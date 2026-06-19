import { BarChart3, Eye, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: string;
  total: number | string;
  status: string;
  created_at: string;
  order_items?: { product_name: string; quantity: number; total: number | string }[];
};

type Visit = { visited_at: string };
type Customer = { created_at: string };

const periods = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = periods.some(item => item.value === params.period) ? Number(params.period) : 7;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;

  const { data: store } = await supabase.from("stores").select("id,name").maybeSingle();
  if (!store) return <EmptyStore />;

  const from = startOfDay(addDays(new Date(), -(period - 1))).toISOString();
  const previousFrom = startOfDay(addDays(new Date(), -(period * 2 - 1))).toISOString();
  const previousTo = startOfDay(addDays(new Date(), -period)).toISOString();
  const [
    { data: orders },
    { data: previousOrders },
    { data: visits },
    { data: previousVisits },
    { data: customers },
    { count: activeProducts },
    { count: lowStockProducts },
  ] = await Promise.all([
    supabase.from("orders").select("id,total,status,created_at,order_items(product_name,quantity,total)").gte("created_at", from).order("created_at", { ascending: true }),
    supabase.from("orders").select("id,total,status,created_at").gte("created_at", previousFrom).lt("created_at", previousTo),
    supabase.from("store_visits").select("visited_at").gte("visited_at", from),
    supabase.from("store_visits").select("visited_at").gte("visited_at", previousFrom).lt("visited_at", previousTo),
    supabase.from("customers").select("created_at").gte("created_at", from),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true).lte("stock", 5),
  ]);

  const safeOrders = (orders || []) as Order[];
  const safePreviousOrders = (previousOrders || []) as Order[];
  const safeVisits = (visits || []) as Visit[];
  const safePreviousVisits = (previousVisits || []) as Visit[];
  const safeCustomers = (customers || []) as Customer[];
  const revenue = sumRevenue(safeOrders);
  const previousRevenue = sumRevenue(safePreviousOrders);
  const averageTicket = safeOrders.length ? revenue / safeOrders.length : 0;
  const conversion = safeVisits.length ? (safeOrders.length / safeVisits.length) * 100 : 0;
  const previousConversion = safePreviousVisits.length ? (safePreviousOrders.length / safePreviousVisits.length) * 100 : 0;
  const daily = buildDailyReport(safeOrders, safeVisits, safeCustomers, period);
  const maxDaily = Math.max(...daily.map(day => Math.max(day.orders, day.visits, day.customers)), 1);
  const statusRows = buildStatusRows(safeOrders);
  const topProducts = buildTopProducts(safeOrders);
  const periodLabel = `${period} dias`;

  const cards = [
    ["Faturamento", formatCurrency(revenue), variation(revenue, previousRevenue), TrendingUp, "bg-emerald-50 text-brand"],
    ["Pedidos", safeOrders.length, variation(safeOrders.length, safePreviousOrders.length), ShoppingBag, "bg-orange-50 text-orange-600"],
    ["Ticket medio", formatCurrency(averageTicket), null, BarChart3, "bg-violet-50 text-violet-600"],
    ["Conversao estimada", `${conversion.toFixed(1)}%`, variation(conversion, previousConversion), Eye, "bg-blue-50 text-blue-600"],
  ] as const;

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold text-slate-400">INTELIGENCIA DA LOJA</p>
        <h2 className="font-display mt-1 text-3xl font-extrabold">Relatorios</h2>
        <p className="mt-2 text-slate-500">Acompanhe vendas, visitas e crescimento por periodo.</p>
      </div>
      <form className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        <select name="period" defaultValue={String(period)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
          {periods.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button className="h-10 rounded-xl bg-brand px-4 text-sm font-extrabold text-white">Atualizar</button>
      </form>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, delta, Icon, color]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <span className={`grid size-11 place-items-center rounded-xl ${color}`}><Icon size={21} /></span>
          <span className="text-xs font-bold text-slate-400">{periodLabel}</span>
        </div>
        <p className="font-display mt-5 text-3xl font-extrabold">{value}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          {delta && <span className={`text-xs font-black ${delta.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>{delta.label}</span>}
        </div>
      </article>)}
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h3 className="font-display text-lg font-extrabold">Movimento diario</h3>
          <p className="mt-1 text-sm text-slate-500">Pedidos, visitas e novos clientes no periodo.</p>
        </div>
        <div className="mt-7 grid h-72 items-end gap-2 rounded-2xl bg-slate-50 p-4" style={{ gridTemplateColumns: `repeat(${period}, minmax(0, 1fr))` }}>
          {daily.map(day => <div key={day.key} className="flex h-full flex-col justify-end gap-1">
            <div className="flex flex-1 items-end justify-center gap-1">
              <Bar value={day.visits} max={maxDaily} className="bg-blue-400" />
              <Bar value={day.orders} max={maxDaily} className="bg-brand" />
              <Bar value={day.customers} max={maxDaily} className="bg-orange-400" />
            </div>
            <span className="hidden text-center text-[10px] font-bold text-slate-400 sm:block">{day.label}</span>
          </div>)}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
          <Legend color="bg-blue-400" label="Visitas" />
          <Legend color="bg-brand" label="Pedidos" />
          <Legend color="bg-orange-400" label="Clientes" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-extrabold">Resumo operacional</h3>
        <div className="mt-5 space-y-3">
          <SummaryRow icon={Package} label="Produtos publicados" value={activeProducts || 0} />
          <SummaryRow icon={Package} label="Estoque baixo" value={lowStockProducts || 0} />
          <SummaryRow icon={Users} label="Novos clientes" value={safeCustomers.length} />
          <SummaryRow icon={Eye} label="Visitas registradas" value={safeVisits.length} />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="text-sm font-extrabold">Pedidos por status</h4>
          <div className="mt-3 space-y-2">
            {statusRows.length ? statusRows.map(row => <div key={row.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <span className="font-bold text-slate-600">{row.label}</span>
              <span className="font-extrabold">{row.count}</span>
            </div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-400">Sem pedidos no periodo.</p>}
          </div>
        </div>
      </section>
    </div>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-display text-lg font-extrabold">Produtos mais vendidos</h3>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        {topProducts.length ? topProducts.map((product, index) => <div key={product.name} className="grid grid-cols-[44px_1fr_90px_130px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 font-extrabold text-brand">{index + 1}</span>
          <span className="font-extrabold">{product.name}</span>
          <span className="text-right font-bold text-slate-500">{product.quantity} un.</span>
          <span className="text-right font-extrabold text-brand">{formatCurrency(product.total)}</span>
        </div>) : <div className="grid min-h-40 place-items-center text-center text-slate-400">
          <div>
            <ShoppingBag className="mx-auto mb-3" />
            <p className="font-bold">Nenhum produto vendido no periodo.</p>
          </div>
        </div>}
      </div>
    </section>
  </div>;
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  const height = value ? Math.max(12, (value / max) * 100) : 0;
  return <span title={`${value}`} className={`w-2 rounded-t-full sm:w-3 ${className}`} style={{ height: `${height}%` }} />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`size-3 rounded-full ${color}`} />{label}</span>;
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
    <span className="flex items-center gap-2 text-sm font-bold text-slate-600"><Icon size={17} />{label}</span>
    <strong>{value}</strong>
  </div>;
}

function buildDailyReport(orders: Order[], visits: Visit[], customers: Customer[], period: number) {
  const days = Array.from({ length: period }, (_, index) => {
    const date = startOfDay(addDays(new Date(), index - (period - 1)));
    return { key: dateKey(date), label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), orders: 0, visits: 0, customers: 0 };
  });
  const byKey = new Map(days.map(day => [day.key, day]));
  orders.forEach(order => { const day = byKey.get(dateKey(new Date(order.created_at))); if (day) day.orders += 1; });
  visits.forEach(visit => { const day = byKey.get(dateKey(new Date(visit.visited_at))); if (day) day.visits += 1; });
  customers.forEach(customer => { const day = byKey.get(dateKey(new Date(customer.created_at))); if (day) day.customers += 1; });
  return days;
}

function buildStatusRows(orders: Order[]) {
  const labels: Record<string, string> = { new: "Novo", in_progress: "Em andamento", picking: "Separando", finished: "Finalizado", delivered: "Entregue", cancelled: "Cancelado" };
  const counts = orders.reduce<Record<string, number>>((acc, order) => ({ ...acc, [order.status]: (acc[order.status] || 0) + 1 }), {});
  return Object.entries(counts).map(([status, count]) => ({ label: labels[status] || status, count }));
}

function buildTopProducts(orders: Order[]) {
  const products = new Map<string, { name: string; quantity: number; total: number }>();
  orders.flatMap(order => order.order_items || []).forEach(item => {
    const current = products.get(item.product_name) || { name: item.product_name, quantity: 0, total: 0 };
    current.quantity += Number(item.quantity);
    current.total += Number(item.total);
    products.set(item.product_name, current);
  });
  return Array.from(products.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
}

function sumRevenue(orders: Order[]) {
  return orders.reduce((sum, order) => sum + Number(order.total), 0);
}

function variation(current: number, previous: number) {
  if (previous === 0 && current === 0) return { value: 0, label: "0%" };
  if (previous === 0) return { value: 100, label: "+100%" };
  const value = ((current - previous) / previous) * 100;
  return { value, label: `${value >= 0 ? "+" : ""}${value.toFixed(0)}%` };
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

function EmptyStore() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Crie sua loja primeiro</h2>
    <p className="mt-3 leading-7 text-slate-600">Depois do primeiro acesso, os relatorios passam a acompanhar sua loja automaticamente.</p>
  </div>;
}

function SetupRequired() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Conecte seu Supabase</h2>
    <p className="mt-3 leading-7 text-slate-600">Configure as variaveis do Supabase para visualizar dados reais.</p>
  </div>;
}
