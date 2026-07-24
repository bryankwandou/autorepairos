# AutoRepairOS

> No work starts on anything the customer did not actually approve.

AutoRepairOS is an approval-gated repair-order MVP for independent automotive shops. Every estimate line item has its own customer token, technicians are blocked server-side from logging work against pending or declined scope, diagnostic drafts stay grounded in technician notes, and actual cost is tracked against the approved estimate.

- Production: `https://autorepairos.vercel.app`
- Public proof console: `https://autorepairos.vercel.app/system-proof`

## Included workflows

- Staff dashboard with active orders, pending approvals, and overage flags
- Work-order detail with labor logging and immutable activity events
- Fresh line item for every mid-repair discovery
- Tokenized, mobile customer approval and decline flow
- Grounded diagnostic drafting with mandatory review status
- Live Groq Diagnostic Agent with deterministic grounding enforcement
- Live Groq Authorization Risk Agent for evidence and scope review
- Phantom-compatible Solana wallet connection and server-verified devnet memo proof
- Public system proof API and deployment trust console
- Database migration with trigger and RLS defense-in-depth

## Run locally

```bash
npm install
npm run dev
```

Open ```http://localhost:3000``` and sign in with:

- Email: ```advisor@autorepairos.app```
- Password: ```repair123```

The customer flow is available at ```/approve/approve-brake-2048```.

## Validation

```bash
npm run lint
npm run type-check
npm test
npm run build
npm run smoke:production
```

The default demo store is in-memory so the workflow runs without a database. Live AI requires `GROQ_API_KEY`; wallet verification defaults to Solana devnet. Apply `supabase/migrations/202607230001_autorepair_core.sql` for durable database enforcement.
