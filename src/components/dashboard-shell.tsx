import Link from "next/link";
import { CircleUserRound, ExternalLink, LogOut, Menu, Search } from "lucide-react";
import { Brand } from "@/components/brand";
import { logout } from "@/app/dashboard/actions";
import { DashboardNavLink } from "@/components/dashboard-nav-link";

const mainItems = [
  ["Visão geral", "/dashboard", "home"],
  ["Produtos", "/dashboard/produtos", "products"],
  ["Categorias", "/dashboard/categorias", "categories"],
  ["Pedidos", "/dashboard/pedidos", "orders"],
  ["Clientes", "/dashboard/clientes", "customers"],
  ["Relatórios", "/dashboard/relatorios", "reports"],
  ["Planos", "/dashboard/planos", "plans"],
] as const;

export function DashboardShell({ children, storeSlug, isAdmin }: { children: React.ReactNode; storeSlug?: string; isAdmin?: boolean }) {
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,.22),transparent_26%),linear-gradient(180deg,#0f172a_0%,#111827_52%,#020617_100%)] px-4 py-5 shadow-2xl shadow-slate-950/25 lg:block">
      <div className="rounded-3xl border border-white/10 bg-white/[.06] p-4 backdrop-blur">
        <Brand dark />
        <p className="mt-4 text-xs font-medium leading-5 text-slate-300">Gestão premium para vender mais pelo WhatsApp com catálogo, pedidos e métricas em um só lugar.</p>
      </div>

      <div className="mt-7 space-y-7">
        <nav>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Operação</p>
          <div className="space-y-1">{mainItems.map(([label, href, icon]) => <DashboardNavLink key={href} href={href} label={label} icon={icon} />)}</div>
        </nav>

        <nav>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Minha loja</p>
          <div className="space-y-1">
            <DashboardNavLink href="/dashboard/personalizar" label="Personalizar" icon="customize" />
            <DashboardNavLink href="/dashboard/configuracoes" label="Configurações" icon="settings" />
          </div>
        </nav>

        {isAdmin && <nav>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">Administração</p>
          <DashboardNavLink href="/dashboard/admin" label="Admin global" icon="admin" />
        </nav>}
      </div>

      <div className="absolute inset-x-4 bottom-5 space-y-3">
        {storeSlug && <Link target="_blank" href={`/loja/${storeSlug}`} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.06] text-sm font-bold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"><ExternalLink size={17} />Ver minha loja</Link>}
        <form action={logout}><button className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-sm font-bold text-red-200 transition hover:bg-red-500/20"><LogOut size={17} />Sair</button></form>
      </div>
    </aside>

    <div className="lg:pl-72">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/86 backdrop-blur-xl">
        <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">Painel da loja</p>
            <h1 className="font-display text-xl font-extrabold text-slate-950">MGD Catálogo PRO</h1>
          </div>

          <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400 xl:flex">
            <Search size={17} className="mr-2" /> Busque pedidos, produtos ou clientes
          </div>

          <div className="flex items-center gap-2">
            {storeSlug && <Link target="_blank" href={`/loja/${storeSlug}`} className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand sm:flex"><ExternalLink size={17} />Ver loja</Link>}
            <details className="relative lg:hidden">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15"><Menu size={21} /></summary>
              <div className="absolute right-0 top-12 w-[min(92vw,390px)] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
                <nav className="grid grid-cols-2 gap-2">{mainItems.map(([label, href, icon]) => <DashboardNavLink key={href} href={href} label={label} icon={icon} compact />)}</nav>
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
                  <DashboardNavLink href="/dashboard/personalizar" label="Personalizar" icon="customize" compact />
                  <DashboardNavLink href="/dashboard/configuracoes" label="Configurações" icon="settings" compact />
                  {storeSlug && <Link target="_blank" href={`/loja/${storeSlug}`} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-600"><ExternalLink size={17} />Ver minha loja</Link>}
                  {isAdmin && <DashboardNavLink href="/dashboard/admin" label="Admin global" icon="admin" compact />}
                </div>
                <form action={logout} className="mt-2 border-t border-slate-100 pt-3"><button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-red-600"><LogOut size={17} />Sair</button></form>
              </div>
            </details>
            <button className="hidden size-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 lg:grid"><CircleUserRound size={21} /></button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">{mainItems.slice(0, 6).map(([label, href, icon]) => <DashboardNavLink key={href} href={href} label={label} icon={icon} compact />)}</nav>
      </header>
      <main className="p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}


