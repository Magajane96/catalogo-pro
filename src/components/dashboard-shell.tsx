import Link from "next/link";
import { BarChart3, CircleUserRound, CreditCard, ExternalLink, Home, LayoutGrid, LogOut, Menu, Package, Palette, Settings, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { logout } from "@/app/dashboard/actions";
import { DashboardNavLink } from "@/components/dashboard-nav-link";

const items = [
  ["VisÃ£o geral", "/dashboard", Home], ["Produtos", "/dashboard/produtos", Package], ["Categorias", "/dashboard/categorias", LayoutGrid], ["Pedidos", "/dashboard/pedidos", ShoppingCart], ["Clientes", "/dashboard/clientes", Users], ["RelatÃ³rios", "/dashboard/relatorios", BarChart3], ["Planos", "/dashboard/planos", CreditCard],
] as const;

export function DashboardShell({ children, storeSlug, isAdmin }: { children: React.ReactNode; storeSlug?: string; isAdmin?: boolean }) {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(22,162,99,.12),transparent_28%),linear-gradient(135deg,#eef4ef_0%,#f7f4ec_45%,#eef2f7_100%)]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/70 bg-white/70 px-4 py-6 shadow-2xl shadow-slate-900/5 backdrop-blur-xl lg:block">
      <div className="rounded-3xl bg-[#14261d] p-4 text-white shadow-xl shadow-slate-900/10">
        <Brand />
        <p className="mt-3 text-xs font-semibold leading-5 text-white/55">GestÃ£o profissional para vender melhor pelo WhatsApp.</p>
      </div>
      <nav className="mt-7 space-y-1">{items.map(([label, href, Icon]) => <DashboardNavLink key={href} href={href} label={label} icon={Icon} />)}</nav>
      <div className="mt-8 border-t border-slate-200/80 pt-6">
        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Minha loja</p>
        <DashboardNavLink href="/dashboard/personalizar" label="Personalizar" icon={Palette} />
        <DashboardNavLink href="/dashboard/configuracoes" label="ConfiguraÃ§Ãµes" icon={Settings} />
      </div>
      {isAdmin && <div className="mt-6 border-t border-slate-200/80 pt-6">
        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">AdministraÃ§Ã£o</p>
        <DashboardNavLink href="/dashboard/admin" label="Admin global" icon={ShieldCheck} />
      </div>}
      <form action={logout} className="absolute inset-x-4 bottom-5"><button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"><LogOut size={19}/>Sair</button></form>
    </aside>
    <div className="lg:pl-72">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex h-18 items-center justify-between px-5 lg:px-8">
          <div><p className="text-xs font-bold text-slate-400">PAINEL DA LOJA</p><h1 className="font-display text-lg font-extrabold">MGD CatÃ¡logo PRO</h1></div>
          <div className="flex items-center gap-2">
            {storeSlug && <Link target="_blank" href={`/loja/${storeSlug}`} className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:border-brand hover:text-brand sm:flex"><ExternalLink size={17}/>Ver minha loja</Link>}
            <details className="relative lg:hidden">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl bg-slate-100 transition hover:bg-white"><Menu size={21}/></summary>
              <div className="absolute right-0 top-12 w-[min(88vw,360px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <nav className="grid grid-cols-2 gap-2">{items.map(([label, href, Icon]) => <DashboardNavLink key={href} href={href} label={label} icon={Icon} compact />)}</nav>
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
                  <DashboardNavLink href="/dashboard/personalizar" label="Personalizar" icon={Palette} compact />
                  <DashboardNavLink href="/dashboard/configuracoes" label="ConfiguraÃ§Ãµes" icon={Settings} compact />
                  {storeSlug && <Link target="_blank" href={`/loja/${storeSlug}`} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-600"><ExternalLink size={17}/>Ver minha loja</Link>}
                  {isAdmin && <DashboardNavLink href="/dashboard/admin" label="Admin global" icon={ShieldCheck} compact />}
                </div>
                <form action={logout} className="mt-2 border-t border-slate-100 pt-3"><button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-red-600"><LogOut size={17}/>Sair</button></form>
              </div>
            </details>
            <button className="hidden size-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 lg:grid"><CircleUserRound size={21}/></button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-5 py-2 lg:hidden">{items.slice(0, 6).map(([label, href, Icon]) => <DashboardNavLink key={href} href={href} label={label} icon={Icon} compact />)}</nav>
      </header>
      <main className="p-5 pb-24 lg:p-8">{children}</main>
    </div>
  </div>;
}


