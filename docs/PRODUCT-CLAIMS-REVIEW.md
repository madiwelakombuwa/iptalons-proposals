# Product claims requiring business approval

**Purpose:** prevent unverified statements from appearing in a paid proposal. A business owner should mark each claim approved, revise it with substantiation, or remove it. Source code presence does not establish truth.

## Release-blocking claims

| Claim family | Current representation | Evidence required before approval | Status |
| --- | --- | --- | --- |
| Regulatory outcome | CSR “ensures” funded researchers meet minimum requirements under NSPM-33, the CHIPS Act, NDAA, and funding-agency rules | Legal/compliance review of the exact language, supported control mapping, scope limitations, and update ownership | Open |
| Verifiable designation | CSR designation links to a researcher’s ORCID identifier and can be checked by sponsors | Demonstrated production integration, ORCID permissions, screenshots/test evidence, and documented failure/revocation behavior | Open |
| ORCID write-back | The platform writes certification information back to ORCID | Demonstrated provider flow and authorization basis | Open |
| Foreign-risk adjudication | IPTalons adjudicates affiliations/associations and maintains digital compliance records | Approved operating procedure, reviewer qualifications, record scope, retention, access controls, and customer terms | Open |
| Continuous monitoring | RedBook detects new high-risk collaborators and alerts the RSO/IPTalons for re-adjudication | Live data sources, match methodology, update frequency, false-positive controls, alert evidence, and service limits | Open |
| Dataset scale | Analysis covers more than 300 million publications, 120 million patents, and roughly 16,200 flagged entities | Current dated source, measurement method, licensing rights, and owner responsible for keeping counts current | Open |
| Included accounts | Up to 500 graduate-student/covered-individual accounts are included | Approved commercial catalog, technical capacity, eligibility definition, and contract language | Open |
| Included consulting | 60 consulting hours per year are included | Approved catalog/SOW, scheduling and rollover rules, eligible work, and staffing capacity | Open |
| Supplemental rate | Extra support is $275 per hour | Approved price book, minimum increments, expenses, change-order process, and effective date | Open |
| Cost savings | Template/prompt suggests savings across subscriptions, analyst headcount, training, and verification, including specific dollar ranges | Customer-specific calculation methodology, source assumptions, disclaimer, and approval before each proposal | Open |
| Certification/security posture | Any SOC 2, ISO 27001, FedRAMP, CMMC, residency, encryption, or uptime representation | Current certificates/reports or a precisely qualified roadmap statement approved by counsel/security owner | Removed from generic login copy; otherwise Open |

## Commercial terms embedded in proposal generation

The proposal catalog contains service prices, quantities, bundle discounts, payment terms, annual subscription language, and savings estimates. Before the paid pilot:

1. Assign one person as price-book owner.
2. Record an effective date and approval for every service price and included benefit.
3. Prevent AI-generated text from inventing contractual terms or quantified savings.
4. Require a human to review the customer name, recipient, scope, price, discount, validity date, claims, and payment terms before publishing.
5. Make the signed agreement control when a proposal and contract differ.

## Language rules for the pilot

- Use “supports,” “helps document,” or “designed to align with” only when they accurately describe the delivered service.
- Reserve “complies,” “ensures,” “certified,” “verified,” and “guarantees” for statements with an approved definition and evidence.
- State the date and source for dataset counts and coverage claims.
- Present savings as customer-specific estimates with visible assumptions, never as guaranteed outcomes.
- Describe proposal views as page requests that may include automated scanners.
- Describe Resend success as provider acceptance until delivery/bounce events are processed.
- Describe Apify results as sales-research candidates requiring human review.

## Approval record

For each approved claim, record:

- exact approved wording;
- evidence location and owner;
- approval name and date;
- effective/expiry date;
- where the claim may appear;
- review trigger when the product, law, source, or price changes.

Until that record exists, the proposal owner must revise or remove the claim before sending a paid-customer proposal.
