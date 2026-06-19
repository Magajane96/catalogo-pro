import Link from "next/link";
import { Edit3, ImageIcon, Package, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/dashboard/actions";
import { formatCurrency } from "@/lib/utils";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = supabase ? await supabase.from("products").select("id,name,price,promotional_price,stock,active,product_images(url,is_primary)").order("created_at", { ascending: false }) : { data: [] };
  return <div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-slate-400">CATALOGO</p><h2 className="font-display mt-1 text-3xl font-extrabold">Produtos</h2><p className="mt-2 text-slate-500">Gerencie tudo o que aparece na sua loja.</p></div><Link href="/dashboard/produtos/novo" className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white"><Plus size={18}/>Novo produto</Link></div>
    {!products?.length ? <div className="mt-8 grid min-h-96 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-brand"><Package size={28}/></span><h3 className="font-display mt-5 text-xl font-extrabold">Seu catalogo esta esperando</h3><p className="mx-auto mt-2 max-w-sm text-slate-500">Cadastre o primeiro produto para ele aparecer automaticamente na sua loja.</p><Link href="/dashboard/produtos/novo" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white"><Plus size={18}/>Cadastrar produto</Link></div></div> : <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1fr_120px_100px_100px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-black uppercase text-slate-400 sm:grid"><span>Produto</span><span>Preco</span><span>Estoque</span><span>Acoes</span></div>
      {products.map(product=>{const image=product.product_images?.find(item=>item.is_primary)||product.product_images?.[0];return <div key={product.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[1fr_120px_100px_100px]">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">{image?<img src={image.url} alt={product.name} className="size-full object-cover"/>:<ImageIcon/>}</span><div><p className="font-extrabold">{product.name}</p><p className="text-xs font-bold text-slate-400">{product.active ? "Publicado" : "Rascunho"}</p></div></div>
        <span className="hidden font-bold text-brand sm:block">{formatCurrency(product.promotional_price || product.price)}</span><span className="hidden text-sm font-bold sm:block">{product.stock}</span>
        <div className="flex gap-1"><Link href={`/dashboard/produtos/${product.id}/editar`} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><Edit3 size={17}/></Link><form action={deleteProduct}><input type="hidden" name="id" value={product.id}/><button className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17}/></button></form></div>
      </div>})}
    </div>}
  </div>;
}
