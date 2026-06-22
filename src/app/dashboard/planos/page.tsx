import { AlertTriangle, CalendarClock, Check, CreditCard, MessageCircle, Package, Palette, QrCode, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlansPage() {
  const supabase = await createClient();
  const [{ data: profile }, { count: products }, { count: categories }, { data: store }, { data: subscription }] = supabase ? await Promise.all([
    supabase.from("profiles").select("plan").maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("stores").select("slug,primary_color,logo_url,banner_url,font_family").maybeSingle(),
    supabase.from("subscriptions").select("status,provider,current_period_end,cancel_at_period_end").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]) : [{ data: null }, { count: 0 }, { count: 0 }, { data: null }, { data: null }];

  const plan = profile?.plan === "pro" ? "pro" : "free";
  const productUsage = products || 0;
  const productLimit = 20;
  const usagePercent = plan === "pro" ? 100 : Math.min(100, (productUsage / productLimit) * 100);
  const proReady = Boolean(store?.primary_color && store?.font_family && store?.slug);
  const nearLimit = plan === "free" && productUsage >= 16;
  const subscriptionStatus = getSubscriptionStatus(subscription?.status);
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR") : null;
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
      <p className="mt-2 text-slate-500">Acompanhe seus limites e vejá o que muda no MGD Catálogo PRO.</p>
    </div>

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <span className={`grid size-12 place-items-center rounded-xl ${plan === "pro" ? "bg-emerald-50 text-brand" : "bg-slate-100 text-slate-600"}`}>{plan === "pro" ? <Sparkles size={22} /> : <CreditCard size={22} />}</span>
          <div>
            <h3 className="font-display text-xl font-extrabold">Plano atual: {plan === "pro" ? "PRO" : "Grátis"}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{plan === "pro" ? "Sua loja está com recursos avançados liberados." : "Comece sem custo e evolua quando precisar de mais capacidade."}</p>
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
            <p className="text-sm text-slate-500">Limites atuais protegidos também no Supabase.</p>
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
          <p className="mt-3 text-sm font-semibold text-slate-500">{plan === "pro" ? "No PRO, este limite deixa de restringir seus cadastros." : `${Math.max(0, productLimit - productUsage)} produtos restantes no plano grátis.`}</p>
          {nearLimit && <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700"><AlertTriangle size={16} />Sua loja está perto do limite gratuito.</p>}
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
            <p className="mt-2 text-sm leading-6 text-white/60">A base do banco agora suporta assinaturas e sincroniza o plano do perfil automaticamente.</p>
          </div>
          <Sparkles className="text-emerald-400" />
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl bg-white/[.06] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-white/60">Status</span>
            <span className="font-extrabold">{subscriptionStatus}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-white/60">Provedor</span>
            <span className="font-extrabold">{subscription?.provider || "A definir"}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-white/60">Periodo</span>
            <span className="inline-flex items-center gap-1 font-extrabold"><CalendarClock size={15} />{periodEnd || "Sem vencimento"}</span>
          </div>
          {subscription?.cancel_at_period_end && <p className="rounded-xl bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-100">Cancelamento agendado ao fim do período.</p>}
        </div>
        <div className="mt-7 grid gap-3">
          {["Produtos ilimitados", "Categorias ilimitadas", "Variantes ilimitadas", "QR Code e link da loja", "Personalizacao completa"].map(item => <p key={item} className="flex items-center gap-2 text-sm font-bold"><Check size={17} className="text-emerald-400" />{item}</p>)}
        </div>
        {plan === "pro" ? <Link href="/dashboard/personalizar" className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-emerald-400 text-sm font-extrabold text-[#14261d]">Aproveitar recursos PRO</Link> : <a href={`https://wa.me/?text=${encodeURIComponent("Olá! Quero saber como ativar o Plano PRO do MGD Catálogo PRO.")}`} target="_blank" rel="noreferrer" className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 text-sm font-extrabold text-[#14261d]"><MessageCircle size={17} />Solicitar upgrade PRO</a>}
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

function getSubscriptionStatus(status?: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    trialing: "Teste ativo",
    active: "Ativa",
    past_due: "Pagamento pendente",
    paused: "Pausada",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return status ? labels[status] || status : "Sem assinatura";
}


