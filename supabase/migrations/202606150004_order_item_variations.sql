create or replace function public.create_public_order(p_store_id uuid, p_customer jsonb, p_items jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_customer_id uuid; v_order_id uuid; v_order_number bigint; v_total numeric(12,2) := 0;
  v_item jsonb; v_product record; v_quantity integer; v_phone text; v_variant_name text;
begin
  if not exists(select 1 from public.stores where id=p_store_id and published=true) then raise exception 'Loja indisponivel.'; end if;
  v_phone := regexp_replace(coalesce(p_customer->>'phone',''), '\D', '', 'g');
  if length(trim(coalesce(p_customer->>'name',''))) < 2 or length(v_phone) < 8 then raise exception 'Informe nome e telefone validos.'; end if;
  if jsonb_array_length(p_items)=0 then raise exception 'O carrinho esta vazio.'; end if;

  insert into public.customers(store_id,name,phone,email)
  values(p_store_id,trim(p_customer->>'name'),v_phone,nullif(trim(p_customer->>'email'),''))
  on conflict(store_id,phone) do update set name=excluded.name,email=coalesce(excluded.email,public.customers.email),updated_at=now()
  returning id into v_customer_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := greatest(1,least(999,(v_item->>'quantity')::integer));
    select id,name,coalesce(promotional_price,price) as unit_price,stock into v_product from public.products where id=(v_item->>'product_id')::uuid and store_id=p_store_id and active=true;
    if not found then raise exception 'Um produto nao esta mais disponivel.'; end if;
    if v_product.stock < v_quantity then raise exception 'Estoque insuficiente para %.',v_product.name; end if;
    v_total := v_total + (v_product.unit_price*v_quantity);
  end loop;

  insert into public.orders(store_id,customer_id,status,subtotal,total,customer_name,customer_phone,customer_email)
  values(p_store_id,v_customer_id,'new',v_total,v_total,trim(p_customer->>'name'),v_phone,nullif(trim(p_customer->>'email'),''))
  returning id,order_number into v_order_id,v_order_number;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := greatest(1,least(999,(v_item->>'quantity')::integer));
    v_variant_name := nullif(left(trim(coalesce(v_item->>'variant_name','')), 240), '');
    select id,name,coalesce(promotional_price,price) as unit_price into v_product from public.products where id=(v_item->>'product_id')::uuid and store_id=p_store_id and active=true;
    insert into public.order_items(order_id,product_id,product_name,variant_name,quantity,unit_price,total)
    values(v_order_id,v_product.id,v_product.name,v_variant_name,v_quantity,v_product.unit_price,v_product.unit_price*v_quantity);
  end loop;

  insert into public.activities(store_id,type,title,metadata)
  values(p_store_id,'order_created','Novo pedido recebido',jsonb_build_object('order_id',v_order_id,'order_number',v_order_number,'total',v_total));
  return jsonb_build_object('id',v_order_id,'order_number',v_order_number,'total',v_total);
end; $$;

grant execute on function public.create_public_order(uuid,jsonb,jsonb) to anon, authenticated;
