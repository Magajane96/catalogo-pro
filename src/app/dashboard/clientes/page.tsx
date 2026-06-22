import { Mail, MessageCircle, Phone, Search, Users } from "lucide-react";
import { sanitizeDashboardSearchTerm } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  variant_sku: string | null;
  quantity: number;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  orders: { id: string; order_number: number; status: string; total: number | string; created_at: string; order_items: OrderItem[] }[];
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  in_progress: "Em andamento",
  picking: "Separando",
  finished: "Finalizado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const segments = [
  { value: "all", label: "Todos" },
  { value: "buyers", label: "Com pedidos" },
  { value: "contacts", label: "Sem pedidos" },
  { value: "vip", label: "VIP" },
];

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; segment?: string }> }) {
  const filters = await searchParams;
  const search = sanitizeDashboardSearchTerm(filters.q);
  const sort = filters.sort === "spent" || filters.sort === "orders" ? filters.sort : "recent";
  const segment = segments.some(item => item.value === filters.segment) ? String(filters.segment) : "all";
  const supabase = await createClient();

  let query = supabase
    ?.from("customers")
    .select("id,name,phone,email,created_at,orders(id,order_number,status,total,created_at,order_items(id,product_name,variant_name,variant_sku,quantity))")
    .order("created_at", { ascending: false });
  if (query && search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: customers } = query ? await query : { data: [] };
  const allCustomerRows = (customers || []) as Customer[];
  const vipThreshold = calculateVipThreshold(allCustomerRows);
  const customerRows = sortCustomers(filterCustomersBySegment(allCustomerRows, segment, vipThreshold), sort);
  const totalSpent = customerRows.reduce((sum, customer) => sum + customerTotal(customer), 0);
  const withOrders = customerRows.filter(customer => customer.orders.length > 0).length;
  const vipCount = allCustomerRows.filter(customer => isVipCustomer(customer, vipThreshold)).length;

  return <div className="mx-auto max-w-6xl">
    <div>
      <p className="text-sm font-bold text-slate-400">RELACIONAMENTO</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Clientes</h2>
      <p className="mt-2 text-slate-500">Contatos cadastrados automáticamente a partir dos pedidos.</p>
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-4">
      <SummaryCard label="Clientes encontrados" value={customerRows.length} />
      <SummaryCard label="Com pedidos" value={withOrders} />
      <SummaryCard label="Clientes VIP" value={vipCount} />
      <SummaryCard label="Total comprado" value={formatCurrency(totalSpent)} />
    </div>

    <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_180px_220px_auto]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input name="q" defaultValue={search} placeholder="Buscar por nome, telefone ou e-mail" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand" />
      </label>
      <select name="segment" defaultValue={segment} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
        {segments.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <select name="sort" defaultValue={sort} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
        <option value="recent">Mais recentes</option>
        <option value="spent">Maior compra total</option>
        <option value="orders">Mais pedidos</option>
      </select>
      <button className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white">Filtrar</button>
    </form>

    {!customerRows.length ? <div className="mt-8 grid min-h-96 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
      <div>
        <Users className="mx-auto text-slate-300" size={42} />
        <h3 className="font-display mt-4 text-xl font-extrabold">{search ? "Nenhum cliente encontrado" : "Sua lista ainda está vazia"}</h3>
        <p className="mt-2 text-slate-400">{search ? "Tente buscar por outro nome, telefone ou e-mail." : "O primeiro cliente será salvo ao concluir um pedido."}</p>
      </div>
    </div> : <div className="mt-8 grid gap-4 md:grid-cols-2">
      {customerRows.map(customer => {
        const spent = customerTotal(customer);
        const lastOrder = latestOrderDate(customer);
        const recentOrders = latestOrders(customer);
        const vip = isVipCustomer(customer, vipThreshold);
        const lastOrderSummary = recentOrders[0] ? summarizeOrderItems(recentOrders[0].order_items) : "";
        const message = recentOrders[0]
          ? `Olá, ${customer.name}! Tudo bem? Vi aqui seu pedido #${recentOrders[0].order_number}${lastOrderSummary ? ` com ${lastOrderSummary}` : ""}. Podemos continuar seu atendimento por aqui.`
          : `Olá, ${customer.name}! Tudo bem? Aqui e da loja. Podemos continuar seu atendimento por aqui.`;
        return <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-50 font-display font-extrabold text-brand">{customer.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <h3 className="font-extrabold">{customer.name}</h3>
                <p className="text-xs text-slate-400">Cliente desde {formatDate(customer.created_at)}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${vip ? "bg-emerald-50 text-brand" : "bg-slate-100 text-slate-600"}`}>{vip ? "VIP" : `${customer.orders.length} pedidos`}</span>
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-500">
            <p className="flex items-center gap-2"><Phone size={16} />{customer.phone}</p>
            {customer.email && <p className="flex items-center gap-2"><Mail size={16} />{customer.email}</p>}
          </div>

          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <span className="text-slate-400">Total em compras</span>
              <strong className="mt-1 block text-brand">{formatCurrency(spent)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Ultimo pedido</span>
              <strong className="mt-1 block">{lastOrder ? formatDate(lastOrder) : "Sem pedidos"}</strong>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-extrabold">Historico de pedidos</h4>
              {customer.orders.length > 3 && <span className="text-xs font-bold text-slate-400">+{customer.orders.length - 3} anteriores</span>}
            </div>
            <div className="mt-3 space-y-2">
              {recentOrders.length ? recentOrders.map(order => <div key={order.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-extrabold">Pedido #{order.order_number}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(order.created_at)} - {statusLabels[order.status] || order.status}</p>
                  {order.order_items?.length ? <div className="mt-2 space-y-1">
                    {order.order_items.slice(0, 2).map(item => <p key={item.id} className="text-xs font-bold text-slate-500">
                      {item.quantity}x {item.product_name}{item.variant_name ? ` - ${item.variant_name}` : ""}{item.variant_sku ? ` - SKU ${item.variant_sku}` : ""}
                    </p>)}
                    {order.order_items.length > 2 && <p className="text-xs font-bold text-slate-400">+{order.order_items.length - 2} itens</p>}
                  </div> : null}
                </div>
                <strong className="text-brand">{formatCurrency(order.total)}</strong>
              </div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-400">Nenhum pedido registrado para este cliente.</p>}
            </div>
          </div>

          <a href={`https://wa.me/${normalizeBrazilPhone(customer.phone)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-extrabold text-white">
            <MessageCircle size={17} />Chamar no WhatsApp
          </a>
        </article>;
      })}
    </div>}
  </div>;
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    <p className="font-display mt-3 text-2xl font-extrabold">{value}</p>
  </div>;
}

