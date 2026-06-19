create or replace function public.mark_public_order_whatsapp_sent(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare
  v_order record;
begin
  update public.orders
    set whatsapp_sent_at = coalesce(whatsapp_sent_at, now()), updated_at = now()
    where id = p_order_id and whatsapp_sent_at is null
    returning id, store_id, order_number into v_order;

  if found then
    insert into public.activities(store_id,type,title,metadata)
    values(
      v_order.store_id,
      'whatsapp_sent',
      'Pedido enviado para WhatsApp',
      jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number)
    );
  end if;

  return exists(select 1 from public.orders where id = p_order_id and whatsapp_sent_at is not null);
end; $$;

grant execute on function public.mark_public_order_whatsapp_sent(uuid) to anon, authenticated;
