import { Check, CreditCard, Package, Palette, QrCode, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlansPage() {
  const supabase = await createClient();
  const [{ data: profile }, { count: products }, { count: categories }, { data: store }] = supabase ? await Promise.all([
    supabase.from("profiles").select("plan").maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("stores").select("slug,primary_color,logo_url,banner_url,font_family").maybeSingle(),
  ]) : [{ data: null }, { count: 0 }, { count: 0 }, { data: null }];

  const plan = profile?.plan === "pro" ? "pro" : "free";
  const productUsage = products || 0;
  const productLimit = 20;
  const usagePercent = Math.min(100, (productUsage / productLimit) * 100);
  const proReady = Boolean(store?.primary_color && store?.font_family && store?.slug);
  const customizationItems = [
    { label: "Cores da marca", done: Boolean(store?.primary_color) },
    { label: "Fonte personalizada", done: Boolean(store?.font_family) },
    { label: "Logo", done: Boolean(store?.logo_url) },
    { label: "Banner", done: Boolean(store?.banner_url) },
  ];

  return <div className="mx-auto max-w-6xl">
    <div>
      <p className="text-sm font-bold text-slate-400">ASSINATURA</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">Planos</h2>
      <p className="mt-2 text-slate-500">Acompanhe seus limites e veja o que muda no MGD Catalogo PRO.</p>
    </div>

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <span className={`grid size-12 place-items-center rounded-xl ${plan === "pro" ? "bg-emerald-50 text-brand" : "bg-slate-100 text-slate-600"}`}>{plan === "pro" ? <Sparkles size={22} /> : <CreditCard size={22} />}</span>
          <div>
            <h3 className="font-display text-xl font-extrabold">Plano atual: {plan === "pro" ? "PRO" : "Gratis"}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{plan === "pro" ? "Sua loja esta com recursos avancados liberados." : "Comece sem custo e evolua quando precisar de mais capacidade."}</p>
          </div>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-black ${plan === "pro" ? "bg-emerald-50 text-brand" : "bg-slate-100 text-slate-600"}`}>{plan === "pro" ? "Ativo" : "Free"}</span>
      </div>
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-brand"><Package size={20} /></span>
          <div>
            <h3 className="font-display text-lg font-extrabold">Uso do plano gratuito</h3>
            <p className="text-sm text-slate-500">Limites atuais protegidos tambem no Supabase.</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm font-extrabold">
            <span>Produtos</span>
            <span>{productUsage} / {productLimit}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${productUsage >= productLimit ? "bg-amber-500" : "bg-brand"}`} style={{ width: `${usagePercent}%` }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-500">{plan === "pro" ? "No PRO, este limite deixa de restringir seus cadastros." : `${Math.max(0, productLimit - productUsage)} produtos restantes no plano gratis.`}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <UsageCard icon={Store} label="Lojas" value="1 / 1" />
          <UsageCard icon={Package} label="Categorias" value={`${categories || 0}`} />
          <UsageCard icon={QrCode} label="QR Code" value="Disponivel" />
          <UsageCard icon={Palette} label="Personalizacao" value={proReady ? "Pronta" : "Parcial"} />
        </div>
      </section>

      <section className="rounded-2xl bg-[#14261d] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-[#14261d]">Estrutura pronta</span>
            <h3 className="font-display mt-4 text-2xl font-extrabold">Plano PRO</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">A base do banco ja suporta planos. A integracao com pagamento pode entrar na etapa de comercializacao.</p>
          </div>
          <Sparkles className="text-emerald-400" />
        </div>
        <div className="mt-7 grid gap-3">
          {["Produtos ilimitados", "Categorias ilimitadas", "Variantes ilimitadas", "QR Code e link da loja", "Personalizacao completa"].map(item => <p key={item} className="flex items-center gap-2 text-sm font-bold"><Check size={17} className="text-emerald-400" />{item}</p>)}
        </div>
        <button disabled className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-white/10 text-sm font-extrabold text-white/70">Assinatura em breve</button>
      </section>
    </div>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-display text-lg font-extrabold">Checklist para vender melhor</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {customizationItems.map(item => <div key={item.label} className="rounded-xl bg-slate-50 p-4">
          <span className={`mb-3 grid size-8 place-items-center rounded-lg ${item.done ? "bg-emerald-50 text-brand" : "bg-amber-50 text-amber-700"}`}><Check size={16} /></span>
          <p className="text-sm font-extrabold">{item.label}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">{item.done ? "Configurado" : "Pendente"}</p>
        </div>)}
      </div>
      <Link href="/dashboard/personalizar" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-extrabold text-white">Ajustar personalizacao</Link>
    </section>
  </div>;
}

function UsageCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4">
    <Icon className="text-slate-400" size={18} />
    <p className="mt-3 text-xs font-black uppercase text-slate-400">{label}</p>
    <p className="mt-1 font-extrabold">{value}</p>
  </div>;
}
