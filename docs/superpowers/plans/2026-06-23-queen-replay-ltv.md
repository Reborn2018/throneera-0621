# Queen Replay/LTV Plan

## Goal

Increase Queen Simulator replay intent and second-purchase measurability without changing pricing, Creem products, checkout, refunds, or the existing three-variant ad paths.

## Scope

- Keep `legacy`, `crown`, and `betrayal` reachable at `/queen?variant=...`.
- Make completed endings feel like one earned fate among multiple materially different routes.
- Add a same-variant replay CTA after completion.
- Track replay-created/replay-started data so replay funnel events can be segmented by `run_type=replay` and `variant_id`.

## Implementation

1. Add a deterministic ending profile helper based on variant, choices, and top realm stat.
2. Update the ending page with stronger route recap, alternate-route teasers, and a primary replay CTA.
3. Route replay form submissions through the existing `createReplayRun` engine path.
4. Emit replay-specific funnel events while keeping existing paywall/checkout/purchase events unchanged.
5. Add focused tests for ending profile selection and replay event creation.

## Verification

- `npm run verify`
- `npm run build`
- Local browser smoke for `/queen?variant=legacy|crown|betrayal`
- Confirm checkout still opens only from explicit checkout click, not from paywall view.
