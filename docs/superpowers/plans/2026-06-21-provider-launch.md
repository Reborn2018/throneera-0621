# Provider Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace local-only provider boundaries with launch-ready Supabase, Creem, Meta CAPI, and deployment wiring for the first ad test.

**Architecture:** Keep all secrets server-side. Preserve the current server-owned run engine and inject provider adapters at API boundaries so local mock flows keep working while production fails closed if required secrets are missing.

**Tech Stack:** Next.js App Router, TypeScript, Supabase JS, Creem REST API/webhooks, Meta Conversions API, Vercel.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add provider dependencies.
- Modify `next.config.ts`: pin Turbopack root for nested worktree/deploy consistency.
- Create `src/lib/adapters/creem.ts`: Creem checkout API, redirect signature, webhook signature, payload mapping.
- Modify `src/lib/engine/checkout.ts`: support real Creem checkout creation and provider-specific webhook idempotency.
- Modify `src/app/api/checkout/route.ts`: choose mock only outside production, otherwise Creem.
- Modify `src/app/api/webhooks/creem/route.ts`: verify raw body signature and map real Creem event shapes.
- Create `src/lib/adapters/meta-capi.ts`: server-side Purchase event sender with event ID dedupe fields.
- Modify `src/app/api/meta/capi/route.ts`: validate payload and call Meta adapter.
- Create `src/lib/adapters/supabase-store.ts`: RunStore implementation backed by Supabase service role.
- Modify `src/lib/server/store.ts`: choose Supabase store when Supabase env vars exist.
- Modify `db/001_initial.sql`: align DB schema with app run statuses and anonymous pre-auth run ownership model.
- Add/modify tests under `tests/unit`: cover Creem signatures/API mapping, webhook route behavior, Meta CAPI payload, Supabase mapping helpers.
- Modify `README.md` and `docs/LAUNCH_GAPS.md`: move completed provider items out of gaps and document dashboard steps.

## Tasks

### Task 1: Creem Checkout And Webhook

- [ ] Write failing unit tests for Creem checkout session creation payload, redirect signature verification, webhook HMAC verification, and real webhook payload mapping.
- [ ] Implement `src/lib/adapters/creem.ts` with REST calls to `/v1/checkouts`, HMAC verification, redirect verification, and zod-normalized event parsing.
- [ ] Update checkout engine/API route to create `provider: "creem"` orders when mock checkout is disabled.
- [ ] Update webhook route to verify raw body before granting/revoking entitlements.
- [ ] Run `npm run test -- tests/unit/checkout.test.ts tests/unit/creem.test.ts`.
- [ ] Commit `feat: integrate creem checkout provider`.

### Task 2: Meta CAPI Purchase

- [ ] Write failing tests for Meta Purchase payload shape, event ID propagation, and missing-env fail-closed behavior.
- [ ] Implement `src/lib/adapters/meta-capi.ts`.
- [ ] Trigger Meta Purchase after verified checkout completion without exposing access tokens client-side.
- [ ] Run targeted unit tests.
- [ ] Commit `feat: add meta capi purchase events`.

### Task 3: Supabase Store

- [ ] Write failing mapping tests for run/order/entitlement/webhook records.
- [ ] Install Supabase JS and implement `src/lib/adapters/supabase-store.ts`.
- [ ] Update `getStore()` to use Supabase only when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present.
- [ ] Align `db/001_initial.sql` with current app statuses, anonymous run support, and service-role-only writes.
- [ ] Run store/unit tests.
- [ ] Commit `feat: add supabase run store`.

### Task 4: Deployment Wiring

- [ ] Fix Turbopack root warning in `next.config.ts`.
- [ ] Verify `npm run verify` and `npm run e2e` locally.
- [ ] Use available GitHub/Vercel/Supabase/Creem authenticated surfaces to create or link the repo/project.
- [ ] Set production env vars in Vercel without committing secrets.
- [ ] Apply Supabase migration and inspect RLS/grants.
- [ ] Configure Creem product and production webhook endpoint.
- [ ] Deploy preview, run smoke tests, then promote/deploy production.
- [ ] Verify Meta Test Events for Purchase after a real or sandbox checkout.
- [ ] Commit docs updates.

## Acceptance

- Local mock checkout still passes.
- Production checkout fails closed unless Creem/Supabase env vars are configured.
- Real Creem webhook signature is required before paid entitlement is granted.
- Purchase events include `event_name=Purchase`, `event_id`, `currency=USD`, and value `7.99`.
- Supabase service-role store can persist runs, orders, entitlements, restore tokens, events, and webhook receipts.
- Vercel production has no mock checkout env flag.
