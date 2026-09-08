# Audit evidence — 8 September 2026

These files support [the paid-product study](/Users/harsha/iptalons-proposals/docs/PAID-PRODUCT-STUDY.md).

- `probe-results.json`: eleven final isolated behavior checks, including one access-denial control.
- `audit-probes.mjs`: reproducible probes using the current source, fake credentials, an in-memory KV model, an intercepted Anthropic SDK `post`, and mocked `fetch`.
- `typecheck-results.txt`: compiler failure and frontend syntax-check results.
- `dry-run-results.txt`: successful locked Wrangler build; existing namespace identifier redacted.
- `audit-results.json`: raw npm dependency audit, including advisory links and affected dependency paths. This is a dependency inventory finding, not a production exploitability assessment.
- `source-manifest.json`: hashes of the original application/configuration files used in the study; credential and local agent settings files excluded.

No production deployment, customer email, or payment was performed. The final probes make no live provider calls. An early probe attempt received an invalid-key response using a fake credential and synthetic audit text before SDK transport interception was corrected. It used no real key or customer data.

The probes intentionally assert that the audited defects occur. They are evidence tools, not a regression suite whose existing expectations should be preserved after fixes. In particular, do not wire them into product CI as “passing security tests.”

To reproduce, use a disposable directory. The commands below do not deploy anything:

```sh
audit_repo=/Users/harsha/iptalons-proposals
audit_tmp=$(mktemp -d)
cp "$audit_repo/package.json" "$audit_repo/package-lock.json" "$audit_tmp/"
cp "$audit_repo/docs/audit-2026-09-08/audit-probes.mjs" "$audit_tmp/"
cd "$audit_tmp"
npm ci --ignore-scripts --no-audit --no-fund
AUDIT_REPO="$audit_repo" node audit-probes.mjs
```

Node used: v22.17.0. The script writes a transpiled Worker and results into that disposable working directory. It reads the original source path supplied in `AUDIT_REPO`, so results can change after application edits. It does not simulate real Cloudflare KV replication, request limits, or actual identity/payment provider behavior.

For the original typecheck and deployment dry run, a separate copy of `src`, `public`, `tsconfig.json`, and `wrangler.jsonc` was placed in the disposable dependency directory. The checks were `tsc --noEmit` and `wrangler deploy --dry-run --outdir dry-run-build` using the locked tools. The latter succeeded despite the former failing: Wrangler bundling does not substitute for type validation.
