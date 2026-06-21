# Launch Gaps

This branch creates a runnable production skeleton and local verification path. It
does not claim external provider launch readiness without credentials and dashboard
access.

## Completed Locally

- Next.js App Router routes for Queen and Napoleon.
- Typed simulator configs with authored prologue and paid scenes.
- Server-owned run engine and local development store.
- Run-scoped checkout entitlement semantics.
- Mock checkout only when explicitly enabled outside production.
- Unit tests for simulator config, local store, run engine, checkout idempotency,
  entitlement restore, replay requiring payment, mismatch rejection, and refund
  revocation.
- Playwright smoke tests for core local funnels.

## Provider Gates Still Required

- Apply `db/001_initial.sql` to a real Supabase project and review RLS.
- Replace the local store with the Supabase adapter.
- Configure Creem sandbox and production products.
- Verify signed Creem webhook using the raw request body and provider secret.
- Run a real Creem sandbox checkout and refund/dispute path.
- Configure Meta Pixel and Conversions API.
- Verify deduplicated `Purchase` in Meta Test Events.
- Configure restore email delivery.
- Connect a production LLM adapter with timeout, validation, and fallback.
- Configure production domain, HTTPS, CSP, logging, and alerts.

## Production Safety Rules

- Do not enable mock checkout in production.
- Do not describe `$7.99` as lifetime access.
- Do not sell bundle, collection, subscription, credit pack, or future content
  until real inventory exists behind the feature flag.
- Do not expose Meta access tokens or payment secrets to client code.
