import type { Identity } from './identity';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (value !== null && typeof value === 'object') return '{'+Object.entries(value).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => JSON.stringify(k)+':'+canonical(v)).join(',')+'}';
  return JSON.stringify(value);
};
interface Row { id: string; record_json: string; revision: number; updated_by: string; updated_at: string }
interface MemberRow { email: string; role: string }
interface VersionRow { kind: string; id: string; revision: number; updated_by: string; updated_at: string }
const present = (row: Row) => ({ record: JSON.parse(row.record_json), revision: row.revision, updatedBy: row.updated_by, updatedAt: row.updated_at });
export async function workspace(request: Request, db: D1Database | undefined, identity: Identity | null): Promise<Response> {
  if (!identity) return json({ error: 'Individual workspace sign-in required' }, 401);
  if (!db) return json({ error: 'Workspace storage is not configured' }, 503);
  const url = new URL(request.url);
  if (url.pathname === '/api/workspace/members' && request.method === 'GET') {
    const [memberRows, versionRows, recordRows] = await Promise.all([
      db.prepare('SELECT email, role FROM workspace_members WHERE enabled = 1 ORDER BY email').all<MemberRow>(),
      db.prepare('SELECT kind, id, revision, updated_by, updated_at FROM workspace_record_versions ORDER BY updated_at DESC').all<VersionRow>(),
      db.prepare('SELECT kind, id, record_json, revision, updated_by, updated_at FROM workspace_records').all<Row & { kind: string }>(),
    ]);
    const creator = new Map(versionRows.results.filter(v => v.revision === 1).map(v => [`${v.kind}:${v.id}`, v.updated_by.toLowerCase()]));
    const proposalValue = (record: Record<string, unknown>) => {
      const items = Array.isArray(record.items) ? record.items as Record<string, unknown>[] : [];
      return items.reduce((sum, item) => {
        const price = Number(item.unitPrice) || 0, qty = Number(item.qty) || 0, discount = Number(item.bundleDiscount) || 0;
        return sum + price * qty * (1 - Math.min(100, Math.max(0, discount)) / 100);
      }, 0);
    };
    const members = memberRows.results.map(member => {
      const email = member.email.toLowerCase();
      const created = recordRows.results.filter(row => creator.get(`${row.kind}:${row.id}`) === email);
      const prospects = created.filter(row => row.kind === 'prospect');
      const proposals = created.filter(row => row.kind === 'proposal').map(row => ({ row, record: JSON.parse(row.record_json) as Record<string, unknown> }));
      const activity = versionRows.results.filter(v => v.updated_by.toLowerCase() === email);
      const sent = proposals.filter(({ record }) => ['sent','review','won','lost'].includes(String(record.status || '')));
      const won = proposals.filter(({ record }) => record.status === 'won');
      return {
        email: member.email,
        role: member.role,
        metrics: {
          prospectsCreated: prospects.length,
          proposalsCreated: proposals.length,
          proposalsSent: sent.length,
          dealsClosed: won.length,
          estimatedDealValue: proposals.filter(({ record }) => record.status !== 'lost').reduce((sum, { record }) => sum + proposalValue(record), 0),
          closedValue: won.reduce((sum, { record }) => sum + proposalValue(record), 0),
          activityCount: activity.length,
          lastActiveAt: activity[0]?.updated_at || null,
        },
      };
    });
    return json({ members });
  }
  const match = url.pathname.match(/^\/api\/workspace\/records\/(proposal|prospect)(?:\/([^/]+))?$/);
  if (!match) return json({ error: 'Not found' }, 404);
  const kind = match[1];
  let id: string | undefined;
  try { id = match[2] ? decodeURIComponent(match[2]) : undefined; } catch { return json({ error: 'Invalid ID' }, 400); }
  if (id && (id.length > 128 || /[\x00-\x1f]/.test(id))) return json({ error: 'Invalid ID' }, 400);
  if (request.method === 'GET' && !id) {
    const after = url.searchParams.get('after') || '';
    if (after.length > 128) return json({ error: 'Invalid cursor' }, 400);
    const { results } = await db.prepare('SELECT * FROM workspace_records WHERE kind = ? AND id > ? ORDER BY id LIMIT 101').bind(kind, after).all<Row>();
    const page = results.slice(0,100);
    return json({ records: page.map(present), nextCursor: results.length > 100 ? page[99].id : null });
  }
  if (request.method === 'POST' && id) {
    let body;
    try { body = await request.json() as { record?: Record<string, unknown>; expectedRevision?: number; import?: boolean }; } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (!body || !body.record || typeof body.record !== 'object' || Array.isArray(body.record) || body.record.id !== id || !Number.isSafeInteger(body.expectedRevision) || body.expectedRevision! < 0)
      return json({ error: 'record.id and a nonnegative expectedRevision are required' }, 400);
    if (body.import && (identity.role !== 'admin' || body.expectedRevision !== 0)) return json({ error: 'Only administrators may import new records' }, 403);
    let data: string;
    try { data = canonical(body.record); } catch { return json({ error: 'Record is too deeply nested' }, 400); }
    if (new TextEncoder().encode(data).byteLength > 128000) return json({ error: 'Record exceeds 128 KB' }, 413);
    const now = new Date().toISOString();
    // Single-statement compare-and-swap prevents lost updates. Triggers capture history atomically.
    const result = body.expectedRevision === 0
      ? await db.prepare('INSERT INTO workspace_records (kind,id,record_json,revision,updated_by,updated_at) VALUES (?,?,?,1,?,?) ON CONFLICT(kind,id) DO NOTHING RETURNING *').bind(kind,id,data,identity.email,now).first<Row>()
      : await db.prepare('UPDATE workspace_records SET record_json = ?, revision = revision + 1, updated_by = ?, updated_at = ? WHERE kind = ? AND id = ? AND revision = ? RETURNING *').bind(data,identity.email,now,kind,id,body.expectedRevision).first<Row>();
    if (result) return json(present(result));
    const current = await db.prepare('SELECT * FROM workspace_records WHERE kind = ? AND id = ?').bind(kind,id).first<Row>();
    if (body.import && current?.record_json === data) return json({ ...present(current), alreadyImported: true });
    return json({ error: 'This record has changed or its ID already exists. Export your edits before reloading; nothing was overwritten.', conflict: true, currentRevision: current?.revision ?? null }, 409);
  }
  return json({ error: 'Method not allowed' }, 405);
}
