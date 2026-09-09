# Managed paid-pilot launch checklist

## Approved commercial shape

- [x] One managed IPTalons workspace for the first release.
- [x] Four named administrators: Allen, Adam, Harsha, and Keenen.
- [x] Ninety-day pilot.
- [x] $1,500 onboarding plus $499 per month, billed monthly in advance.
- [x] $2,997 pilot total before applicable taxes.
- [x] Self-service checkout and multi-company tenancy deferred.

## Product and security

- [x] Private GitHub repository and passing required checks.
- [x] Separate staging Worker, KV namespace, and D1 database.
- [x] Individual Cloudflare Access identities and application membership checks.
- [x] Shared prospects/proposals, revision history, and conflict detection.
- [x] Immutable published proposals with allowlisted public fields.
- [x] Expiring and revocable high-entropy recipient links.
- [x] Public `/p/*` route isolated from the protected workspace.
- [x] Exact D1 view events and idempotent email-delivery ledger.
- [x] Self-hosted production frontend bundles and dedicated public renderer.
- [x] Recipient CSP and privacy headers.
- [x] Backup export and real D1 restore rehearsal.
- [ ] Business owner approves all proposal service, pricing, savings, ORCID, dataset-size, monitoring, and compliance claims.
- [ ] Browser acceptance pass by each named administrator.

## Providers

- [x] Apify staging collector installed and bounded.
- [ ] Confirm commercial collection rights and retention rules for every enabled Apify source/actor.
- [ ] Verify a dedicated Resend subdomain with SPF and DKIM.
- [ ] Install a sending-only Resend API key as a Cloudflare secret.
- [ ] Configure an approved `EMAIL_FROM` and reply path.
- [ ] Test receipt, spam placement, links, idempotency, provider-ID storage, bounce, and complaint handling.
- [ ] Keep funded AI disabled until provider credentials, budget controls, and approved use are complete.

## Commercial and legal

- [x] Pilot scope and price approved.
- [x] Identify the legal entity that licenses and supports the workspace: IPTalons, Inc.
- [ ] Confirm invoice name, billing address, tax treatment, payment instructions, and invoice recipient.
- [ ] Approve customer agreement, privacy terms, acceptable-use limits, support channel, retention, and termination/export terms.
- [ ] Confirm ownership or authorization for the IPTalons brand, domain, source data, proposal content, and provider accounts.
- [ ] Record the paid entitlement start/end dates after payment clears.

## Production

- [ ] Confirm the Cloudflare account that will permanently own production.
- [x] Reserve `proposals.iptalons.com` as the eventual production hostname. Launch the first pilot on the Skyabove `workers.dev` origin; DNS cutover remains outstanding.
- [ ] Complete the production inventory. Worker, bindings, secret names, and empty KV keyset are documented; browser-local record sets and published links still require export from every profile that used the legacy origin.
- [ ] Provision isolated production D1/KV resources; do not reuse staging bindings.
- [x] Configure production Access for the four named administrators and a separate Everyone bypass limited to `/p/*`.
- [x] Provision clean production D1 and KV resources, apply all migrations, and add the four administrators.
- [x] Deploy the managed production Worker and verify anonymous rendering, exact view recording, revocation, and cleanup with a synthetic proposal.
- [ ] Apply migrations, deploy the reviewed commit, and record the Worker version ID.
- [ ] Run the release-gate acceptance suite with controlled data.
- [ ] Test rollback without reverting database migrations.
- [ ] Set operational owner, support hours, incident contacts, backup retention, and a first monthly restore-rehearsal date.

## Go/no-go rule

Do not invoice or onboard a paid pilot as live until every unchecked item that affects the agreed pilot scope is either completed or explicitly removed from that scope in the signed agreement. Do not describe provider acceptance as email delivery, page requests as human readership, sales signals as verified identity or intent, or the proposal workspace as a research-compliance system.
