# Managed-workspace implementation status — 2026-09-08

The selected first release is a managed IPTalons workspace, owned on GitHub by `madiwelakombuwa` under the private repository name `iptalons-proposals`.

## Implemented locally

- Server-verified login replaces browser-only authentication and the fallback password. Login throttling is required; missing protection fails closed.
- AI requires a valid session, explicit enablement, and a rate-limit binding. Browser API-key overrides are ignored. Inputs and output tokens are bounded. Provider retries are disabled. AI remains disabled by default.
- Cross-origin API writes and non-JSON writes are rejected; request bytes are bounded while reading.
- Public proposal snapshots use an allowlist on write and read, including old snapshots. Internal notes, activity, prospect intelligence, and other editor fields are excluded. Every publication creates a distinct token, even when local proposal IDs collide.
- Opening Share does not publish. Anonymous `?preview=1` no longer bypasses request logging. Shares receive no-store, noindex and no-referrer headers.
- Saved drafts are no longer seeded with demo proposals or silently given new follow-up dates. New drafts use UUIDs. Malformed saved records are preserved instead of overwritten, and storage failures show an alert.
- Settings exports the original proposal/prospect storage strings in a private JSON backup. Restore and database migration remain pending.
- Simulated signing was replaced with an unavailable-state explanation. Unverified certification claims and fabricated analytics were removed from the main trust screen, analytics screen, and daily digest. Other legacy/demo assets still require product-copy review.
- Digest preview is read-only. Its seen-state advances only after a successful provider response. Source URLs are protocol-checked and attribute-escaped.
- Updated dependencies, generated binding declarations, pinned GitHub check actions, Worker regression tests, and JSX syntax checks.

## Validation

`npm run check`: Worker types, five network-isolated regression tests, and three JSX syntax checks pass. `npm run deploy:check`: Cloudflare dry run passes. `npm audit`: no known vulnerabilities at the time of this pass. These checks do not establish browser end-to-end correctness, production email deliverability, or real provider integration success. No emails were sent and no live AI calls were made by the regression tests.

## Required before the managed paid release

1. Publish privately under madiwelakombuwa (owner confirmed by the user). Enable branch protection and verify CI on GitHub.
2. Confirm the intended Cloudflare account, domain, and existing production resources. Export live KV and browser records; test restoration. Provision separate staging resources without touching existing records.
3. Replace the shared password with individual identity, allowlisted membership and revocable sessions. Define administrator and member permissions.
4. Implement authoritative D1 workspace/prospect/proposal/version storage, an idempotent browser-data importer with review and conflict handling, and tested backups. Preserve original IDs and dates during migration.
5. Replace KV read-modify-write engagement records with durable events. Current KV writes can race; counts are capped at 200 and listing lacks pagination. They cannot be sold as precise engagement analytics. Revocation, expiry and version-management UI remain incomplete.
6. Compile and self-host production frontend dependencies; remove legacy pitch/demo assets; audit all service/pricing/compliance copy. Test the full browser workflow, including login/logout, storage errors, export, publication and recipient rendering.
7. Add durable AI quotas and provider spending controls. The native rate limiter is approximate and per location, so it is not a billing ledger or global cost ceiling.
8. Harden and coordinate the sibling Radar Worker. Existing Radar records and credentials have not been migrated or changed.
9. Configure verified email delivery, retries and idempotency. A provider acceptance response is not proof of inbox delivery; a crash after provider acceptance can still duplicate a digest on retry.
10. Establish the managed commercial offer, support process, customer agreement and invoicing. Self-service subscriptions, Stripe webhooks and multi-company tenancy are deferred by the chosen release scope.

The source changes above are an initial hardening increment, not a declaration that all audit findings are closed. Existing live behavior remains unchanged until an explicit deployment occurs.

## Cloudflare CLI staging provision

The CLI is authenticated as harsha@lookermetrics.com with access to the app’s existing Skyabove account (`aa96f50b9174b128d2cbe8f6db54b940`). Created an empty staging KV namespace (`a4d813d127874f569188f0c3d3daf77a`) and empty D1 database `iptalons-proposals-staging` (`e0d1b5d2-9651-4a59-90cb-3ea9db8afe71`). Cloudflare placed this test database in APAC; no production residency decision is implied.

The `staging` environment binds these separate resources, disables cron, AI, workers.dev and preview URLs, and has no routes. The staging Worker is uploaded as version `9a73bf66-f32f-426a-8dfc-6a11db591489`, with no public targets or secrets configured. Existing production storage has not been modified or backed up in this step. D1 application tables, identity integration and shared-data APIs remain to be implemented.

The private GitHub repository has been published under madiwelakombuwa; its initial CI run passed.

The user confirmed Skyabove as the hosting account for now. Staging remains isolated from the existing production KV namespace.
