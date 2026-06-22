import { CheckCircle2, Clock, Hash, Mail, MessageCircle, PackageCheck, Search, ShoppingBag, TrendingUp } from "lucide-react";
import { updateOrderStatus } from "@/app/dashboard/actions";
import { sanitizeDashboardSearchTerm } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const statuses = [
  { value: "new", label: "Novo", className: "bg-blue-50 text-blue-700 ring-blue-100" },
  { value: "in_progress", label: "Em preparo", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  { value: "picking", label: "Enviado", className: "bg-violet-50 text-violet-700 ring-violet-100" },
  { value: "finished", label: "Concluído", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  { value: "delivered", label: "Concluído", className: "bg-slate-950 text-white ring-slate-900" },
  { value: "cancelled", label: "Cancelado", className: "bg-red-50 text-red-700 ring-red-100" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const filters = await searchParams;
  const selectedStatus = statuses.some(status => status.value === filters.status) ? filters.status : "all";
  const search = sanitizeDashboardSearchTerm(filters.q);
  const supabase = await createClient();
  let query = supabase
    ?.from("orders")
    .select("id,order_number,status,total,customer_name,customer_phone,customer_email,notes,created_at,whatsapp_sent_at,stock_restored_at,order_items(id,product_name,variant_name,variant_sku,quantity,unit_price)")
    .order("created_at", { ascending: false });
  if (query && selectedStatus !== "all") query = query.eq("status", selectedStatus);
  if (query && search) {
    const orderNumber = /^\d{1,9}$/.test(search) ? Number(search) : 0;
    const searchFilter = orderNumber > 0
      ? `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.eq.${orderNumber}`
      : `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`;
    query = query.or(searchFilter);
  }
  const [{ data: orders }, { data: allOrders }, { data: store }] = query && supabase ? await Promise.all([
    query,
    supabase.from("orders").select("status,total,created_at"),
    supabase.from("stores").select("whatsapp").maybeSingle(),
  ]) : [{ data: [] }, { data: [] }, { data: null }];
  const summary = buildOrderSummary((allOrders || []) as { status: string; total: number | string; created_at: string }[]);

  return <div className="mx-auto max-w-7xl space-y-7">
    <section className="premium-panel rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-brand">Vendas</p>
          <h2 className="font-display mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">Pedidos</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Acompanhe cada venda do recebimento até a entrega, com status, cliente, WhatsApp e valor em uma tabela profissional.</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-xl shadow-slate-950/15">
          <p className="text-xs font-bold uppercase text-slate-400">Faturamento total</p>
          <p className="font-display mt-1 text-2xl font-extrabold">{formatCurrency(summary.revenue)}</p>
        </div>
      </div>
    </section>

    <form className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input name="q" defaultValue={search} placeholder="Buscar por cliente, telefone ou número do pedido" className="input-premium h-12 w-full rounded-2xl pl-11 pr-4 text-sm font-semibold" />
      </label>
      <select name="status" defaultValue={selectedStatus} className="input-premium h-12 rounded-2xl px-3 text-sm font-bold">
        <option value="all">Todos os status</option>
        {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
      </select>
      <button className="h-12 rounded-2xl bg-brand px-6 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5">Filtrar</button>
    </form>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Pedidos totais" value={summary.totalOrders} icon={<ShoppingBag size={20} />} />
      <SummaryCard label="Novos" value={summary.newOrders} icon={<Clock size={20} />} tone="bg-blue-50 text-blue-700" />
      <SummaryCard label="Em preparo" value={summary.openOrders} icon={<PackageCheck size={20} />} tone="bg-amber-50 text-amber-700" />
      <SummaryCard label="Ticket médio" value={formatCurrency(summary.averageTicket)} icon={<TrendingUp size={20} />} tone="bg-emerald-50 text-brand" />
    </div>

    {!orders?.length ? <div className="premium-card grid min-h-96 place-items-center rounded-3xl p-8 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-brand"><ShoppingBag size={34} /></span>
        <h3 className="font-display mt-5 text-2xl font-extrabold">Você ainda não recebeu pedidos.</h3>
        <p className="mx-auto mt-2 max-w-md text-slate-500">Compartilhe sua vitrine com clientes para começar a receber pedidos organizados pelo WhatsApp.</p>
        <a href="/dashboard/personalizar" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20">Compartilhar catálogo</a>
      </div>
    </div> : <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[110px_1.2fr_150px_120px_150px_140px_170px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-slate-400 xl:grid">
        <span>Pedido</span><span>Cliente</span><span>WhatsApp</span><span>Valor</span><span>Status</span><span>Data</span><span>Ações</span>
      </div>
      <div className="divide-y divide-slate-100">
        {orders.map(order => {
          const status = statuses.find(item => item.value === order.status) || statuses[0];
          const whatsappMessage = buildCustomerWhatsAppMessage(order);
          const customerWhatsapp = normalizeBrazilPhone(order.customer_phone);
          return <article key={order.id} className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/80 xl:grid-cols-[110px_1.2fr_150px_120px_150px_140px_170px] xl:items-start">
            <div>
              <p className="font-display text-lg font-extrabold text-slate-950">#{order.order_number}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{order.order_items.length} itens</p>
            </div>

            <div>
              <p className="font-extrabold text-slate-900">{order.customer_name}</p>
              {order.customer_email && <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Mail size={13} />{order.customer_email}</p>}
              {order.notes && <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">Observações: {order.notes}</p>}
              <div className="mt-3 space-y-1 xl:hidden">
                {order.order_items.map(item => <OrderItem key={item.id} item={item} />)}
              </div>
            </div>

            <a href={`https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-sm font-extrabold text-white"><MessageCircle size={16} />{order.customer_phone}</a>
            <p className="font-display text-lg font-extrabold text-brand">{formatCurrency(order.total)}</p>
            <div className="space-y-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${status.className}`}>{status.label}</span>
              {order.whatsapp_sent_at ? <p className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />WhatsApp enviado</p> : <p className="flex items-center gap-1 text-xs font-bold text-amber-700"><MessageCircle size={13} />Aguardando envio</p>}
              {order.stock_restored_at && <p className="flex items-center gap-1 text-xs font-bold text-blue-700"><PackageCheck size={13} />Estoque restaurado</p>}
            </div>
            <p className="text-sm font-semibold text-slate-500">{formatDateTime(order.created_at)}</p>

            <div className="space-y-3">
              <form action={updateOrderStatus} className="grid gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="input-premium h-10 rounded-xl px-3 text-xs font-bold">
                  {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
                <button className="h-10 rounded-xl bg-slate-950 px-3 text-xs font-extrabold text-white transition hover:bg-brand">Atualizar</button>
              </form>
              {store?.whatsapp && <a href={`https://wa.me/${normalizeBrazilPhone(store.whatsapp)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-600"><MessageCircle size={15} />Loja</a>}
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 xl:col-span-7">
              <p className="mb-2 text-xs font-black uppercase text-slate-400">Itens do pedido</p>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {order.order_items.map(item => <OrderItem key={item.id} item={item} />)}
              </div>
            </div>
          </article>;
        })}
      </div>
    </section>}
  </div>;
}

function OrderItem({ item }: { item: { product_name: string; variant_name: string | null; variant_sku?: string | null; quantity: number; unit_price: number | string } }) {
  return <div className="flex justify-between gap-4 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-100">
    <div>
      <span className="font-semibold">{item.quantity}x {item.product_name}</span>
      {(item.variant_name || item.variant_sku) && <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
        {item.variant_name && <span>{item.variant_name}</span>}
        {item.variant_sku && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500"><Hash size={12} />{item.variant_sku}</span>}
      </div>}
    </div>
    <span className="font-bold">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
  </div>;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function normalizeBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function SummaryCard({ label, value, icon, tone = "bg-slate-100 text-slate-700" }: { label: string; value: number | string; icon: React.ReactNode; tone?: string }) {
  return <div className="premium-card metric-spark rounded-3xl p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <span className={`grid size-10 place-items-center rounded-2xl ${tone}`}>{icon}</span>
    </div>
    <p className="font-display mt-5 text-3xl font-extrabold text-slate-950">{value}</p>
  </div>;
}

function buildOrderSummary(orders: { status: string; total: number | string; created_at: string }[]) {
  const paidOrders = orders.filter(order => order.status !== "cancelled");
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
  return {
    totalOrders: orders.length,
    newOrders: orders.filter(order => order.status === "new").length,
    openOrders: orders.filter(order => ["new", "in_progress", "picking"].includes(order.status)).length,
    revenue,
    averageTicket: paidOrders.length ? revenue / paidOrders.length : 0,
  };
}

function buildCustomerWhatsAppMessage(order: {
  order_number: number;
  total: number | string;
  notes: string | null;
  order_items: { product_name: string; variant_name: string | null; variant_sku?: string | null; quantity: number; unit_price: number | string }[];
}) {
  const lines = order.order_items.map(item => {
    const variation = item.variant_name || item.variant_sku ? ` (${[item.variant_name, item.variant_sku ? `SKU ${item.variant_sku}` : ""].filter(Boolean).join(" - ")})` : "";
    return `- ${item.quantity}x ${item.product_name}${variation}: ${formatCurrency(Number(item.unit_price) * item.quantity)}`;
  });
  const notes = order.notes ? `\n\nObservações: ${order.notes}` : "";
  return `Olá! Sobre seu pedido #${order.order_number}:\n\n${lines.join("\n")}${notes}\n\nTotal: ${formatCurrency(order.total)}\n\nPodemos continuar por aqui.`;
}

