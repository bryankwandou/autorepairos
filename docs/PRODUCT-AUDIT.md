# AutoRepairOS Product and Design Audit

Date: July 24, 2026

## Verdict

The original idea was too broad whenever it tried to become another complete shop-management suite. The strongest company is narrower: AutoRepairOS is the authorization control plane between diagnosis, customer consent, and billable work.

## Scorecard

| Dimension | Score | Finding |
|---|---:|---|
| Problem severity | 9/10 | Surprise work creates disputes, chargebacks, lost trust, and unbillable technician time. |
| Product clarity | 9/10 | The hard-block promise is specific and demonstrable. |
| Differentiation | 8/10 | The moat is enforcement and evidence, not another digital estimate screen. |
| MVP completeness | 10/10 | Approval, labor, parts, discovery, two live Groq agents, overage, wallet connection, and devnet verification run end to end. |
| Production readiness | 8/10 | Public deployment, CI, production smoke testing, and a proof console are present; durable multi-tenant persistence and communication delivery remain next. |
| Design quality | 9/10 | Clear hierarchy, restrained operational color, reduced-motion support, mobile approval, and public proof-first trust UX. |
| Monetization | 8/10 | Sell per location, not per user; trust and dispute reduction support premium pricing. |
| Expansion path | 8/10 | Payments, warranty evidence, insurer workflows, and supplier records extend the same authorization ledger. |

## Strengthened product direction

- Ideal customer: independent shops with 2-20 bays, one or more service advisors, and recurring estimate disputes.
- Buyer: owner or general manager. Daily users: advisors and technicians. Beneficiary: vehicle owner.
- Wedge: approval-gated repair scope, not scheduling, CRM, inventory, or generic AI assistance.
- Pricing hypothesis: $249 per location monthly, with a higher tier for multi-location audit exports and policy controls.
- Primary metric: percentage of billable work with attributable pre-work approval.
- Secondary metrics: approval response time, blocked unauthorized attempts, overage conversations opened before work continues, and disputed invoice rate.
- Moat: accumulated authorization evidence, shop policy configuration, dispute-resolution history, and deeply embedded technician behavior.

## Design review

- Keep approval colors paired with labels; never use color as the only state signal.
- Keep customer actions limited to one repair decision per screen.
- Avoid decorative 3D animation in the approval flow; it competes with legal and financial clarity.
- Preserve the restrained blue, slate, green, and amber system. It reads as operational software rather than consumer fintech theater.
- Keep rejection language protective: the system prevented unapproved and potentially unbillable work.
- Keep motion concentrated on landing, AI result transitions, and proof discovery; never animate the legal customer decision itself.
- Keep the public proof console factual: configured state, commit identity, controls, and externally verifiable records.
- The next design priority is evidence media: annotated photos, measurements, and a clear ?what changed? comparison for revised estimates.

## Three fixes before paid pilots

1. Durable multi-tenant Postgres with hashed approval tokens and append-only audit records.
2. Real SMS and email delivery with delivery status, resend controls, and token revocation.
3. Shop onboarding that imports labor rate, tax rules, approval expiry, and overage policy in under ten minutes.

## Blockchain boundary

Wallets are not part of customer approval and must never become required friction in that flow. Solana devnet is limited to an optional technical verification surface that proves wallet connection, memo creation, confirmation, and server-side transaction inspection. The signed application audit log remains the authorization record.
