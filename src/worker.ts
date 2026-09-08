import Anthropic from "@anthropic-ai/sdk";
import { publicProposal, safeSourceUrl } from "./public-proposal";

interface Env extends WorkerBindings {
  ANTHROPIC_API_KEY?: string;
  APP_PASSWORD?: string;
  RADAR_PASSWORD?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  MAILER_URL?: string; // Apps Script mailer web app (send_email command)
  MAILER_SECRET?: string;
  DIGEST_TO?: string; // recipient(s) for the daily summary email, comma-separated
}

// The CSR Demand Radar (sister worker). /api/signals proxies it server-to-server
// so the team never handles the radar password.
const RADAR_ORIGIN = "https://iptalons-csr-radar.harsha-4cf.workers.dev";

interface ShareView { at: string; country: string; ua: string }
interface ShareEmail { at: string; to: string; subject: string }
interface ShareRecord {
  token: string;
  proposalId: string;
  name: string;
  prospectName: string;
  createdAt: string;
  updatedAt: string;
  proposal: Record<string, unknown>;
  views: ShareView[];
  emails: ShareEmail[];
}

const ALLOWED_MODELS = new Set([
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
]);

const COOKIE = "ip_sess";
const SESSION_TTL_S = 30 * 24 * 3600;
const MAX_VIEWS_KEPT = 200;

// ─── Session auth (HMAC cookie, password = APP_PASSWORD secret) ────────────
const enc = new TextEncoder();

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = enc.encode(a), bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < ab.length; i++) out |= ab[i] ^ bb[i];
  return out === 0;
}

async function makeToken(secret: string): Promise<string> {
  const ts = String(Date.now());
  return `${ts}.${await hmac(secret, ts)}`;
}

async function verifySession(secret: string | undefined, token: string | null): Promise<boolean> {
  if (!secret || !token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const ts = token.slice(0, dot), sig = token.slice(dot + 1);
  const age = (Date.now() - Number(ts)) / 1000;
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_S) return false;
  return timingSafeEqual(sig, await hmac(secret, ts));
}

function getCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("Cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

const sessionCookie = (value: string, maxAge: number) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

// ─── Helpers ────────────────────────────────────────────────────────────────
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

function newShareToken(): string {
  const bytes = new Uint8Array(15);
  crypto.getRandomValues(bytes);
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

function shareSummary(s: ShareRecord) {
  return {
    token: s.token,
    proposalId: s.proposalId,
    name: s.name,
    prospectName: s.prospectName,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    viewCount: s.views.length,
    lastViewedAt: s.views.length ? s.views[0].at : null,
    recentViews: s.views.slice(0, 20),
    emails: s.emails,
  };
}

async function loadShare(env: Env, token: string): Promise<ShareRecord | null> {
  const raw = await env.SHARES.get(`share:${token}`);
  return raw ? (JSON.parse(raw) as ShareRecord) : null;
}

const saveShare = (env: Env, s: ShareRecord) => env.SHARES.put(`share:${s.token}`, JSON.stringify(s));

// ─── Daily digest ────────────────────────────────────────────────────────────
interface RadarLead { t: string; tier: string; handle: string; src: string; pain: string; quote: string; url: string }
interface RadarState { leads: Record<string, { status: string; owner: string; notes: string; updatedAt?: string }> }

// News intel items — ingested by the daily sweep, matched to prospects client-side
interface NewsItem {
  id: string;
  at: string; // ISO date of the event/post
  source: string; // 'X', 'Federal Register', …
  handle?: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  severity: "high" | "medium" | "info";
  match: { types: string[]; entities: string[] };
}
const NEWS_KEY = "news:v1";

async function loadNews(env: Env): Promise<NewsItem[]> {
  const raw = await env.SHARES.get(NEWS_KEY);
  return raw ? (JSON.parse(raw) as NewsItem[]) : [];
}

const escHtml = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const stripTags = (s: string) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const DIGEST_SEEN_KEY = "digest:seen";
const DAY_MS = 24 * 3600 * 1000;

async function fetchRadar(env: Env): Promise<{ leads: RadarLead[]; state: RadarState } | null> {
  if (!env.RADAR_PASSWORD) return null;
  const resp = await fetch(`${RADAR_ORIGIN}/api/export`, {
    headers: { Authorization: `Bearer ${env.RADAR_PASSWORD}` },
  });
  if (!resp.ok) return null;
  return await resp.json();
}

async function buildDigest(env: Env, origin: string) {
  const now = new Date();
  const cutoff = now.getTime() - DAY_MS;
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // ── Radar scan ──
  const radar = await fetchRadar(env);
  const leads = (radar?.leads || []).filter((l) => l.t !== "comp");
  const stateOf = (h: string) => radar?.state?.leads?.[h] || { status: "new", owner: "", notes: "", updatedAt: undefined };
  const seenRaw = await env.SHARES.get(DIGEST_SEEN_KEY);
  const seen: string[] | null = seenRaw ? JSON.parse(seenRaw) : null;
  const seenSet = new Set(seen || []);
  const firstDigest = seen === null;
  const newLeads = firstDigest ? leads : leads.filter((l) => !seenSet.has(l.handle));
  const tierCounts: Record<string, number> = {};
  for (const l of leads) tierCounts[l.t] = (tierCounts[l.t] || 0) + 1;


  // ── Proposals & engagement (from share records) ──
  const list = await env.SHARES.list({ prefix: "share:" });
  const sharesCreated: ShareRecord[] = [];
  const viewsToday: { share: ShareRecord; count: number; latest: ShareView }[] = [];
  const emailsToday: { share: ShareRecord; email: ShareEmail }[] = [];
  for (const key of list.keys) {
    const raw = await env.SHARES.get(key.name);
    if (!raw) continue;
    const s = JSON.parse(raw) as ShareRecord;
    if (new Date(s.createdAt).getTime() >= cutoff) sharesCreated.push(s);
    const v = s.views.filter((x) => new Date(x.at).getTime() >= cutoff);
    if (v.length) viewsToday.push({ share: s, count: v.length, latest: v[0] });
    for (const e of s.emails) if (new Date(e.at).getTime() >= cutoff) emailsToday.push({ share: s, email: e });
  }

  // ── Needs attention ──
  const awaitingFirst = leads.filter((l) => stateOf(l.handle).status === "new");
  const tierRank: Record<string, number> = { hot: 0, warm: 1, acad: 2, inst: 3 };
  awaitingFirst.sort((a, b) => (tierRank[a.t] ?? 9) - (tierRank[b.t] ?? 9));
  const staleContacted = leads.filter((l) => {
    const st = stateOf(l.handle);
    return st.status === "contacted" && st.updatedAt && new Date(st.updatedAt).getTime() < now.getTime() - 5 * DAY_MS;
  });
  const replied = leads.filter((l) => ["replied", "call"].includes(stateOf(l.handle).status));

  const attentionCount = awaitingFirst.length + staleContacted.length + replied.length;
  const subject = `IPTalons Daily Summary — ${dateStr} · ${newLeads.length} new signal${newLeads.length === 1 ? "" : "s"} · ${viewsToday.reduce((n, v) => n + v.count, 0)} proposal view${viewsToday.reduce((n, v) => n + v.count, 0) === 1 ? "" : "s"} · ${attentionCount} need attention`;

  // ── Render ──
  const daysAgo = (iso?: string) => iso ? Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / DAY_MS)) : null;
  const H = (t: string) => `<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;color:#2F6B4F;margin:30px 0 12px;text-transform:uppercase">${t}</div>`;
  const P = (t: string) => `<p style="font-size:15px;line-height:1.65;color:#20281F;margin:0 0 12px">${t}</p>`;
  const LI = (t: string) => `<div style="font-size:14px;line-height:1.6;color:#3A4237;margin:0 0 8px;padding-left:14px;text-indent:-14px">&bull;&nbsp; ${t}</div>`;
  const B = (t: string | number) => `<strong style="color:#141A12">${t}</strong>`;

  const tierLabel: Record<string, string> = { hot: "hot", warm: "warm", acad: "academic", inst: "institutional" };
  const tierLine = ["hot", "warm", "acad", "inst"].filter((t) => tierCounts[t]).map((t) => `${B(tierCounts[t])} ${tierLabel[t]}`).join(", ");

  let html = `<div style="margin:0;padding:0;background:#F1F3EC">
  <div style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <div style="background:#141A12;padding:28px 32px">
      <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.3px">Daily Summary</div>
      <div style="font-size:14px;color:#9DA89A;margin-top:5px">IPTalons Outreach &middot; ${dateStr}</div>
    </div>
    <div style="background:#ffffff;padding:10px 32px 30px">`;

  // Stat tiles
  const tile = (value: string, label: string, hint?: string) =>
    `<td width="25%" style="padding:4px"><div style="border:1px solid #E4E8DE;border-radius:8px;padding:12px 8px;text-align:center">
      <div style="font-size:21px;font-weight:800;color:#141A12">${value}</div>
      <div style="font-size:10.5px;color:#8A948B;margin-top:3px;letter-spacing:0.3px;text-transform:uppercase">${label}</div>
      ${hint ? `<div style="font-size:10.5px;color:#2F6B4F;font-weight:600;margin-top:2px">${hint}</div>` : ""}
    </div></td>`;
  html += `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr>
    ${tile(String(newLeads.length), "new signals", "radar scan")}
    ${tile(String(viewsToday.reduce((n, v) => n + v.count, 0)), "proposal views", "last 24h")}
  </tr></table>`;

  // Radar scan
  html += H("Radar Scan");
  if (!radar) {
    html += P(`The radar feed could not be reached for this digest.`);
  } else {
    html += P(`${B(leads.length)} active signals on the radar — ${tierLine}. ${
      firstDigest
        ? `This is the first digest, so the baseline starts today.`
        : newLeads.length
          ? `${B(newLeads.length)} ${newLeads.length === 1 ? "is" : "are"} new since yesterday's scan:`
          : `No new signals since yesterday's scan.`}`);
    for (const l of newLeads.slice(0, 5)) {
      html += LI(`${B(escHtml(l.handle))} <span style="color:#8A948B">(${escHtml(l.tier)} &middot; ${escHtml(l.src)})</span> — ${escHtml(stripTags(l.pain))}`);
    }
    if (newLeads.length > 5) html += LI(`&hellip;and ${newLeads.length - 5} more in the <a href="${origin}" style="color:#2F6B4F">Signals tab</a>`);
  }

  // Policy watch — news from the last 7 days, severity first
  const sevRank: Record<string, number> = { high: 0, medium: 1, info: 2 };
  const sevColor: Record<string, string> = { high: "#B8493A", medium: "#B8860B", info: "#8A948B" };
  const news = (await loadNews(env))
    .filter((n) => new Date(n.at).getTime() >= now.getTime() - 7 * DAY_MS)
    .sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 4);
  if (news.length) {
    html += H("Policy Watch");
    for (const n of news) {
      html += `<div style="font-size:14px;line-height:1.6;color:#3A4237;margin:0 0 10px;padding-left:14px;text-indent:-14px">
        <span style="color:${sevColor[n.severity]};font-size:11px">&#9679;</span>&nbsp; <a href="${escHtml(safeSourceUrl(n.url))}" style="color:#141A12;font-weight:700;text-decoration:none">${escHtml(n.title)}</a>
        <span style="color:#8A948B;font-size:12px">&middot; ${escHtml(n.source)}${n.handle ? " &middot; " + escHtml(n.handle) : ""}</span><br>
        <span style="font-size:13px">${escHtml(n.summary)}</span>
      </div>`;
    }
  }

  // Proposals & engagement
  html += H("Proposals & Engagement");
  const sentBits: string[] = [];
  if (sharesCreated.length) sentBits.push(`${B(sharesCreated.length)} proposal${sharesCreated.length === 1 ? "" : "s"} published to a tracked link`);
  if (emailsToday.length) sentBits.push(`${B(emailsToday.length)} emailed to prospects`);
  html += P(sentBits.length ? `${sentBits.join(" and ")} in the last 24 hours.` : `No proposals were sent in the last 24 hours.`);
  for (const s of sharesCreated) html += LI(`${B(escHtml(s.prospectName || s.name))} — link published`);
  for (const e of emailsToday) html += LI(`${B(escHtml(e.share.prospectName || e.share.name))} — emailed to ${escHtml(e.email.to)}`);
  if (viewsToday.length) {
    html += P(`Prospect engagement:`);
    for (const v of viewsToday) {
      html += LI(`${B(escHtml(v.share.prospectName || v.share.name))} viewed their proposal ${B(v.count + "×")}${v.latest.country ? ` <span style="color:#8A948B">(latest from ${escHtml(v.latest.country)})</span>` : ""}`);
    }
  } else {
    html += P(`<span style="color:#8A948B">No proposal views in the last 24 hours.</span>`);
  }

  // Needs attention
  html += H("Needs Attention");
  if (!attentionCount) {
    html += P(`Nothing waiting — the pipeline is clean.`);
  } else {
    if (replied.length) {
      html += P(`${B(replied.length)} prospect${replied.length === 1 ? " has" : "s have"} replied or booked a call — respond first:`);
      for (const l of replied.slice(0, 4)) html += LI(`${B(escHtml(l.handle))} <span style="color:#8A948B">(${escHtml(stateOf(l.handle).status)}${stateOf(l.handle).owner ? ` &middot; ${escHtml(stateOf(l.handle).owner)}` : ""})</span>`);
    }
    if (staleContacted.length) {
      html += P(`${B(staleContacted.length)} contacted ${staleContacted.length === 1 ? "signal has" : "signals have"} gone quiet — follow up:`);
      for (const l of staleContacted.slice(0, 4)) html += LI(`${B(escHtml(l.handle))} — contacted ${daysAgo(stateOf(l.handle).updatedAt)} days ago, no reply logged`);
    }
    if (awaitingFirst.length) {
      html += P(`${B(awaitingFirst.length)} signal${awaitingFirst.length === 1 ? " is" : "s are"} still awaiting a first touch. Hottest:`);
      for (const l of awaitingFirst.slice(0, 3)) html += LI(`${B(escHtml(l.handle))} <span style="color:#8A948B">(${escHtml(l.tier)})</span> — &ldquo;${escHtml(stripTags(l.quote)).slice(0, 110)}&rdquo;`);
    }
  }

  html += `<div style="margin-top:32px;padding-top:18px;border-top:1px solid #E4E8DE;font-size:12px;color:#8A948B;line-height:1.7">
      <a href="${origin}" style="color:#2F6B4F;font-weight:600">Open the outreach platform</a> &middot; <a href="${RADAR_ORIGIN}" style="color:#2F6B4F">Demand Radar</a><br>
      Generated automatically by the IPTalons outreach platform.<br>
      <span style="color:#AAB4A6">Proposal requests may include repeat visits and automated scanners. Website and advertising analytics are not connected.</span>
    </div></div></div></div>`;

  // Plain-text alternative
  const text = [
    `IPTALONS DAILY SUMMARY — ${dateStr}`,
    ``,
    `RADAR SCAN: ${leads.length} active signals; ${firstDigest ? "first digest (baseline set)" : newLeads.length + " new since yesterday"}.`,
    ...newLeads.slice(0, 5).map((l) => `  - ${l.handle} (${l.tier} / ${l.src}): ${stripTags(l.pain)}`),
    ``,
    `PROPOSALS: ${sharesCreated.length} published, ${emailsToday.length} emailed in the last 24h.`,
    ...viewsToday.map((v) => `  - ${v.share.prospectName || v.share.name} viewed their proposal ${v.count}x`),
    ``,
    ``,
    `NEEDS ATTENTION: ${replied.length} replied/call, ${staleContacted.length} gone quiet, ${awaitingFirst.length} awaiting first touch.`,
    ``,
    `Open the platform: ${origin}`,
  ].join("\n");

  return { subject, html, text, seenHandles: radar ? leads.map(l => l.handle) : null, stats: { signals: leads.length, newSignals: newLeads.length, sharesCreated: sharesCreated.length, emailsToday: emailsToday.length, viewsToday: viewsToday.reduce((n, v) => n + v.count, 0), attention: attentionCount } };
}

async function sendViaResend(env: Env, to: string[], subject: string, html: string, text: string): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM || "IPTalons Proposals <onboarding@resend.dev>", to, subject, html, text }),
  });
}

// Send through whichever channel is configured: Resend when the API key is
// set, otherwise the Apps Script mailer (sends from the owner's Google
// account; ~100 emails/day quota). Returns null if neither is configured.
async function dispatchEmail(env: Env, to: string[], subject: string, html: string, text: string): Promise<{ ok: boolean; provider: string; detail: string } | null> {
  if (env.RESEND_API_KEY) {
    const resp = await sendViaResend(env, to, subject, html, text);
    return { ok: resp.ok, provider: "resend", detail: resp.ok ? "sent" : `${resp.status}: ${(await resp.text()).slice(0, 300)}` };
  }
  if (env.MAILER_URL && env.MAILER_SECRET) {
    const resp = await fetch(env.MAILER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.MAILER_SECRET, command: "send_email", payload: { to: to.join(","), subject, html, text, fromName: "IPTalons Outreach" } }),
      redirect: "follow",
    });
    let ok = false, detail = `${resp.status}`;
    try {
      const d = (await resp.json()) as { ok?: boolean; error?: string; result?: { message?: string } };
      ok = Boolean(d.ok);
      detail = d.error || d.result?.message || detail;
    } catch { detail = `non-JSON response (${resp.status})`; }
    return { ok, provider: "apps-script", detail };
  }
  return null;
}

// ─── Worker ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const origin = request.headers.get("Origin");
      if ((origin && origin !== url.origin) || request.headers.get("Sec-Fetch-Site") === "cross-site")
        return json({ error: "Cross-origin writes are not allowed" }, 403);
      if (request.method !== "DELETE" && request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json")
        return json({ error: "Content-Type must be application/json" }, 415);
      // Count actual bytes, not only a client-supplied Content-Length.
      if (request.body) {
        const reader = request.body.getReader();
        const parts: Uint8Array[] = []; let size = 0;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          size += value.byteLength;
          if (size > 262144) { await reader.cancel(); return json({ error: "Request too large" }, 413); }
          parts.push(value);
        }
        const bytes = new Uint8Array(size); let offset = 0;
        for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
        request = new Request(request.url, { method: request.method, headers: request.headers, body: bytes });
      }
    }
    const authed = await verifySession(env.APP_PASSWORD, getCookie(request, COOKIE));

    // Public share page: /p/<token>
    const shareMatch = url.pathname.match(/^\/p\/([a-z0-9]{10,40})$/);
    if (shareMatch && request.method === "GET") {
      return serveSharePage(request, env, ctx, shareMatch[1], authed);
    }

    if (url.pathname === "/api/claude" && request.method === "POST") {
      if (!authed) return json({ error: "unauthorized — sign in to use AI" }, 401);
      if (env.AI_ENABLED !== "true") return json({ error: "AI drafting is disabled by the workspace administrator" }, 503);
      if (!env.AI_RATE_LIMIT) return json({ error: "AI rate limit is not configured" }, 503);
      if (!(await env.AI_RATE_LIMIT.limit({ key: "iptalons-workspace" })).success)
        return json({ error: "Workspace AI request limit reached. Retry shortly." }, 429, { "Retry-After": "60" });
      return handleClaudeRequest(request, env);
    }

    if (url.pathname === "/api/me" && request.method === "GET") {
      return json({ authed, configured: Boolean(env.APP_PASSWORD) });
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      if (!env.LOGIN_RATE_LIMIT) return json({ error: "Login protection is not configured" }, 503);
      if (!(await env.LOGIN_RATE_LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") || "local" })).success)
        return json({ error: "Too many login attempts. Retry shortly." }, 429, { "Retry-After": "60" });
      if (!env.APP_PASSWORD) return json({ error: "auth not configured on the Worker (set the APP_PASSWORD secret)" }, 503);
      let body: { password?: string };
      try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
      if (!timingSafeEqual(String(body?.password || ""), env.APP_PASSWORD)) {
        return json({ error: "invalid password" }, 401);
      }
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await makeToken(env.APP_PASSWORD), SESSION_TTL_S) });
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    }

    // ── Authenticated share + signals APIs ────────────────────────────────
    if (url.pathname.startsWith("/api/shares") || url.pathname === "/api/send" || url.pathname.startsWith("/api/signals")) {
      if (!authed) return json({ error: "unauthorized — sign in again to sync your session" }, 401);
    }

    // ── Demand Radar signals (server-to-server proxy) ─────────────────────
    if (url.pathname === "/api/signals" && request.method === "GET") {
      if (!env.RADAR_PASSWORD) {
        return json({ error: "Radar sync is not configured — set the RADAR_PASSWORD secret on this Worker." }, 501);
      }
      const resp = await fetch(`${RADAR_ORIGIN}/api/export`, {
        headers: { Authorization: `Bearer ${env.RADAR_PASSWORD}` },
      });
      if (!resp.ok) return json({ error: `radar export failed (${resp.status})` }, 502);
      return json(await resp.json());
    }

    if (url.pathname === "/api/signals/update" && request.method === "POST") {
      if (!env.RADAR_PASSWORD) {
        return json({ error: "Radar sync is not configured — set the RADAR_PASSWORD secret on this Worker." }, 501);
      }
      let body: { handle?: string; patch?: Record<string, string> };
      try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
      const resp = await fetch(`${RADAR_ORIGIN}/api/lead`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RADAR_PASSWORD}`, "Content-Type": "application/json" },
        body: JSON.stringify({ handle: body.handle, patch: body.patch }),
      });
      return json(await resp.json(), resp.status);
    }

    if (url.pathname === "/api/shares" && request.method === "POST") {
      let body: { proposal?: Record<string, unknown> };
      try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
      const proposal = body?.proposal;
      const proposalId = String(proposal?.id || "");
      if (!proposal || typeof proposal !== "object" || Array.isArray(proposal) || !proposalId || proposalId.length > 128) return json({ error: "proposal with id required" }, 400);

      const now = new Date().toISOString();
      const share: ShareRecord = {
        token: newShareToken(), proposalId,
        name: String(proposal.name || "Proposal").slice(0, 300),
        prospectName: String((publicProposal(proposal).prospect as { name: string }).name),
        createdAt: now, updatedAt: now, proposal: publicProposal(proposal), views: [], emails: [],
      };
      await saveShare(env, share);
      return json({ ...shareSummary(share), url: `${url.origin}/p/${share.token}` });
    }

    if (url.pathname === "/api/shares" && request.method === "GET") {
      const list = await env.SHARES.list({ prefix: "share:" });
      const out = [];
      for (const key of list.keys) {
        const raw = await env.SHARES.get(key.name);
        if (!raw) continue;
        const s = JSON.parse(raw) as ShareRecord;
        out.push({ ...shareSummary(s), url: `${url.origin}/p/${s.token}` });
      }
      return json({ shares: out });
    }

    const delMatch = url.pathname.match(/^\/api\/shares\/([a-z0-9]{10,40})$/);
    if (delMatch && request.method === "DELETE") {
      const share = await loadShare(env, delMatch[1]);
      if (share) {
        await env.SHARES.delete(`share:${share.token}`);
        // Legacy byprop indexes are no longer used for publication.
      }
      return json({ ok: true });
    }

    if (url.pathname === "/api/send" && request.method === "POST") {
      return handleSend(request, env, url.origin);
    }

    // ── Policy & market intel (news items matched to the pipeline) ────────
    if (url.pathname === "/api/news" || url.pathname === "/api/news/ingest") {
      const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const bearerOk = Boolean(env.APP_PASSWORD) && Boolean(bearer) && timingSafeEqual(bearer, env.APP_PASSWORD!);
      if (!authed && !bearerOk) return json({ error: "unauthorized" }, 401);

      if (url.pathname === "/api/news" && request.method === "GET") {
        return json({ items: await loadNews(env) });
      }

      if (url.pathname === "/api/news/ingest" && request.method === "POST") {
        let body: { items?: NewsItem[] };
        try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
        const incoming = (body.items || []).filter((n) => n && n.id && n.title && n.at);
        if (!incoming.length) return json({ error: "items[] with id, title, at required" }, 400);
        const existing = await loadNews(env);
        const byId = new Map(existing.map((n) => [n.id, n]));
        let added = 0, updated = 0;
        for (const n of incoming) {
          if (byId.has(n.id)) updated++; else added++;
          byId.set(n.id, {
            id: String(n.id).slice(0, 80),
            at: n.at,
            source: String(n.source || "X").slice(0, 30),
            handle: String(n.handle || "").slice(0, 60),
            url: String(n.url || "").slice(0, 400),
            title: String(n.title).slice(0, 200),
            summary: String(n.summary || "").slice(0, 500),
            tags: (n.tags || []).slice(0, 8).map((t) => String(t).slice(0, 30)),
            severity: (["high", "medium", "info"].includes(n.severity) ? n.severity : "info") as NewsItem["severity"],
            match: {
              types: ((n.match && n.match.types) || []).slice(0, 6).map((t) => String(t).slice(0, 20)),
              entities: ((n.match && n.match.entities) || []).slice(0, 10).map((t) => String(t).slice(0, 80)),
            },
          });
        }
        const all = [...byId.values()].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 100);
        await env.SHARES.put(NEWS_KEY, JSON.stringify(all));
        return json({ ok: true, added, updated, total: all.length });
      }
    }

    // ── Daily digest (cookie session or Bearer APP_PASSWORD for scripts) ──
    if (url.pathname === "/api/digest" || url.pathname === "/api/digest/send") {
      const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const bearerOk = Boolean(env.APP_PASSWORD) && Boolean(bearer) && timingSafeEqual(bearer, env.APP_PASSWORD!);
      if (!authed && !bearerOk) return json({ error: "unauthorized" }, 401);

      if (url.pathname === "/api/digest" && request.method === "GET") {
        const digest = await buildDigest(env, url.origin);
        if (url.searchParams.get("format") === "json") {
          return json({ subject: digest.subject, stats: digest.stats, text: digest.text });
        }
        return new Response(digest.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      }

      if (url.pathname === "/api/digest/send" && request.method === "POST") {
        let body: { to?: string };
        try { body = await request.json(); } catch { body = {}; }
        const to = (body.to || env.DIGEST_TO || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (!to.length) return json({ error: "recipient required (body.to or DIGEST_TO secret)" }, 400);
        const digest = await buildDigest(env, url.origin);
        const sent = await dispatchEmail(env, to, digest.subject, digest.html, digest.text);
        if (!sent) return json({ error: "Email sending is not configured — set RESEND_API_KEY, or MAILER_URL + MAILER_SECRET.", needsSetup: true }, 501);
        if (!sent.ok) return json({ error: `Email provider error (${sent.provider}): ${sent.detail}` }, 502);
        if (digest.seenHandles) await env.SHARES.put(DIGEST_SEEN_KEY, JSON.stringify(digest.seenHandles));
        return json({ ok: true, to, provider: sent.provider, subject: digest.subject, stats: digest.stats });
      }
    }

    return env.ASSETS.fetch(request);
  },

  // Daily summary email — fires on the cron trigger in wrangler.jsonc.
  // No-ops (harmlessly) until RESEND_API_KEY and DIGEST_TO are configured.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const configured = env.RESEND_API_KEY || (env.MAILER_URL && env.MAILER_SECRET);
    if (!configured || !env.DIGEST_TO) return;
    const origin = "https://iptalons-proposals.skyabove.workers.dev";
    const digest = await buildDigest(env, origin);
    const to = env.DIGEST_TO.split(",").map((s) => s.trim()).filter(Boolean);
    const sent = await dispatchEmail(env, to, digest.subject, digest.html, digest.text);
    if (!sent?.ok) throw new Error("Daily digest delivery failed");
    if (digest.seenHandles) await env.SHARES.put(DIGEST_SEEN_KEY, JSON.stringify(digest.seenHandles));
  },
} satisfies ExportedHandler<Env>;