function sortCustomers(customers: Customer[], sort: string) {
  return [...customers].sort((a, b) => {
    if (sort === "spent") return customerTotal(b) - customerTotal(a);
    if (sort === "orders") return b.orders.length - a.orders.length;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function filterCustomersBySegment(customers: Customer[], segment: string, vipThreshold: number) {
  if (segment === "buyers") return customers.filter(customer => customer.orders.length > 0);
  if (segment === "contacts") return customers.filter(customer => customer.orders.length === 0);
  if (segment === "vip") return customers.filter(customer => isVipCustomer(customer, vipThreshold));
  return customers;
}

function customerTotal(customer: Customer) {
  return customer.orders.reduce((total, order) => total + Number(order.total), 0);
}

function calculateVipThreshold(customers: Customer[]) {
  const paidTotals = customers.map(customerTotal).filter(total => total > 0).sort((a, b) => b - a);
  if (!paidTotals.length) return Number.POSITIVE_INFINITY;
  return paidTotals[Math.min(4, paidTotals.length - 1)];
}

function isVipCustomer(customer: Customer, threshold: number) {
  return customerTotal(customer) > 0 && customerTotal(customer) >= threshold;
}

function latestOrderDate(customer: Customer) {
  return customer.orders.reduce<string | null>((latest, order) => {
    if (!latest) return order.created_at;
    return new Date(order.created_at) > new Date(latest) ? order.created_at : latest;
  }, null);
}

function latestOrders(customer: Customer) {
  return [...customer.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
}

function summarizeOrderItems(items: OrderItem[]) {
  if (!items.length) return "";
  const first = items[0];
  const variation = first.variant_name ? ` ${first.variant_name}` : "";
  const sku = first.variant_sku ? ` SKU ${first.variant_sku}` : "";
  const suffix = items.length > 1 ? ` e mais ${items.length - 1} item${items.length > 2 ? "s" : ""}` : "";
  return `${first.product_name}${variation}${sku}${suffix}`;
}

function normalizeBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

