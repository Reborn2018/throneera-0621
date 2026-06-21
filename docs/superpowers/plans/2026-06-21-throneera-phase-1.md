# ThroneEra Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Next.js production skeleton for Queen and Napoleon with typed simulator configs, server-authoritative local run state, checkout boundaries, and automated tests.

**Architecture:** Implement a clean App Router app in the current workspace. Keep product content in typed simulator config modules, keep state transitions in server-only services, and keep provider integrations behind adapters that fail closed in production without credentials.

**Tech Stack:** Next.js App Router, TypeScript strict mode, React, Vitest, Playwright, ESLint, Zod, file-backed local development storage.

---

## File Structure

- `package.json`: scripts and dependencies.
- `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`: toolchain configuration.
- `.gitignore`, `.env.example`, `README.md`: repo hygiene and run instructions.
- `db/001_initial.sql`: copied Supabase schema from the handoff package.
- `docs/reference/*`: copied handoff reference docs.
- `src/app/*`: App Router pages and API route handlers.
- `src/components/*`: reusable UI components for landing, identity, scenes, paywall, return, ending, legal shell.
- `src/lib/simulators/*`: typed Queen and Napoleon product configs.
- `src/lib/engine/*`: run state machine, scene advancement, entitlement and checkout rules.
- `src/lib/adapters/*`: local storage, checkout, webhook, analytics, LLM fallback boundaries.
- `src/lib/types.ts`: shared domain types.
- `tests/unit/*`: Vitest unit coverage for engine and adapter behavior.
- `tests/e2e/*`: Playwright smoke coverage for the core funnels.

## Task 1: Scaffold Project Toolchain

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create dependency manifest**

Create `package.json` with these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "verify": "npm run typecheck && npm run lint && npm run test && npm run build"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install next react react-dom zod clsx nanoid && npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest @vitejs/plugin-react jsdom playwright`

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 3: Add configs**

Create strict TypeScript, Next, ESLint, Vitest, and Playwright configs. Use `src/**/*` and `tests/**/*` in type coverage.

- [ ] **Step 4: Commit scaffold**

Run: `git add package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs vitest.config.ts playwright.config.ts .gitignore .env.example && git commit -m "chore: scaffold throneera app toolchain"`

## Task 2: Import Handoff References

**Files:**
- Create: `db/001_initial.sql`
- Create: `docs/reference/README_FIRST.md`
- Create: `docs/reference/CODEX_MASTER_PROMPT.md`
- Create: `docs/reference/ACCEPTANCE_CRITERIA.md`
- Create: `docs/reference/PRODUCT_AND_CRO.md`
- Create: `docs/reference/HANDOFF.zh-CN.md`

- [ ] **Step 1: Copy reference files**

Copy the handoff files from the desktop package into the repo without editing their contents.

- [ ] **Step 2: Commit references**

Run: `git add db docs/reference && git commit -m "docs: import throneera handoff references"`

## Task 3: Domain Types and Simulator Configs

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/simulators/queen.ts`
- Create: `src/lib/simulators/napoleon.ts`
- Create: `src/lib/simulators/index.ts`
- Test: `tests/unit/simulators.test.ts`

- [ ] **Step 1: Write simulator tests**

Test that both configs have landing copy, identity options, at least four prologue scenes, at least six paid scenes, one paywall scene boundary, and ending rules.

- [ ] **Step 2: Define shared types**

Create types for `SimulatorSlug`, `RunStatus`, `RealmState`, `SceneChoice`, `StoryScene`, `SimulatorConfig`, `RunRecord`, `OrderRecord`, `EntitlementRecord`, and `RunEventRecord`.

- [ ] **Step 3: Add Queen and Napoleon configs**

