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

The `staging` environment binds these separate resources and disables cron and AI. Its `workers.dev` target is enabled behind Cloudflare Access for team testing. Existing production storage has not been modified or backed up in this step.

The private GitHub repository has been published under madiwelakombuwa; its initial CI run passed.

The user confirmed Skyabove as the hosting account for now. Staging remains isolated from the existing production KV namespace.

The planned stable hostname is `proposals.iptalons.com`. The first pilot may use the Skyabove `workers.dev` origin until DNS is ready. `APP_ORIGIN` now controls absolute links generated by scheduled jobs, so the later hostname change does not require an application-code change. Existing published links remain tied to the origin on which they were issued and must be handled during cutover.

## Managed production launch

The managed release is deployed at `https://iptalons-proposals.skyabove.workers.dev` as Worker version `3bdc3625-b68d-485c-b73f-a107337260d2`. Production uses a clean APAC D1 database, `iptalons-proposals-production` (`66fe06a6-f030-4581-a48d-9250b5d6964d`), and a separate KV namespace (`e31eb0ecfae34d069f729649b6ab3fd6`). All three migrations are applied. Allen, Adam, Harsha, and Keenen are enabled administrators.

Cloudflare Access application `41ddbc99-26de-4d11-b1a8-440ba5072b78` protects the production Worker with the named-administrator policy. Application `53a77d05-10cd-4ef3-982e-ad022e1d127a` bypasses Access only for `iptalons-proposals.skyabove.workers.dev/p/*`. An anonymous synthetic proposal rendered with the dedicated recipient bundle, recorded one D1 view, returned 404 immediately after revocation, and was then removed with its test event. Production is otherwise empty.

Production email and Apify collection remain disabled until their production secrets are installed. The API returns a controlled setup error for an administrator-triggered signal scan without `APIFY_API_TOKEN`; scheduled email delivery no-ops without provider configuration.

## Individual access and shared records

Staging now uses a Cloudflare Access application scoped to the `iptalons-proposals-staging` Worker. Its allow policy names `harsha@lookermetrics.com`, and the application session cookie is HTTP-only. The Worker independently validates Access JWT signature, issuer, audience, expiry, email, and subject before consulting its own membership table. `harsha@lookermetrics.com` is the initial administrator; additional people must be added to both the Access policy and the application membership table.

D1 migrations create members, current workspace records, and immutable record revisions. Saves use optimistic revision checks, so stale browser tabs receive a conflict instead of overwriting newer work. The browser loads shared proposals and prospects, warns about unsaved changes, supports explicit saves and exports, and offers an administrator-only reviewed import that never overwrites an existing ID. A synthetic proposal was saved and reloaded through the live staging UI, then removed from both current records and version history.

The protected staging URL is `https://iptalons-proposals-staging.skyabove.workers.dev`. AI, cron, and external recipient access remain disabled. Staging proposal links are protected by the same team Access policy and therefore must not be sent to customers yet.

## Progress since the initial hardening pass

- Added Allen, Adam, Harsha, and Keenen as individually allowlisted administrators in both Cloudflare Access and D1.
- Replaced the managed Team text list with record-history-backed member and workspace performance cards.
- Replaced the static Radar import in staging with a bounded Apify X collector, explainable qualification, stable source IDs, visible failures, and persistent review state. Staging stores 14 qualified results from the first 50-item run.
- Moved new managed-workspace publications and engagement events to D1. Published proposal content is immutable; views and provider-accepted emails are append-only events; view totals are no longer capped; revocation retains the audit trail. The Worker keeps a KV compatibility path when no D1 binding exists.
- Added an additive publication migration, concurrency/revocation regression coverage, and a verified staging database export at `/tmp/iptalons-staging-after-publications.sql` on the deployment host.
- Prospect create, edit, and delete operations now commit to D1 immediately and surface failures before closing the editor. Proposal edits use debounced revision-checked D1 saves with visible saving/saved status and the existing unload guard.
- Frontend deployments now use content-hashed bundle filenames, preventing browsers from retaining an old application implementation after a release.
- Workspace administrators can store Claude and Resend credentials through write-only encrypted settings. Resend includes a self-test restricted to the signed-in administrator's Access email.
- Successful Claude calls are recorded in an append-only D1 usage ledger, and Settings reports the current month's request and token totals.

The staging recipient-delivery gate is now open at `/p/*` through a path-specific Cloudflare Access bypass. The workspace root and private APIs remain behind the named-user Access application. A synthetic proposal rendered anonymously end to end, loaded its first-party assets, and recorded exact D1 view events; the test record and events were then removed.

The workspace frontend now builds React and Chart.js into a minified, self-hosted production bundle. The recipient surface uses a dedicated 4.5 KB renderer containing only the published proposal schema; it no longer downloads React, Babel, Chart.js, internal screens, demo prospects, or team addresses. Raw JSX and the legacy pitch page are excluded from Cloudflare static-asset uploads. Recipient responses carry a nonce-based Content Security Policy, no-store, noindex, no-referrer, nosniff, and frame-denial controls.

Resend is selected for outbound proposal delivery. Staging now has a D1 delivery ledger keyed by a browser-generated operation ID, the same ID is passed to Resend as its idempotency key, and accepted engagement events deduplicate on that operation. Repeated accepted submissions return the recorded result; conflicting payload reused operation IDs are rejected. A pre-migration backup is stored at `/tmp/iptalons-staging-before-email-ledger.sql`. Sending remains disabled until a restricted Resend API key and a sender on a verified domain are installed and tested.

A real recovery rehearsal imported the pre-email-ledger backup into a separate APAC D1 database, applied the current migration, matched all source table counts, and verified that insert/update triggers produced immutable revisions 1 and 2. The temporary database was deleted after verification. The repeatable process and incident procedures are documented in `docs/OPERATIONS-RUNBOOK.md`.

The next managed-pilot gates are Resend domain/key configuration and deliverability testing, remaining product-copy review, and the commercial offer/customer agreement. Self-service billing remains deferred for the managed-workspace release. Production resources and secrets remain unchanged.
