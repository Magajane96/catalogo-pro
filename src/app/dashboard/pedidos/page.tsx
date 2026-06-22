import { CheckCircle2, Clock, Hash, Mail, MessageCircle, PackageCheck, Search, ShoppingBag } from "lucide-react";
import { updateOrderStatus } from "@/app/dashboard/actions";
import { sanitizeDashboardSearchTerm } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const statuses = [
  { value: "new", label: "Novo", className: "bg-blue-50 text-blue-700" },
  { value: "in_progress", label: "Em andamento", className: "bg-amber-50 text-amber-700" },
  { value: "picking", label: "Separando", className: "bg-violet-50 text-violet-700" },
  { value: "finished", label: "Finalizado", className: "bg-emerald-50 text-emerald-700" },
  { value: "delivered", label: "Entregue", className: "bg-slate-900 text-white" },
  { value: "cancelled", label: "Cancelado", className: "bg-red-50 text-red-700" },
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

  return <div className="mx-auto max-w-6xl">
    <div>
      <p className="text-sm font-bold text-slate-400">VENDAS</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Pedidos</h2>
      <p className="mt-2 text-slate-500">Acompanhe cada venda do recebimento ate a entrega.</p>
    </div>

    <form className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input name="q" defaultValue={search} placeholder="Buscar por cliente, telefone ou numero do pedido" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand" />
      </label>
      <select name="status" defaultValue={selectedStatus} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
        <option value="all">Todos os status</option>
        {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
      </select>
      <button className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white">Filtrar</button>
    </form>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Pedidos totais" value={summary.totalOrders} />
      <SummaryCard label="Pedidos novos" value={summary.newOrders} tone="bg-blue-50 text-blue-700" />
      <SummaryCard label="Em andamento" value={summary.openOrders} tone="bg-amber-50 text-amber-700" />
      <SummaryCard label="Faturamento" value={formatCurrency(summary.revenue)} tone="bg-emerald-50 text-brand" />
    </div>

    {!orders?.length ? <div className="mt-8 grid min-h-96 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
      <div>
        <ShoppingBag className="mx-auto text-slate-300" size={42} />
        <h3 className="font-display mt-4 text-xl font-extrabold">Nenhum pedido ainda</h3>
        <p className="mt-2 text-slate-400">Os pedidos feitos na loja aparecerao aqui.</p>
      </div>
    </div> : <div className="mt-8 space-y-4">
      {orders.map(order => {
        const status = statuses.find(item => item.value === order.status) || statuses[0];
        const whatsappMessage = buildCustomerWhatsAppMessage(order);
        const customerWhatsapp = normalizeBrazilPhone(order.customer_phone);
        return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-lg font-extrabold">Pedido #{order.order_number}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"><Clock size={13} />{formatDateTime(order.created_at)}</span>
              {order.whatsapp_sent_at ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />WhatsApp enviado</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><MessageCircle size={13} />Aguardando WhatsApp</span>}
              {order.stock_restored_at && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"><PackageCheck size={13} />Estoque restaurado</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{order.customer_name} - {order.customer_phone}</span>
              {order.customer_email && <span className="inline-flex items-center gap-1"><Mail size={14} />{order.customer_email}</span>}
            </div>
            {order.notes && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">Observacoes: {order.notes}</p>}
            {order.whatsapp_sent_at && <p className="mt-1 text-xs font-bold text-slate-400">Enviado em {formatDateTime(order.whatsapp_sent_at)}</p>}
            {order.stock_restored_at && <p className="mt-1 text-xs font-bold text-slate-400">Estoque restaurado em {formatDateTime(order.stock_restored_at)}</p>}
          </div>
          <form action={updateOrderStatus} className="flex items-center gap-2">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
              {statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <button className="h-10 rounded-xl bg-brand px-4 text-sm font-extrabold text-white">Atualizar</button>
          </form>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          {order.order_items.map(item => <div key={item.id} className="flex justify-between gap-4 py-2 text-sm">
            <div>
              <span>{item.quantity}x {item.product_name}</span>
              {(item.variant_name || item.variant_sku) && <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold text-slate-400">
                {item.variant_name && <span>{item.variant_name}</span>}
                {item.variant_sku && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500"><Hash size={12} />{item.variant_sku}</span>}
              </div>}
            </div>
            <span className="font-bold">{formatCurrency(item.unit_price * item.quantity)}</span>
          </div>)}
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-extrabold">
            <span>Total</span>
            <span className="text-brand">{formatCurrency(order.total)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <a href={`https://wa.me/${customerWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-extrabold text-white"><MessageCircle size={17} />Chamar cliente</a>
            {store?.whatsapp && <a href={`https://wa.me/${normalizeBrazilPhone(store.whatsapp)}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-extrabold text-slate-600"><MessageCircle size={17} />WhatsApp da loja</a>}
          </div>
        </div>
      </article>;
      })}
    </div>}
  </div>;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function normalizeBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function SummaryCard({ label, value, tone = "bg-slate-100 text-slate-700" }: { label: string; value: number | string; tone?: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    <p className={`mt-3 inline-flex rounded-xl px-3 py-1 font-display text-2xl font-extrabold ${tone}`}>{value}</p>
  </div>;
}

function buildOrderSummary(orders: { status: string; total: number | string; created_at: string }[]) {
  return {
    totalOrders: orders.length,
    newOrders: orders.filter(order => order.status === "new").length,
    openOrders: orders.filter(order => ["new", "in_progress", "picking"].includes(order.status)).length,
    revenue: orders
      .filter(order => order.status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total), 0),
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
  const notes = order.notes ? `\n\nObservacoes: ${order.notes}` : "";
  return `Ola! Sobre seu pedido #${order.order_number}:\n\n${lines.join("\n")}${notes}\n\nTotal: ${formatCurrency(order.total)}\n\nPodemos continuar por aqui.`;
}
