import { Mail, MessageCircle, Phone, Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
  orders: { id: string; order_number: number; status: string; total: number | string; created_at: string }[];
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  in_progress: "Em andamento",
  picking: "Separando",
  finished: "Finalizado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const filters = await searchParams;
  const search = String(filters.q || "").trim();
  const sort = filters.sort === "spent" || filters.sort === "orders" ? filters.sort : "recent";
  const supabase = await createClient();

  let query = supabase
    ?.from("customers")
    .select("id,name,phone,email,created_at,orders(id,order_number,status,total,created_at)")
    .order("created_at", { ascending: false });
  if (query && search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: customers } = query ? await query : { data: [] };
  const customerRows = sortCustomers((customers || []) as Customer[], sort);
  const totalSpent = customerRows.reduce((sum, customer) => sum + customerTotal(customer), 0);
  const withOrders = customerRows.filter(customer => customer.orders.length > 0).length;

  return <div className="mx-auto max-w-6xl">
    <div>
      <p className="text-sm font-bold text-slate-400">RELACIONAMENTO</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Clientes</h2>
      <p className="mt-2 text-slate-500">Contatos cadastrados automaticamente a partir dos pedidos.</p>
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      <SummaryCard label="Clientes encontrados" value={customerRows.length} />
      <SummaryCard label="Com pedidos" value={withOrders} />
      <SummaryCard label="Total comprado" value={formatCurrency(totalSpent)} />
    </div>

    <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input name="q" defaultValue={search} placeholder="Buscar por nome, telefone ou e-mail" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand" />
      </label>
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
        <h3 className="font-display mt-4 text-xl font-extrabold">{search ? "Nenhum cliente encontrado" : "Sua lista ainda esta vazia"}</h3>
        <p className="mt-2 text-slate-400">{search ? "Tente buscar por outro nome, telefone ou e-mail." : "O primeiro cliente sera salvo ao concluir um pedido."}</p>
      </div>
    </div> : <div className="mt-8 grid gap-4 md:grid-cols-2">
      {customerRows.map(customer => {
        const spent = customerTotal(customer);
        const lastOrder = latestOrderDate(customer);
        const recentOrders = latestOrders(customer);
        const message = `Ola, ${customer.name}! Tudo bem? Aqui e da loja. Podemos continuar seu atendimento por aqui.`;
        return <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-emerald-50 font-display font-extrabold text-brand">{customer.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <h3 className="font-extrabold">{customer.name}</h3>
                <p className="text-xs text-slate-400">Cliente desde {formatDate(customer.created_at)}</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{customer.orders.length} pedidos</span>
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

function customerTotal(customer: Customer) {
  return customer.orders.reduce((total, order) => total + Number(order.total), 0);
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

function normalizeBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}
