-- ThroneEra initial production schema.
-- Review in the target Supabase project before applying.

create extension if not exists pgcrypto;

create type public.simulator_slug as enum ('queen', 'napoleon');
create type public.run_status as enum (
  'prologue', 'paywalled', 'checkout_pending', 'paid', 'completed',
  'generation_error', 'refunded', 'disputed'
);
create type public.order_status as enum ('pending', 'completed', 'refunded', 'disputed', 'failed', 'expired');
create type public.entitlement_status as enum ('active', 'revoked', 'consumed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  simulator public.simulator_slug not null,
  status public.run_status not null default 'prologue',
  current_scene_id text not null default 'identity',
  route_key text,
  queen_name text,
  identity jsonb not null default '{}'::jsonb,
  realm_state jsonb not null default '{"legitimacy":50,"treasury":50,"military":50,"publicSupport":50}'::jsonb,
  active_threads jsonb not null default '[]'::jsonb,
  first_touch jsonb not null default '{}'::jsonb,
  last_touch jsonb not null default '{}'::jsonb,
  funnel_variant text not null default 'standard',
  run_type text not null default 'first_campaign' check (run_type in ('first_campaign','replay','cross_sell')),
  source_run_id uuid references public.runs(id) on delete set null,
  version integer not null default 1,
  last_completed_at timestamptz,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index runs_user_idx on public.runs(user_id, created_at desc);
create index runs_status_idx on public.runs(status);

create table public.run_events (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  scene_id text,
  choice_id text,
  payload jsonb not null default '{}'::jsonb,
  client_event_id uuid,
  created_at timestamptz not null default now(),
  unique (run_id, client_event_id)
);
create index run_events_run_idx on public.run_events(run_id, id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  run_id uuid references public.runs(id) on delete restrict,
  simulator public.simulator_slug,
  sku text not null,
  provider text not null default 'creem',
  provider_checkout_id text,
  provider_order_id text,
  provider_customer_id text,
  provider_product_id text not null,
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null check (char_length(currency) = 3),
  status public.order_status not null default 'pending',
  request_id text not null,
  fb_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, request_id),
  unique(provider, provider_checkout_id),
  unique(provider, provider_order_id)
);
create unique index one_open_run_checkout_idx
  on public.orders(run_id, sku)
  where status in ('pending','completed');

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  run_id uuid references public.runs(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  entitlement_type text not null check (entitlement_type in ('run_unlock','campaign_credit')),
  simulator public.simulator_slug,
  quantity integer not null default 1 check (quantity >= 0),
  status public.entitlement_status not null default 'active',
  consumed_by_run_id uuid references public.runs(id) on delete restrict,
  granted_at timestamptz not null default now(),
  consumed_at timestamptz,
  revoked_at timestamptz
);
create unique index one_run_unlock_idx on public.entitlements(run_id)
  where entitlement_type='run_unlock' and status='active';

create table public.webhook_events (
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload_hash text not null,
  processed_at timestamptz,
  failure text,
  received_at timestamptz not null default now(),
  primary key (provider, provider_event_id)
);

create table public.restore_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  run_id uuid references public.runs(id) on delete set null,
  event_name text not null,
  event_id text,
  simulator public.simulator_slug,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(event_name, event_id)
);

alter table public.profiles enable row level security;
alter table public.runs enable row level security;
alter table public.run_events enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.restore_tokens enable row level security;
alter table public.analytics_events enable row level security;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "runs select own" on public.runs for select using (auth.uid() = user_id);
create policy "runs insert own" on public.runs for insert with check (auth.uid() = user_id);
-- Run mutations should normally go through server routes/RPC so clients cannot forge paid state or deltas.
create policy "run events select own" on public.run_events for select using (auth.uid() = user_id);
create policy "orders select own" on public.orders for select using (auth.uid() = user_id);
create policy "entitlements select own" on public.entitlements for select using (auth.uid() = user_id);
create policy "analytics insert own" on public.analytics_events for insert with check (auth.uid() = user_id or user_id is null);

-- No client policies for webhook_events or restore_tokens.
-- Orders, entitlements, paid state, and authoritative run transitions must be written by trusted server code only.
