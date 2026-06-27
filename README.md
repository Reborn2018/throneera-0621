# ThroneEra

Production rebuild of the ThroneEra Queen/Napoleon interactive campaign MVP.

## Local Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/queen`
- `http://localhost:3000/napoleon`

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run e2e
```

`npm run verify` runs typecheck, lint, unit tests, and production build.

## Environment Variables

Local mock checkout:

```bash
THRONEERA_ALLOW_MOCK_CHECKOUT=true
THRONEERA_LOCAL_STORE_PATH=.throneera/local-store.json
```

Production-required provider settings:

```bash
NEXT_PUBLIC_SITE_URL=
CREEM_API_KEY=
CREEM_WEBHOOK_SECRET=
CREEM_COMPLETE_CAMPAIGN_PRODUCT_ID=
CREEM_UNLIMITED_PRODUCT_ID=
CREEM_API_BASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
META_PIXEL_ID=
META_ACCESS_TOKEN=
META_GRAPH_API_VERSION=v21.0
META_TEST_EVENT_CODE=
RESTORE_EMAIL_FROM=
LLM_PROVIDER=
LLM_API_KEY=
```

Production must not enable `THRONEERA_ALLOW_MOCK_CHECKOUT`.

## Current Architecture

- Simulator content lives in `src/lib/simulators`.
- Server-owned run transitions live in `src/lib/engine`.
- Provider boundaries live in `src/lib/adapters`.
- App Router pages live in `src/app`.
- The local development store writes to `.throneera/local-store.json`.
- Production storage uses Supabase when `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` are configured.

The base SKU is `complete_current_campaign` at `$4.99`, scoped to one run.
`engine_v3_unlimited` is the `$14.99` permanent dynasty unlock. Replay and
cross-sell create new runs without carrying one-run paid entitlement.

## Database

The Supabase migration is in `db/001_initial.sql`. It uses text IDs and nullable
ownership fields so anonymous ad-test runs can be created before account login.
Apply it to the target Supabase project before production traffic.

## Payments And Analytics

Production checkout uses Creem `POST /v1/checkouts`; successful purchases are
granted only after `/api/webhooks/creem` verifies the raw-body
`creem-signature`. Verified purchases also send a server-side Meta CAPI
`Purchase` event with `event_id` set to the order request id.

## Deployment

This app is Vercel-compatible:

```bash
npm run verify
npm run build
```

Set all production provider environment variables before deploy. See
`docs/LAUNCH_GAPS.md` for provider-dependent gates that are not claimed complete.
