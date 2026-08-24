-- QEH OUTLET — produits complémentaires et composition de kits
-- À exécuter une seule fois dans Supabase > SQL Editor.

begin;

create table if not exists public.product_kit_options (
  id uuid primary key default gen_random_uuid(),
  parent_product_id uuid not null,
  option_product_id uuid not null,
  quantity integer not null default 1,
  is_default_selected boolean not null default false,
  is_required boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_kit_options_parent_product_id_fkey
    foreign key (parent_product_id)
    references public.products(id)
    on delete cascade,

  constraint product_kit_options_option_product_id_fkey
    foreign key (option_product_id)
    references public.products(id)
    on delete cascade,

  constraint product_kit_options_unique_product
    unique (parent_product_id, option_product_id),

  constraint product_kit_options_different_products
    check (parent_product_id <> option_product_id),

  constraint product_kit_options_quantity_range
    check (quantity between 1 and 100),

  constraint product_kit_options_display_order_range
    check (display_order between 0 and 10000)
);

create index if not exists product_kit_options_parent_order_idx
  on public.product_kit_options(parent_product_id, display_order, created_at);

create index if not exists product_kit_options_option_product_idx
  on public.product_kit_options(option_product_id);

alter table public.product_kit_options enable row level security;

revoke all on public.product_kit_options from anon, authenticated;
grant select on public.product_kit_options to anon, authenticated;
grant insert, update, delete on public.product_kit_options to authenticated;

drop policy if exists "QEH public reads visible kit options"
on public.product_kit_options;

create policy "QEH public reads visible kit options"
on public.product_kit_options
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products parent_product
    where parent_product.id = product_kit_options.parent_product_id
      and parent_product.is_active = true
  )
  and exists (
    select 1
    from public.products option_product
    where option_product.id = product_kit_options.option_product_id
      and option_product.is_active = true
  )
);

drop policy if exists "QEH admins manage kit options"
on public.product_kit_options;

create policy "QEH admins manage kit options"
on public.product_kit_options
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

comment on table public.product_kit_options is
  'Produits complémentaires proposés sur une fiche QEH OUTLET afin de composer un kit.';

comment on column public.product_kit_options.parent_product_id is
  'Produit principal sur lequel le configurateur de kit est affiché.';

comment on column public.product_kit_options.option_product_id is
  'Produit complémentaire ajouté au panier avec le produit principal.';

comment on column public.product_kit_options.quantity is
  'Quantité du produit complémentaire ajoutée pour une unité du produit principal.';

commit;
