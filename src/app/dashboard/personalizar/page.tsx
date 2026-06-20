import Image from "next/image";
import { ImagePlus, Palette, Save, ShoppingBag } from "lucide-react";
import { updateStore } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

const storeCategories = ["Moda Feminina", "Moda Infantil", "Artesanato", "Semijoias", "Confeitaria", "Maquiagem", "Personalizados", "Moda Evangelica", "Outros"];
const fonts = ["Manrope", "Inter", "Poppins", "Montserrat", "Nunito"];

export default async function PersonalizePage() {
  const supabase = await createClient();
  const { data: store } = supabase ? await supabase.from("stores").select("id,name,slug,description,whatsapp,category,logo_url,banner_url,primary_color,secondary_color,font_family,published").maybeSingle() : { data: null };

  if (!store) return <EmptyStore />;

  const input = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-emerald-100";

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold text-slate-400">IDENTIDADE DA LOJA</p>
        <h2 className="font-display mt-1 text-3xl font-extrabold">Personalizar</h2>
        <p className="mt-2 text-slate-500">Ajuste logo, banner, cores e informacoes que aparecem no catalogo publico.</p>
      </div>
    </div>

    <form action={updateStore} className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]" encType="multipart/form-data">
      <input type="hidden" name="id" value={store.id} />
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Informacoes principais</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Nome da loja</span>
              <input name="name" required defaultValue={store.name} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Slug da loja</span>
              <input name="slug" required defaultValue={store.slug} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">WhatsApp</span>
              <input name="whatsapp" required defaultValue={store.whatsapp} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Categoria</span>
              <select name="category" defaultValue={store.category} className={input}>{storeCategories.map(category => <option key={category}>{category}</option>)}</select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-bold">Descricao da loja</span>
              <textarea name="description" rows={4} defaultValue={store.description || ""} className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-brand" placeholder="Fale sobre sua marca e seus produtos." />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Imagens</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
              <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="sr-only" />
              {store.logo_url ? <span className="relative size-full"><Image src={store.logo_url} alt="Logo atual" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></span> : <ImagePickerLabel title="Enviar logo" />}
            </label>
            <label className="grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
              <input type="file" name="banner" accept="image/png,image/jpeg,image/webp" className="sr-only" />
              {store.banner_url ? <span className="relative size-full"><Image src={store.banner_url} alt="Banner atual" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" /></span> : <ImagePickerLabel title="Enviar banner" />}
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Aparencia</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Cor principal</span>
              <input name="primary_color" type="color" defaultValue={store.primary_color} className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Cor secundaria</span>
              <input name="secondary_color" type="color" defaultValue={store.secondary_color} className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-1" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Fonte</span>
              <select name="font_family" defaultValue={store.font_family} className={input}>{fonts.map(font => <option key={font}>{font}</option>)}</select>
            </label>
          </div>
          <label className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold">
            <input name="published" type="checkbox" defaultChecked={store.published} className="size-5 accent-emerald-600" />
            Loja publicada
          </label>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-400"><Palette size={17} />PREVIEW</div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-[#f8f8f6]">
            <div className="flex items-center gap-3 bg-white p-4">
              {store.logo_url ? <Image src={store.logo_url} alt={store.name} width={44} height={44} className="size-11 rounded-full object-cover" /> : <span className="grid size-11 place-items-center rounded-full text-white" style={{ background: store.primary_color }}><ShoppingBag size={20} /></span>}
              <div>
                <p className="font-display text-sm font-extrabold">{store.name}</p>
                <p className="text-xs text-slate-400">{store.category}</p>
              </div>
            </div>
            <div className="m-4 rounded-2xl bg-cover bg-center p-6 text-white" style={{ backgroundColor: store.secondary_color, backgroundImage: store.banner_url ? `linear-gradient(90deg,rgba(15,30,22,.82),rgba(15,30,22,.25)),url(${store.banner_url})` : undefined }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Bem-vindo</p>
              <h3 className="font-display mt-2 text-2xl font-extrabold">Produtos escolhidos com carinho.</h3>
              <button type="button" className="mt-5 rounded-xl px-4 py-2 text-xs font-extrabold text-white" style={{ background: store.primary_color }}>Comprar agora</button>
            </div>
          </div>
          <button className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-extrabold text-white"><Save size={18} />Salvar personalizacao</button>
        </section>
      </aside>
    </form>
  </div>;
}

function ImagePickerLabel({ title }: { title: string }) {
  return <span className="text-slate-400">
    <ImagePlus className="mx-auto mb-2" />
    <span className="text-sm font-bold">{title}</span>
    <span className="mt-1 block text-xs">PNG, JPG ou WEBP</span>
  </span>;
}

function EmptyStore() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Crie sua loja primeiro</h2>
    <p className="mt-3 leading-7 text-slate-600">Depois do primeiro acesso, esta tela libera a personalizacao completa da vitrine.</p>
  </div>;
}
