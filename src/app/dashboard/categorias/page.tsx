import { FolderOpen, Plus, Tag, Trash2 } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

const icons = ["Tag", "Shirt", "Gem", "CakeSlice", "Sparkles", "Baby", "Palette", "Package"];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = supabase ? await supabase.from("categories").select("id,name,icon,color,active,products(count)").order("position") : { data: [] };
  return <div className="mx-auto max-w-5xl">
    <div><p className="text-sm font-bold text-slate-400">ORGANIZACAO</p><h2 className="font-display mt-1 text-3xl font-extrabold">Categorias</h2><p className="mt-2 text-slate-500">Ajude seus clientes a encontrar produtos com facilidade.</p></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
      <form action={createCategory} className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-extrabold">Nova categoria</h3>
        <label className="mt-5 block"><span className="mb-2 block text-sm font-bold">Nome</span><input name="name" required className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand" placeholder="Ex: Vestidos"/></label>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-bold">Icone</span><select name="icon" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4">{icons.map(icon=><option key={icon}>{icon}</option>)}</select></label>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-bold">Cor</span><input name="color" type="color" defaultValue="#16a263" className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1"/></label>
        <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-extrabold text-white"><Plus size={18}/>Adicionar categoria</button>
      </form>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!categories?.length ? <div className="grid min-h-80 place-items-center text-center"><div><FolderOpen className="mx-auto text-slate-300" size={40}/><p className="mt-4 font-extrabold">Nenhuma categoria cadastrada</p><p className="mt-1 text-sm text-slate-400">Crie a primeira ao lado.</p></div></div> : categories.map(category=><form action={updateCategory} key={category.id} className="grid items-center gap-3 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[44px_1fr_90px_70px_100px]">
          <input type="hidden" name="id" value={category.id}/><input type="hidden" name="icon" value={category.icon || "Tag"}/>
          <span className="grid size-11 place-items-center rounded-xl text-white" style={{background:category.color}}><Tag size={19}/></span>
          <div><input name="name" defaultValue={category.name} className="h-9 w-full rounded-lg border border-transparent px-2 font-bold hover:border-slate-200 focus:border-brand outline-none"/><p className="px-2 text-[11px] text-slate-400">{category.products?.[0]?.count || 0} produtos</p></div>
          <input name="color" type="color" defaultValue={category.color} className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"/>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500"><input name="active" type="checkbox" defaultChecked={category.active} className="accent-emerald-600"/>Ativa</label>
          <div className="flex justify-end gap-1"><button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold">Salvar</button><button formAction={deleteCategory} className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16}/></button></div>
        </form>)}
      </section>
    </div>
  </div>;
}
