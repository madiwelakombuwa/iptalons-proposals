# Existing production inventory — 2026-09-10

This is a read-only inventory of the current Skyabove deployment. No production code, bindings, data, routes, or secrets were changed.

## Worker

- Service: `iptalons-proposals`
- URL: `https://iptalons-proposals.skyabove.workers.dev`
- Current observed version: `5f88b9dd-1931-4261-8069-dbebb66ec9dc`
- Version created: 2026-08-13 by `harsha@lookermetrics.com`
- Handlers: `fetch`, `scheduled`
- Compatibility date: 2026-05-06
- Public root behavior: returns the legacy application login page without Cloudflare Access
- Authentication model: legacy shared `APP_PASSWORD`

## Bindings

- Static Assets
- KV `SHARES`: namespace `938f657a4f2e4f649fa844cb3ff10db8`
- No production D1 binding
- No production rate-limit bindings

## Secret names

Values were not read or exported.

- `APP_PASSWORD`
- `DIGEST_TO`
- `MAILER_SECRET`
- `MAILER_URL`
- `RADAR_PASSWORD`

No `RESEND_API_KEY`, `APIFY_API_TOKEN`, or `ANTHROPIC_API_KEY` was listed on the current version.

## KV inventory

The production `SHARES` namespace returned zero keys. The key inventory is stored outside the repository at `/tmp/iptalons-production-kv-keys-20260910.json`, mode-restricted by the creating shell. It is three bytes (`[]` plus newline) with SHA-256:

`37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`

An empty server KV namespace does not establish that there are no production records. The legacy application stores working proposals and prospects in browser local storage. Each browser profile that used this origin must export its records before production replacement. A different domain cannot read those origin-local records.

## Migration consequence

Do not deploy the current repository’s top-level configuration over this Worker. It would retain the legacy production KV binding, add behavior that expects newer secrets/bindings, and would not create the D1 database required by managed access and durable records.

Provision a distinct production D1 database and KV namespace, migrate reviewed browser exports, configure named-user Access and a path-specific public proposal route, install environment-specific secrets, and complete staging acceptance before directing production traffic to the new release.
