export interface ShareView { at: string; country: string; ua: string }
export interface ShareEmail { at: string; to: string; subject: string; operationId?: string }
export interface ShareRecord {
  token: string;
  proposalId: string;
  name: string;
  prospectName: string;
  createdAt: string;
  updatedAt: string;
  proposal: Record<string, unknown>;
  views: ShareView[];
  emails: ShareEmail[];
  viewCount?: number;
  expiresAt?: string | null;
}

interface PublishedRow {
  token: string; proposal_id: string; name: string; prospect_name: string;
  proposal_json: string; created_at: string; expires_at: string | null;
}
interface EventRow {
  token: string; event_type: "view" | "email_accepted"; at: string;
  country: string | null; user_agent: string | null; recipient: string | null; subject: string | null;
}
interface CountRow { token: string; count: number }

const fromRow = (row: PublishedRow): ShareRecord => ({
  token: row.token, proposalId: row.proposal_id, name: row.name, prospectName: row.prospect_name,
  createdAt: row.created_at, updatedAt: row.created_at, proposal: JSON.parse(row.proposal_json), views: [], emails: [], expiresAt: row.expires_at,
});

export function shareSummary(s: ShareRecord) {
  return {
    token: s.token, proposalId: s.proposalId, name: s.name, prospectName: s.prospectName,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
    expiresAt: s.expiresAt || null,
    viewCount: s.viewCount ?? s.views.length,
    lastViewedAt: s.views.length ? s.views[0].at : null,
    recentViews: s.views.slice(0, 20), emails: s.emails.slice(0, 50),
  };
}

export async function createPublished(db: D1Database | undefined, kv: KVNamespace, share: ShareRecord, actor: string) {
  if (!db) return kv.put(`share:${share.token}`, JSON.stringify(share));
  await db.prepare('INSERT INTO published_proposals (token,proposal_id,name,prospect_name,proposal_json,created_by,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(share.token, share.proposalId, share.name, share.prospectName, JSON.stringify(share.proposal), actor, share.createdAt, share.expiresAt || null).run();
}

export async function loadPublished(db: D1Database | undefined, kv: KVNamespace, token: string): Promise<ShareRecord | null> {
  if (!db) {
    const raw = await kv.get(`share:${token}`);
    if (!raw) return null;
    const share = JSON.parse(raw) as ShareRecord;
    return share.expiresAt && Date.parse(share.expiresAt) <= Date.now() ? null : share;
  }
  const row = await db.prepare("SELECT token,proposal_id,name,prospect_name,proposal_json,created_at,expires_at FROM published_proposals WHERE token=? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>?)")
    .bind(token, new Date().toISOString()).first<PublishedRow>();
  if (!row) return null;
  const share = fromRow(row);
  const { results } = await db.prepare('SELECT token,event_type,at,country,user_agent,recipient,subject FROM proposal_events WHERE token=? ORDER BY at DESC LIMIT 200').bind(token).all<EventRow>();
  attachEvents(share, results);
  const count = await db.prepare("SELECT COUNT(*) count FROM proposal_events WHERE token=? AND event_type='view'").bind(token).first<{ count: number }>();
  share.viewCount = Number(count?.count || 0);
  return share;
}

function attachEvents(share: ShareRecord, events: EventRow[]) {
  for (const event of events) {
    if (event.event_type === 'view' && share.views.length < 20) share.views.push({ at: event.at, country: event.country || '', ua: event.user_agent || '' });
    if (event.event_type === 'email_accepted' && share.emails.length < 50) share.emails.push({ at: event.at, to: event.recipient || '', subject: event.subject || '' });
  }
}

export async function listPublished(db: D1Database | undefined, kv: KVNamespace): Promise<ShareRecord[]> {
  if (!db) {
    const out: ShareRecord[] = [];
    let cursor: string | undefined;
    do {
      const page = await kv.list({ prefix: 'share:', cursor });
      for (const key of page.keys) {
        const raw = await kv.get(key.name);
        if (raw) { const share = JSON.parse(raw) as ShareRecord; if (!share.expiresAt || Date.parse(share.expiresAt) > Date.now()) out.push(share); }
      }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    return out;
  }
  const [rows, events, counts] = await Promise.all([
    db.prepare('SELECT token,proposal_id,name,prospect_name,proposal_json,created_at,expires_at FROM published_proposals WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at>?) ORDER BY created_at DESC LIMIT 1000').bind(new Date().toISOString()).all<PublishedRow>(),
    db.prepare("SELECT e.token,e.event_type,e.at,e.country,e.user_agent,e.recipient,e.subject FROM proposal_events e JOIN published_proposals p ON p.token=e.token WHERE p.revoked_at IS NULL ORDER BY e.at DESC LIMIT 5000").all<EventRow>(),
    db.prepare("SELECT e.token,COUNT(*) count FROM proposal_events e JOIN published_proposals p ON p.token=e.token WHERE p.revoked_at IS NULL AND e.event_type='view' GROUP BY e.token").all<CountRow>(),
  ]);
  const shares = rows.results.map(fromRow), byToken = new Map(shares.map(share => [share.token, share]));
  for (const event of events.results) { const share = byToken.get(event.token); if (share) attachEvents(share, [event]); }
  for (const count of counts.results) { const share = byToken.get(count.token); if (share) share.viewCount = Number(count.count); }
  return shares;
}

export async function revokePublished(db: D1Database | undefined, kv: KVNamespace, token: string) {
  if (!db) return kv.delete(`share:${token}`);
  await db.prepare('UPDATE published_proposals SET revoked_at=? WHERE token=? AND revoked_at IS NULL').bind(new Date().toISOString(), token).run();
}

export async function recordView(db: D1Database | undefined, kv: KVNamespace, share: ShareRecord, view: ShareView) {
  if (!db) { share.views.unshift(view); share.views = share.views.slice(0, 200); return kv.put(`share:${share.token}`, JSON.stringify(share)); }
  await db.prepare("INSERT INTO proposal_events(token,event_type,at,country,user_agent) VALUES (?,'view',?,?,?)").bind(share.token, view.at, view.country, view.ua).run();
}

export async function recordEmail(db: D1Database | undefined, kv: KVNamespace, share: ShareRecord, email: ShareEmail) {
  if (!db) { share.emails.unshift(email); share.emails = share.emails.slice(0, 50); return kv.put(`share:${share.token}`, JSON.stringify(share)); }
  await db.prepare("INSERT OR IGNORE INTO proposal_events(token,event_type,at,recipient,subject,operation_id) VALUES (?,'email_accepted',?,?,?,?)").bind(share.token, email.at, email.to, email.subject, email.operationId || null).run();
}
