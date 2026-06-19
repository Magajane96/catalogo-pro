create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "admin_read_profiles" on public.profiles for select using(public.is_admin());
create policy "admin_read_stores" on public.stores for select using(public.is_admin());
create policy "admin_read_categories" on public.categories for select using(public.is_admin());
create policy "admin_read_products" on public.products for select using(public.is_admin());
create policy "admin_read_product_images" on public.product_images for select using(public.is_admin());
create policy "admin_read_product_options" on public.product_options for select using(public.is_admin());
create policy "admin_read_product_option_values" on public.product_option_values for select using(public.is_admin());
create policy "admin_read_product_variants" on public.product_variants for select using(public.is_admin());
create policy "admin_read_customers" on public.customers for select using(public.is_admin());
create policy "admin_read_orders" on public.orders for select using(public.is_admin());
create policy "admin_read_order_items" on public.order_items for select using(public.is_admin());
create policy "admin_read_store_visits" on public.store_visits for select using(public.is_admin());
create policy "admin_read_activities" on public.activities for select using(public.is_admin());
