# Codex master implementation prompt — ThroneEra MVP

You are the lead product engineer for a paid-traffic interactive narrative product. Build and deploy a production-ready MVP from this handoff package.

## Non-negotiable outcome

Create one Next.js App Router + TypeScript application with two directly addressable products:

- `/queen`
- `/napoleon`

Cold ads land directly on the matching URL. Both products share infrastructure and components, but have different theme tokens, copy, characters, story graphs, endings, share cards, and ad attribution.

## What exists

- `reference/queen-static-prototype.zip`: visual/interaction reference only.
- `reference/queen-design-brief-v1.md`: original design intent.
- `db/001_initial.sql`: proposed production data model.
- A minimal skeleton under `skeleton/`.

Do not claim the existing static prototype is production-ready. Reimplement it with accessible React components and server-authoritative persistence.

## Required stack

- Next.js App Router, TypeScript, strict mode
- Supabase Postgres + Auth (anonymous start is acceptable; no signup gate)
- Creem one-time Checkout Sessions and signed webhooks
- A server-side LLM adapter with deterministic fallback content
- Meta Pixel + Conversions API with shared `event_id` deduplication
- Playwright E2E, Vitest unit tests, ESLint, typecheck
- Vercel-compatible deployment unless the repository specifies another target

## Route contract

- `/queen`, `/napoleon`: ad landing pages
- `/[simulator]/start`: create/resume anonymous run
- `/[simulator]/play/[runId]`: prologue and paid scenes
- `/[simulator]/unlock/[runId]`: paywall for that run
- `/[simulator]/return`: payment return and authoritative entitlement polling
- `/[simulator]/ending/[runId]`: ending, share, cross-sell, replay
- `/restore/[token]`: email restore
- `/privacy`, `/terms`, `/refunds`, `/support`
- `/api/checkout`: create/reuse a pending Creem checkout for one run
- `/api/webhooks/creem`: verify signature against raw body and process idempotently
- `/api/runs/*`: create, load, submit choice, generate personalization, resume
- `/api/meta/capi`: server events only where appropriate; never expose access token

## Payment semantics

The base SKU is `complete_current_campaign`, nominally `$5.99`.

Entitlement key: `run_id`, not user, browser, simulator, or account.

1. A completed webhook grants the referenced run.
2. The same run remains granted after refresh, return, email restore, or another device.
3. A replay creates a new run and has no entitlement by default.
4. The new run may play the free prologue, then must pay again or consume one valid campaign credit.
5. Checkout creation must be idempotent: reuse a still-valid pending checkout for the same run/SKU.
6. Webhooks must be idempotent by provider event ID and order/checkout ID.
7. Verify product ID, expected price, currency, run ownership/reference, environment, and status before granting.
8. Refund/dispute events revoke only the entitlement or remaining credits originating from that order; preserve history for support/audit.
9. The payment-return page is not the source of truth. It polls server state until the signed webhook grants access or shows a recoverable pending state.

Creem metadata/reference must include at least:

- `run_id`
- `simulator`
- `sku`
- `anonymous_user_id` or internal actor ID
- `funnel_variant`
- `fb_event_id`
- first-touch UTM/ad identifiers

## Funnel and pacing

Do not gate by a literal timer. Show the paywall immediately after these four value events:

1. identity established;
2. irreversible decision made;
3. the world explicitly echoes the user's decision or words;
4. a major unresolved crisis is revealed.

Target cold-traffic paywall arrival is about 3.5–5 minutes. Do not put “5–8 minutes” on the landing page. Use “Start free · no sign-up” and promise the first meaningful decision in under a minute.

The paid campaign should feel like about 12–18 minutes of high-density play, with:

- 6–8 paid scenes;
- a meaningful choice roughly every 1.5–2.5 minutes;
- payment payoff within the first 30–60 seconds after return;
- at least two dramatic anchors;
- at least three callbacks, including one verbatim or close paraphrase of the user's decree;
- a complete personalized ending;
- materially different route content, not just cosmetic text substitutions.

Use an authored story graph for reliability. The LLM may classify custom decrees and personalize bounded paragraphs/dialogue/endings. Every dynamic generation requires timeout, retry, content validation, and authored fallback. Never let an LLM decide payment, entitlement, price, or state transitions.

## Product configuration

Implement simulators as typed configuration modules sharing the same engine.

Each simulator config includes:

- identity options
- theme tokens
- landing copy
- prologue graph
- paid graph with route conditions
- relationship and realm-state labels
- ending rules
- cross-sell copy
- share-card renderer data

