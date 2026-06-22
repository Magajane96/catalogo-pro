import Link from "next/link";
import { CheckCircle2, Cloud, ExternalLink, Globe2, Save, Search, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import { updateStore } from "@/app/dashboard/actions";
import { StoreShareCard } from "@/components/store-share-card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: store } = supabase ? await supabase.from("stores").select("id,name,slug,description,whatsapp,category,primary_color,secondary_color,font_family,seo_title,seo_description,published").maybeSingle() : { data: null };
  if (!store) return <EmptyStore />;

  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const storeUrl = `${protocol}://${host}/loja/${store.slug}`;
  const input = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-emerald-100";
  const checklist = [
    { label: "Lojá publicada", done: store.published },
    { label: "WhatsApp configurado", done: store.whatsapp.replace(/\D/g, "").length >= 10 },
    { label: "Descrição da loja", done: Boolean(store.description?.trim()) },
    { label: "Titulo SEO", done: Boolean((store.seo_title || store.name).trim()) },
    { label: "Descrição SEO", done: Boolean((store.seo_description || store.description)?.trim()) },
  ];
  const deployChecklist = [
    { label: "URL publica configurada", done: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()) },
    { label: "Supabase URL configurada", done: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) },
    { label: "Supabase anon key configurada", done: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) },
    { label: "Dominio HTTPS em uso", done: protocol === "https" },
    { label: "Lojá publicada para indexacao", done: store.published },
  ];
  const readyItems = checklist.filter(item => item.done).length;
  const deployReadyItems = deployChecklist.filter(item => item.done).length;

  return <div className="mx-auto max-w-5xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold text-slate-400">PUBLICACAO</p>
        <h2 className="font-display mt-1 text-3xl font-extrabold">Configurações</h2>
        <p className="mt-2 text-slate-500">Controle o link da loja, QR Code, SEO e disponibilidade publica.</p>
      </div>
      <Link href={`/loja/${store.slug}`} target="_blank" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold">
        <ExternalLink size={17} />Abrir loja
      </Link>
    </div>

    <div className="mt-8 space-y-6">
      <StoreShareCard storeUrl={storeUrl} color={store.primary_color} />

      <form action={updateStore} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <input type="hidden" name="id" value={store.id} />
        <input type="hidden" name="name" value={store.name} />
        <input type="hidden" name="description" value={store.description || ""} />
        <input type="hidden" name="whatsapp" value={store.whatsapp} />
        <input type="hidden" name="category" value={store.category} />
        <input type="hidden" name="primary_color" value={store.primary_color} />
        <input type="hidden" name="secondary_color" value={store.secondary_color} />
        <input type="hidden" name="font_family" value={store.font_family} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-brand"><Search size={20} /></span>
            <div>
              <h3 className="font-display text-lg font-extrabold">SEO automático</h3>
              <p className="text-sm text-slate-500">Personalize como sua lojá aparece ao compartilhar o link.</p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Endereço da loja</span>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50">
                <span className="hidden items-center px-4 text-sm font-bold text-slate-400 sm:flex">/loja/</span>
                <input name="slug" required defaultValue={store.slug} className="h-12 min-w-0 flex-1 bg-transparent px-4 font-bold outline-none sm:px-0" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Meta title</span>
              <input name="seo_title" defaultValue={store.seo_title || store.name} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Meta description</span>
              <textarea name="seo_description" rows={4} defaultValue={store.seo_description || store.description || ""} className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-brand" />
            </label>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-600"><Globe2 size={20} /></span>
              <div>
                <h3 className="font-display text-lg font-extrabold">Status</h3>
                <p className="text-sm text-slate-500">Controle a vitrine publica.</p>
              </div>
            </div>
            <label className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold">
              <input name="published" type="checkbox" defaultChecked={store.published} className="size-5 accent-emerald-600" />
              Lojá publicada
            </label>
            <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-extrabold text-white"><Save size={18} />Salvar ajustes</button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-extrabold">Checklist de publicação</h3>
                <p className="mt-1 text-sm text-slate-500">{readyItems} de {checklist.length} itens prontos</p>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-brand"><CheckCircle2 size={20} /></span>
            </div>
            <div className="mt-5 space-y-2">
              {checklist.map(item => <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-bold text-slate-600">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.done ? "OK" : "Pendente"}</span>
              </div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-extrabold">Checklist de producao</h3>
                <p className="mt-1 text-sm text-slate-500">{deployReadyItems} de {deployChecklist.length} itens prontos para deploy</p>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><Cloud size={20} /></span>
            </div>
            <div className="mt-5 space-y-2">
              {deployChecklist.map(item => <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-bold text-slate-600">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.done ? "OK" : "Pendente"}</span>
              </div>)}
            </div>
            <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-bold leading-5 text-blue-800">Antes de vender, rode as migracoes no Supabase, configure os redirects de Auth e confirme `npm run lint` e `npm run build`.</p>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
            <ShieldCheck className="text-brand" />
            <h3 className="font-display mt-4 text-lg font-extrabold">Dados protegidos</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">As regras RLS do Supabase mantem loja, produtos, clientes e pedidos isolados por usuario.</p>
          </section>
        </aside>
      </form>
    </div>
  </div>;
}

function EmptyStore() {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
    <h2 className="font-display text-2xl font-extrabold">Crie sua lojá primeiro</h2>
    <p className="mt-3 leading-7 text-slate-600">Depois do primeiro acesso, está tela mostra seu link, QR Code e configuracoes públicas.</p>
  </div>;
}


