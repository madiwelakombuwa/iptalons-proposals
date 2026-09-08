import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import worker from '../src/worker';
import { publicProposal, safeSourceUrl } from '../src/public-proposal';

class KV {
  data = new Map<string, string>();
  async get(key: string) { return this.data.get(key) ?? null; }
  async put(key: string, value: string) { this.data.set(key, value); }
  async delete(key: string) { this.data.delete(key); }
  async list({ prefix }: { prefix: string }) { return { keys: [...this.data.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; }
}
const req = (path: string, body?: unknown, cookie = '', headers = {}) => new Request('https://workspace.example'+path, {
  method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
function fixture() {
  const pending: Promise<unknown>[] = [];
  const env: any = { APP_PASSWORD: 'synthetic-test-password', ANTHROPIC_API_KEY: 'synthetic-server-key', AI_ENABLED: 'true',
    AI_RATE_LIMIT: { limit: async () => ({ success: true }) }, LOGIN_RATE_LIMIT: { limit: async () => ({ success: true }) },
    SHARES: new KV(), ASSETS: { fetch: async () => new Response(readFileSync('public/share.html','utf8')) } };
  const ctx: any = { waitUntil: (p: Promise<unknown>) => pending.push(p) };
  const call = (r: Request) => worker.fetch(r, env, ctx);
  const login = async () => { const r = await call(req('/api/login', { password: env.APP_PASSWORD })); assert.equal(r.status, 200); return r.headers.get('set-cookie')!.split(';')[0]; };
  return { env, ctx, pending, call, login };
}
// Block all real network traffic. The SDK transport is separately mocked below.
globalThis.fetch = async () => { throw new Error('Live network forbidden in regression tests'); };

test('authentication, rate limits, kill switch and request bounds protect AI', async () => {
  const f = fixture(); const body = { messages: [{ role: 'user', content: 'test' }] };
  assert.equal((await f.call(req('/api/claude', body))).status, 401);
  const cookie = await f.login();
  f.env.AI_ENABLED = 'false'; assert.equal((await f.call(req('/api/claude', body, cookie))).status, 503);
  f.env.AI_ENABLED = 'true'; f.env.AI_RATE_LIMIT.limit = async () => ({ success: false });
  assert.equal((await f.call(req('/api/claude', body, cookie))).status, 429);
  f.env.AI_RATE_LIMIT.limit = async () => ({ success: true });
  assert.equal((await f.call(req('/api/claude', { messages: [{ role: 'system', content: 'bad' }] }, cookie))).status, 400);
  assert.equal((await f.call(req('/api/claude', { text: 'a'.repeat(262145) }, cookie))).status, 413);
  assert.equal((await f.call(req('/api/shares', {}, cookie, { Origin: 'https://attacker.example' }))).status, 403);
  assert.equal((await f.call(new Request('https://workspace.example/api/login', { method: 'POST', body: '{}' }))).status, 415);
  f.env.LOGIN_RATE_LIMIT.limit = async () => ({ success: false });
  assert.equal((await f.call(req('/api/login', { password: f.env.APP_PASSWORD }))).status, 429);
});

test('AI ignores browser credentials and caps provider output', async () => {
  const original = Anthropic.prototype.post;
  let sent: any;
  Anthropic.prototype.post = async function(_path: any, options: any) {
    sent = { key: this.apiKey, body: options.body };
    return { content: [{ type: 'text', text: 'mock' }], model: 'mock', usage: {}, stop_reason: 'end_turn' };
  } as any;
  try {
    const f = fixture(); const cookie = await f.login();
    const r = await f.call(req('/api/claude', { messages: [{ role: 'user', content: 'test' }], max_tokens: 64000 }, cookie, { 'x-api-key': 'synthetic-browser-key' }));
    assert.equal(r.status, 200); assert.equal(sent.key, f.env.ANTHROPIC_API_KEY); assert.equal(sent.body.max_tokens, 4000);
  } finally { Anthropic.prototype.post = original; }
});

test('new and legacy public shares exclude internal data; publication is immutable', async () => {
  const f = fixture(); const cookie = await f.login();
  const proposal = { id: 'same-id', name: 'Client A', prospect: { name: 'Client A', notes: 'PRIVATE-PROSPECT' }, internalNotes: 'PRIVATE-NOTE', activities: ['PRIVATE-ACTIVITY'], items: [{ serviceId: 'csr', qty: 10, unitPrice: 249, bundleDiscount: 0 }] };
  const a = await (await f.call(req('/api/shares', { proposal }, cookie))).json() as any;
  const b = await (await f.call(req('/api/shares', { proposal: { ...proposal, name: 'Client B' } }, cookie))).json() as any;
  assert.notEqual(a.token, b.token);
  const stored = JSON.parse(await f.env.SHARES.get('share:'+a.token));
  assert.equal(stored.name, 'Client A'); assert(!JSON.stringify(stored).includes('PRIVATE-'));
  // Simulate a pre-hardening share that contains the entire editor object.
  stored.proposal = proposal; await f.env.SHARES.put('share:'+a.token, JSON.stringify(stored));
  const r = await f.call(req('/p/'+a.token+'?preview=1')); const html = await r.text();
  assert(!html.includes('PRIVATE-')); assert(html.includes('Client A')); assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  await Promise.all(f.pending); assert.equal(JSON.parse(await f.env.SHARES.get('share:'+a.token)).views.length, 1);
});

test('public schema preserves price data and rejects executable source links', () => {
  const data: any = publicProposal({ items: [{ serviceId: 'csr', qty: 10, unitPrice: 249, bundleDiscount: 20 }], prospect: { name: 'A', radar: { secret: 'x' } } });
  assert.deepEqual(data.items, [{ serviceId: 'csr', qty: 10, unitPrice: 249, bundleDiscount: 20 }]);
  assert.equal(safeSourceUrl('javascript:alert(1)'), ''); assert.equal(safeSourceUrl('https://user:password@example.com'), '');
});

test('digest preview and failed delivery preserve seen state; success advances it', async () => {
  const f = fixture(); const cookie = await f.login(); f.env.RADAR_PASSWORD = 'synthetic'; f.env.RESEND_API_KEY = 'synthetic';
  await f.env.SHARES.put('digest:seen', '["old"]'); let success = false;
  const original = globalThis.fetch;
  globalThis.fetch = async (input: any) => {
    const url = String(input);
    if (url.endsWith('/api/export')) return Response.json({ leads: [{ t: 'hot', tier: 'Hot', handle: 'new', src: 'test', pain: 'test', quote: '', url: '' }], state: { leads: {} } });
    if (url === 'https://api.resend.com/emails') return new Response('{}', { status: success ? 200 : 500 });
    throw new Error('Unexpected network destination');
  };
  try {
    assert.equal((await f.call(req('/api/digest?commit=1', undefined, cookie))).status, 200);
    assert.equal(await f.env.SHARES.get('digest:seen'), '["old"]');
    assert.equal((await f.call(req('/api/digest/send', { to: 'test@example.invalid' }, cookie))).status, 502);
    assert.equal(await f.env.SHARES.get('digest:seen'), '["old"]');
    success = true;
    assert.equal((await f.call(req('/api/digest/send', { to: 'test@example.invalid' }, cookie))).status, 200);
    assert.equal(await f.env.SHARES.get('digest:seen'), '["new"]');
  } finally { globalThis.fetch = original; }
});
