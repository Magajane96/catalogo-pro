import { notFound } from "next/navigation";
import { CreditCard, Package, ShieldCheck, ShoppingBag, Sparkles, Store, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
  profiles: { name: string; plan: string }[] | { name: string; plan: string } | null;
};
type ProfileRow = { plan: string };
type SubscriptionRow = { status: string; plan: string; current_period_end: string | null };

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const { data: profile } = await supabase.from("profiles").select("role").maybeSingle();
  if (profile?.role !== "admin") notFound();

  const [{ count: stores }, { count: users }, { count: products }, { data: orders }, { data: recentStores }, { data: profiles }, { data: subscriptions }] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id,total"),
    supabase.from("stores").select("id,name,slug,category,published,created_at,profiles(name,plan)").order("created_at", { ascending: false }).limit(8),
    supabase.from("profiles").select("plan"),
    supabase.from("subscriptions").select("status,plan,current_period_end"),
  ]);

  const revenue = (orders || []).reduce((sum, order) => sum + Number(order.total), 0);
  const planSummary = buildPlanSummary((profiles || []) as ProfileRow[]);
  const subscriptionSummary = buildSubscriptionSummary((subscriptions || []) as SubscriptionRow[]);
  const storesList = ((recentStores || []) as StoreRow[]).map(store => ({
    ...store,
    owner: Array.isArray(store.profiles) ? store.profiles[0] : store.profiles,
  }));
  const cards = [
    ["Total de lojas", stores || 0, Store, "bg-emerald-50 text-brand"],
    ["Total de usuarios", users || 0, Users, "bg-blue-50 text-blue-600"],
    ["Total de produtos", products || 0, Package, "bg-violet-50 text-violet-600"],
    ["Total de pedidos", orders?.length || 0, ShoppingBag, "bg-orange-50 text-orange-600"],
  ] as const;

  return <div className="mx-auto max-w-7xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-slate-400">ADMINISTRACAO GLOBAL</p>
        <h2 className="font-display mt-1 text-3xl font-extrabold">Painel administrativo</h2>
        <p className="mt-2 text-slate-500">Visao geral da operacao SaaS MGD Catalogo PRO.</p>
      </div>
      <span className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-extrabold text-brand sm:inline-flex"><ShieldCheck size={17} />Admin</span>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon, color]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className={`grid size-11 place-items-center rounded-xl ${color}`}><Icon size={21} /></span>
          <span className="text-xs font-bold text-slate-400">Global</span>
        </div>
        <p className="font-display mt-5 text-3xl font-extrabold">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </article>)}
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-extrabold">Receita monitorada</h3>
        <p className="font-display mt-5 text-4xl font-extrabold text-brand">{formatCurrency(revenue)}</p>
        <p className="mt-2 text-sm text-slate-500">Soma dos pedidos registrados em todas as lojas.</p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Assinaturas</p>
              <p className="mt-2 text-sm font-bold text-slate-600">Planos e assinaturas monitorados pelo banco.</p>
            </div>
            <CreditCard className="text-slate-400" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniMetric icon={Users} label="Free" value={planSummary.free} />
            <MiniMetric icon={Sparkles} label="PRO" value={planSummary.pro} />
            <MiniMetric icon={CreditCard} label="Ativas" value={subscriptionSummary.active} />
            <MiniMetric icon={ShieldCheck} label="Pendentes" value={subscriptionSummary.needsAttention} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-extrabold">Lojas recentes</h3>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          {storesList.length ? storesList.map(store => <div key={store.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[1fr_120px_110px] sm:items-center">
            <div>
              <p className="font-extrabold">{store.name}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">/{store.slug} - {store.category} - {store.owner?.name || "Sem nome"}</p>
            </div>
            <span className="text-sm font-bold text-slate-500">{store.owner?.plan === "pro" ? "PRO" : "Gratis"}</span>
            <span className={`rounded-full px-3 py-1 text-center text-xs font-black ${store.published ? "bg-emerald-50 text-brand" : "bg-slate-100 text-slate-500"}`}>{store.published ? "Publicada" : "Oculta"}</span>
          </div>) : <div className="grid min-h-40 place-items-center text-center text-slate-400">
            <div>
              <Store className="mx-auto mb-3" />
              <p className="font-bold">Nenhuma loja criada ainda.</p>
            </div>
          </div>}
        </div>
      </section>
    </div>
  </div>;
}

function MiniMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return <div className="rounded-xl bg-white p-4">
    <Icon className="text-slate-400" size={18} />
    <p className="mt-3 text-xs font-black uppercase text-slate-400">{label}</p>
    <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
  </div>;
}

function buildPlanSummary(profiles: ProfileRow[]) {
  return profiles.reduce((summary, profile) => ({
    free: summary.free + (profile.plan === "pro" ? 0 : 1),
    pro: summary.pro + (profile.plan === "pro" ? 1 : 0),
  }), { free: 0, pro: 0 });
}

function buildSubscriptionSummary(subscriptions: SubscriptionRow[]) {
  return subscriptions.reduce((summary, subscription) => {
    const active = subscription.plan === "pro" && ["trialing", "active"].includes(subscription.status) && (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());
    const needsAttention = ["pending", "past_due", "paused", "cancelled", "expired"].includes(subscription.status);
    return {
      active: summary.active + (active ? 1 : 0),
      needsAttention: summary.needsAttention + (needsAttention ? 1 : 0),
    };
  }, { active: 0, needsAttention: 0 });
}

function SetupRequired() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Conecte seu Supabase</h2>
    <p className="mt-3 leading-7 text-slate-600">Configure as variaveis do Supabase para acessar o painel administrativo.</p>
  </div>;
}
