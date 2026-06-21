# Release acceptance criteria

## P0 — launch blockers

- [ ] Production code exists for Queen and Napoleon; no static mock masquerades as production.
- [ ] Server-authoritative run records and run-scoped entitlements.
- [ ] Signed Creem webhook is the payment source of truth.
- [ ] Same paid run restores without another charge.
- [ ] New replay run requires another payment/valid campaign credit.
- [ ] Checkout creation and webhook processing are idempotent.
- [ ] Product ID, amount, currency, environment, and run reference are verified.
- [ ] Refund/dispute behavior is implemented and auditable.
- [ ] Supabase RLS/security review passes.
- [ ] Email restore works in a new browser/device context.
- [ ] No mock checkout is reachable in production.
- [ ] Privacy, terms, refunds, support, and contact path are live.
- [ ] Typecheck, lint, unit tests, E2E, and production build pass.

## P1 — paid-traffic readiness

- [ ] First meaningful choice reachable in under one minute without signup.
- [ ] Paywall appears only after identity, irreversible decision, personalized echo, and crisis.
- [ ] Paywall copy clearly says the payment unlocks the current campaign and a new campaign requires a separate purchase.
- [ ] The paid experience immediately pays off after checkout.
- [ ] At least two dramatic anchors and three callbacks per campaign.
- [ ] Major routes include materially exclusive content.
- [ ] Meta Pixel/CAPI Purchase deduplication verified in Test Events.
- [ ] First-touch UTM/fb attribution persists through checkout and webhook.
- [ ] Funnel timing fields are captured.
- [ ] No horizontal overflow at 360, 390, 1440.
- [ ] All primary touch targets are at least 44px.
- [ ] Keyboard and focus behavior passes.
- [ ] Timeout/retry/fallback/online recovery preserve the last committed choice.

## P2 — launch operations

- [ ] Environment-variable matrix documented.
- [ ] Supabase migration and rollback documented.
- [ ] Creem sandbox and production dashboard setup documented.
- [ ] Webhook endpoint excluded from bot challenges and protected by signature verification.
- [ ] Domain, HTTPS, CSP, error logging, and alerting configured.
- [ ] A low-spend smoke campaign can be attributed end to end.
- [ ] Kill switches exist for checkout, LLM generation, Napoleon, cross-sell, bundles, and experiments.
