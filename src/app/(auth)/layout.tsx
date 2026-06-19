import { Brand } from "@/components/brand";
import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="flex flex-col bg-white px-6 py-7 sm:px-12 lg:px-20"><Brand/><div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div><p className="text-center text-xs text-slate-400">Ao continuar, voce concorda com os Termos de Uso e a Politica de Privacidade.</p></section>
    <aside className="relative hidden overflow-hidden bg-[#14261d] p-14 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 opacity-20 dot-grid"/><div className="relative"><span className="inline-flex rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300">Seu negocio merece uma vitrine profissional</span><h2 className="font-display mt-8 max-w-lg text-5xl font-extrabold leading-tight tracking-tight">Venda mais.<br/>Organize melhor.<br/><span className="text-emerald-400">Cresca do seu jeito.</span></h2></div><div className="relative grid gap-4">{["Catalogo online pronto em minutos", "Pedidos organizados pelo WhatsApp", "Plano gratis para comecar agora"].map(x=><div key={x} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 font-bold"><CheckCircle2 className="text-emerald-400" size={21}/>{x}</div>)}</div></aside>
  </main>;
}
