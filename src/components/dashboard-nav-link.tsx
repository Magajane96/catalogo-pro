"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Home, LayoutGrid, Package, Palette, Settings, ShieldCheck, ShoppingCart, Users } from "lucide-react";

const icons = {
  home: Home,
  products: Package,
  categories: LayoutGrid,
  orders: ShoppingCart,
  customers: Users,
  reports: BarChart3,
  plans: CreditCard,
  customize: Palette,
  settings: Settings,
  admin: ShieldCheck,
};

export type DashboardNavIcon = keyof typeof icons;

export function DashboardNavLink({ href, label, icon, compact = false }: { href: string; label: string; icon: DashboardNavIcon; compact?: boolean }) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const Icon = icons[icon];

  if (compact) {
    return <Link href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${active ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-slate-950 hover:shadow-md"}`}>
      <Icon size={15} />{label}
    </Link>;
  }

  return <Link href={href} aria-current={active ? "page" : undefined} className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? "bg-white/12 text-white shadow-lg shadow-black/10" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
    <span className={`grid size-9 place-items-center rounded-xl transition-all duration-200 ${active ? "bg-emerald-400 text-slate-950" : "bg-white/8 text-slate-400 group-hover:bg-emerald-400/15 group-hover:text-emerald-300"}`}><Icon size={18} /></span>
    <span>{label}</span>
    {active && <span className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-emerald-400" />}
  </Link>;
}
