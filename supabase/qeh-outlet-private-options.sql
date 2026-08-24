-- QEH OUTLET — options tarifaires privées par produit
-- À exécuter dans Supabase > SQL Editor avant de remplacer les fichiers React.

begin;

create or replace function public.is_qeh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_qeh_admin() from public, anon;
grant execute on function public.is_qeh_admin() to authenticated;

create table if not exists public.product_custom_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  name text not null,
  description text,
  price_delta numeric(12, 2) not null default 0,
  is_default_selected boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_custom_options_product_id_fkey
    foreign key (product_id)
    references public.products(id)
    on delete cascade,

  constraint product_custom_options_name_length
    check (length(trim(name)) between 2 and 120),

  constraint product_custom_options_description_length
    check (description is null or length(description) <= 300),

  constraint product_custom_options_positive_price
    check (price_delta >= 0),

  constraint product_custom_options_display_order_range
    check (display_order between 0 and 10000)
);

create index if not exists product_custom_options_product_order_idx
  on public.product_custom_options(product_id, display_order, created_at);

alter table public.product_custom_options enable row level security;

revoke all on public.product_custom_options from anon, authenticated;
grant select on public.product_custom_options to anon, authenticated;
grant insert, update, delete on public.product_custom_options to authenticated;

drop policy if exists "QEH public reads visible custom options"
on public.product_custom_options;

create policy "QEH public reads visible custom options"
on public.product_custom_options
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_custom_options.product_id
      and products.is_active = true
  )
);

drop policy if exists "QEH admins manage custom options"
on public.product_custom_options;

create policy "QEH admins manage custom options"
on public.product_custom_options
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

-- Cette fonction permet au paiement serveur de recalculer les suppléments
-- à partir des identifiants reçus, sans faire confiance au prix du navigateur.
create or replace function public.qeh_get_product_option_total(
  p_product_id uuid,
  p_option_ids uuid[] default array[]::uuid[]
)
returns table (
  options_total numeric,
  selected_options jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(option_row.price_delta), 0)::numeric as options_total,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', option_row.id,
          'name', option_row.name,
          'price_delta', option_row.price_delta
        )
        order by option_row.display_order, option_row.created_at
      ) filter (where option_row.id is not null),
      '[]'::jsonb
    ) as selected_options
  from public.product_custom_options option_row
  where option_row.product_id = p_product_id
    and option_row.is_active = true
    and option_row.id = any(coalesce(p_option_ids, array[]::uuid[]))
    and exists (
      select 1
      from public.products product_row
      where product_row.id = p_product_id
        and product_row.is_active = true
    );
$$;

revoke all on function public.qeh_get_product_option_total(uuid, uuid[])
from public;

grant execute on function public.qeh_get_product_option_total(uuid, uuid[])
to anon, authenticated;

comment on table public.product_custom_options is
  'Petites options tarifaires visibles uniquement sur la fiche du produit parent.';

commit;
