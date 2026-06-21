do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'pending',
      'trialing',
      'active',
      'past_due',
      'paused',
      'cancelled',
      'expired'
    );
  end if;
end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  plan public.plan_type not null default 'pro',
  status public.subscription_status not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_subscription_id)
);

create index if not exists subscriptions_profile_status_idx on public.subscriptions(profile_id,status);
create index if not exists subscriptions_provider_customer_idx on public.subscriptions(provider,provider_customer_id);

alter table public.subscriptions enable row level security;

create policy "subscription_owner_read" on public.subscriptions
  for select
  using(profile_id = auth.uid());

create policy "subscription_admin_read" on public.subscriptions
  for select
  using(public.is_admin());

create or replace function public.refresh_profile_plan(target_profile uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  has_active_subscription boolean;
begin
  select exists(
    select 1
    from public.subscriptions
    where profile_id = target_profile
      and plan = 'pro'
      and status in ('trialing', 'active')
      and (
        current_period_end is null
        or current_period_end > now()
      )
  ) into has_active_subscription;

  update public.profiles
  set
    plan = case when has_active_subscription then 'pro'::public.plan_type else 'free'::public.plan_type end,
    updated_at = now()
  where id = target_profile;
end;
$$;

create or replace function public.sync_profile_plan_from_subscription()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_plan(old.profile_id);
    return old;
  end if;

  perform public.refresh_profile_plan(new.profile_id);
  return new;
end;
$$;

create or replace function public.touch_subscription_updated_at()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_subscription_updated_at_before_update on public.subscriptions;
create trigger touch_subscription_updated_at_before_update
before update on public.subscriptions
for each row execute function public.touch_subscription_updated_at();

drop trigger if exists sync_profile_plan_after_subscription on public.subscriptions;
create trigger sync_profile_plan_after_subscription
after insert or update or delete on public.subscriptions
for each row execute function public.sync_profile_plan_from_subscription();
