create or replace function public.admin_revoke_manual_pro(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;

  if not exists(select 1 from public.profiles where id = p_profile_id) then
    raise exception 'Usuario nao encontrado.';
  end if;

  update public.subscriptions
  set
    status = 'cancelled',
    current_period_end = now(),
    cancel_at_period_end = true,
    metadata = metadata || jsonb_build_object('revoked_by', auth.uid(), 'revoked_at', now()),
    updated_at = now()
  where profile_id = p_profile_id
    and provider = 'manual'
    and plan = 'pro'
    and status in ('pending', 'trialing', 'active', 'past_due', 'paused');

  perform public.refresh_profile_plan(p_profile_id);
end;
$$;

grant execute on function public.admin_revoke_manual_pro(uuid) to authenticated;
