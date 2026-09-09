export interface SignalLead {
  t: "hot" | "warm" | "acad" | "inst";
  tier: string;
  handle: string;
  src: string;
  pain: string;
  quote: string;
  angle: string;
  url: string;
  sourceId: string;
  publishedAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  score: number;
  scoreReasons: string[];
}

export interface SignalState {
  status: string;
  owner: string;
  notes: string;
  updatedAt?: string;
}

export interface SignalStore {
  leads: SignalLead[];
  scannedAt: string;
  actor: string;
  candidateCount: number;
}

const SIGNALS_KEY = "signals:v2";
const STATE_PREFIX = "signal-state:v2:";
const ACTOR = "apidojo~tweet-scraper";
const STATUSES = new Set(["new", "contacted", "replied", "call", "won", "lost"]);

type ApifyPost = Record<string, unknown> & { author?: Record<string, unknown> };

const text = (value: unknown, max: number) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);

export function qualifyPost(post: ApifyPost, now = new Date().toISOString()): SignalLead | null {
  const body = text(post.fullText || post.text, 1200);
  const lower = body.toLowerCase();
  const id = text(post.id, 100);
  const author = post.author || {};
  const handle = text(author.userName || post.userName, 80);
  const url = text(post.url || post.twitterUrl, 500);
  if (!id || !handle || !body || !/^https:\/\/(?:x\.com|twitter\.com)\//i.test(url)) return null;

  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => { score += points; reasons.push(reason); };
  if (/\b(research security|research-security|nspm[- ]?33|foreign influence|foreign talent|mftrp)\b/i.test(body)) add(30, "explicit research-security need");
  if (/\b(sbir|sttr|nih|nsf|federal (?:grant|funding)|university|research institution)\b/i.test(body)) add(25, "IPTalons customer-profile fit");
  if (/\b(help|need|struggl|confus|deadline|urgent|requirement|comply|compliance|risk|assessment|mitigation|denied|rejected|resubmit)\b/i.test(body)) add(20, "need or urgency language");
  if (/\b(we|our|my)\b/i.test(body)) add(10, "first-person problem statement");
  const followers = Number(author.followers || post.followers || 0);
  if (followers >= 1000) add(10, "established public account");
  const created = text(post.createdAt, 50);
  if (created && Number.isFinite(Date.parse(created))) {
    const ageDays = (Date.now() - Date.parse(created)) / 86400000;
    if (ageDays <= 14) add(5, "recent source");
    if (ageDays > 60) score -= 20;
  }
  score = Math.max(0, Math.min(100, score));
  if (score < 40) return null;
  const type = score >= 75 ? "hot" : "warm";
  return {
    t: type,
    tier: type.toUpperCase(),
    handle: `@${handle.replace(/^@/, "")}`,
    src: "X",
    pain: body,
    quote: body.slice(0, 500),
    angle: "Offer a research-security readiness review tied to the need expressed in this post.",
    url,
    sourceId: `x:${id}`,
    publishedAt: created && Number.isFinite(Date.parse(created)) ? new Date(created).toISOString() : null,
    firstSeenAt: now,
    lastSeenAt: now,
    score,
    scoreReasons: reasons,
  };
}

export async function loadSignals(kv: KVNamespace): Promise<SignalStore | null> {
  return await kv.get<SignalStore>(SIGNALS_KEY, "json");
}

export async function exportSignals(kv: KVNamespace) {
  const store = await loadSignals(kv);
  const leads = store?.leads || [];
  const entries = await Promise.all(leads.map(async lead => [lead.sourceId, await kv.get<SignalState>(STATE_PREFIX + lead.sourceId, "json")] as const));
  return {
    leads,
    state: { leads: Object.fromEntries(entries.map(([handle, state]) => [handle, state || { status: "new", owner: "", notes: "" }])) },
    meta: store ? { source: "apify", scannedAt: store.scannedAt, actor: store.actor, candidateCount: store.candidateCount } : { source: "apify", scannedAt: null, actor: ACTOR, candidateCount: 0 },
  };
}

export async function updateSignalState(kv: KVNamespace, identifier: string, patch: Record<string, string>) {
  const store = await loadSignals(kv);
  const lead = store?.leads.find(item => item.sourceId === identifier || item.handle === identifier);
  if (!lead) return null;
  const key = STATE_PREFIX + lead.sourceId;
  const current = await kv.get<SignalState>(key, "json") || { status: "new", owner: "", notes: "" };
  if (patch.status !== undefined && !STATUSES.has(String(patch.status))) throw new Error("bad status");
  const next = { ...current };
  if (patch.status !== undefined) next.status = text(patch.status, 30);
  if (patch.owner !== undefined) next.owner = text(patch.owner, 120);
  if (patch.notes !== undefined) next.notes = text(patch.notes, 4000);
  next.updatedAt = new Date().toISOString();
  await kv.put(key, JSON.stringify(next));
  return next;
}

export async function collectApifySignals(kv: KVNamespace, token: string): Promise<SignalStore> {
  const terms = [
    '"research security" (help OR compliance OR assessment OR program)',
    '"NSPM-33" (help OR compliance OR implementation)',
    '(SBIR OR STTR) ("foreign risk" OR "research security" OR compliance)',
    '(university OR researcher) (MFTRP OR "foreign talent" OR "foreign influence")',
  ];
  const endpoint = new URL(`https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`);
  endpoint.searchParams.set("timeout", "120");
  endpoint.searchParams.set("maxItems", "50");
  endpoint.searchParams.set("maxTotalChargeUsd", "0.50");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ searchTerms: terms, maxItems: 50, sort: "Latest" }),
  });
  if (!response.ok) throw new Error(`Apify actor failed (${response.status})`);
  const posts = await response.json<ApifyPost[]>();
  if (!Array.isArray(posts)) throw new Error("Apify returned an invalid dataset");
  const now = new Date().toISOString();
  const previous = await loadSignals(kv);
  const previousById = new Map((previous?.leads || []).map(lead => [lead.sourceId, lead]));
  const qualified = posts.map(post => qualifyPost(post, now)).filter((lead): lead is SignalLead => Boolean(lead));
  const byId = new Map<string, SignalLead>();
  for (const lead of qualified) {
    const old = previousById.get(lead.sourceId);
    byId.set(lead.sourceId, { ...lead, firstSeenAt: old?.firstSeenAt || lead.firstSeenAt });
  }
  const result: SignalStore = { leads: [...byId.values()].sort((a, b) => b.score - a.score), scannedAt: now, actor: ACTOR, candidateCount: posts.length };
  await kv.put(SIGNALS_KEY, JSON.stringify(result));
  return result;
}
