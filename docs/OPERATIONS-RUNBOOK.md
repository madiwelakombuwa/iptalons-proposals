# IPTalons managed workspace operations

This runbook covers the managed paid-pilot deployment. Replace bracketed values deliberately. Never point rehearsal commands at the production database.

## Release gate

1. Confirm `git status --short` is empty and the GitHub `Checks` workflow passed for the commit being released.
2. Run `npm ci`, `npm run check`, and `npx wrangler deploy --env staging --dry-run` from a fresh checkout.
3. Export the current target D1 database before applying migrations.
4. Apply additive migrations before deploying code that depends on them.
5. Verify named-user login, shared-record load/save, proposal publication, anonymous recipient rendering, expiry/revocation, and event recording in staging.
6. Deploy the reviewed commit once. Record the Worker version ID and migration names in the release log.

## D1 backup

Create a timestamped directory outside the repository and export the database:

```sh
mkdir -p "$HOME/iptalons-backups"
npx wrangler d1 export iptalons-proposals-staging --env staging --remote \
  --output "$HOME/iptalons-backups/iptalons-staging-YYYYMMDD-HHMMSS.sql"
```

Treat exports as confidential customer data. Keep them out of Git, cloud-sync folders without approval, email, and support tickets. Record the file checksum and retention date separately.

## Restore rehearsal

Use a unique temporary database name. Match the source database region unless a documented residency decision requires otherwise.

```sh
npx wrangler d1 create iptalons-restore-rehearsal-YYYYMMDD --location apac
npx wrangler d1 execute iptalons-restore-rehearsal-YYYYMMDD --remote --file /absolute/path/to/backup.sql
```

Apply migrations created after the backup. When the temporary database is not present in `wrangler.jsonc`, apply those SQL files directly in order:

```sh
npx wrangler d1 execute iptalons-restore-rehearsal-YYYYMMDD --remote --file migrations/0003_email_deliveries.sql
```

Compare source and restored counts for `workspace_members`, `workspace_records`, `workspace_record_versions`, `published_proposals`, `proposal_events`, and `email_deliveries`. Exercise an insert and update in the restored database and confirm the revision trigger creates one version per revision.

After recording the result, delete only the temporary rehearsal database:

```sh
npx wrangler d1 delete iptalons-restore-rehearsal-YYYYMMDD --skip-confirmation
```

## Proposal-link incident

1. Revoke the affected link from the authenticated workspace. Revocation is a soft delete and retains its audit trail.
2. Confirm an anonymous `GET /p/<token>` returns the inactive-link response.
3. Publish a new immutable version if the recipient still needs access.
4. Review proposal events and Cloudflare request logs without copying proposal bodies or tokens into routine logs.

If all recipient links must be closed, disable the path-specific `IPTalons staging public proposals` Access application. Keep the named-user workspace application active.

## Member revocation

Remove the person from both controls:

1. Disable the row in `workspace_members` and advance `tokens_valid_after`.
2. Remove the address from the Cloudflare Access named-user policy.
3. Verify a fresh request is rejected. Record who approved the change and when it took effect.

## Resend activation

1. Verify a dedicated sending subdomain with SPF and DKIM in Resend.
2. Create an API key restricted to sending mail from the approved domain.
3. Install `RESEND_API_KEY` as a Worker secret; never store it in Git or browser storage.
4. Set `EMAIL_FROM` to the exact verified-domain sender.
5. Send to controlled addresses at two mailbox providers. Verify receipt, spam placement, links, reply behavior, provider ID capture, D1 `accepted` state, and a single engagement event.
6. Repeat the same operation ID and confirm no second email is sent.
7. Review bounce/complaint handling before sending to customers. Provider acceptance alone is not proof of delivery.

## Rollback

Use Cloudflare Worker version rollback for application-code regressions. A code rollback does not reverse D1 migrations or data writes. Migrations are additive; do not drop new fields or tables during an incident. Restore data into a separate database first, inspect it, and plan any controlled replacement as a distinct change.

## Current rehearsal evidence

On 2026-09-10, `/tmp/iptalons-staging-before-email-ledger.sql` was imported into a separate APAC D1 database. The restored counts matched staging: four members and zero records, versions, publications, events, and deliveries. Migration `0003_email_deliveries.sql` applied successfully. A synthetic proposal insert and update produced revisions 1 and 2 through the database triggers. The synthetic database was then deleted; staging and production were not modified by the rehearsal.
