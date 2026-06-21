"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Loader2, MessageCircle, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

type Product = { id: string; name: string; slug: string | null; price: number; promotional_price: number | null; stock: number; category_id: string | null; product_images: { url: string; is_primary: boolean }[]; product_variants?: { id: string; stock: number; active: boolean }[] };
type Category = { id: string; name: string; color: string };
export function StoreCart({ storeId, storeSlug, products, categories, whatsapp, color }: { storeId: string; storeSlug: string; products: Product[]; categories: Category[]; whatsapp: string; color: string }) {
  const [items,setItems]=useState<Record<string,number>>({}); const [open,setOpen]=useState(false); const [category,setCategory]=useState("all"); const [loading,setLoading]=useState(false); const [search,setSearch]=useState("");
  const searchTerm=search.trim().toLowerCase();
  const visible=products.filter(product=>(category==="all"||product.category_id===category)&&(!searchTerm||product.name.toLowerCase().includes(searchTerm)));
  const count=Object.values(items).reduce((a,b)=>a+b,0); const total=useMemo(()=>products.reduce((sum,p)=>sum+(p.promotional_price||p.price)*(items[p.id]||0),0),[items,products]);
  const add=(id:string)=>{const product=products.find(item=>item.id===id);const stock=product?getEffectiveStock(product):0;if(!product||stock<=0){toast.error("Produto sem estoque.");return;}if(hasVariants(product)){toast.message("Escolha a variante na pagina do produto.");return;}setItems(v=>({...v,[id]:Math.min(stock,(v[id]||0)+1)}));setOpen(true)};
  async function finish(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);const form=new FormData(event.currentTarget);const notes=String(form.get("notes")||"").trim();try{const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({storeId,customer:{name:form.get("name"),phone:form.get("phone"),email:form.get("email"),notes},items:products.filter(p=>items[p.id]).map(p=>({product_id:p.id,quantity:items[p.id]}))})});const result=await response.json();if(!response.ok)throw new Error(result.error);const lines=products.filter(p=>items[p.id]).map(p=>`- ${p.name}\n  Quantidade: ${items[p.id]}\n  Valor: ${formatCurrency((p.promotional_price||p.price)*items[p.id])}`);const notesText=notes?`\n\nObservacoes: ${notes}`:"";const message=`Ola! Gostaria de realizar o pedido #${result.order_number}:\n\n${lines.join("\n\n")}\n\nCliente: ${form.get("name")}\nTelefone: ${form.get("phone")}${notesText}\nTotal: ${formatCurrency(result.total)}`;setItems({});window.open(`https://wa.me/${whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`,"_blank");void markOrderWhatsAppSent(result.id);toast.success("Pedido registrado com sucesso!");}catch(error){toast.error(error instanceof Error?error.message:"Nao foi possivel registrar o pedido.")}finally{setLoading(false)}}
  return <>
    <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_320px] lg:items-center">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0"><button onClick={()=>setCategory("all")} className="shrink-0 rounded-full px-4 py-2 text-sm font-extrabold text-white" style={{background:category==="all"?color:"#64748b"}}>Todos</button>{categories.map(item=><button key={item.id} onClick={()=>setCategory(item.id)} className="shrink-0 rounded-full border bg-white px-4 py-2 text-sm font-extrabold" style={{borderColor:category===item.id?item.color:"#e2e8f0",color:category===item.id?item.color:"#64748b"}}>{item.name}</button>)}</div>
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar produto" className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold outline-none focus:border-slate-400" />
      </label>
    </div>
    {visible.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map(product=>{const image=product.product_images?.find(item=>item.is_primary)||product.product_images?.[0];const href=product.slug?`/loja/${storeSlug}/produto/${product.slug}`:`/loja/${storeSlug}`;const stock=getEffectiveStock(product);const soldOut=stock<=0;const needsChoice=hasVariants(product);return <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><Link href={href} className="block"><div className="grid aspect-square place-items-center overflow-hidden bg-slate-100 text-slate-300">{image?<div className="relative size-full"><Image src={image.url} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" className="object-cover"/></div>:<ShoppingBag size={46}/>}</div><div className="p-4 pb-2"><h3 className="font-display font-extrabold">{product.name}</h3></div></Link><div className="px-4 pb-4"><div className="mt-2 flex items-center justify-between"><div>{product.promotional_price&&<p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p>}<p className="font-display text-lg font-extrabold" style={{color}}>{formatCurrency(product.promotional_price||product.price)}</p><p className="mt-1 text-xs font-bold text-slate-400">{soldOut?"Sem estoque":needsChoice?`${stock} em variantes`:`${stock} em estoque`}</p></div>{needsChoice?<Link href={href} aria-label={`Escolher opcao de ${product.name}`} className="grid size-10 place-items-center rounded-xl text-white" style={{background:color}}><SlidersHorizontal size={18}/></Link>:<button onClick={()=>add(product.id)} disabled={soldOut} aria-label={`Adicionar ${product.name}`} className="grid size-10 place-items-center rounded-xl text-white disabled:cursor-not-allowed disabled:opacity-40" style={{background:color}}><Plus size={19}/></button>}</div><Link href={href} className="mt-3 inline-block text-xs font-extrabold text-slate-400 hover:text-slate-700">{needsChoice?"Escolher opcoes":"Ver detalhes"}</Link></div></article>})}</div>:<div className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400"><div><Search className="mx-auto mb-3"/><p className="font-extrabold">Nenhum produto encontrado</p><p className="mt-1 text-sm">Tente outro termo ou categoria.</p></div></div>}
    {count>0&&<button onClick={()=>setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-2xl px-5 py-4 font-extrabold text-white shadow-xl" style={{background:color}}><ShoppingBag size={20}/>Ver carrinho <span className="rounded-full bg-white/20 px-2">{count}</span></button>}
    {open&&<div className="fixed inset-0 z-50 flex justify-end bg-black/30"><aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold">Seu pedido</h2><button onClick={()=>setOpen(false)}><X/></button></div><div className="mt-7 space-y-4">{products.filter(p=>items[p.id]).map(p=><div key={p.id} className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="font-bold">{p.name}</p><p className="text-sm" style={{color}}>{formatCurrency(p.promotional_price||p.price)}</p></div><div className="flex items-center gap-3"><button onClick={()=>setItems(v=>({...v,[p.id]:Math.max(0,v[p.id]-1)}))}><Minus size={17}/></button><b>{items[p.id]}</b><button onClick={()=>add(p.id)}><Plus size={17}/></button><button onClick={()=>setItems(v=>({...v,[p.id]:0}))} className="text-red-500"><Trash2 size={17}/></button></div></div>)}</div><div className="mt-8 flex justify-between text-lg font-extrabold"><span>Total</span><span>{formatCurrency(total)}</span></div><form onSubmit={finish} className="mt-6 space-y-3"><input name="name" required minLength={2} placeholder="Seu nome" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand"/><input name="phone" required minLength={8} placeholder="Seu WhatsApp" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand"/><input name="email" type="email" placeholder="E-mail (opcional)" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand"/><textarea name="notes" rows={3} maxLength={500} placeholder="Observacoes do pedido (opcional)" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand"/><button disabled={loading} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-extrabold text-white disabled:opacity-60">{loading?<Loader2 className="animate-spin"/>:<MessageCircle/>}Registrar e enviar ao WhatsApp</button></form></aside></div>}
  </>;
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

function activeVariants(product: Product) {
  return (product.product_variants || []).filter(variant => variant.active);
}

function hasVariants(product: Product) {
  return activeVariants(product).length > 0;
}

function getEffectiveStock(product: Product) {
  const variants = activeVariants(product);
  if (variants.length) return variants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  return Number(product.stock || 0);
}
