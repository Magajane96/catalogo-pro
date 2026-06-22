import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { jsonLd, siteUrl } from "@/lib/seo";
import { StoreCart } from "@/components/store-cart";
import { StoreVisitTracker } from "@/components/store-visit-tracker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: store } = supabase ? await supabase.from("stores").select("name,description,logo_url,banner_url,seo_title,seo_description").eq("slug", slug).eq("published", true).maybeSingle() : { data: null };
  const title = store?.seo_title || store?.name || "Loja";
  const description = store?.seo_description || store?.description || "Catálogo online com pedido direto pelo WhatsApp.";
  const image = store?.banner_url || store?.logo_url;
  const url = siteUrl(`/loja/${slug}`);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website", images: image ? [{ url: image, alt: store?.name || "Loja" }] : [] }, twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] } };
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: store } = await supabase.from("stores").select("id,name,description,whatsapp,primary_color,secondary_color,font_family,logo_url,banner_url,category").eq("slug", slug).eq("published", true).maybeSingle();
  if (!store) notFound();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("id,name,slug,price,promotional_price,stock,category_id,product_images(url,is_primary),product_variants(id,stock,active)").eq("store_id", store.id).eq("active", true).order("created_at", { ascending: false }),
    supabase.from("categories").select("id,name,color").eq("store_id", store.id).eq("active", true).order("position"),
  ]);
  const safeProducts = products || [];
  const featured = safeProducts.slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: store.description || "Catálogo online",
    url: siteUrl(`/loja/${slug}`),
    image: store.logo_url || store.banner_url || undefined,
    telephone: store.whatsapp,
    department: categories?.map(category => category.name) || [],
  };

  return <main className="min-h-screen bg-slate-50 text-slate-950" style={{ fontFamily: store.font_family }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <StoreVisitTracker storeId={store.id} path={`/loja/${slug}`} />

    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-3">{store.logo_url ? <Image src={store.logo_url} alt={store.name} width={48} height={48} className="size-12 rounded-2xl object-cover ring-1 ring-slate-200" /> : <span className="grid size-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: store.primary_color }}><ShoppingBag /></span>}<div><h1 className="font-display text-lg font-extrabold">{store.name}</h1><p className="flex items-center gap-1 text-xs font-semibold text-slate-500"><BadgeCheck size={13} style={{ color: store.primary_color }} />{store.category || "Loja verificada"}</p></div></div>
        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5" style={{ background: store.primary_color }}><MessageCircle size={18} />Falar conosco</a>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-cover bg-center p-7 text-white shadow-2xl shadow-slate-950/15 sm:p-12" style={store.banner_url ? { backgroundColor: store.secondary_color, backgroundImage: `linear-gradient(90deg,rgba(15,23,42,.92),rgba(15,23,42,.46),rgba(15,23,42,.16)),url(${store.banner_url})` } : { background: `radial-gradient(circle at top right, ${store.primary_color}55, transparent 34%), linear-gradient(135deg, ${store.secondary_color}, #0f172a)` }}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-white/80"><Sparkles size={14} />Loja oficial</span>
          <h2 className="font-display mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Produtos escolhidos com carinho para você.</h2>
          <p className="mt-5 max-w-xl text-white/75">{store.description || "Explore nosso catálogo e faça seu pedido de forma simples pelo WhatsApp."}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2"><ShieldCheck size={16} />Compra pelo WhatsApp</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2"><Star size={16} fill="currentColor" />Atendimento personalizado</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {featured.map(product => {
          const image = product.product_images?.find(item => item.is_primary) || product.product_images?.[0];
          return <div key={product.id} className="premium-card rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100 text-slate-300">{image ? <Image src={image.url} alt={product.name} fill sizes="64px" className="object-cover" /> : <ShoppingBag />}</span>
              <div><p className="text-xs font-black uppercase tracking-wide" style={{ color: store.primary_color }}>Destaque</p><h3 className="font-display font-extrabold">{product.name}</h3></div>
            </div>
          </div>;
        })}
      </div>

      {categories?.length ? <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
        {categories.slice(0, 8).map(category => <span key={category.id} className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold shadow-sm" style={{ color: category.color }}>{category.name}</span>)}
      </div> : null}

      <div className="my-8"><p className="text-xs font-black uppercase tracking-wider" style={{ color: store.primary_color }}>Nosso catálogo</p><h2 className="font-display mt-1 text-3xl font-extrabold">Todos os produtos</h2></div>
      {safeProducts.length ? <StoreCart storeId={store.id} storeSlug={slug} products={safeProducts} categories={categories || []} whatsapp={store.whatsapp} color={store.primary_color} /> : <div className="premium-card grid h-72 place-items-center rounded-3xl p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBag size={30} /></span><p className="font-display mt-5 text-2xl font-extrabold">Novidades em breve</p><p className="mx-auto mt-2 max-w-sm text-slate-500">Esta loja está preparando uma seleção especial de produtos.</p></div></div>}
    </section>

    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs font-semibold text-slate-400">Loja criada com MGD Catálogo PRO</footer>
  </main>;
}
