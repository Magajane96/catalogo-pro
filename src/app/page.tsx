import Link from "next/link";
import { ArrowRight, BarChart3, Check, ChevronRight, MessageCircle, Package, Palette, Play, QrCode, ShieldCheck, Sparkles, Star, Users, Zap } from "lucide-react";
import { Brand } from "@/components/brand";

const benefits = [
  { icon: Package, title: "Catálogo de alto padrão", text: "Produtos, fotos, variações, preços e estoque em uma vitrine rápida, organizada e pronta para vender." },
  { icon: MessageCircle, title: "Pedidos no WhatsApp", text: "O cliente compra sem atrito e você recebe a mensagem já estruturada com itens, total e dados de contato." },
  { icon: BarChart3, title: "Gestão comercial", text: "Acompanhe pedidos, clientes, visitas, estoque e evolução da loja em uma operação simples de administrar." },
  { icon: Palette, title: "Marca profissional", text: "Personalize cores, logo, banner e detalhes visuais para transmitir confiança desde o primeiro clique." },
  { icon: QrCode, title: "Venda em todos os canais", text: "Divulgue link e QR Code em redes sociais, embalagens, etiquetas, balcão e atendimento presencial." },
  { icon: ShieldCheck, title: "Estrutura segura", text: "Base SaaS moderna com autenticação, dados isolados por conta e arquitetura pronta para crescer." },
];

const stats = [
  ["3 min", "para publicar a vitrine"],
  ["24h", "recebendo pedidos"],
  ["100%", "pensado para WhatsApp"],
  ["R$ 0", "para começar"],
];

const testimonials = [
  ["A loja ficou com cara de marca grande. Agora envio um link bonito em vez de mandar fotos soltas.", "Marina Costa", "Moda feminina"],
  ["Os pedidos chegam organizados e minha equipe não se perde mais nas conversas.", "Rafael Lima", "Confeitaria"],
  ["Parece um sistema caro, mas continua simples para usar no dia a dia.", "Bruna Alves", "Semijoias"],
];

const faq = [
  ["Preciso ter site ou domínio?", "Não. Você cria sua vitrine com link próprio e já pode divulgar nas redes sociais e no WhatsApp."],
  ["O cliente paga dentro da plataforma?", "O foco inicial é organizar o pedido e levar a conversa para o WhatsApp. Assim você combina pagamento e entrega do jeito que já vende hoje."],
  ["Consigo usar no celular?", "Sim. O painel, a loja e o checkout foram pensados para desktop, tablet e celular."],
  ["Existe plano grátis?", "Sim. O plano grátis permite começar com catálogo, pedidos pelo WhatsApp e painel de gestão."],
];

