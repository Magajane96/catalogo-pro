import { Brand } from "@/components/brand";
import { BarChart3, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";

const highlights = [
  ["Catálogo premium em minutos", CheckCircle2],
  ["Pedidos organizados pelo WhatsApp", MessageCircle],
  ["Métricas para vender melhor", BarChart3],
  ["Ambiente seguro para sua loja", ShieldCheck],
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.02fr_.98fr]">
    <section className="flex flex-col bg-white px-6 py-7 sm:px-12 lg:px-20">
      <Brand />
      <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
      <p className="text-center text-xs text-slate-400">Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.</p>
    </section>
    <aside className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,.32),transparent_26%),linear-gradient(160deg,#0f172a_0%,#111827_48%,#020617_100%)] p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative">
        <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-300">MGD Catálogo PRO</span>
        <h2 className="font-display mt-8 max-w-lg text-5xl font-extrabold leading-tight">Venda mais com uma vitrine digital que parece grande desde o primeiro clique.</h2>
        <p className="mt-6 max-w-md leading-8 text-slate-400">Organize produtos, receba pedidos e acompanhe sua operação com uma experiência premium feita para lojas que querem crescer.</p>
      </div>
      <div className="relative grid gap-4">
        {highlights.map(([text, Icon]) => <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.07] p-4 font-bold shadow-xl shadow-black/10 backdrop-blur">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><Icon size={20} /></span>{text}
        </div>)}
      </div>
    </aside>
  </main>;
}


