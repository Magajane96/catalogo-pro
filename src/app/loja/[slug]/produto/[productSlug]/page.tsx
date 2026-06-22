import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductBuyBox } from "@/components/product-buy-box";
import { StoreVisitTracker } from "@/components/store-visit-tracker";
import { createClient } from "@/lib/supabase/server";
import { jsonLd, siteUrl } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";

type ProductImage = { id: string; url: string; is_primary: boolean; position: number };
type ProductOption = { id: string; name: string; position: number; product_option_values: { id: string; value: string; color_hex: string | null; position: number }[] };
type ProductVariant = { id: string; name: string; sku: string | null; price_adjustment: number | string | null; stock: number; active: boolean };
type RelatedProduct = { id: string; name: string; slug: string; price: number | string; promotional_price: number | string | null; product_images: ProductImage[] };
type MetadataProduct = { stock: number; product_variants?: { stock: number; active: boolean }[] };

export async function generateMetadata({ params }: { params: Promise<{ slug: string; productSlug: string }> }) {
  const { slug, productSlug } = await params;
  const supabase = await createClient();
  const { data: store } = supabase ? await supabase.from("stores").select("id,name").eq("slug", slug).eq("published", true).maybeSingle() : { data: null };
  const { data: product } = supabase && store ? await supabase.from("products").select("name,description,price,promotional_price,stock,product_images(url,is_primary),product_variants(stock,active)").eq("store_id", store.id).eq("slug", productSlug).eq("active", true).maybeSingle() : { data: null };
  const image = product?.product_images?.find(item => item.is_primary) || product?.product_images?.[0];
  const price = product ? Number(product.promotional_price || product.price) : 0;
  const stock = product ? getProductStock(product) : 0;
  const title = product && store ? `${product.name} | ${store.name}` : "Produto";
  const description = product ? `${product.description || "Produto disponivel para pedido pelo WhatsApp."} ${price ? `A partir de ${formatCurrency(price)}.` : ""} ${stock > 0 ? "Disponivel em estoque." : "Produto sem estoque no momento."}` : "Produto do catálogo online";
  const url = siteUrl(`/loja/${slug}/produto/${productSlug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", images: image?.url ? [{ url: image.url, alt: product?.name || "Produto" }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image?.url ? [image.url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; productSlug: string }> }) {
  const { slug, productSlug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: store } = await supabase.from("stores").select("id,name,slug,whatsapp,primary_color,secondary_color,font_family,logo_url,category").eq("slug", slug).eq("published", true).maybeSingle();
  if (!store) notFound();

  const { data: product } = await supabase.from("products")
    .select("id,store_id,category_id,name,slug,description,price,promotional_price,stock,sku,weight,product_images(id,url,is_primary,position),product_options(id,name,position,product_option_values(id,value,color_hex,position)),product_variants(id,name,sku,price_adjustment,stock,active)")
    .eq("store_id", store.id)
    .eq("slug", productSlug)
    .eq("active", true)
    .maybeSingle();
  if (!product) notFound();

  const images = [...(product.product_images || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position) as ProductImage[];
  const options = [...(product.product_options || [])].sort((a, b) => a.position - b.position).map(option => ({ ...option, product_option_values: [...(option.product_option_values || [])].sort((a, b) => a.position - b.position) })) as ProductOption[];
  const variants = [...(product.product_variants || [])].filter(variant => variant.active).sort((a, b) => a.name.localeCompare(b.name)) as ProductVariant[];
  const { data: related } = await supabase.from("products").select("id,name,slug,price,promotional_price,product_images(id,url,is_primary,position)").eq("store_id", store.id).eq("active", true).neq("id", product.id).limit(4);
  const price = Number(product.promotional_price || product.price);
  const stock = variants.length ? variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0) : Number(product.stock || 0);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "Produto do catálogo online",
    image: images.map(image => image.url),
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: store.name },
    offers: {
      "@type": "Offer",
      url: siteUrl(`/loja/${store.slug}/produto/${product.slug}`),
      priceCurrency: "BRL",
      price,
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Store", name: store.name },
    },
  };

  return <main className="min-h-screen bg-[#f8f8f6]" style={{ fontFamily: store.font_family }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <StoreVisitTracker storeId={store.id} path={`/loja/${slug}/produto/${productSlug}`} />
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link href={`/loja/${store.slug}`} className="flex items-center gap-3">
          {store.logo_url ? <Image src={store.logo_url} alt={store.name} width={44} height={44} className="size-11 rounded-full object-cover" /> : <span className="grid size-11 place-items-center rounded-full text-white" style={{ background: store.primary_color }}><ShoppingBag /></span>}
          <div>
            <h1 className="font-display text-lg font-extrabold">{store.name}</h1>
            <p className="text-xs text-slate-400">{store.category}</p>
          </div>
        </Link>
        <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white" style={{ background: store.primary_color }}><MessageCircle size={18} />Falar conosco</a>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-5 py-8">
      <Link href={`/loja/${store.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-slate-500"><ArrowLeft size={17} />Voltar ao catálogo</Link>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {images[0] ? <div className="relative aspect-square w-full"><Image src={images[0].url} alt={product.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority /></div> : <div className="grid aspect-square place-items-center bg-slate-100 text-slate-300"><Package size={72} /></div>}
          </div>
          {images.length > 1 && <div className="mt-4 grid grid-cols-4 gap-3">
            {images.slice(1, 5).map(image => <div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white"><Image src={image.url} alt={product.name} fill sizes="25vw" className="object-cover" /></div>)}
          </div>}
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: store.primary_color }}>Produto</p>
            <h2 className="font-display mt-3 text-4xl font-extrabold leading-tight">{product.name}</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{variants.length ? `${variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)} em variantes` : product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}</span>
              {product.sku && <span className="rounded-full bg-slate-100 px-3 py-1">SKU {product.sku}</span>}
              {product.weight && <span className="rounded-full bg-slate-100 px-3 py-1">{product.weight} kg</span>}
            </div>
            <div className="mt-6 prose prose-slaté max-w-none">
              <p className="whitespace-pre-line leading-8 text-slate-600">{product.description || "Produto disponivel para pedido pelo WhatsApp."}</p>
            </div>
          </section>

          <ProductBuyBox storeId={store.id} whatsapp={store.whatsapp} color={store.primary_color} product={product} options={options} variants={variants} />
        </div>
      </div>

      {(related as RelatedProduct[] | null)?.length ? <section className="mt-14">
        <h3 className="font-display text-2xl font-extrabold">Você também pode gostar</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(related as RelatedProduct[]).map(item => {
            const image = item.product_images?.find(row => row.is_primary) || item.product_images?.[0];
            return <Link key={item.id} href={`/loja/${store.slug}/produto/${item.slug}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="grid aspect-square place-items-center overflow-hidden bg-slate-100 text-slate-300">{image ? <div className="relative size-full"><Image src={image.url} alt={item.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" /></div> : <ShoppingBag size={42} />}</div>
              <div className="p-4">
                <h4 className="font-display font-extrabold">{item.name}</h4>
                <p className="mt-2 font-display text-lg font-extrabold" style={{ color: store.primary_color }}>{formatCurrency(item.promotional_price || item.price)}</p>
              </div>
            </Link>;
          })}
        </div>
      </section> : null}
    </section>
  </main>;
}

function getProductStock(product: MetadataProduct) {
  const variants = (product.product_variants || []).filter(variant => variant.active);
  if (variants.length) return variants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  return Number(product.stock || 0);
}

