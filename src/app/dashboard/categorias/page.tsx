import { FolderOpen, Plus, Search, Tag, Trash2 } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/app/dashboard/actions";
import { sanitizeDashboardSearchTerm } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";

const icons = ["Tag", "Shirt", "Gem", "CakeSlice", "Sparkles", "Baby", "Palette", "Package"];
const filters = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "inactive", label: "Inativas" },
];

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  active: boolean;
  products?: { count: number }[];
};

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const params = await searchParams;
  const search = sanitizeDashboardSearchTerm(params.q);
  const selectedFilter = filters.some(filter => filter.value === params.filter) ? params.filter : "all";
  const supabase = await createClient();
  let query = supabase
    ?.from("categories")
    .select("id,name,icon,color,active,products(count)")
    .order("position");
  if (query && search) query = query.ilike("name", `%${search}%`);
  if (query && selectedFilter === "active") query = query.eq("active", true);
  if (query && selectedFilter === "inactive") query = query.eq("active", false);

  const { data: categories } = query ? await query : { data: [] };
  const rows = (categories || []) as Category[];
  const activeCount = rows.filter(category => category.active).length;
  const inactiveCount = rows.filter(category => !category.active).length;
  const productCount = rows.reduce((total, category) => total + categoryProducts(category), 0);

  return <div className="mx-auto max-w-5xl">
    <div>
      <p className="text-sm font-bold text-slate-400">ORGANIZACAO</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Categorias</h2>
      <p className="mt-2 text-slate-500">Ajude seus clientes a encontrar produtos com facilidade.</p>
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      <SummaryCard label="Categorias ativas" value={activeCount} />
      <SummaryCard label="Inativas" value={inactiveCount} />
      <SummaryCard label="Produtos exibidos" value={productCount} />
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
      <form action={createCategory} className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-extrabold">Nova categoria</h3>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold">Nome</span>
          <input name="name" required className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand" placeholder="Ex: Vestidos" />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold">Icone</span>
          <select name="icon" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4">
            {icons.map(icon => <option key={icon}>{icon}</option>)}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold">Cor</span>
          <input name="color" type="color" defaultValue="#16a263" className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1" />
        </label>
        <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-extrabold text-white">
          <Plus size={18} />Adicionar categoria
        </button>
      </form>

      <section>
        <form className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_160px_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input name="q" defaultValue={search} placeholder="Buscar categoria" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-brand" />
          </label>
          <select name="filter" defaultValue={selectedFilter} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold">
            {filters.map(filter => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
          </select>
          <button className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-white">Filtrar</button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {!rows.length ? <div className="grid min-h-80 place-items-center text-center">
            <div>
              <FolderOpen className="mx-auto text-slate-300" size={40} />
              <p className="mt-4 font-extrabold">{search || selectedFilter !== "all" ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}</p>
              <p className="mt-1 text-sm text-slate-400">{search || selectedFilter !== "all" ? "Ajuste a busca ou os filtros." : "Crie a primeira ao lado."}</p>
            </div>
          </div> : rows.map(category => <form action={updateCategory} key={category.id} className="grid items-center gap-3 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[44px_1fr_90px_76px_100px]">
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="icon" value={category.icon || "Tag"} />
            <span className="grid size-11 place-items-center rounded-xl text-white" style={{ background: category.color }}><Tag size={19} /></span>
            <div>
              <input name="name" defaultValue={category.name} className="h-9 w-full rounded-lg border border-transparent px-2 font-bold outline-none hover:border-slate-200 focus:border-brand" />
              <p className="px-2 text-[11px] font-bold text-slate-400">{categoryProducts(category)} produtos</p>
            </div>
            <input name="color" type="color" defaultValue={category.color} className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <input name="active" type="checkbox" defaultChecked={category.active} className="accent-emerald-600" />Ativa
            </label>
            <div className="flex justify-end gap-1">
              <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold">Salvar</button>
              <button formAction={deleteCategory} className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          </form>)}
        </div>
      </section>
    </div>
  </div>;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-black uppercase text-slate-400">{label}</p>
    <p className="font-display mt-3 text-2xl font-extrabold">{value}</p>
  </div>;
}

function categoryProducts(category: Category) {
  return category.products?.[0]?.count || 0;
}
