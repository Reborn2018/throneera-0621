# ThroneEra Production Takeover Design

Date: 2026-06-21

## Context

The provided handoff package is a static Queen Simulator prototype plus product, database, and launch criteria. It is not a production repository. The production goal is a Next.js App Router application with two directly addressable simulators, `/queen` and `/napoleon`, sharing infrastructure while keeping story, theme, copy, and endings product-specific.

## Selected Approach

Use a clean production rebuild in the current workspace, importing the handoff package as reference material and implementing the app as typed Next.js code. This is preferred over wrapping the static prototype because launch criteria explicitly forbid treating the prototype as production.

The first implementation milestone is a local, testable production skeleton:

- App Router routes for Queen and Napoleon.
- Typed simulator configuration modules.
- Server-authoritative run engine interface.
- Local durable development store with the same semantics as the Supabase schema.
- Payment adapter boundary with non-production checkout simulation only when explicitly enabled.
- Deterministic LLM fallback adapter for personalization.
- Accessible mobile-first UI derived from the Queen prototype.
- Tests for state transitions, entitlements, checkout idempotency, and route gates.

Real Supabase, Creem, Meta CAPI, email restore delivery, and live LLM calls remain adapter-backed until credentials and dashboards are available. The app must fail loudly in production if required external secrets are missing.

## Scope

In scope for this takeover pass:

- Build the real application structure and make it runnable.
- Preserve the Queen conversion flow: landing, identity, prologue, personalized echo, crisis, paywall, return, paid scenes, ending, share/replay/cross-sell entry points.
- Add a production-complete Napoleon flow with equivalent route depth and the same commercial semantics.
- Keep `$5.99` as a one-time purchase for the current run only.
- Ensure same-run restore never charges again and replay creates a separate unpaid run.
- Add legal/support pages and environment documentation.
- Add automated verification gates that can run without external provider accounts.

Out of scope for this pass:

- Claiming Creem sandbox success without actual Creem credentials and webhook setup.
- Claiming Meta Test Events verification without real Meta credentials.
- Shipping a real bundle, subscription, virtual currency, unlimited replay, or collection upsell.
- Turning the experience into a chat window, dashboard, or static marketing page.

## Architecture

The app is split into five layers:

1. Route layer: App Router pages and route handlers. Pages fetch server payloads; route handlers validate requests and call services.
2. Product config layer: typed `queen` and `napoleon` modules containing identity options, theme tokens, landing copy, prologue graph, paid graph, ending rules, and cross-sell copy.
3. Engine layer: run state machine, route selection, scene advancement, realm-state deltas, entitlement checks, replay creation, restore-token semantics.
4. Adapter layer: storage, checkout, webhook verification, LLM personalization, analytics, email restore. Local adapters support development and tests; production adapters require env vars.
5. UI layer: reusable React components for landing, identity, scene narration, choices, custom decree, realm drawer, chronicle drawer, paywall, return, ending, and legal/support surfaces.

The server is the source of truth for run status, current scene, entitlements, price, and state deltas. The client renders payloads and submits user actions, but never calculates paid status or price.

## Route Contract

- `/queen`, `/napoleon`: simulator landing.
- `/[simulator]/start`: identity creation/resume.
- `/[simulator]/play/[runId]`: prologue and paid scenes.
- `/[simulator]/unlock/[runId]`: current-run paywall.
- `/[simulator]/return`: authoritative payment return polling.
- `/[simulator]/ending/[runId]`: ending, share, replay, cross-sell.
- `/restore/[token]`: restore a run from a token.
- `/privacy`, `/terms`, `/refunds`, `/support`: legal and support.
- `/api/runs`: create run.
- `/api/runs/[runId]`: load run.
- `/api/runs/[runId]/choice`: submit a scene choice.
- `/api/runs/[runId]/restore`: create restore token or request email.
- `/api/checkout`: create or reuse checkout.
- `/api/webhooks/creem`: raw-body signed webhook endpoint.
- `/api/meta/capi`: server-only Meta event dispatch boundary.

## Data Model

The app model mirrors `db/001_initial.sql`:

- `runs` store user/run identity, simulator, status, current scene, route, realm state, decisions, attribution, and timestamps.
- `run_events` append every meaningful funnel and story action.
- `orders` store idempotent checkout/order references.
- `entitlements` grant run-scoped unlocks or campaign credits.
- `webhook_events` guarantee webhook idempotency.
- `restore_tokens` store hashed restore tokens with expiry and one-time-use metadata.
- `analytics_events` stores normalized funnel events before optional external dispatch.

During local development, a file-backed adapter preserves these semantics. Supabase production adapter must use service-role writes for trusted transitions and RLS for user-readable records.

## Payment Semantics

The base SKU is `complete_current_campaign` at 599 cents USD. The entitlement key is `run_id`.

- A verified completed webhook grants exactly one run.
- Returning, refreshing, or restoring that same run does not charge again.
- A replay creates a new run with no entitlement by default.
- Checkout creation reuses an active pending checkout for the same run and SKU.
- Webhooks are idempotent by provider event ID and checkout/order ID.
- Product ID, amount, currency, simulator, SKU, and run reference are verified before granting.
- Refund or dispute events revoke the originating entitlement but keep audit history.

Mock checkout is allowed only when `THRONEERA_ALLOW_MOCK_CHECKOUT=true` and `NODE_ENV !== "production"`.

## Personalization

Story reliability comes from authored graphs. LLM use is bounded:

- Classify custom decrees into known intents.
- Generate or personalize short consequence, callback, and ending paragraphs.
- Preserve `echoedQuote` so the user sees their exact decree reflected.
- Timeout, retry, validate, and fall back to authored text.
- Never let the LLM decide entitlement, price, scene index, or realm-state deltas.

## UI Design

The visual system follows the Queen prototype's cinematic, regal, restrained direction while removing the fake phone shell for production. Queen uses dark court, old gold, oxblood, paper, and serif ceremonial typography. Napoleon uses a related but distinct empire palette: campaign green, brass, parchment, deep navy, and military-map accents.

Each screen has one primary action. Realm and chronicle data are accessible but default-collapsed. The experience must work at 360x800, 390x844, and 1440 desktop without horizontal overflow. Dialogs trap focus, support Escape, restore focus, and announce loading/error states.

## Testing

Initial verification gates:

- Typecheck, lint, unit tests, production build.
- Unit tests for run transitions, prologue gate, paid gate, route selection, custom decree fallback, entitlement restore, replay requiring payment, checkout idempotency, webhook rejection/idempotency, mismatch rejection, refund revocation, restore token expiry.
- Playwright smoke for Queen and Napoleon free funnel to paywall, mock payment return to paid scene, same-run refresh, completed run replay, and no horizontal overflow at 360, 390, and desktop.

Provider-dependent launch gates remain documented as manual/external until real credentials are available.

## Assumptions

- Work continues in the current Codex workspace; the desktop handoff package remains reference input.
- External credentials are not currently available, so provider integrations must be adapter-complete and fail-closed in production.
- Feature flags default collection/bundle/subscription off.
- User-facing copy remains English.
- Internal docs can be Chinese or English; code and tests use English identifiers.
