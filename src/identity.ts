import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export interface Identity { email: string; subject: string; role: 'admin' | 'member' }
export interface IdentityConfig { ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string; DB?: D1Database }
// Only public verification keys are cached. No user or request state is retained.
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export async function identify(request: Request, env: IdentityConfig, testKey?: JWTVerifyGetKey): Promise<Identity | null> {
  const domain = env.ACCESS_TEAM_DOMAIN;
  if (!domain || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) || !env.ACCESS_AUD || !env.DB) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 16384) return null;
  const issuer = `https://${domain}`;
  let keys = testKey || keySets.get(issuer);
  if (!keys) {
    const remote = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), { timeoutDuration: 5000 });
    keySets.set(issuer, remote);
    keys = remote;
  }
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer, audience: env.ACCESS_AUD, algorithms: ['RS256'], requiredClaims: ['sub', 'email', 'iat', 'exp'],
    });
    if (typeof payload.email !== 'string' || typeof payload.sub !== 'string' || typeof payload.iat !== 'number') return null;
    const email = payload.email.trim().toLowerCase();
    if (payload.iat > Math.floor(Date.now()/1000) + 30) return null;
    // First successful login pins the verified subject. Changed identities need an explicit admin reset.
    await env.DB.prepare('UPDATE workspace_members SET subject = ? WHERE email = ? AND subject IS NULL AND enabled = 1 AND tokens_valid_after < ?')
      .bind(payload.sub, email, payload.iat).run();
    const member = await env.DB.prepare('SELECT role FROM workspace_members WHERE email = ? AND subject = ? AND enabled = 1 AND tokens_valid_after < ?')
      .bind(email, payload.sub, payload.iat).first<{ role: Identity['role'] }>();
    return member ? { email, subject: payload.sub, role: member.role } : null;
  } catch { return null; }
}
