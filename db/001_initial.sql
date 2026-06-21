-- ThroneEra initial production schema.
-- Designed for anonymous ad-test runs with server-side service-role writes.

create type public.simulator_slug as enum ('queen', 'napoleon');
create type public.run_status as enum (
  'identity', 'prologue', 'paywalled', 'checkout_pending', 'paid',
  'completed', 'generation_error', 'refunded', 'disputed'
);
create type public.order_status as enum (
  'pending', 'completed', 'refunded', 'disputed', 'failed', 'expired'
);
create type public.entitlement_status as enum ('active', 'revoked', 'consumed');

create table public.runs (
  id text primary key,
  simulator public.simulator_slug not null,
  status public.run_status not null default 'identity',
  current_scene_id text not null default 'identity',
  run_type text not null default 'first_campaign'
    check (run_type in ('first_campaign', 'replay', 'cross_sell')),
  source_run_id text references public.runs(id) on delete set null,
  identity jsonb not null default '{}'::jsonb,
  realm_state jsonb not null default
    '{"legitimacy":50,"treasury":50,"military":50,"publicSupport":50}'::jsonb,
  decisions jsonb not null default '[]'::jsonb,
  echoed_quote text,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index runs_created_idx on public.runs(created_at desc);
create index runs_status_idx on public.runs(status);
create index runs_simulator_idx on public.runs(simulator);

create table public.run_events (
  id text primary key,
  run_id text not null references public.runs(id) on delete cascade,
  event_type text not null,
  scene_id text,
  choice_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index run_events_run_idx on public.run_events(run_id, created_at);

create table public.orders (
  id text primary key,
  run_id text references public.runs(id) on delete restrict,
  sku text not null,
  provider text not null default 'creem' check (provider in ('mock', 'creem')),
  provider_checkout_id text not null,
  provider_checkout_url text,
  provider_order_id text,
  provider_product_id text not null,
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null check (currency = upper(currency) and char_length(currency) = 3),
  status public.order_status not null default 'pending',
  request_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, request_id),
  unique(provider, provider_checkout_id),
  unique(provider, provider_order_id)
);
create index orders_run_idx on public.orders(run_id, created_at desc);
create unique index one_open_run_checkout_idx
  on public.orders(run_id, sku)
  where status in ('pending', 'completed');

create table public.entitlements (
  id text primary key,
  run_id text references public.runs(id) on delete restrict,
  order_id text not null references public.orders(id) on delete restrict,
  status public.entitlement_status not null default 'active',
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index one_active_run_entitlement_idx
  on public.entitlements(run_id)
  where status = 'active';

create table public.webhook_events (
  provider text not null check (provider in ('mock', 'creem')),
  provider_event_id text not null,
  event_type text not null,
  payload_hash text not null,
  processed_at timestamptz,
  received_at timestamptz not null default now(),
  primary key (provider, provider_event_id)
);

create table public.restore_tokens (
  id text primary key,
  run_id text not null references public.runs(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index restore_tokens_run_idx on public.restore_tokens(run_id);

create table public.analytics_events (
  id text primary key,
  run_id text references public.runs(id) on delete set null,
  event_name text not null,
  event_id text,
  simulator public.simulator_slug,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(event_name, event_id)
);

alter table public.runs enable row level security;
alter table public.run_events enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.webhook_events enable row level security;
alter table public.restore_tokens enable row level security;
alter table public.analytics_events enable row level security;

-- This MVP writes through trusted Next.js server routes using the Supabase
-- service role key. No anonymous/client policies are granted here.
-- Never expose SUPABASE_SERVICE_ROLE_KEY to browser code.
