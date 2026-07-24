# AutoRepairOS MVP Workflow Verification

Date: July 24, 2026

## Verified core loop

1. Staff signs in with an authenticated shop session.
2. Technician records measured diagnostic notes.
3. Customer-facing language is drafted and held for review.
4. Advisor creates one estimate line per repair scope.
5. Each line receives an independent, expiring customer token.
6. Pending and declined lines reject both labor and parts logs.
7. The customer approves or declines from a mobile link.
8. The dashboard refreshes approval state every two seconds.
9. Approved work accepts labor and parts entries.
10. Actual cost rolls up against the estimate and triggers an overage flag.
11. A new mid-repair finding always creates fresh pending scope.

## Defense layers

- Page middleware protects staff screens.
- Staff APIs verify the signed HTTP-only session cookie.
- Customer approval is the only public write route.
- Domain rules reject non-approved work regardless of UI state.
- The production SQL migration repeats the rule with triggers and RLS.
- Approval and work-log events are append-only in the application model.

## Demo versus production

The local MVP is complete and testable without external credentials. Production rollout still requires a durable Postgres deployment, encrypted token storage, SMS or email delivery, organization tenancy, and real staff provisioning. These are deployment requirements, not missing core-loop behavior.

## Production HTTP verification

The built Next.js server was started locally and exercised through real HTTP requests:

| Check | Expected | Result |
|---|---:|---:|
| Unauthenticated dashboard API | 401 | 401 |
| Demo staff login | 200 | 200 |
| Labor against pending line | 409 | 409 |
| Customer token approval | 200 | 200 |
| Labor after approval | 201 | 201 |
| Parts after approval | 201 | 201 |
| Fresh mid-repair line item | 201 | 201 |
| Labor against fresh pending item | 409 | 409 |
| Diagnostic draft | 201 | 201 |
| Diagnostic review | 200 | 200 |

## Solana devnet proof

- Wallet: `35z7X59rtyts557Up1RAwpyYN7x2cFqcDc7RjPuNxFzr`
- Slot: `478466491`
- Transaction: `CYKH67vMGAxDMa5NBzhudvzo575dv4zMFTLLzReu7TiW4DxgebAKWhX7iEuDhhNDcFatpP9KBAr9JfsnosTEV1u`
- Memo: `AutoRepairOS MVP verified on Solana devnet | 2026-07-24`
