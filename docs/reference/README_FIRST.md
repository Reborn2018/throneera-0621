# ThroneEra — Codex production handoff

## Read this first

This package is **not a finished production repository**. It contains the Queen visual prototype, the original product brief, a minimal Next.js skeleton, an authoritative implementation brief, a database migration, and launch acceptance criteria.

Codex should take ownership of **production implementation, account integration, automated verification, and deployment**. Do not treat the static HTML prototype as production code and do not merely deploy it.

## Business objective

Ship a mobile-first paid-traffic MVP that can validate whether Facebook/Instagram cold traffic will:

1. start a Queen or Napoleon identity fantasy;
2. reach a paywall after experiencing genuine personalization;
3. pay for the current complete campaign;
4. finish the campaign;
5. buy another campaign, replay a materially different route, or later upgrade to a real bundle.

## Authoritative commercial rule

`$7.99` is a one-time payment for **the current run only**.

- Refreshing or restoring the same paid run must never charge again.
- Starting a new run is free through its prologue.
- Continuing that new run past its paywall requires a new payment or a valid campaign credit.
- Never describe the product as a lifetime unlock or permanent simulator purchase.

## Start order

1. Read `CODEX_MASTER_PROMPT.md`.
2. Read `docs/PRODUCT_AND_CRO.md` and `docs/ACCEPTANCE_CRITERIA.md`.
3. Apply `db/001_initial.sql` to a local Supabase project or adapt it without weakening RLS/idempotency.
4. Build the actual Next.js application in `skeleton/` or replace the skeleton with a clean implementation.
5. Run every gate in `docs/ACCEPTANCE_CRITERIA.md` before production traffic.
