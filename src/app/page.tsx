import Link from "next/link";
import { ArrowRight, BarChart3, Check, MessageCircle, Package, Palette, Play, QrCode, ShieldCheck, ShoppingBag, Sparkles, Star, Users } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  { icon: Package, title: "Catálogo que vende", text: "Produtos, variações, estoque e fotos organizados em uma vitrine profissional." },
  { icon: MessageCircle, title: "Checkout no WhatsApp", text: "O pedido chega pronto, detalhado e com os dados do cliente no seu WhatsApp." },
  { icon: Palette, title: "A cara da sua marca", text: "Personalize cores, logo, banner e tipografia sem precisar programar." },
  { icon: BarChart3, title: "Gestão simples", text: "Acompanhe pedidos, clientes, visitas e os resultados da sua lojá em um so lugar." },
  { icon: QrCode, title: "Link e QR Code", text: "Divulgue sua vitrine nas redes sociais, embalagens, cartões e na lojá física." },
  { icon: ShieldCheck, title: "Seus dados protegidos", text: "Cada conta tem seu ambiente privado e isolado com segurança de nivel profissional." },
];

export default function Home() {
  return <main className="overflow-hidden bg-[#fbfcfa]">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos</a></nav>
        <div className="flex items-center gap-2"><Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold sm:block">Entrar</Link><Link href="/cadastro" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-[#128452]">Criar catálogo</Link></div>
      </div>
    </header>

    <section className="relative min-h-[780px] pt-32 lg:pt-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_20%,#d8f7e8_0,transparent_30%),radial-gradient(circle_at_15%_50%,#f3edda_0,transparent_26%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700"><Sparkles size={15} /> Feito para quem vende pelo WhatsApp</div>
          <h1 className="font-display max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-[-.045em] text-[#13251c] sm:text-6xl lg:text-7xl">Sua vitrine online.<br/><span className="text-brand">Suas vendas</span> em movimento.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Crie um catálogo bonito, receba pedidos organizados e transforme conversas no WhatsApp em vendas. Tudo simples, rapido e com a sua marca.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/cadastro" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-7 font-extrabold text-white shadow-xl shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-[#128452]">Criar meu catálogo grátis <ArrowRight size={19}/></Link><a href="#como-funciona" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 font-extrabold text-slate-700"><Play size={18} fill="currentColor"/> Ver como funciona</a></div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500"><span className="flex items-center gap-1.5"><Check size={16} className="text-brand"/> Grátis para começar</span><span className="flex items-center gap-1.5"><Check size={16} className="text-brand"/> Sem cartão</span><span className="flex items-center gap-1.5"><Check size={16} className="text-brand"/> Pronto em minutos</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[550px] lg:mx-0">
          <div className="dot-grid absolute -inset-10 -z-10 rounded-[3rem] opacity-60" />
          <div className="soft-shadow overflow-hidden rounded-[2rem] border-[7px] border-[#17251e] bg-white">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-[#e6c9ab] text-xs font-black">AL</div><span className="font-display text-sm font-extrabold">Atélie Luna</span></div><ShoppingBag size={19}/></div>
            <div className="relative h-52 bg-gradient-to-br from-[#e7d5c4] to-[#c99775] p-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Nova coleção</p><h3 className="font-display mt-2 max-w-[230px] text-3xl font-extrabold leading-tight text-white">Leveza que combina com você.</h3><div className="absolute -bottom-16 right-5 size-52 rounded-full bg-[#f4e4d4]/80" /></div>
            <div className="relative bg-white p-5"><div className="mb-5 flex gap-2 overflow-hidden text-xs font-bold"><span className="rounded-full bg-[#17251e] px-4 py-2 text-white">Destaques</span><span className="rounded-full bg-slate-100 px-4 py-2">Vestidos</span><span className="rounded-full bg-slate-100 px-4 py-2">Acessorios</span></div><div className="grid grid-cols-2 gap-3">{["#e8ddd1", "#dfe5dc", "#eadbd3", "#d9d3c7"].map((color, i) => <div key={color} className="rounded-2xl border border-slate-100 p-2"><div className="aspect-[4/3] rounded-xl" style={{background: color}}/><p className="mt-2 text-xs font-extrabold">Peça exclusiva {i + 1}</p><p className="text-xs font-black text-brand">R$ {i % 2 ? "89,90" : "119,90"}</p></div>)}</div></div>
          </div>
          <div className="float-card absolute -left-8 top-28 hidden rounded-2xl bg-white p-4 card-shadow sm:block"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-brand"><MessageCircle size={20}/></span><div><p className="text-[10px] font-bold uppercase text-slate-400">Novo pedido</p><p className="text-sm font-extrabold">R$ 189,80</p></div></div></div>
          <div className="absolute -bottom-7 -right-5 rounded-2xl bg-[#17251e] p-4 text-white card-shadow"><div className="flex items-center gap-3"><Users size={22} className="text-emerald-400"/><div><p className="text-[10px] font-bold uppercase text-white/50">Esta semana</p><p className="text-sm font-extrabold">+38 novos clientes</p></div></div></div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-100 bg-white py-7"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-5 text-sm font-bold text-slate-500 sm:gap-14"><span className="flex items-center gap-2 text-amber-500"><Star size={17} fill="currentColor"/> Pensado para pequenos negócios</span><span>Moda</span><span>Confeitaria</span><span>Artesanato</span><span>Beleza</span><span>Personalizados</span></div></section>

    <section id="recursos" className="py-24 sm:py-32"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-extrabold uppercase tracking-[.2em] text-brand">Tudo em um so lugar</p><h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Menos complicação.<br/>Mais tempo para vender.</h2><p className="mt-5 text-slate-600">Ferramentas profissionais com uma experiência feita para quem está comecando.</p></div><div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map(({icon: Icon, title, text}) => <article key={title} className="rounded-3xl border border-slate-200/70 bg-white p-7 card-shadow transition hover:-translate-y-1"><span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-brand"><Icon size={23}/></span><h3 className="font-display mt-5 text-xl font-extrabold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></article>)}</div></div></section>

    <section id="como-funciona" className="bg-[#14261d] py-24 text-white sm:py-28"><div className="mx-auto max-w-6xl px-5 lg:px-8"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-extrabold uppercase tracking-[.2em] text-emerald-400">Comece hoje</p><h2 className="font-display mt-3 text-4xl font-extrabold tracking-tight">Da ideia ao primeiro pedido em poucos passos.</h2><p className="mt-5 leading-7 text-white/60">Você cuida dos seus produtos. A MGD cuida da tecnologia.</p></div><div className="grid gap-4 sm:grid-cols-2">{[["01", "Crie sua conta", "Informe seus dados e o nome da sua loja."], ["02", "Personalize", "Adicione logo, cores e a identidade da marca."], ["03", "Cadastre produtos", "Inclua fotos, preços, estoque e variações."], ["04", "Compartilhe e venda", "Divulgue o link e receba pedidos no WhatsApp."]].map(([n,t,d]) => <div key={n} className="rounded-3xl border border-white/10 bg-white/[.06] p-6"><span className="font-display text-sm font-black text-emerald-400">{n}</span><h3 className="font-display mt-4 text-lg font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-white/55">{d}</p></div>)}</div></div></div></section>

    <section id="planos" className="py-24"><div className="mx-auto max-w-5xl px-5 text-center"><p className="text-sm font-extrabold uppercase tracking-[.2em] text-brand">Plano para cada momento</p><h2 className="font-display mt-3 text-4xl font-extrabold">Comece grátis. Cresca no seu ritmo.</h2><div className="mx-auto mt-12 grid max-w-3xl gap-5 text-left md:grid-cols-2"><div className="rounded-3xl border border-slate-200 bg-white p-8"><p className="font-display text-xl font-extrabold">Grátis</p><p className="mt-4 font-display text-4xl font-extrabold">R$ 0</p><p className="mt-1 text-sm text-slate-500">para sempre</p><div className="my-7 h-px bg-slate-100"/>{["1 lojá profissional", "Até 20 produtos", "Pedidos pelo WhatsApp", "Painel de gestão"].map(x=><p key={x} className="mt-3 flex items-center gap-2 text-sm font-semibold"><Check size={17} className="text-brand"/>{x}</p>)}<Link href="/cadastro" className="mt-8 flex h-12 items-center justify-center rounded-xl border-2 border-brand font-extrabold text-brand">Comecar grátis</Link></div><div className="relative rounded-3xl bg-[#14261d] p-8 text-white soft-shadow"><span className="absolute right-6 top-6 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-[#14261d]">Mais completo</span><p className="font-display text-xl font-extrabold">PRO</p><p className="mt-4 font-display text-4xl font-extrabold">Em breve</p><p className="mt-1 text-sm text-white/50">estrutura pronta para assinatura</p><div className="my-7 h-px bg-white/10"/>{["Produtos ilimitados", "Categorias e variações", "QR Code para download", "Personalizacao completa"].map(x=><p key={x} className="mt-3 flex items-center gap-2 text-sm font-semibold"><Check size={17} className="text-emerald-400"/>{x}</p>)}</div></div></div></section>

    <footer className="border-t border-slate-200 bg-white py-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 sm:flex-row lg:px-8"><Brand/><p className="text-sm text-slate-500">Â© 2026 MGD Catálogo PRO. Feito para quem empreende.</p></div></footer>
  </main>;
}

