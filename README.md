# IPTalons Proposals

Managed IPTalons workspace under development. This is an existing proposal prototype being hardened; it is not yet ready for a paid production launch.

## Local development

Use Node 22 and npm. Run `npm ci`, copy `.dev.vars.example` to `.dev.vars`, replace the local password, and run `npm run dev`. Wrangler simulates KV locally. Do not use remote storage for development.

Run `npm run check` for Worker type checking, network-isolated security regression tests, and JSX syntax validation. Run `npm run deploy:check` to validate the Cloudflare upload without deploying. `npm audit` checks dependency advisories.

The UI currently loads React, Babel, and Chart.js from external CDNs. A production asset build is still required. Drafts remain in browser storage: use Settings → Export backup before clearing storage or changing browser. Export files contain confidential records. There is no automatic restore or server-side draft sync yet.

## Deployment status

`wrangler.jsonc` retains the existing Worker account and KV identifiers. Do not replace or migrate that storage without a verified backup. Staging has separate KV and D1 resources in the Skyabove account. Its Worker configuration disables public routes, preview URLs, cron and AI. Production has not been redeployed. The sibling Radar Worker has a separate configuration and requires its own review.

AI defaults to disabled. Login and AI rate-limit bindings are configured; they are approximate per-location limits, not a global financial budget. Individual identities, durable usage accounting, and provider spending controls are required before paid access.

GitHub CI checks code but does not deploy. Production secrets belong in Cloudflare, never GitHub source. Existing exposed/shared credentials need operator rotation coordinated with existing integrations.

See [the deep product study](docs/PAID-PRODUCT-STUDY.md) and [implementation status](docs/IMPLEMENTATION-STATUS.md).
