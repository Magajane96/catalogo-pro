import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, Edit3, ImageIcon, Lock, Package, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/dashboard/actions";
import { formatCurrency } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  price: number | string;
  promotional_price: number | string | null;
  stock: number;
  active: boolean;
  product_images: { url: string; is_primary: boolean }[];
  product_variants: { id: string; name: string; sku: string | null; stock: number; active: boolean; price_adjustment: number | string | null }[];
};

const stockFilters = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Publicados" },
  { value: "draft", label: "Rascunhos" },
  { value: "low", label: "Estoque baixo" },
  { value: "out", label: "Sem estoque" },
];

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const filters = await searchParams;
  const search = String(filters.q || "").trim();
  const selectedFilter = stockFilters.some(filter => filter.value === filters.filter) ? filters.filter : "all";
  const supabase = await createClient();
  const [{ data: profile }, { count: totalProducts }] = supabase ? await Promise.all([
    supabase.from("profiles").select("plan").maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]) : [{ data: null }, { count: 0 }];
  const plan = profile?.plan === "pro" ? "pro" : "free";
  const productLimit = plan === "free" ? 20 : null;
  const reachedProductLimit = Boolean(productLimit && (totalProducts || 0) >= productLimit);
  let query = supabase
    ?.from("products")
    .select("id,name,sku,price,promotional_price,stock,active,product_images(url,is_primary),product_variants(id,name,sku,stock,active,price_adjustment)")
    .order("created_at", { ascending: false });
  if (query && search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  if (query && selectedFilter === "active") query = query.eq("active", true);
  if (query && selectedFilter === "draft") query = query.eq("active", false);
  const { data: products } = query ? await query : { data: [] };
  const allProductRows = ((products || []) as ProductRow[]).map(product => ({
    ...product,
    product_variants: (product.product_variants || []).filter(variant => variant.active),
  }));
  const productRows = allProductRows.filter(product => {
    const effectiveStock = getEffectiveStock(product);
    if (selectedFilter === "low") return effectiveStock > 0 && effectiveStock <= 5;
    if (selectedFilter === "out") return effectiveStock === 0;
    return true;
  });
  const lowStock = allProductRows.filter(product => {
    const stock = getEffectiveStock(product);
    return stock > 0 && stock <= 5;
  }).length;
  const outOfStock = allProductRows.filter(product => getEffectiveStock(product) === 0).length;
  const published = productRows.filter(product => product.active).length;
  const withVariants = allProductRows.filter(product => product.product_variants.length > 0).length;

  return <div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-slate-400">CATALOGO</p><h2 className="font-display mt-1 text-3xl font-extrabold">Produtos</h2><p className="mt-2 text-slate-500">Gerencie tudo o que aparece na sua loja.</p></div>{reachedProductLimit ? <span className="flex h-11 items-center gap-2 rounded-xl bg-slate-200 px-5 text-sm font-extrabold text-slate-500"><Lock size={18}/>Limite atingido</span> : <Link href="/dashboard/produtos/novo" className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white"><Plus size={18}/>Novo produto</Link>}</div>

    <section className={`mt-7 rounded-2xl border p-5 ${reachedProductLimit ? "border-amber-200 bg-amber-50" : "border-emerald-100 bg-emerald-50"}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-white ${reachedProductLimit ? "text-amber-600" : "text-brand"}`}>{plan === "pro" ? <Sparkles size={21} /> : <Package size={21} />}</span>
          <div>
            <h3 className="font-display text-lg font-extrabold">{plan === "pro" ? "Plano PRO ativo" : "Plano gratuito"}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">{plan === "pro" ? "Produtos ilimitados liberados para sua loja." : `${totalProducts || 0} de ${productLimit} produtos usados.`}</p>
          </div>
        </div>
        {plan === "free" && <Link href="/dashboard/planos" className={`rounded-full px-4 py-2 text-sm font-black ${reachedProductLimit ? "bg-amber-600 text-white" : "bg-white text-brand"}`}>{reachedProductLimit ? "Ver plano PRO" : `${Math.max(0, (productLimit || 0) - (totalProducts || 0))} vagas restantes`}</Link>}
      </div>
    </section>

    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      <StockCard label="Publicados" value={published} className="bg-emerald-50 text-emerald-700" />
      <StockCard label="Estoque baixo" value={lowStock} className="bg-amber-50 text-amber-700" />
      <StockCard label="Sem estoque" value={outOfStock} className="bg-red-50 text-red-700" />
      <StockCard label="Com variantes" value={withVariants} className="bg-violet-50 text-violet-700" />
    </div>

    <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input name="q" defaultValue={search} placeholder="Buscar produto ou SKU" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand" />
      </label>
      <select name="filter" defaultValue={selectedFilter} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
        {stockFilters.map(filter => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
      </select>
      <button className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white">Filtrar</button>
    </form>

    {!productRows.length ? <div className="mt-8 grid min-h-96 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-brand"><Package size={28}/></span><h3 className="font-display mt-5 text-xl font-extrabold">Nenhum produto encontrado</h3><p className="mx-auto mt-2 max-w-sm text-slate-500">{search || selectedFilter !== "all" ? "Ajuste a busca ou os filtros para ver mais produtos." : "Cadastre o primeiro produto para ele aparecer automaticamente na sua loja."}</p>{reachedProductLimit ? <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-200 px-5 text-sm font-extrabold text-slate-500"><Lock size={18}/>Limite atingido</span> : <Link href="/dashboard/produtos/novo" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white"><Plus size={18}/>Cadastrar produto</Link>}</div></div> : <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden grid-cols-[1fr_120px_140px_100px] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-black uppercase text-slate-400 sm:grid"><span>Produto</span><span>Preco</span><span>Estoque</span><span>Acoes</span></div>
      {productRows.map(product=>{const image=product.product_images?.find(item=>item.is_primary)||product.product_images?.[0];const stockStatus=getStockStatus(getEffectiveStock(product), product.product_variants.length);return <div key={product.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[1fr_120px_140px_100px]">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">{image?<Image src={image.url} alt={product.name} width={48} height={48} className="size-full object-cover"/>:<ImageIcon/>}</span><div><p className="font-extrabold">{product.name}</p><p className="text-xs font-bold text-slate-400">{product.active ? "Publicado" : "Rascunho"}{product.sku ? ` | SKU ${product.sku}` : ""}</p>{product.product_variants.length ? <p className="mt-1 text-xs font-bold text-violet-500">{product.product_variants.length} variantes ativas</p> : null}</div></div>
        <span className="hidden font-bold text-brand sm:block">{formatCurrency(product.promotional_price || product.price)}</span><span className={`hidden items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold sm:inline-flex ${stockStatus.className}`}>{stockStatus.icon && <AlertTriangle size={13}/>} {stockStatus.label}</span>
        <div className="flex gap-1"><Link href={`/dashboard/produtos/${product.id}/editar`} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><Edit3 size={17}/></Link><form action={deleteProduct}><input type="hidden" name="id" value={product.id}/><button className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17}/></button></form></div>
      </div>})}
    </div>}
  </div>;
}

function StockCard({ label, value, className }: { label: string; value: number; className: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    <p className={`mt-3 inline-flex rounded-xl px-3 py-1 font-display text-2xl font-extrabold ${className}`}>{value}</p>
  </div>;
}

function getEffectiveStock(product: ProductRow) {
  if (product.product_variants.length) {
    return product.product_variants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  }
  return Number(product.stock || 0);
}

function getStockStatus(stock: number, variantCount = 0) {
  const suffix = variantCount ? " em variantes" : " em estoque";
  if (stock === 0) return { label: "Sem estoque", className: "bg-red-50 text-red-700", icon: true };
  if (stock <= 5) return { label: `${stock}${suffix}`, className: "bg-amber-50 text-amber-700", icon: true };
  return { label: `${stock}${suffix}`, className: "bg-emerald-50 text-emerald-700", icon: false };
}