export default function Home() {
  return <main className="overflow-hidden bg-slate-50 text-slate-950">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <a href="#beneficios" className="transition hover:text-slate-950">Benefícios</a>
          <a href="#planos" className="transition hover:text-slate-950">Planos</a>
          <a href="#faq" className="transition hover:text-slate-950">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block">Entrar</Link>
          <Link href="/cadastro" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-brand">Criar catálogo</Link>
        </div>
      </div>
    </header>

    <section className="relative pt-32 lg:pt-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-[820px] bg-[radial-gradient(circle_at_80%_10%,rgba(34,197,94,.22),transparent_28%),radial-gradient(circle_at_18%_18%,rgba(15,23,42,.12),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[.16em] text-emerald-700"><Sparkles size={15} /> SaaS para vendas pelo WhatsApp</div>
          <h1 className="font-display max-w-4xl text-5xl font-extrabold leading-[1.02] text-slate-950 sm:text-6xl lg:text-7xl">Sua vitrine digital profissional para vender pelo WhatsApp.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">Organize produtos, receba pedidos automaticamente e transforme conversas em vendas.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-7 font-extrabold text-white shadow-xl shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">Começar agora <ArrowRight size={19} /></Link>
            <a href="#beneficios" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 font-extrabold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Play size={18} fill="currentColor" /> Ver recursos</a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([value, label]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="font-display text-2xl font-extrabold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-semibold leading-4 text-slate-500">{label}</p>
            </div>)}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px] lg:mx-0">
          <div className="dot-grid absolute -inset-8 -z-10 rounded-[2.5rem] opacity-60" />
          <div className="soft-shadow overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white">MG</span><div><p className="text-sm font-extrabold">Maison Green</p><p className="text-xs font-semibold text-slate-400">Catálogo online</p></div></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Online</span>
            </div>
            <div className="grid gap-0 lg:grid-cols-[.9fr_1.1fr]">
              <div className="bg-slate-950 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Dashboard</p>
                <h3 className="font-display mt-4 text-3xl font-extrabold">R$ 4.280</h3>
                <p className="mt-1 text-sm text-slate-400">faturamento estimado</p>
                <div className="mt-8 space-y-3">
                  {["Pedido #128 recebido", "Cliente chamou no WhatsApp", "Estoque baixo detectado"].map(item => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm font-semibold"><span className="size-2 rounded-full bg-emerald-400" />{item}</div>)}
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {["Vestido Linho", "Bolsa Urbana", "Camisa Premium", "Kit Presente"].map((product, index) => <div key={product} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className={`aspect-[4/3] rounded-xl ${["bg-emerald-100", "bg-slate-200", "bg-stone-200", "bg-green-100"][index]}`} />
                    <p className="mt-3 text-sm font-extrabold">{product}</p>
                    <p className="text-xs font-black text-brand">R$ {[129, 89, 159, 219][index]},90</p>
                  </div>)}
                </div>
              </div>
            </div>
          </div>
          <div className="float-card absolute -left-5 top-28 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-brand"><MessageCircle size={20} /></span><div><p className="text-[10px] font-bold uppercase text-slate-400">Novo pedido</p><p className="text-sm font-extrabold">R$ 189,80</p></div></div></div>
          <div className="absolute -bottom-7 -right-4 rounded-2xl bg-slate-950 p-4 text-white shadow-2xl"><div className="flex items-center gap-3"><Users size={22} className="text-emerald-400" /><div><p className="text-[10px] font-bold uppercase text-white/50">Conversão</p><p className="text-sm font-extrabold">+24% esta semana</p></div></div></div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white py-7">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-7 px-5 text-sm font-bold text-slate-500 sm:gap-12">
        <span className="text-slate-400">Inspirado em operações modernas</span><span>Shopify</span><span>Stripe</span><span>Linear</span><span>Notion</span><span>Vercel</span>
      </div>
    </section>

    <section id="beneficios" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[.2em] text-brand">Produto pronto para vender</p>
          <h2 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">A experiência premium que sua loja merece.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">Tudo que o cliente vê transmite confiança. Tudo que você gerencia fica organizado em uma operação simples.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => <article key={title} className="premium-card rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-2xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-brand"><Icon size={23} /></span>
            <h3 className="font-display mt-6 text-xl font-extrabold">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-slate-950 py-24 text-white sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[.2em] text-emerald-400">Operação completa</p>
          <h2 className="font-display mt-3 text-4xl font-extrabold sm:text-5xl">Do clique ao pedido, sem improviso.</h2>
          <p className="mt-5 leading-8 text-slate-400">A MGD organiza a vitrine, acelera o atendimento e ajuda você a vender com mais clareza.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Crie sua conta", "Personalize a marca", "Cadastre produtos", "Receba pedidos"].map((title, index) => <div key={title} className="rounded-3xl border border-white/10 bg-white/[.06] p-6">
            <span className="font-display text-sm font-black text-emerald-400">0{index + 1}</span>
            <h3 className="font-display mt-4 text-lg font-extrabold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{["Informe seus dados e publique sua loja.", "Ajuste cores, logo e identidade visual.", "Organize estoque, variações e fotos.", "Envie o cliente direto para o WhatsApp."][index]}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section id="planos" className="py-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase tracking-[.2em] text-brand">Planos</p>
          <h2 className="font-display mt-3 text-4xl font-extrabold">Comece grátis. Cresça com o PRO.</h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          <Plan name="Grátis" price="R$ 0" description="Para validar a vitrine e começar a vender hoje." items={["1 loja profissional", "Até 20 produtos", "Pedidos pelo WhatsApp", "Painel de gestão"]} />
          <Plan featured name="PRO" price="R$ 69,90" description="Para operar com volume e aparência comercial." items={["Produtos ilimitados", "Categorias e variações", "QR Code e link da loja", "Personalização completa", "Relatórios e métricas"]} />
        </div>
      </div>
    </section>

    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map(([text, name, segment]) => <article key={name} className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
            <div className="flex text-amber-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}</div>
            <p className="mt-5 leading-7 text-slate-700">â€œ{text}â€</p>
            <p className="mt-6 font-extrabold">{name}</p>
            <p className="text-sm font-semibold text-slate-500">{segment}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section id="faq" className="py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="text-center"><p className="text-sm font-extrabold uppercase tracking-[.2em] text-brand">FAQ</p><h2 className="font-display mt-3 text-4xl font-extrabold">Perguntas frequentes</h2></div>
        <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
          {faq.map(([question, answer]) => <details key={question} className="group p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-extrabold">{question}<ChevronRight className="transition group-open:rotate-90" size={20} /></summary>
            <p className="mt-3 leading-7 text-slate-600">{answer}</p>
          </details>)}
        </div>
      </div>
    </section>

    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
      <Link href="/cadastro" className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white shadow-2xl shadow-emerald-700/30">Criar catálogo grátis <Zap size={18} /></Link>
    </div>

    <footer className="border-t border-slate-200 bg-white py-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 sm:flex-row lg:px-8"><Brand /><p className="text-sm text-slate-500">© 2026 MGD Catálogo PRO. Feito para quem empreende.</p></div></footer>
  </main>;
}

function Plan({ name, price, description, items, featured = false }: { name: string; price: string; description: string; items: string[]; featured?: boolean }) {
  return <div className={`relative rounded-3xl p-8 ${featured ? "bg-slate-950 text-white shadow-2xl shadow-slate-950/20" : "border border-slate-200 bg-white"}`}>
    {featured && <span className="absolute right-6 top-6 rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-slate-950">Mais completo</span>}
    <p className="font-display text-xl font-extrabold">{name}</p>
    <p className="mt-4 font-display text-5xl font-extrabold">{price}</p>
    <p className={`mt-3 leading-7 ${featured ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
    <div className={`my-7 h-px ${featured ? "bg-white/10" : "bg-slate-100"}`} />
    {items.map(item => <p key={item} className="mt-3 flex items-center gap-2 text-sm font-semibold"><Check size={17} className="text-brand" />{item}</p>)}
    <Link href="/cadastro" className={`mt-8 flex h-12 items-center justify-center rounded-xl font-extrabold ${featured ? "bg-brand text-white" : "border-2 border-brand text-brand"}`}>Começar agora</Link>
  </div>;
}



