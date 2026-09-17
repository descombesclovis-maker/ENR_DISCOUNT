alter table public.orders
  add column if not exists tracking_token uuid not null default gen_random_uuid(),
  add column if not exists processing_at timestamptz;

create unique index if not exists orders_tracking_token_key
  on public.orders (tracking_token);

create table if not exists public.order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in ('processing','shipped','delivered')),
  label text not null,
  message text,
  source text not null default 'admin',
  occurred_at timestamptz not null default now(),
  email_sent_at timestamptz,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, status)
);

create index if not exists order_tracking_events_order_id_idx
  on public.order_tracking_events (order_id, occurred_at);

alter table public.order_tracking_events enable row level security;

drop policy if exists "Customers can view their own tracking events" on public.order_tracking_events;
create policy "Customers can view their own tracking events"
  on public.order_tracking_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_tracking_events.order_id
        and orders.customer_id = auth.uid()
    )
  );

grant select on public.order_tracking_events to authenticated;
