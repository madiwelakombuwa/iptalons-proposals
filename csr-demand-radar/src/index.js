/**
 * IPTalons CSR Demand Radar — Worker
 * Serves the static radar page (public, read-only) and a team-only workflow API:
 *   POST /api/login   {password}          -> HMAC session cookie (30 days)
 *   POST /api/logout                      -> clears cookie
 *   GET  /api/me                          -> {authed}
 *   GET  /api/state   (auth)              -> {leads:{[handle]:{status,notes,owner,updatedAt}}, activity:[...]}
 *   POST /api/lead    (auth) {handle,patch:{status?,notes?,owner?}} -> updated state
 *   GET  /api/export  (auth or Bearer)    -> {leads:[...LEADS], state:{...}} — CORS-enabled feed
 *                                            for the proposal tool's "Import from Radar".
 * Lead state lives in KV (binding STATE, key "state:v1"). The lead list itself
 * stays in public/index.html's LEADS array (maintained by the daily refresh task);
 * /api/export parses it out of the deployed asset so there is one source of truth.
 */

const STATE_KEY = "state:v1";
const COOKIE = "csr_sess";
const SESSION_TTL_S = 30 * 24 * 3600;
const STATUSES = ["new", "contacted", "replied", "call", "won", "lost"];

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

const enc = new TextEncoder();

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = enc.encode(a), bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < ab.length; i++) out |= ab[i] ^ bb[i];
  return out === 0;
}

async function makeToken(secret) {
  const ts = String(Date.now());
  return `${ts}.${await hmac(secret, ts)}`;
}

async function verifyToken(secret, token) {
  if (!secret || !token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const ts = token.slice(0, dot), sig = token.slice(dot + 1);
  const age = (Date.now() - Number(ts)) / 1000;
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_S) return false;
  return timingSafeEqual(sig, await hmac(secret, ts));
}

function getCookie(req, name) {
  const raw = req.headers.get("Cookie") || "";
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

const sessionCookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

async function loadState(env) {
  const raw = await env.STATE.get(STATE_KEY);
  const st = raw ? JSON.parse(raw) : {};
  if (!st.leads) st.leads = {};
  if (!st.activity) st.activity = [];
  return st;
}

// Origins allowed to call /api/export cross-site (the proposal tool).
const EXPORT_ORIGINS = new Set([
  "https://iptalons-proposals.skyabove.workers.dev",
  "http://localhost:8787",
]);

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  if (!EXPORT_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// Extract the LEADS array from the deployed index.html asset. The array is a
// JS object literal (bare keys, double-quoted strings); scan it with string
// awareness, quote the bare keys, and JSON.parse the result.
function extractLeads(html) {
  const anchor = html.indexOf("const LEADS=[");
  if (anchor === -1) return null;
  const start = html.indexOf("[", anchor);
  let depth = 0, end = -1, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  const src = html.slice(start, end + 1);
  let out = "";
  inStr = false; esc = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === ",") {
      let after = i + 1;
      while (after < src.length && /\s/.test(src[after])) after++;
      if (src[after] === "]" || src[after] === "}") continue; // trailing comma
    }
    if (/[A-Za-z_$]/.test(c)) {
      let k = i;
      while (k < src.length && /[\w$]/.test(src[k])) k++;
      let after = k;
      while (after < src.length && /\s/.test(src[after])) after++;
      if (src[after] === ":") { out += `"${src.slice(i, k)}"`; i = k - 1; continue; }
    }
    out += c;
  }
  return JSON.parse(out);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    const secret = env.AUTH_PASSWORD;
    // Auth: session cookie (the radar page) OR Bearer team password
    // (server-to-server calls from the proposal tool worker).
    const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const bearerOk = Boolean(secret) && Boolean(bearer) && timingSafeEqual(bearer, secret);
    const authed = bearerOk || await verifyToken(secret, getCookie(request, COOKIE));

    if (url.pathname === "/api/me" && request.method === "GET") {
      return json({ authed, configured: Boolean(secret) });
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      if (!secret) return json({ error: "auth not configured" }, 503);
      let body;
      try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
      if (!timingSafeEqual(String(body.password || ""), secret)) {
        return json({ error: "invalid password" }, 401);
      }
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await makeToken(secret), SESSION_TTL_S) });
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    }

    if (url.pathname === "/api/export") {
      const cors = corsHeaders(request);
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }
      if (request.method !== "GET") return json({ error: "not found" }, 404, cors);

      const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const bearerOk = secret && bearer && timingSafeEqual(bearer, secret);
      if (!authed && !bearerOk) return json({ error: "unauthorized" }, 401, cors);

      const assetResp = await env.ASSETS.fetch(new Request(new URL("/index.html", url.origin)));
      const html = await assetResp.text();
      let leads;
      try {
        leads = extractLeads(html);
      } catch (e) {
        return json({ error: `lead parse failed: ${e.message}` }, 500, cors);
      }
      if (!leads) return json({ error: "LEADS array not found in page" }, 500, cors);

      return json({ leads, state: await loadState(env), exportedAt: new Date().toISOString() }, 200, cors);
    }

    if (!authed) return json({ error: "unauthorized" }, 401);

    if (url.pathname === "/api/state" && request.method === "GET") {
      return json(await loadState(env));
    }

    if (url.pathname === "/api/lead" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "bad request" }, 400); }
      const handle = String(body.handle || "").slice(0, 120);
      const patch = body.patch || {};
      if (!handle) return json({ error: "handle required" }, 400);
      if (patch.status !== undefined && !STATUSES.includes(patch.status)) {
        return json({ error: "bad status" }, 400);
      }

      const st = await loadState(env);
      const cur = st.leads[handle] || { status: "new", notes: "", owner: "" };
      const next = { ...cur };
      const now = new Date().toISOString();

      for (const field of ["status", "notes", "owner"]) {
        if (patch[field] !== undefined && String(patch[field]) !== String(cur[field] ?? "")) {
          next[field] = String(patch[field]).slice(0, field === "notes" ? 4000 : 120);
          st.activity.unshift({ at: now, handle, field, from: cur[field] ?? "", to: next[field] });
        }
      }
      next.updatedAt = now;
      st.leads[handle] = next;
      st.activity = st.activity.slice(0, 300);

      await env.STATE.put(STATE_KEY, JSON.stringify(st));
      return json({ ok: true, lead: next });
    }

    return json({ error: "not found" }, 404);
  },
};
