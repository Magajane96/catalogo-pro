alter table public.orders add column if not exists stock_restored_at timestamptz;

create or replace function public.update_order_status(p_order_id uuid, p_status public.order_status)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_order record;
  v_item record;
begin
  select id, store_id, order_number, status, stock_restored_at
    into v_order
    from public.orders
    where id = p_order_id
    for update;

  if not found then raise exception 'Pedido nao encontrado.'; end if;
  if not public.owns_store(v_order.store_id) then raise exception 'Acesso negado.'; end if;

  update public.orders
    set status = p_status, updated_at = now()
    where id = p_order_id;

  if p_status = 'cancelled' and v_order.stock_restored_at is null then
    for v_item in
      select product_id, product_name, quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
    loop
      update public.products
        set stock = stock + v_item.quantity, updated_at = now()
        where id = v_item.product_id;

      insert into public.activities(store_id,type,title,metadata)
      values(
        v_order.store_id,
        'stock_restored',
        'Estoque restaurado por cancelamento',
        jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'product_id',v_item.product_id,'product_name',v_item.product_name,'quantity_restored',v_item.quantity)
      );
    end loop;

    update public.orders
      set stock_restored_at = now(), updated_at = now()
      where id = p_order_id;
  end if;

  insert into public.activities(store_id,type,title,metadata)
  values(
    v_order.store_id,
    'order_status_updated',
    'Status do pedido atualizado',
    jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'status',p_status)
  );

  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'status',p_status);
end; $$;

grant execute on function public.update_order_status(uuid,public.order_status) to authenticated;