Queen routes should at minimum distinguish people/mercy, iron/military, and intrigue/court trajectories with two route-specific paid scenes and a distinct climax/ending consequence.

Napoleon routes should at minimum distinguish republic, empire/conquest, and diplomacy/statecraft trajectories with equivalent depth.

## Monetization after the first purchase

Launch-safe default:

- Base current campaign: on
- Cross-sell the other simulator after completion: on if the other campaign is production-complete
- Same-theme replay: visible, but clearly states a new campaign requires a separate payment at the paywall
- Campaign-credit pack / bundle: feature-flagged off until all promised campaigns/routes exist
- Subscription: off for MVP

Do not sell a collection, archive, unlimited replay, New Game+, or future content that is not actually available.

The ending CTA hierarchy should be tested, but default to:

1. experience the other completed simulator;
2. explore a clearly different route/new reign;
3. share result;
4. optional real bundle offer when enabled.

## Analytics

Persist first-touch and last-touch attribution. Capture:

- `fbclid`, `_fbp`, `_fbc`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- ad/campaign/adset/creative IDs if present
- simulator, route, funnel variant, run type
- timestamps and elapsed seconds between key events

Required events:

- landing_view
- start_clicked
- identity_chosen
- first_choice_completed
- critical_choice_made
- custom_command_submitted
- consequence_viewed
- crisis_revealed
- paywall_viewed
- checkout_started
- purchase_completed
- paid_scene_loaded
- anchor_reached
- ending_reached
- replay_started
- cross_promo_clicked
- upgrade_clicked
- generation_timeout
- generation_fallback_used
- restore_requested
- restore_completed

Send `Purchase` from the server after verified webhook. If also sent browser-side, use the exact same stable `event_id` for deduplication. Do not log raw decree text, email, or payment data into analytics.

## UX and accessibility

- Mobile-first at 360×800 and 390×844; verify 1440 desktop.
- One primary action per screen.
- No fake phone frame or fake OS status bar.
- No developer notes visible publicly.
- All core targets at least 44×44 CSS pixels.
- Input remains usable above mobile keyboard and safe areas.
- Dialogs trap focus, move focus on open, restore focus on close, support Escape, and make background inert.
- `prefers-reduced-motion` supported.
- Loading/error/status changes announced accessibly.
- Progress is recoverable from last committed scene.
- Legal/support links are visible at checkout and footer without distracting the main funnel.

## Security and data rules

- Enforce RLS or service-role-only mutations where appropriate.
- Never trust client-supplied price, paid status, scene index, state delta, or ownership.
- Validate every route parameter and request body with a schema library.
- Rate-limit run creation, custom decree classification, generation, email restore, checkout creation, and webhook processing.
- Sanitize dynamic text and render it as text, never raw HTML.
- Store only necessary personal data; hash restore tokens; set expirations.
- Add CSP and basic security headers compatible with Creem, Supabase, Meta, and analytics.
- Production must fail loudly when required secrets/product IDs are absent. Mock payment may only exist behind an explicit non-production flag.

## Required tests

Unit/integration:

- run state transition validation
- authored route selection
- custom command classification fallback
- run-scoped entitlement
- same-run restore without re-charge
- new-run replay requires payment
- credit consumption once and only once
- checkout idempotency
- webhook signature rejection
- webhook event idempotency
- product/amount/currency mismatch rejection
- refund/dispute revocation
- Meta event ID stability/dedup payload
- restore-token expiry and one-time use

Playwright:

- Queen mobile complete free funnel → paywall
- Napoleon mobile complete free funnel → paywall
- successful sandbox payment return → resume paid scene
- canceled checkout → progress preserved, no entitlement
- same paid run refresh/restore → no paywall
- completed run → replay → new run reaches a new paywall
- cross-sell creates correct destination run and attribution
- email restore on a fresh browser context
- generation timeout → fallback → no lost choice
- 360, 390, desktop smoke and no horizontal overflow
- keyboard/focus flow for custom decree and dialogs

## Definition of done

Do not report completion until:

- dependency install, typecheck, lint, tests, production build pass;
- the database migration applies cleanly;
- Creem sandbox checkout and signed webhook work end-to-end;
- a real test refund/dispute path is verified or documented with provider limitation;
- Meta Test Events receives a deduplicated Purchase;
- email restore works in a clean browser;
- both simulator funnels are manually experienced on a real mobile device or device emulation;
- screenshots and a concise launch report are included;
- README lists exact environment variables, dashboard configuration, deployment commands, and rollback procedure.

When a test fails, fix the product; do not weaken or skip the test merely to obtain a green build.
