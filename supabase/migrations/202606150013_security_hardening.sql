drop policy if exists "order_public_create" on public.orders;

create index if not exists categories_store_position_idx on public.categories(store_id,position);
create index if not exists product_images_product_position_idx on public.product_images(product_id,position);
create index if not exists product_options_product_position_idx on public.product_options(product_id,position);
create index if not exists product_option_values_option_position_idx on public.product_option_values(option_id,position);
create index if not exists product_variants_product_active_idx on public.product_variants(product_id,active);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);
create index if not exists activities_store_created_idx on public.activities(store_id,created_at desc);
create index if not exists subscriptions_profile_created_idx on public.subscriptions(profile_id,created_at desc);

create unique index if not exists product_images_one_primary_idx
  on public.product_images(product_id)
  where is_primary;

do $$
begin
  if not exists(select 1 from pg_constraint where conname = 'stores_primary_color_hex') then
    alter table public.stores add constraint stores_primary_color_hex check (primary_color ~ '^#[0-9A-Fa-f]{6}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'stores_secondary_color_hex') then
    alter table public.stores add constraint stores_secondary_color_hex check (secondary_color ~ '^#[0-9A-Fa-f]{6}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'categories_color_hex') then
    alter table public.categories add constraint categories_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'product_option_values_color_hex') then
    alter table public.product_option_values add constraint product_option_values_color_hex check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'products_promotional_price_lte_price') then
    alter table public.products add constraint products_promotional_price_lte_price check (promotional_price is null or promotional_price <= price) not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'orders_customer_phone_digits') then
    alter table public.orders add constraint orders_customer_phone_digits check (customer_phone ~ '^[0-9]{8,20}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'customers_phone_digits') then
    alter table public.customers add constraint customers_phone_digits check (phone ~ '^[0-9]{8,20}$') not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'store_visits_path_length') then
    alter table public.store_visits add constraint store_visits_path_length check (path is null or length(path) <= 500) not valid;
  end if;

  if not exists(select 1 from pg_constraint where conname = 'activities_type_length') then
    alter table public.activities add constraint activities_type_length check (length(type) between 1 and 80) not valid;
  end if;
end $$;
