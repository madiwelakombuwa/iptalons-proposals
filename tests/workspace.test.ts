import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { generateKeyPair, SignJWT } from 'jose';
import { identify } from '../src/identity';
import { workspace } from '../src/workspace';

function database() {
  const sql = new DatabaseSync(':memory:'); sql.exec(readFileSync('migrations/0001_workspace.sql','utf8'));
  const db: any = { prepare(query: string) {
    let values: any[] = [];
    const stmt = { bind(...v: any[]) { values = v; return stmt; },
      async run() { return sql.prepare(query).run(...values); },
      async first() { return sql.prepare(query).get(...values) || null; },
      async all() { return { results: sql.prepare(query).all(...values) }; } };
    return stmt;
  } };
  return { sql, db };
}
const admin = { email: 'admin@example.invalid', subject: 'admin-id', role: 'admin' as const };
const request = (id = '', body?: unknown, kind = 'proposal') => new Request('https://test.example/api/workspace/records/'+kind+(id ? '/'+id : ''), { method: body === undefined ? 'GET' : 'POST', ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

test('shared records preserve data, reject stale edits, retain versions, and import idempotently', async () => {
  const { sql, db } = database();
  const record = { id: 'legacy-1', name: 'Original', created: '2020-01-01', nextFollowUp: '2020-02-01', activities: [{ content: 'Internal note' }] };
  assert.equal((await workspace(request(), db, null)).status, 401);
  let r = await workspace(request(record.id, { record, expectedRevision: 0, import: true }), db, admin); assert.equal(r.status, 200);
  assert.deepEqual((await r.json() as any).record, record);
  r = await workspace(request(record.id, { record: { ...record }, expectedRevision: 0, import: true }), db, admin);
  assert.equal((await r.json() as any).alreadyImported, true);
  r = await workspace(request(record.id, { record: { ...record, name: 'Different client' }, expectedRevision: 0, import: true }), db, admin); assert.equal(r.status, 409);
  const write = (name: string) => workspace(request(record.id, { record: { ...record, name }, expectedRevision: 1 }), db, admin);
  const results = await Promise.all([write('A'), write('B')]); assert.deepEqual(results.map(r=>r.status).sort(), [200,409]);
  assert.equal((sql.prepare('SELECT COUNT(*) AS n FROM workspace_record_versions').get() as any).n, 2);
  assert.equal((await workspace(request('other', { record, expectedRevision: 0 }), db, admin)).status, 400);
  assert.equal((await workspace(request(record.id, { record, expectedRevision: 0, import: true }), db, { ...admin, role: 'member' })).status, 403);
  sql.close();
});

test('record pagination does not omit record 101', async () => {
  const { sql, db } = database();
  for (let i=0;i<101;i++) { const id = String(i).padStart(3,'0'); await workspace(request(id, { record: { id }, expectedRevision: 0 }), db, admin); }
  const first = await (await workspace(request(), db, admin)).json() as any;
  assert.equal(first.records.length,100); assert.equal(first.nextCursor,'099');
  const second = await (await workspace(new Request('https://test.example/api/workspace/records/proposal?after=099'), db, admin)).json() as any;
  assert.equal(second.records.length,1); assert.equal(second.nextCursor,null); sql.close();
});

test('team summaries attribute created records and proposal value to the creator', async () => {
  const { sql, db } = database();
  sql.prepare('INSERT INTO workspace_members(email,role) VALUES (?,?)').run(admin.email,'admin');
  const prospect = { id: 'prospect-1', name: 'Example University' };
  const proposal = { id: 'proposal-1', status: 'won', items: [{ unitPrice: 1000, qty: 2, bundleDiscount: 10 }] };
  assert.equal((await workspace(request(prospect.id, { record: prospect, expectedRevision: 0 }, 'prospect'), db, admin)).status, 200);
  assert.equal((await workspace(request(proposal.id, { record: proposal, expectedRevision: 0 }), db, admin)).status, 200);
  const response = await workspace(new Request('https://test.example/api/workspace/members'), db, admin);
  const member = ((await response.json()) as any).members[0];
  assert.deepEqual(member.metrics, {
    prospectsCreated: 1, proposalsCreated: 1, proposalsSent: 1, dealsClosed: 1,
    estimatedDealValue: 1800, closedValue: 1800, activityCount: 2, lastActiveAt: member.metrics.lastActiveAt,
  });
  assert(member.metrics.lastActiveAt);
  sql.close();
});

test('Access verifies signature, issuer, audience, expiry and membership; revocation is immediate', async () => {
  const { sql, db } = database();
  sql.prepare('INSERT INTO workspace_members(email,role) VALUES (?,?)').run(admin.email,'admin');
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const env = { DB: db, ACCESS_TEAM_DOMAIN: 'test.cloudflareaccess.com', ACCESS_AUD: 'test-audience' };
  const make = async (claims = {}) => new SignJWT({ email: admin.email, ...claims }).setProtectedHeader({ alg: 'RS256' }).setSubject('verified-id').setIssuedAt().setExpirationTime('1h').setIssuer('https://test.cloudflareaccess.com').setAudience('test-audience').sign(privateKey);
  const req = (token: string) => new Request('https://test.example', { headers: { 'Cf-Access-Jwt-Assertion': token, 'Cf-Access-Authenticated-User-Email': 'spoof@example.invalid' } });
  const token = await make(); const key = async () => publicKey;
  assert.equal((await identify(req(token),env,key))?.email,admin.email);
  assert.equal(await identify(req(token), { ...env, ACCESS_AUD: 'wrong' },key),null);
  assert.equal(await identify(req(token), { ...env, ACCESS_TEAM_DOMAIN: 'wrong.cloudflareaccess.com' },key),null);
  assert.equal(await identify(req(await make({ email: 'outsider@example.invalid' })),env,key),null);
  assert.equal(await identify(req(token.slice(0,-8)+'AAAAAAAA'),env,key),null);
  const expired = await new SignJWT({ email: admin.email }).setProtectedHeader({ alg: 'RS256' }).setSubject('verified-id').setIssuedAt(1).setExpirationTime(2).setIssuer('https://test.cloudflareaccess.com').setAudience('test-audience').sign(privateKey);
  assert.equal(await identify(req(expired),env,key),null);
  sql.prepare('UPDATE workspace_members SET enabled=0').run(); assert.equal(await identify(req(token),env,key),null);
  sql.close();
});
