-- Nexora — FINAL PHASE schema.
--
-- This file was reverse-engineered directly from the current application
-- code (every .from("...") / .storage.from("...") call in src/), not from
-- a separate design. It covers exactly four tables that Phase 1 + Phase 2
-- did not already create, plus the private payment-proofs Storage bucket.
--
-- Fully additive: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS + CREATE
-- POLICY only, no DROP TABLE, no data loss, does not touch any Phase 1/
-- Phase 2 table (plans, admin_users, subscriptions, stores, store_members,
-- store_settings, products, product_images, orders, order_items).
--
-- Run manually in the Supabase SQL editor - not executed automatically.

-- ============================================================
-- 1. STORE_THEME_SETTINGS (Phase 2 - theme/customization)
--    Columns match src/app/api/appearance/route.ts and the direct
--    client reads in src/app/shop/[slug]/page.tsx and
--    src/app/shop/[slug]/product/[productSlug]/page.tsx exactly.
-- ============================================================

create table if not exists public.store_theme_settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  theme_id text not null default 'minimal',
  primary_color text not null,
  accent_color text not null,
  font text not null,
  customization jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.store_theme_settings enable row level security;

-- Public storefront reads this directly (client-side, anon key) for every
-- active store, exactly like it already reads products/product_images.
drop policy if exists "public_select_active_store_theme" on public.store_theme_settings;
create policy "public_select_active_store_theme"
on public.store_theme_settings
for select
to anon, authenticated
using (
  exists (
    select 1 from public.stores s
    where s.id = store_theme_settings.store_id
      and s.is_active = true
  )
);

