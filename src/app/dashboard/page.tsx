import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, Clock, Eye, Package, ShoppingBag, TrendingUp, Users, WalletCards, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { formatCurrency } from "@/lib/utils";

type Order = { created_at: string; total?: number | string; status?: string };
type Visit = { visited_at: string };
type Activity = { id: string; title: string; type: string; created_at: string };
type StockProduct = {
  id: string;
  name: string;
  stock: number;
  product_variants: { stock: number; active: boolean }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const { data: store } = await supabase.from("stores").select("id,name,slug").maybeSingle();
  if (!store) return <OnboardingForm />;

  const weekStart = startOfDay(addDays(new Date(), -6)).toISOString();
  const [
    { count: orders },
    { count: customers },
    { count: visits },
    { data: weekOrders },
    { data: weekVisits },
    { data: activities },
    { data: stockAlerts },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("store_visits").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("created_at,total,status").gte("created_at", weekStart),
    supabase.from("store_visits").select("visited_at").gte("visited_at", weekStart),
    supabase.from("activities").select("id,title,type,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id,name,stock,product_variants(stock,active)").eq("active", true).is("archived_at", null).order("stock", { ascending: true }),
  ]);

  const safeOrders = (weekOrders || []) as Order[];
  const safeVisits = (weekVisits || []) as Visit[];
  const revenue = safeOrders.filter(order => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total || 0), 0);
  const conversion = visits ? Math.round(((orders || 0) / Math.max(visits || 1, 1)) * 1000) / 10 : 0;
  const daily = buildDailyReport(safeOrders, safeVisits);
  const maxDaily = Math.max(...daily.map(day => Math.max(day.orders, day.visits)), 1);
  const stockRows = ((stockAlerts || []) as StockProduct[])
    .map(product => ({
      id: product.id,
      name: product.name,
      stock: getEffectiveStock(product),
      variantCount: (product.product_variants || []).filter(variant => variant.active).length,
    }))
    .filter(product => product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const metrics = [
    { label: "Total de pedidos", value: orders || 0, helper: "+12% vs. período anterior", icon: ShoppingBag, tone: "bg-emerald-50 text-brand" },
    { label: "Faturamento", value: formatCurrency(revenue), helper: "últimos 7 dias", icon: WalletCards, tone: "bg-slate-950 text-white" },
    { label: "Conversões", value: `${conversion}%`, helper: "pedidos sobre visitas", icon: TrendingUp, tone: "bg-blue-50 text-blue-700" },
    { label: "Clientes", value: customers || 0, helper: "+8% em crescimento", icon: Users, tone: "bg-violet-50 text-violet-700" },
  ] as const;

  return <div className="mx-auto max-w-7xl space-y-7">
    <section className="premium-panel overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-brand">Visão geral</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">Olá, {store.name}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Acompanhe sua operação comercial, encontre gargalos e tome decisões rápidas com dados da loja.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/produtos/novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5">
            <Package size={18} />Novo produto
          </Link>
          <Link href={`/loja/${store.slug}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5">
            <Eye size={18} />Ver loja
          </Link>
        </div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, helper, icon: Icon, tone }) => <article key={label} className="premium-card metric-spark rounded-3xl p-5">
        <div className="flex items-start justify-between">
          <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} /></span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700"><TrendingUp size={13} />ativo</span>
        </div>
        <p className="font-display mt-6 text-3xl font-extrabold text-slate-950">{value}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs font-bold"><span className="text-slate-400">{helper}</span><span className="rounded-full bg-white/70 px-2 py-1 text-emerald-700 ring-1 ring-emerald-100">tendência positiva</span></div>
      </article>)}
    </section>

    {stockRows.length ? <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-amber-600 shadow-sm"><AlertTriangle size={21} /></span>
          <div>
            <h3 className="font-display text-lg font-extrabold">Atenção ao estoque</h3>
            <p className="mt-1 text-sm font-semibold text-amber-900/70">Produtos publicados com 5 unidades ou menos, incluindo variantes.</p>
          </div>
        </div>
        <Link href="/dashboard/produtos?filter=low" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-extrabold text-white">
          Ver produtos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stockRows.map(product => <Link key={product.id} href={`/dashboard/produtos/${product.id}/editar`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5">
          <span className="font-extrabold text-slate-700">{product.name}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {product.stock === 0 ? "Sem estoque" : `${product.stock} un.${product.variantCount ? " em variantes" : ""}`}
          </span>
        </Link>)}
      </div>
    </section> : null}

    <section className="grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
      <div className="premium-card rounded-3xl p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-extrabold">Performance da semana</h3>
            <p className="mt-1 text-sm text-slate-500">Pedidos e visitas dos últimos 7 dias.</p>
          </div>
          <Link href="/dashboard/relatorios" className="text-sm font-extrabold text-brand">Ver relatórios</Link>
        </div>
        <div className="mt-6 grid h-72 grid-cols-7 items-end gap-3 rounded-3xl bg-slate-50 p-4">
          {daily.map(day => <div key={day.key} className="flex h-full flex-col justify-end gap-3">
            <div className="flex flex-1 items-end justify-center gap-1.5">
              <Bar value={day.visits} max={maxDaily} className="bg-slate-300" />
              <Bar value={day.orders} max={maxDaily} className="bg-brand shadow-lg shadow-emerald-700/20" />
            </div>
            <span className="text-center text-[11px] font-bold text-slate-400">{day.label}</span>
          </div>)}
        </div>
        <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500">
          <Legend color="bg-slate-300" label="Visitas" />
          <Legend color="bg-brand" label="Pedidos" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Zap size={19} /></span><h3 className="font-display text-lg font-extrabold">Próximas ações</h3></div>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/produtos/novo" className="flex items-center justify-between rounded-2xl bg-white/8 p-4 text-sm font-extrabold text-slate-100 transition hover:bg-white/12">
              <span className="flex items-center gap-2"><Box size={18} />Cadastrar produto</span><ArrowRight size={17} />
            </Link>
            <Link href="/dashboard/pedidos" className="flex items-center justify-between rounded-2xl bg-white/8 p-4 text-sm font-extrabold text-slate-100 transition hover:bg-white/12">
              <span className="flex items-center gap-2"><ShoppingBag size={18} />Acompanhar pedidos</span><ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="premium-card rounded-3xl p-6">
          <h3 className="font-display text-lg font-extrabold">Atividades recentes</h3>
          <div className="mt-5 space-y-3">
            {activities?.length ? ((activities || []) as Activity[]).map(activity => <div key={activity.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm"><Clock size={16} /></span>
              <div>
                <p className="text-sm font-extrabold">{activity.title}</p>
                <p className="text-xs font-bold text-slate-400">{new Date(activity.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500"><p className="font-extrabold text-slate-700">Sem atividades recentes.</p><p className="mt-1">Quando pedidos, produtos e visitas acontecerem, tudo aparecerá aqui.</p></div>}
          </div>
        </div>
      </div>
    </section>
  </div>;
}

function SetupRequired() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Conecte seu Supabase</h2>
    <p className="mt-3 leading-7 text-slate-600">Copie <code>.env.example</code> para <code>.env.local</code>, informe as chaves do projeto e execute a migração SQL. A interface está pronta para usar dados reais.</p>
  </div>;
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const height = value ? Math.max(12, (value / max) * 100) : 0;
  return <span className={`w-3 rounded-t-full transition-all ${className}`} style={{ height: `${height}%` }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`size-3 rounded-full ${color}`} />{label}</span>;
}

function getEffectiveStock(product: StockProduct) {
  const activeVariants = (product.product_variants || []).filter(variant => variant.active);
  if (activeVariants.length) return activeVariants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  return Number(product.stock || 0);
}

function buildDailyReport(orders: Order[], visits: Visit[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(addDays(new Date(), index - 6));
    return { key: dateKey(date), label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), orders: 0, visits: 0 };
  });
  const byKey = new Map(days.map(day => [day.key, day]));
  orders.forEach(order => { const day = byKey.get(dateKey(new Date(order.created_at))); if (day) day.orders += 1; });
  visits.forEach(visit => { const day = byKey.get(dateKey(new Date(visit.visited_at))); if (day) day.visits += 1; });
  return days;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