// ─── Public share page with view logging ───────────────────────────────────
async function serveSharePage(request: Request, env: Env, ctx: ExecutionContext, token: string, authed: boolean): Promise<Response> {
  const share = await loadShare(env, token);
  if (!share) {
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Proposal not found</title><body style=\"font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#F4F7EE;color:#1F2A1B\"><div style=\"text-align:center\"><div style=\"font-size:40px\">🍃</div><h1 style=\"font-size:20px\">This proposal link is no longer active</h1><p style=\"color:#5F6557\">Please contact IPTalons, Inc. at (972) 422-9169 for a fresh copy.</p></div>",
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const url = new URL(request.url);
  const isPreview = authed;
  if (!isPreview) {
    share.views.unshift({
      at: new Date().toISOString(),
      country: String((request as Request & { cf?: { country?: string } }).cf?.country || ""),
      ua: (request.headers.get("User-Agent") || "").slice(0, 140),
    });
    share.views = share.views.slice(0, MAX_VIEWS_KEPT);
    ctx.waitUntil(saveShare(env, share));
  }

  const assetResp = await env.ASSETS.fetch(new Request(new URL("/share.html", url.origin)));
  let html = await assetResp.text();
  const payload = JSON.stringify({ token: share.token, proposal: publicProposal(share.proposal) }).replace(/</g, "\\u003c");
  html = html.replace('"__SHARE_DATA__"', payload);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
}

// ─── Email send (Resend if configured) ──────────────────────────────────────
async function handleSend(request: Request, env: Env, origin: string): Promise<Response> {
  let body: { token?: string; to?: string; subject?: string; message?: string };
  try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }

  const share = body.token ? await loadShare(env, body.token) : null;
  if (!share) return json({ error: "share not found — create the share link first" }, 404);
  const to = String(body.to || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ error: "valid recipient email required" }, 400);

  const subject = String(body.subject || `Research Security Proposal — ${share.prospectName}`).slice(0, 200);
  const message = String(body.message || "").slice(0, 5000);
  const shareUrl = `${origin}/p/${share.token}`;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const htmlBody = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F2A1B;line-height:1.7">
    ${message.split(/\n\n+/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}
    <p style="margin:28px 0"><a href="${shareUrl}" style="background:#4A7C2E;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-family:system-ui;font-weight:600">View your proposal</a></p>
    <p style="font-size:13px;color:#5F6557">IPTalons, Inc. · 6060 N. Central Expressway, Suite 500, Dallas, TX 75206 · (972) 422-9169</p>
  </div>`;

  const sent = await dispatchEmail(env, [to], subject, htmlBody, `${message}\n\nView your proposal: ${shareUrl}`);
  if (!sent) {
    return json({
      error: "Email sending is not configured yet. Set the RESEND_API_KEY secret, or MAILER_URL + MAILER_SECRET for the Apps Script mailer — or use the copy-link / mail-app options.",
      needsSetup: true,
    }, 501);
  }
  if (!sent.ok) {
    return json({ error: `Email provider error (${sent.provider}): ${sent.detail}` }, 502);
  }

  share.emails.unshift({ at: new Date().toISOString(), to, subject });
  share.emails = share.emails.slice(0, 50);
  await saveShare(env, share);
  return json({ ok: true, to, subject, provider: sent.provider });
}

// ─── Claude proxy (unchanged) ───────────────────────────────────────────────
async function handleClaudeRequest(request: Request, env: Env): Promise<Response> {
  let body: {
    messages?: Anthropic.MessageParam[];
    model?: string;
    max_tokens?: number;
    system?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "messages must be a non-empty array" }, 400);
  }

  if (body.messages.length > 20 || body.messages.some(m => !m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string" || m.content.length > 20000)
      || (body.system !== undefined && (typeof body.system !== "string" || body.system.length > 20000)))
    return json({ error: "AI requests require bounded text messages" }, 400);

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      { error: "AI is not configured. Ask the workspace administrator to configure the provider." },
      401,
    );
  }

  const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : "claude-opus-4-7";
  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: 60000 });

  try {
    const response = await client.messages.create({
      model,
      max_tokens: clampTokens(body.max_tokens, 2000),
      system: body.system,
      messages: body.messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return json({
      text,
      model: response.model,
      stop_reason: response.stop_reason,
      usage: response.usage,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return json({ error: "Invalid Claude API key" }, 401);
    }
    if (e instanceof Anthropic.RateLimitError) {
      return json({ error: "Rate limited by Anthropic — please retry" }, 429);
    }
    if (e instanceof Anthropic.APIError) {
      return json({ error: e.message }, e.status ?? 500);
    }
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
}

function clampTokens(n: number | undefined, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(4000, Math.floor(n)));
}
