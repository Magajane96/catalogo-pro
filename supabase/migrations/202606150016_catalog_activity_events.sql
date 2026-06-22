create or replace function public.log_product_created_activity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.activities(store_id,type,title,metadata)
  values(
    new.store_id,
    'product_created',
    'Produto adicionado',
    jsonb_build_object(
      'product_id', new.id,
      'product_name', new.name,
      'active', new.active
    )
  );

  return new;
end; $$;

drop trigger if exists product_created_activity on public.products;
create trigger product_created_activity
after insert on public.products
for each row execute function public.log_product_created_activity();

create or replace function public.log_customer_created_activity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.activities(store_id,type,title,metadata)
  values(
    new.store_id,
    'customer_created',
    'Novo cliente cadastrado',
    jsonb_build_object(
      'customer_id', new.id,
      'customer_name', new.name,
      'phone', new.phone
    )
  );

  return new;
end; $$;

drop trigger if exists customer_created_activity on public.customers;
create trigger customer_created_activity
after insert on public.customers
for each row execute function public.log_customer_created_activity();
