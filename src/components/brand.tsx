import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Brand({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return <Link href="/" className={`inline-flex items-center gap-3 font-display font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>
    <span className="brand-mark relative grid size-12 place-items-center rounded-2xl text-white shadow-xl shadow-emerald-900/20 ring-1 ring-white/20">
      <span className="font-display text-lg font-black tracking-[-.08em]">MG</span>
      <Sparkles className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-brand shadow-sm" size={16} />
    </span>
    {!compact && <span className="leading-none"><span className="block text-lg">MGD <span className="text-brand">Catálogo</span> PRO</span><span className={`mt-1 block text-[10px] font-bold uppercase tracking-[.2em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Vitrine inteligente</span></span>}
  </Link>;
}

