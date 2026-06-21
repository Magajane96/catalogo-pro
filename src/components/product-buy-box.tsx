"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number | string;
  promotional_price: number | string | null;
  stock: number;
};

type Option = {
  id: string;
  name: string;
  product_option_values: { id: string; value: string; color_hex: string | null }[];
};

export function ProductBuyBox({ storeId, whatsapp, color, product, options }: { storeId: string; whatsapp: string; color: string; product: Product; options: Option[] }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const unitPrice = Number(product.promotional_price || product.price);
  const availableStock = Math.max(0, Number(product.stock || 0));
  const total = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  async function finish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const selectedOptions = options.map(option => `${option.name}: ${form.get(`option_${option.id}`) || "Nao informado"}`);
    const variantName = selectedOptions.length ? selectedOptions.join(" | ") : null;
    const notes = String(form.get("notes") || "").trim();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          customer: { name: form.get("name"), phone: form.get("phone"), email: form.get("email"), notes },
          items: [{ product_id: product.id, quantity, variant_name: variantName }],
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const variations = selectedOptions.length ? `\nVariacoes:\n${selectedOptions.map(item => `- ${item}`).join("\n")}` : "";
      const notesText = notes ? `\nObservacoes: ${notes}` : "";
      const message = `Ola! Gostaria de realizar o pedido #${result.order_number}:\n\nProduto: ${product.name}${variations}\nQuantidade: ${quantity}\nValor: ${formatCurrency(total)}\n\nCliente: ${form.get("name")}\nTelefone: ${form.get("phone")}${notesText}\nTotal: ${formatCurrency(result.total)}`;
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
      void markOrderWhatsAppSent(result.id);
      toast.success("Pedido registrado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel registrar o pedido.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-bold text-slate-400">Comprar pelo WhatsApp</p>
    <div className="mt-3">
      {product.promotional_price && <p className="text-sm font-bold text-slate-400 line-through">{formatCurrency(product.price)}</p>}
      <p className="font-display text-4xl font-extrabold" style={{ color }}>{formatCurrency(unitPrice)}</p>
    </div>
    <form onSubmit={finish} className="mt-6 space-y-4">
      {options.map(option => <fieldset key={option.id}>
        <legend className="mb-2 text-sm font-extrabold">{option.name}</legend>
        <div className="flex flex-wrap gap-2">
          {option.product_option_values.map((value, index) => <label key={value.id} className="cursor-pointer">
            <input required={index === 0} type="radio" name={`option_${option.id}`} value={value.value} className="peer sr-only" />
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
              {value.color_hex && <span className="size-3 rounded-full border border-black/10" style={{ background: value.color_hex }} />}
              {value.value}
            </span>
          </label>)}
        </div>
      </fieldset>)}
      <div>
        <span className="mb-2 block text-sm font-extrabold">Quantidade</span>
        <div className="flex h-12 w-36 items-center justify-between rounded-xl border border-slate-200 px-3">
          <button type="button" disabled={availableStock === 0} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={17} /></button>
          <strong>{quantity}</strong>
          <button type="button" disabled={availableStock === 0 || quantity >= availableStock} onClick={() => setQuantity(value => Math.min(availableStock, value + 1))}><Plus size={17} /></button>
        </div>
      </div>
      <div className="grid gap-3 border-t border-slate-100 pt-5">
        <input name="name" required minLength={2} placeholder="Seu nome" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-brand" />
        <input name="phone" required minLength={8} placeholder="Seu WhatsApp" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-brand" />
        <input name="email" type="email" placeholder="E-mail (opcional)" className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-brand" />
        <textarea name="notes" rows={3} maxLength={500} placeholder="Observacoes do pedido (opcional)" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand" />
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 font-extrabold">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <button disabled={loading || availableStock === 0} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-extrabold text-white disabled:opacity-60">
        {loading ? <Loader2 className="animate-spin" /> : <MessageCircle />}
        {availableStock === 0 ? "Produto sem estoque" : "Registrar e enviar ao WhatsApp"}
      </button>
    </form>
    <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400"><ShoppingBag size={15} />O pedido tambem fica salvo no painel da loja.</p>
  </section>;
}

async function markOrderWhatsAppSent(orderId: string) {
  try {
    await fetch("/api/orders/whatsapp-sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch {}
}