-- Store owners can read/write only their own store's theme settings.
-- (The /api/appearance route also writes this using the service role, so
-- these owner policies are the client-side path the dashboard falls back
-- to / the RLS backstop, not the only way in.)
drop policy if exists "owner_select_own_theme" on public.store_theme_settings;
create policy "owner_select_own_theme"
on public.store_theme_settings
for select
to authenticated
using (
  exists (
    select 1 from public.store_members sm
    where sm.store_id = store_theme_settings.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "owner_write_own_theme" on public.store_theme_settings;
create policy "owner_write_own_theme"
on public.store_theme_settings
for all
to authenticated
using (
  exists (
    select 1 from public.store_members sm
    where sm.store_id = store_theme_settings.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.store_members sm
    where sm.store_id = store_theme_settings.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);


-- ============================================================
-- 2. SUBSCRIPTION_PAYMENT_REQUESTS (Final Phase - payment proof
--    workflow). Columns match src/app/api/payment-requests/route.ts
--    (INSERT: store_id, plan_id, amount, currency, payment_reference,
--    proof_path, status, created_by) and
--    src/app/api/admin/payment-requests/[id]/route.ts (UPDATE:
--    status, rejection_reason, updated_at) exactly.
--
--    NOTE on created_by: the reported code/SQL mismatch. The API
--    inserts created_by = the authenticated merchant's auth.uid(),
--    never anything client-supplied that isn't already verified via
--    getBearerUser(). It is real, load-bearing data (an audit trail
--    of who submitted each payment proof, independent of store
--    ownership possibly changing later) - so it is added here as a
--    proper column with an FK to auth.users, not dropped from the API.
-- ============================================================

create table if not exists public.subscription_payment_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  plan_id text not null references public.plans(id),
  amount numeric,
  currency text not null default 'DZD',
  payment_reference text,
  proof_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_payment_requests_store_id_idx on public.subscription_payment_requests(store_id);
create index if not exists subscription_payment_requests_status_idx on public.subscription_payment_requests(status);

alter table public.subscription_payment_requests enable row level security;

-- Store owners can read and create requests for their own store only.
-- No UPDATE policy for owners at all: approve/reject only ever happens
-- through the admin API route (service role), matching
-- src/app/api/admin/payment-requests/[id]/route.ts being the only place
-- that updates status/rejection_reason.
drop policy if exists "owner_select_own_payment_requests" on public.subscription_payment_requests;
create policy "owner_select_own_payment_requests"
on public.subscription_payment_requests
for select
to authenticated
using (
  exists (
    select 1 from public.store_members sm
    where sm.store_id = subscription_payment_requests.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "owner_insert_own_payment_requests" on public.subscription_payment_requests;
create policy "owner_insert_own_payment_requests"
on public.subscription_payment_requests
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.store_members sm
    where sm.store_id = subscription_payment_requests.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

-- Admins can read and manage every request.
drop policy if exists "admin_select_all_payment_requests" on public.subscription_payment_requests;
create policy "admin_select_all_payment_requests"
on public.subscription_payment_requests
for select
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "admin_write_all_payment_requests" on public.subscription_payment_requests;
create policy "admin_write_all_payment_requests"
on public.subscription_payment_requests
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);


-- ============================================================
-- 3 & 4. SUPPORT_CONVERSATIONS + SUPPORT_MESSAGES (Final Phase).
--    Columns match src/app/api/support/route.ts,
--    src/app/api/support/[id]/route.ts, and the admin equivalents
--    exactly.
-- ============================================================

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('technical', 'store', 'subscription', 'payment', 'general')),
  subject text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_conversations_store_id_idx on public.support_conversations(store_id);

alter table public.support_conversations enable row level security;

drop policy if exists "owner_select_own_conversations" on public.support_conversations;
create policy "owner_select_own_conversations"
on public.support_conversations
for select
to authenticated
using (
  exists (
    select 1 from public.store_members sm
    where sm.store_id = support_conversations.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "owner_insert_own_conversations" on public.support_conversations;
create policy "owner_insert_own_conversations"
on public.support_conversations
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.store_members sm
    where sm.store_id = support_conversations.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "admin_select_all_conversations" on public.support_conversations;
create policy "admin_select_all_conversations"
on public.support_conversations
for select
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "admin_write_all_conversations" on public.support_conversations;
create policy "admin_write_all_conversations"
on public.support_conversations
for update
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);


create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_conversation_id_idx on public.support_messages(conversation_id);

alter table public.support_messages enable row level security;

-- A store owner can read/write messages only on a conversation that
-- belongs to their own store (checked by joining back to
-- support_conversations, never by trusting a client-supplied store_id).
drop policy if exists "owner_select_own_conversation_messages" on public.support_messages;
create policy "owner_select_own_conversation_messages"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_conversations c
    join public.store_members sm on sm.store_id = c.store_id
    where c.id = support_messages.conversation_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "owner_insert_own_conversation_messages" on public.support_messages;
create policy "owner_insert_own_conversation_messages"
on public.support_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.support_conversations c
    join public.store_members sm on sm.store_id = c.store_id
    where c.id = support_messages.conversation_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
  )
);

drop policy if exists "admin_select_all_messages" on public.support_messages;
create policy "admin_select_all_messages"
on public.support_messages
for select
to authenticated
using (
  exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);

drop policy if exists "admin_insert_all_messages" on public.support_messages;
create policy "admin_insert_all_messages"
on public.support_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (select 1 from public.admin_users au where au.user_id = auth.uid())
);


-- ============================================================
-- 5. STORAGE — private payment-proofs bucket.
--    src/app/api/payment-requests/route.ts uploads here with the
--    service role; src/app/api/admin/payment-requests/[id]/route.ts
--    reads it only via short-lived signed URLs. The bucket must NOT
--    be public - all access in the app already goes through
--    service-role code, so no public/anon Storage policy is created
--    for it here.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- No storage.objects policies are added for anon/authenticated on this
-- bucket - every read/write in the app already happens server-side with
-- the service role, which bypasses Storage RLS entirely. Keeping this
-- bucket free of client-facing policies is intentional and matches
-- "payment proofs must remain private".
