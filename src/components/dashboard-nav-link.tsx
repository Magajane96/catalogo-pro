"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export function DashboardNavLink({ href, label, icon: Icon, compact = false }: { href: string; label: string; icon: LucideIcon; compact?: boolean }) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (compact) {
    return <Link href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition ${active ? "bg-[#14261d] text-white shadow-lg shadow-slate-900/15" : "bg-white/80 text-slate-600 ring-1 ring-slate-200 hover:bg-white hover:text-slate-950"}`}>
      <Icon size={15} />{label}
    </Link>;
  }

  return <Link href={href} aria-current={active ? "page" : undefined} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#14261d] text-white shadow-lg shadow-slate-900/15" : "text-slate-500 hover:bg-white hover:text-slate-950 hover:shadow-sm"}`}>
    <span className={`grid size-8 place-items-center rounded-xl transition ${active ? "bg-emerald-400 text-[#14261d]" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-brand"}`}><Icon size={18} /></span>
    {label}
  </Link>;
}
