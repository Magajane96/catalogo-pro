create or replace function public.admin_grant_manual_pro(p_profile_id uuid, p_days integer default 30)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  v_subscription_id uuid;
  v_days integer := greatest(1, least(coalesce(p_days, 30), 366));
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;

  if not exists(select 1 from public.profiles where id = p_profile_id) then
    raise exception 'Usuario nao encontrado.';
  end if;

  insert into public.subscriptions(
    profile_id,
    provider,
    provider_subscription_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    metadata
  )
  values(
    p_profile_id,
    'manual',
    'manual-' || p_profile_id::text,
    'pro',
    'active',
    now(),
    now() + make_interval(days => v_days),
    false,
    jsonb_build_object('granted_by', auth.uid(), 'days', v_days)
  )
  on conflict(provider, provider_subscription_id)
  do update set
    status = 'active',
    current_period_start = now(),
    current_period_end = now() + make_interval(days => v_days),
    cancel_at_period_end = false,
    metadata = public.subscriptions.metadata || jsonb_build_object('granted_by', auth.uid(), 'days', v_days, 'renewed_at', now()),
    updated_at = now()
  returning id into v_subscription_id;

  perform public.refresh_profile_plan(p_profile_id);
  return v_subscription_id;
end;
$$;

grant execute on function public.admin_grant_manual_pro(uuid,integer) to authenticated;
