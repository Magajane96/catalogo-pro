create extension if not exists "pgcrypto";

create type public.plan_type as enum ('free', 'pro');
create type public.order_status as enum ('new', 'in_progress', 'picking', 'finished', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '', avatar_url text, role text not null default 'user' check (role in ('user','admin')),
  plan plan_type not null default 'free', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.stores (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null, slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), description text,
  whatsapp text not null, category text not null, logo_url text, banner_url text,
  primary_color text not null default '#16a263', secondary_color text not null default '#14261d', font_family text not null default 'Manrope',
  published boolean not null default false, seo_title text, seo_description text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, icon text, color text not null default '#16a263', position integer not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), unique(store_id,name)
);
create table public.products (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null, name text not null, slug text,
  description text not null default '', price numeric(12,2) not null check(price >= 0), promotional_price numeric(12,2) check(promotional_price >= 0),
  stock integer not null default 0 check(stock >= 0), sku text, internal_code text, weight numeric(10,3), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(store_id,slug)
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  url text not null, storage_path text, is_primary boolean not null default false, position integer not null default 0, created_at timestamptz not null default now()
);
create table public.product_options (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, position integer not null default 0, created_at timestamptz not null default now()
);
create table public.product_option_values (
  id uuid primary key default gen_random_uuid(), option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null, color_hex text, position integer not null default 0
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, sku text, price_adjustment numeric(12,2) not null default 0, stock integer not null default 0 check(stock >= 0), active boolean not null default true,
  option_values jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.customers (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, phone text not null, email text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(store_id,phone)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null, order_number bigint generated always as identity,
  status order_status not null default 'new', subtotal numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
  customer_name text not null, customer_phone text not null, customer_email text, notes text, whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null, variant_name text, quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null, total numeric(12,2) not null
);
create table public.store_visits (
  id bigint generated always as identity primary key, store_id uuid not null references public.stores(id) on delete cascade,
  visitor_hash text, referrer text, path text, visited_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id) on delete cascade,
  type text not null, title text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index products_store_idx on public.products(store_id,active);
create index orders_store_created_idx on public.orders(store_id,created_at desc);
create index customers_store_idx on public.customers(store_id);
create index visits_store_date_idx on public.store_visits(store_id,visited_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'name','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.owns_store(target_store uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.stores where id=target_store and owner_id=auth.uid());
$$;
create or replace function public.product_store(target_product uuid) returns uuid language sql stable security definer set search_path=public as $$
  select store_id from public.products where id=target_product;
$$;
create or replace function public.order_store(target_order uuid) returns uuid language sql stable security definer set search_path=public as $$
  select store_id from public.orders where id=target_order;
$$;
create or replace function public.enforce_free_product_limit() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_plan plan_type; product_count integer;
begin select p.plan into owner_plan from public.stores s join public.profiles p on p.id=s.owner_id where s.id=new.store_id;
  if owner_plan='free' then select count(*) into product_count from public.products where store_id=new.store_id; if product_count>=20 then raise exception 'O plano gratuito permite ate 20 produtos.'; end if; end if; return new;
end; $$;
create trigger free_product_limit before insert on public.products for each row execute function public.enforce_free_product_limit();

alter table public.profiles enable row level security; alter table public.stores enable row level security;
alter table public.categories enable row level security; alter table public.products enable row level security;
alter table public.product_images enable row level security; alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security; alter table public.product_variants enable row level security;
alter table public.customers enable row level security; alter table public.orders enable row level security;
alter table public.order_items enable row level security; alter table public.store_visits enable row level security; alter table public.activities enable row level security;

create policy "profile_self" on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy "store_owner_all" on public.stores for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "published_stores_public" on public.stores for select using(published=true);
create policy "category_owner_all" on public.categories for all using(public.owns_store(store_id)) with check(public.owns_store(store_id));
create policy "categories_public" on public.categories for select using(active and exists(select 1 from public.stores s where s.id=store_id and s.published));
create policy "product_owner_all" on public.products for all using(public.owns_store(store_id)) with check(public.owns_store(store_id));
create policy "products_public" on public.products for select using(active and exists(select 1 from public.stores s where s.id=store_id and s.published));
create policy "image_owner_all" on public.product_images for all using(public.owns_store(public.product_store(product_id))) with check(public.owns_store(public.product_store(product_id)));
create policy "images_public" on public.product_images for select using(exists(select 1 from public.products p join public.stores s on s.id=p.store_id where p.id=product_id and p.active and s.published));
create policy "option_owner_all" on public.product_options for all using(public.owns_store(public.product_store(product_id))) with check(public.owns_store(public.product_store(product_id)));
create policy "option_value_owner_all" on public.product_option_values for all using(exists(select 1 from public.product_options o where o.id=option_id and public.owns_store(public.product_store(o.product_id)))) with check(exists(select 1 from public.product_options o where o.id=option_id and public.owns_store(public.product_store(o.product_id))));
create policy "variant_owner_all" on public.product_variants for all using(public.owns_store(public.product_store(product_id))) with check(public.owns_store(public.product_store(product_id)));
create policy "customer_owner_all" on public.customers for all using(public.owns_store(store_id)) with check(public.owns_store(store_id));
create policy "order_owner_all" on public.orders for all using(public.owns_store(store_id)) with check(public.owns_store(store_id));
create policy "order_public_create" on public.orders for insert with check(exists(select 1 from public.stores s where s.id=store_id and s.published));
create policy "order_item_owner_all" on public.order_items for all using(public.owns_store(public.order_store(order_id))) with check(public.owns_store(public.order_store(order_id)));
create policy "visit_owner_read" on public.store_visits for select using(public.owns_store(store_id));
create policy "visit_public_create" on public.store_visits for insert with check(exists(select 1 from public.stores s where s.id=store_id and s.published));
create policy "activity_owner_all" on public.activities for all using(public.owns_store(store_id)) with check(public.owns_store(store_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('store-assets','store-assets',true,5242880,array['image/jpeg','image/png','image/webp']),
('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "public_read_store_assets" on storage.objects for select using(bucket_id='store-assets');
create policy "owner_write_store_assets" on storage.objects for all to authenticated using(bucket_id='store-assets' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='store-assets' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "public_read_product_images" on storage.objects for select using(bucket_id='product-images');
create policy "owner_write_product_images" on storage.objects for all to authenticated using(bucket_id='product-images' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='product-images' and (storage.foldername(name))[1]=auth.uid()::text);
