import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, Clock, Eye, Package, ShoppingBag, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

type Order = { created_at: string };
type Visit = { visited_at: string };
type Activity = { id: string; title: string; type: string; created_at: string };
type StockProduct = { id: string; name: string; stock: number };

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const { data: store } = await supabase.from("stores").select("id,name,slug").maybeSingle();
  if (!store) return <OnboardingForm />;

  const weekStart = startOfDay(addDays(new Date(), -6)).toISOString();
  const [
    { count: products },
    { count: orders },
    { count: customers },
    { count: visits },
    { data: weekOrders },
    { data: weekVisits },
    { data: activities },
    { data: stockAlerts },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("store_visits").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("created_at").gte("created_at", weekStart),
    supabase.from("store_visits").select("visited_at").gte("visited_at", weekStart),
    supabase.from("activities").select("id,title,type,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id,name,stock").eq("active", true).lte("stock", 5).order("stock", { ascending: true }).limit(5),
  ]);

  const stockRows = (stockAlerts || []) as StockProduct[];
  const metrics = [
    ["Produtos", products || 0, Package, "bg-violet-50 text-violet-600"],
    ["Pedidos", orders || 0, ShoppingBag, "bg-orange-50 text-orange-600"],
    ["Clientes", customers || 0, Users, "bg-blue-50 text-blue-600"],
    ["Visitas", visits || 0, Eye, "bg-emerald-50 text-brand"],
  ] as const;
  const daily = buildDailyReport((weekOrders || []) as Order[], (weekVisits || []) as Visit[]);
  const maxDaily = Math.max(...daily.map(day => Math.max(day.orders, day.visits)), 1);

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold text-slate-400">BEM-VINDO AO SEU NEGOCIO</p>
        <h2 className="font-display mt-1 text-3xl font-extrabold">Ola, {store.name}</h2>
        <p className="mt-2 text-slate-500">Acompanhe o desempenho da sua loja hoje.</p>
      </div>
      <Link href="/dashboard/produtos/novo" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white">
        <Package size={18} />Novo produto
      </Link>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, Icon, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className={`grid size-11 place-items-center rounded-xl ${color}`}><Icon size={21} /></span>
          <span className="text-xs font-bold text-slate-400">Total</span>
        </div>
        <p className="font-display mt-5 text-3xl font-extrabold">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>)}
    </div>

    {stockRows.length ? <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-amber-600"><AlertTriangle size={21} /></span>
          <div>
            <h3 className="font-display text-lg font-extrabold">Atencao ao estoque</h3>
            <p className="mt-1 text-sm font-semibold text-amber-800/70">Ha produtos publicados com 5 unidades ou menos.</p>
          </div>
        </div>
        <Link href="/dashboard/produtos?filter=low" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-extrabold text-white">
          Ver produtos <ArrowRight size={16} />
        </Link>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stockRows.map(product => <Link key={product.id} href={`/dashboard/produtos/${product.id}/editar`} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm">
          <span className="font-extrabold text-slate-700">{product.name}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-100 text-amber-700"}`}>
            {product.stock === 0 ? "Sem estoque" : `${product.stock} un.`}
          </span>
        </Link>)}
      </div>
    </section> : null}

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-extrabold">Semana da loja</h3>
            <p className="mt-1 text-sm text-slate-500">Pedidos e visitas dos ultimos 7 dias.</p>
          </div>
          <Link href="/dashboard/relatorios" className="text-sm font-extrabold text-brand">Ver relatorios</Link>
        </div>
        <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3 rounded-xl bg-slate-50 p-4">
          {daily.map(day => <div key={day.key} className="flex h-full flex-col justify-end gap-2">
            <div className="flex flex-1 items-end justify-center gap-1">
              <Bar value={day.visits} max={maxDaily} className="bg-blue-400" />
              <Bar value={day.orders} max={maxDaily} className="bg-brand" />
            </div>
            <span className="text-center text-[11px] font-bold text-slate-400">{day.label}</span>
          </div>)}
        </div>
        <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500">
          <Legend color="bg-blue-400" label="Visitas" />
          <Legend color="bg-brand" label="Pedidos" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Comece por aqui</h3>
          <div className="mt-5 space-y-3">
            <Link href="/dashboard/produtos/novo" className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-sm font-extrabold text-brand">
              <span className="flex items-center gap-2"><Box size={18} />Cadastrar produto</span><ArrowRight size={17} />
            </Link>
            <Link href={`/loja/${store.slug}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 text-sm font-extrabold">
              <span className="flex items-center gap-2"><Eye size={18} />Visualizar loja</span><ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Atividades recentes</h3>
          <div className="mt-5 space-y-3">
            {activities?.length ? ((activities || []) as Activity[]).map(activity => <div key={activity.id} className="flex gap-3 rounded-xl bg-slate-50 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand"><Clock size={16} /></span>
              <div>
                <p className="text-sm font-extrabold">{activity.title}</p>
                <p className="text-xs font-bold text-slate-400">{new Date(activity.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-400">As movimentacoes da loja aparecerao aqui.</p>}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function SetupRequired() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Conecte seu Supabase</h2>
    <p className="mt-3 leading-7 text-slate-600">Copie <code>.env.example</code> para <code>.env.local</code>, informe as chaves do projeto e execute a migracao SQL. A interface ja esta pronta para usar dados reais.</p>
  </div>;
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const height = value ? Math.max(12, (value / max) * 100) : 0;
  return <span className={`w-3 rounded-t-full ${className}`} style={{ height: `${height}%` }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`size-3 rounded-full ${color}`} />{label}</span>;
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