Use authored English copy. Queen follows the handoff prototype. Napoleon mirrors the structure with republic, empire, and diplomacy route choices.

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/simulators.test.ts`

Expected: simulator tests pass.

- [ ] **Step 5: Commit configs**

Run: `git add src/lib/types.ts src/lib/simulators tests/unit/simulators.test.ts && git commit -m "feat: add typed simulator configs"`

## Task 4: Local Storage Adapter

**Files:**
- Create: `src/lib/adapters/local-store.ts`
- Create: `src/lib/adapters/store.ts`
- Test: `tests/unit/local-store.test.ts`

- [ ] **Step 1: Write storage tests**

Cover creating runs, loading runs, updating runs, appending events, creating orders, creating entitlements, and reset isolation for tests.

- [ ] **Step 2: Implement file-backed store**

Store data in `.throneera/local-store.json` for development. Use an in-memory store when `NODE_ENV === "test"`. Keep writes atomic by writing a temporary file then moving it into place.

- [ ] **Step 3: Run tests**

Run: `npm run test -- tests/unit/local-store.test.ts`

Expected: local store tests pass and no test writes remain in `.throneera`.

- [ ] **Step 4: Commit adapter**

Run: `git add src/lib/adapters tests/unit/local-store.test.ts && git commit -m "feat: add local run storage adapter"`

## Task 5: Run Engine

**Files:**
- Create: `src/lib/engine/runs.ts`
- Create: `src/lib/engine/scenes.ts`
- Create: `src/lib/engine/restore.ts`
- Test: `tests/unit/run-engine.test.ts`

- [ ] **Step 1: Write engine tests**

Cover run creation, identity submission, prologue progression, paywall transition after crisis, paid gate enforcement, paid scene progression, ending transition, restore token expiry, and replay creating a new unpaid run.

- [ ] **Step 2: Implement engine services**

Implement `createRun`, `submitIdentity`, `submitChoice`, `loadRunView`, `createReplayRun`, `createRestoreToken`, and `restoreRunFromToken`.

- [ ] **Step 3: Run tests**

Run: `npm run test -- tests/unit/run-engine.test.ts`

Expected: engine tests pass.

- [ ] **Step 4: Commit engine**

Run: `git add src/lib/engine tests/unit/run-engine.test.ts && git commit -m "feat: add server-authoritative run engine"`

## Task 6: Checkout and Webhook Boundary

**Files:**
- Create: `src/lib/engine/checkout.ts`
- Create: `src/lib/adapters/checkout.ts`
- Create: `src/lib/adapters/creem-webhook.ts`
- Test: `tests/unit/checkout.test.ts`

- [ ] **Step 1: Write checkout tests**

Cover checkout idempotency, same-run entitlement restore, new replay requiring payment, product mismatch rejection, amount mismatch rejection, currency mismatch rejection, webhook event idempotency, and refund revocation.

- [ ] **Step 2: Implement checkout service**

Implement `createCheckoutForRun`, `applyCheckoutCompleted`, `applyRefundOrDispute`, and `hasActiveRunEntitlement`.

- [ ] **Step 3: Implement provider boundary**

Allow mock checkout only when `THRONEERA_ALLOW_MOCK_CHECKOUT=true` and `NODE_ENV !== "production"`. Throw a clear error for production without Creem env vars.

- [ ] **Step 4: Run tests**

Run: `npm run test -- tests/unit/checkout.test.ts`

Expected: checkout tests pass.

- [ ] **Step 5: Commit checkout boundary**

Run: `git add src/lib/engine/checkout.ts src/lib/adapters/checkout.ts src/lib/adapters/creem-webhook.ts tests/unit/checkout.test.ts && git commit -m "feat: add checkout entitlement boundary"`

## Task 7: App Routes and API Handlers

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/[simulator]/page.tsx`
- Create: `src/app/[simulator]/start/page.tsx`
- Create: `src/app/[simulator]/play/[runId]/page.tsx`
- Create: `src/app/[simulator]/unlock/[runId]/page.tsx`
- Create: `src/app/[simulator]/return/page.tsx`
- Create: `src/app/[simulator]/ending/[runId]/page.tsx`
- Create: `src/app/restore/[token]/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`
- Create: `src/app/refunds/page.tsx`
- Create: `src/app/support/page.tsx`
- Create: `src/app/api/runs/route.ts`
- Create: `src/app/api/runs/[runId]/route.ts`
- Create: `src/app/api/runs/[runId]/choice/route.ts`
- Create: `src/app/api/runs/[runId]/restore/route.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/api/webhooks/creem/route.ts`

- [ ] **Step 1: Create pages and handlers**

Pages call engine services on the server. Mutating actions use route handlers with Zod validation.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: typecheck passes.

- [ ] **Step 3: Commit routes**

Run: `git add src/app && git commit -m "feat: add app routes and api handlers"`

## Task 8: UI Components

**Files:**
- Create: `src/components/brand-header.tsx`
- Create: `src/components/landing-hero.tsx`
- Create: `src/components/identity-builder.tsx`
- Create: `src/components/story-shell.tsx`
- Create: `src/components/scene-narration.tsx`
- Create: `src/components/choice-list.tsx`
- Create: `src/components/custom-decree.tsx`
- Create: `src/components/realm-drawer.tsx`
- Create: `src/components/chronicle-drawer.tsx`
- Create: `src/components/paywall.tsx`
- Create: `src/components/return-card.tsx`
- Create: `src/components/ending.tsx`
- Create: `src/components/legal-page.tsx`

- [ ] **Step 1: Build reusable components**

Use accessible HTML controls, visible focus states, 44px minimum tap targets, collapsed realm and chronicle drawers, and no fake device frame.

- [ ] **Step 2: Wire components into pages**

Connect pages to components with server payloads and form actions or fetch calls.

- [ ] **Step 3: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`

Expected: both commands pass.

- [ ] **Step 4: Commit UI**

Run: `git add src/components src/app && git commit -m "feat: add simulator ui components"`

## Task 9: E2E and Launch Documentation

**Files:**
- Create: `tests/e2e/funnel.spec.ts`
- Modify: `README.md`
- Create: `docs/LAUNCH_GAPS.md`

- [ ] **Step 1: Add Playwright tests**

Cover Queen free funnel to paywall, Napoleon free funnel to paywall, mock checkout return to paid scene, same paid run refresh, replay creates unpaid run, and no horizontal overflow at 360, 390, and 1440.

- [ ] **Step 2: Add documentation**

Document local run commands, env vars, mock checkout rules, provider gaps, deployment commands, and the exact gates that remain external.

- [ ] **Step 3: Run verification**

Run: `npm run verify && npm run e2e`

Expected: local gates pass. Provider-dependent gaps remain documented in `docs/LAUNCH_GAPS.md`.

- [ ] **Step 4: Commit verification**

Run: `git add tests/e2e README.md docs/LAUNCH_GAPS.md && git commit -m "test: add funnel verification and launch gaps"`

## Self-Review

- Spec coverage: Phase 1 covers runnable app structure, Queen and Napoleon routes, server-owned local state, run-scoped entitlement semantics, checkout boundaries, legal pages, and local automated tests. Real Supabase, real Creem sandbox, Meta Test Events, live email, and live LLM verification are deliberately documented as launch gaps because credentials are not present.
- Completeness scan: This plan has no incomplete markers and no vague error-handling instructions.
- Type consistency: The central names are `SimulatorConfig`, `RunRecord`, `createRun`, `submitChoice`, `createCheckoutForRun`, and `hasActiveRunEntitlement`; all subsequent tasks refer to those names.
