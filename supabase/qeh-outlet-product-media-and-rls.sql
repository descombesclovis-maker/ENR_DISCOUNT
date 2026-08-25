-- QEH OUTLET — import des photos produit et correction du masquage RLS
-- À exécuter dans Supabase > SQL Editor sur le projet utilisé par qehoutlet.fr.

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

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

-- Supprime les anciennes politiques permissives avant de recréer le jeu
-- minimal attendu par l'application. Les policies PostgreSQL s'additionnent
-- avec OR : en conserver une seule trop large annulerait le correctif RLS.
do $$
declare
  target_table text;
  existing_policy record;
begin
  foreach target_table in array array[
    'admin_users',
    'categories',
    'products',
    'product_images',
    'product_variants'
  ] loop
    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        existing_policy.policyname,
        target_table
      );
    end loop;
  end loop;
end;
$$;

grant select on public.admin_users to authenticated;
grant select on public.categories, public.products, public.product_images, public.product_variants
  to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants
  to authenticated;

drop policy if exists "QEH admin reads own profile" on public.admin_users;
create policy "QEH admin reads own profile"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "QEH public reads visible categories" on public.categories;
create policy "QEH public reads visible categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "QEH admins manage categories" on public.categories;
create policy "QEH admins manage categories"
on public.categories
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

drop policy if exists "QEH public reads visible products" on public.products;
create policy "QEH public reads visible products"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "QEH admins manage products" on public.products;
create policy "QEH admins manage products"
on public.products
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

drop policy if exists "QEH public reads visible product images" on public.product_images;
create policy "QEH public reads visible product images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.is_active = true
  )
);

drop policy if exists "QEH admins manage product images" on public.product_images;
create policy "QEH admins manage product images"
on public.product_images
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

drop policy if exists "QEH public reads visible product variants" on public.product_variants;
create policy "QEH public reads visible product variants"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.is_active = true
  )
);

drop policy if exists "QEH admins manage product variants" on public.product_variants;
create policy "QEH admins manage product variants"
on public.product_variants
for all
to authenticated
using (public.is_qeh_admin())
with check (public.is_qeh_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'produits',
  'produits',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "QEH public reads product media" on storage.objects;
create policy "QEH public reads product media"
on storage.objects
for select
to public
using (bucket_id = 'produits');

drop policy if exists "QEH admins upload product media" on storage.objects;
create policy "QEH admins upload product media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'produits'
  and public.is_qeh_admin()
);

drop policy if exists "QEH admins update product media" on storage.objects;
create policy "QEH admins update product media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'produits'
  and public.is_qeh_admin()
)
with check (
  bucket_id = 'produits'
  and public.is_qeh_admin()
);

drop policy if exists "QEH admins delete product media" on storage.objects;
create policy "QEH admins delete product media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'produits'
  and public.is_qeh_admin()
);

create or replace function public.qeh_set_product_visibility(
  p_product_id uuid,
  p_is_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_qeh_admin() then
    raise exception 'QEH_ADMIN_ACCESS_DENIED'
      using errcode = '42501';
  end if;

  update public.products
  set is_active = p_is_active
  where id = p_product_id;

  if not found then
    raise exception 'QEH_PRODUCT_NOT_FOUND'
      using errcode = 'P0002';
  end if;

  return true;
end;
$$;

revoke all on function public.qeh_set_product_visibility(uuid, boolean) from public;
grant execute on function public.qeh_set_product_visibility(uuid, boolean) to authenticated;

commit;
