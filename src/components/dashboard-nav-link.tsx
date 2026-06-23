"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Home,
  LayoutGrid,
  Package,
  Palette,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";

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

type DashboardNavLinkProps = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
  compact?: boolean;
};

export function DashboardNavLink({
  href,
  label,
  icon,
  compact = false,
}: DashboardNavLinkProps) {
  const pathname = usePathname();

  const active =
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const Icon = icons[icon];

  if (compact) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
          active
            ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
        }`}
      >
        <Icon size={15} />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-white/[.12] text-white shadow-lg shadow-black/10 ring-1 ring-white/10"
          : "text-slate-300 hover:bg-white/[.08] hover:text-white"
      }`}
    >
      <span
        className={`grid size-9 place-items-center rounded-xl transition-all duration-200 ${
          active
            ? "bg-gradient-to-br from-blue-400 to-violet-400 text-white shadow-lg shadow-blue-950/20"
            : "bg-white/[.08] text-slate-400 group-hover:bg-white/[.12] group-hover:text-blue-200"
        }`}
      >
        <Icon size={18} />
      </span>

      <span className="truncate">{label}</span>

      {active && (
        <>
          <span className="absolute inset-y-3 right-0 w-1 rounded-l-full bg-gradient-to-b from-blue-400 to-violet-400" />
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/[.08] to-transparent" />
        </>
      )}
    </Link>
  );
}