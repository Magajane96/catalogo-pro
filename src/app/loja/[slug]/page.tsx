import { notFound } from "next/navigation";
import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StoreCart } from "@/components/store-cart";
import { StoreVisitTracker } from "@/components/store-visit-tracker";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const supabase=await createClient();
  const {data:store}=supabase?await supabase.from("stores").select("name,description,logo_url,seo_title,seo_description").eq("slug",slug).eq("published",true).maybeSingle():{data:null};
  const title=store?.seo_title||store?.name||"Loja";
  const description=store?.seo_description||store?.description||"Catalogo online";
  return {title,description,openGraph:{title,description,images:store?.logo_url?[store.logo_url]:[]}};
}

export default async function StorePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const supabase=await createClient(); if(!supabase)notFound();
  const {data:store}=await supabase.from("stores").select("id,name,description,whatsapp,primary_color,secondary_color,font_family,logo_url,banner_url,category").eq("slug",slug).eq("published",true).maybeSingle(); if(!store)notFound();
  const [{data:products},{data:categories}]=await Promise.all([
    supabase.from("products").select("id,name,slug,price,promotional_price,stock,category_id,product_images(url,is_primary)").eq("store_id",store.id).eq("active",true).order("created_at",{ascending:false}),
    supabase.from("categories").select("id,name,color").eq("store_id",store.id).eq("active",true).order("position")
  ]);
  return <main className="min-h-screen bg-[#f8f8f6]" style={{fontFamily:store.font_family}}>
    <StoreVisitTracker storeId={store.id} path={`/loja/${slug}`} />
    <header className="border-b border-slate-100 bg-white"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5"><div className="flex items-center gap-3">{store.logo_url?<img src={store.logo_url} alt={store.name} className="size-11 rounded-full object-cover"/>:<span className="grid size-11 place-items-center rounded-full text-white" style={{background:store.primary_color}}><ShoppingBag/></span>}<div><h1 className="font-display text-lg font-extrabold">{store.name}</h1><p className="text-xs text-slate-400">{store.category}</p></div></div><a href={`https://wa.me/${store.whatsapp.replace(/\D/g,"")}`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white" style={{background:store.primary_color}}><MessageCircle size={18}/>Falar conosco</a></div></header>
    <section className="mx-auto max-w-7xl px-5 py-6"><div className="flex min-h-64 items-center overflow-hidden rounded-3xl bg-cover bg-center p-8 text-white sm:p-12" style={store.banner_url?{backgroundColor:store.secondary_color,backgroundImage:`linear-gradient(90deg,rgba(15,30,22,.85),rgba(15,30,22,.2)),url(${store.banner_url})`}:{backgroundColor:store.secondary_color}}><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Bem-vindo a nossa loja</p><h2 className="font-display mt-3 max-w-xl text-4xl font-extrabold sm:text-5xl">Produtos escolhidos com carinho para voce.</h2><p className="mt-4 max-w-lg text-white/60">{store.description||"Explore nosso catalogo e faca seu pedido de forma simples pelo WhatsApp."}</p></div></div><div className="my-8 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider" style={{color:store.primary_color}}>Nosso catalogo</p><h2 className="font-display mt-1 text-2xl font-extrabold">Todos os produtos</h2></div><span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400 sm:flex"><Search size={17}/>Encontre seu favorito</span></div>{products?.length?<StoreCart storeId={store.id} storeSlug={slug} products={products} categories={categories||[]} whatsapp={store.whatsapp} color={store.primary_color}/>:<div className="grid h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-center text-slate-400"><div><ShoppingBag className="mx-auto mb-3"/><p className="font-bold">Novidades em breve</p></div></div>}</section>
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">Loja criada com MGD Catalogo PRO</footer>
  </main>;
}
