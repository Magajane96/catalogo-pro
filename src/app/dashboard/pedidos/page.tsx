import { CheckCircle2, Clock, MessageCircle, ShoppingBag } from "lucide-react";
import { updateOrderStatus } from "@/app/dashboard/actions";
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

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = supabase ? await supabase
    .from("orders")
    .select("id,order_number,status,total,customer_name,customer_phone,created_at,whatsapp_sent_at,order_items(id,product_name,variant_name,quantity,unit_price)")
    .order("created_at", { ascending: false }) : { data: [] };

  return <div className="mx-auto max-w-6xl">
    <div>
      <p className="text-sm font-bold text-slate-400">VENDAS</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Pedidos</h2>
      <p className="mt-2 text-slate-500">Acompanhe cada venda do recebimento ate a entrega.</p>
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
        return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-lg font-extrabold">Pedido #{order.order_number}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"><Clock size={13} />{formatDateTime(order.created_at)}</span>
              {order.whatsapp_sent_at ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />WhatsApp enviado</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><MessageCircle size={13} />Aguardando WhatsApp</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{order.customer_name} - {order.customer_phone}</p>
            {order.whatsapp_sent_at && <p className="mt-1 text-xs font-bold text-slate-400">Enviado em {formatDateTime(order.whatsapp_sent_at)}</p>}
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
              {item.variant_name && <p className="mt-1 text-xs font-bold text-slate-400">{item.variant_name}</p>}
            </div>
            <span className="font-bold">{formatCurrency(item.unit_price * item.quantity)}</span>
          </div>)}
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-extrabold">
            <span>Total</span>
            <span className="text-brand">{formatCurrency(order.total)}</span>
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
