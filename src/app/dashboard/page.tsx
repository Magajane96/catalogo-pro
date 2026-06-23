import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  CircleAlert,
  Clock,
  Eye,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { formatCurrency } from "@/lib/utils";

type Order = {
  created_at: string;
  total?: number | string;
  status?: string;
};

type Visit = {
  visited_at: string;
};

type Activity = {
  id: string;
  title: string;
  type: string;
  created_at: string;
};

type StoreData = {
  id: string;
  name: string;
  slug: string;
  whatsapp?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

type StockProduct = {
  id: string;
  name: string;
  stock: number;
  product_variants: {
    stock: number;
    active: boolean;
  }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) return <SetupRequired />;

  const { data: store } = await supabase
    .from("stores")
    .select(
      "id,name,slug,whatsapp,logo_url,banner_url,meta_title,meta_description",
    )
    .maybeSingle();

  if (!store) return <OnboardingForm />;

  const currentStore = store as StoreData;
  const weekStart = startOfDay(addDays(new Date(), -6)).toISOString();

  const [
    { count: orders },
    { count: customers },
    { count: visits },
    { count: products },
    { data: weekOrders },
    { data: weekVisits },
    { data: activities },
    { data: stockAlerts },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("store_visits").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null),
    supabase.from("orders").select("created_at,total,status").gte("created_at", weekStart),
    supabase.from("store_visits").select("visited_at").gte("visited_at", weekStart),
    supabase
      .from("activities")
      .select("id,title,type,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("id,name,stock,product_variants(stock,active)")
      .eq("active", true)
      .is("archived_at", null)
      .order("stock", { ascending: true }),
  ]);

  const safeOrders = (weekOrders || []) as Order[];
  const safeVisits = (weekVisits || []) as Visit[];

  const revenue = safeOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const conversion = visits
    ? Math.round(((orders || 0) / Math.max(visits || 1, 1)) * 1000) / 10
    : 0;

  const daily = buildDailyReport(safeOrders, safeVisits);
  const maxDaily = Math.max(...daily.map((day) => Math.max(day.orders, day.visits)), 1);

  const stockRows = ((stockAlerts || []) as StockProduct[])
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: getEffectiveStock(product),
      variantCount: (product.product_variants || []).filter((variant) => variant.active).length,
    }))
    .filter((product) => product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const healthItems = [
    {
      label: "Catálogo publicado",
      done: Boolean(currentStore.slug),
      helper: "Link público da loja disponível.",
    },
    {
      label: "WhatsApp configurado",
      done: Boolean(currentStore.whatsapp),
      helper: "Pedidos podem ser enviados ao WhatsApp.",
    },
    {
      label: "Produtos cadastrados",
      done: Boolean((products || 0) > 0),
      helper: "Sua loja já possui produtos no catálogo.",
    },
    {
      label: "Logo configurada",
      done: Boolean(currentStore.logo_url),
      helper: "Fortalece a identidade visual da loja.",
    },
    {
      label: "Banner principal",
      done: Boolean(currentStore.banner_url),
      helper: "Melhora a primeira impressão do cliente.",
    },
    {
      label: "SEO configurado",
      done: Boolean(currentStore.meta_title && currentStore.meta_description),
      helper: "Ajuda no compartilhamento e indexação.",
    },
  ];

  const healthScore = Math.round(
    (healthItems.filter((item) => item.done).length / healthItems.length) * 100,
  );

  const metrics = [
    {
      label: "Faturamento",
      value: formatCurrency(revenue),
      helper: "últimos 7 dias",
      icon: WalletCards,
      tone: "bg-slate-950 text-white",
    },
    {
      label: "Pedidos",
      value: orders || 0,
      helper: "total registrado",
      icon: ShoppingBag,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Produtos",
      value: products || 0,
      helper: "itens cadastrados",
      icon: Package,
      tone: "bg-orange-50 text-orange-700",
    },
    {
      label: "Visualizações",
      value: visits || 0,
      helper: "acessos ao catálogo",
      icon: Eye,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Conversões",
      value: `${conversion}%`,
      helper: "pedidos sobre visitas",
      icon: TrendingUp,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Clientes",
      value: customers || 0,
      helper: "clientes cadastrados",
      icon: Users,
      tone: "bg-violet-50 text-violet-700",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="premium-panel overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-brand">
              Visão geral
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Bem-vindo de volta, {currentStore.name}
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Sua loja está ativa. Acompanhe pedidos, visitas, clientes, estoque
              e oportunidades de crescimento em um só painel.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/produtos/novo"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5"
            >
              <Package size={18} />
              Novo produto
            </Link>

            <Link
              href={`/loja/${currentStore.slug}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand hover:text-brand"
            >
              <Eye size={18} />
              Ver loja
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <HealthScoreCard score={healthScore} items={healthItems} />

        <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-blue-200">
                Central de crescimento
              </p>
              <h3 className="font-display mt-2 text-2xl font-extrabold">
                Próximas ações
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-300">
                Complete sua loja para aumentar a confiança dos clientes.
              </p>
            </div>

            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-blue-200">
              <Sparkles size={22} />
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <QuickAction href="/dashboard/produtos/novo" icon={<Box size={18} />} label="Cadastrar produto" />
            <QuickAction href="/dashboard/pedidos" icon={<ShoppingBag size={18} />} label="Acompanhar pedidos" />
            <QuickAction href="/dashboard/personalizar" icon={<Store size={18} />} label="Personalizar loja" />
            <QuickAction href="/dashboard/relatorios" icon={<TrendingUp size={18} />} label="Ver relatórios" />
          </div>
        </section>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map(({ label, value, helper, icon: Icon, tone }) => (
          <article key={label} className="premium-card metric-spark rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                <Icon size={22} />
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                <TrendingUp size={13} />
                ativo
              </span>
            </div>

            <p className="font-display mt-6 text-3xl font-extrabold text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>

            <div className="mt-4 text-xs font-bold text-slate-400">{helper}</div>
          </article>
        ))}
      </section>

      {stockRows.length ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <AlertTriangle size={21} />
              </span>

              <div>
                <h3 className="font-display text-lg font-extrabold">
                  Atenção ao estoque
                </h3>
                <p className="mt-1 text-sm font-semibold text-amber-900/70">
                  Produtos publicados com 5 unidades ou menos, incluindo variantes.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/produtos?filter=low"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-extrabold text-white"
            >
              Ver produtos
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stockRows.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/produtos/${product.id}/editar`}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5"
              >
                <span className="font-extrabold text-slate-700">{product.name}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    product.stock === 0
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {product.stock === 0
                    ? "Sem estoque"
                    : `${product.stock} un.${product.variantCount ? " em variantes" : ""}`}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
        <div className="premium-card rounded-3xl p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-xl font-extrabold">
                Performance da semana
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Pedidos e visitas dos últimos 7 dias.
              </p>
            </div>

            <Link href="/dashboard/relatorios" className="text-sm font-extrabold text-brand">
              Ver relatórios
            </Link>
          </div>

          <div className="mt-6 grid h-72 grid-cols-7 items-end gap-3 rounded-3xl bg-slate-50 p-4">
            {daily.map((day) => (
              <div key={day.key} className="flex h-full flex-col justify-end gap-3">
                <div className="flex flex-1 items-end justify-center gap-1.5">
                  <Bar value={day.visits} max={maxDaily} className="bg-slate-300" />
                  <Bar
                    value={day.orders}
                    max={maxDaily}
                    className="bg-brand shadow-lg shadow-emerald-700/20"
                  />
                </div>

                <span className="text-center text-[11px] font-bold text-slate-400">
                  {day.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500">
            <Legend color="bg-slate-300" label="Visitas" />
            <Legend color="bg-brand" label="Pedidos" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
                <Zap size={19} />
              </span>
              <h3 className="font-display text-lg font-extrabold">
                Insight rápido
              </h3>
            </div>

            <p className="mt-5 text-sm font-medium leading-6 text-slate-300">
              {healthScore >= 90
                ? "Sua loja está muito bem configurada. Continue acompanhando pedidos, estoque e visitas para manter o crescimento."
                : healthScore >= 60
                  ? "Sua loja está no caminho certo. Complete os itens pendentes para aumentar a confiança dos clientes."
                  : "Sua loja ainda precisa de ajustes importantes. Configure WhatsApp, produtos, logo, banner e SEO para melhorar a apresentação."}
            </p>

            <Link
              href="/dashboard/personalizar"
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5"
            >
              Melhorar loja
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="premium-card rounded-3xl p-6">
            <h3 className="font-display text-lg font-extrabold">
              Atividades recentes
            </h3>

            <div className="mt-5 space-y-3">
              {activities?.length ? (
                ((activities || []) as Activity[]).map((activity) => (
                  <div key={activity.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                      <Clock size={16} />
                    </span>

                    <div>
                      <p className="text-sm font-extrabold">{activity.title}</p>
                      <p className="text-xs font-bold text-slate-400">
                        {new Date(activity.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  <p className="font-extrabold text-slate-700">
                    Sem atividades recentes.
                  </p>
                  <p className="mt-1">
                    Quando pedidos, produtos e visitas acontecerem, tudo aparecerá aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HealthScoreCard({
  score,
  items,
}: {
  score: number;
  items: {
    label: string;
    done: boolean;
    helper: string;
  }[];
}) {
  const status =
    score >= 85
      ? {
          label: "Excelente",
          text: "Sua loja está com ótima apresentação.",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          ring: "ring-emerald-100",
        }
      : score >= 60
        ? {
            label: "Boa",
            text: "Alguns ajustes podem melhorar a conversão.",
            color: "text-amber-700",
            bg: "bg-amber-50",
            ring: "ring-amber-100",
          }
        : {
            label: "Atenção",
            text: "Complete a configuração para deixar a loja mais profissional.",
            color: "text-red-700",
            bg: "bg-red-50",
            ring: "ring-red-100",
          };

  return (
    <section className="premium-card rounded-3xl p-6">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-brand">
            Saúde da loja
          </p>

          <h3 className="font-display mt-2 text-3xl font-extrabold text-slate-950">
            {score}% configurada
          </h3>

          <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
            Avaliação automática da estrutura da loja, aparência, catálogo e
            configurações essenciais.
          </p>

          <span
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${status.bg} ${status.color} ring-1 ${status.ring}`}
          >
            {status.label} · {status.text}
          </span>
        </div>

        <div className="relative grid size-28 shrink-0 place-items-center rounded-full bg-slate-50 ring-8 ring-slate-100">
          <div
            className={`absolute inset-0 rounded-full ${
              score >= 85
                ? "bg-emerald-500/10"
                : score >= 60
                  ? "bg-amber-500/10"
                  : "bg-red-500/10"
            }`}
          />
          <span className="font-display relative text-3xl font-extrabold text-slate-950">
            {score}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                item.done
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {item.done ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}
            </span>

            <div>
              <p className="text-sm font-extrabold text-slate-800">{item.label}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{item.helper}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm font-extrabold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/15"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight size={17} />
    </Link>
  );
}

function SetupRequired() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8">
      <h2 className="font-display text-2xl font-extrabold">Conecte seu Supabase</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Copie <code>.env.example</code> para <code>.env.local</code>, informe as
        chaves do projeto e execute a migração SQL. A interface está pronta para
        usar dados reais.
      </p>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className: string;
}) {
  const height = value ? Math.max(12, (value / max) * 100) : 0;

  return (
    <span
      className={`w-3 rounded-t-full transition-all ${className}`}
      style={{ height: `${height}%` }}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function getEffectiveStock(product: StockProduct) {
  const activeVariants = (product.product_variants || []).filter(
    (variant) => variant.active,
  );

  if (activeVariants.length) {
    return activeVariants.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );
  }

  return Number(product.stock || 0);
}

function buildDailyReport(orders: Order[], visits: Visit[]) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(addDays(new Date(), index - 6));

    return {
      key: dateKey(date),
      label: date
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", ""),
      orders: 0,
      visits: 0,
    };
  });

  const byKey = new Map(days.map((day) => [day.key, day]));

  orders.forEach((order) => {
    const day = byKey.get(dateKey(new Date(order.created_at)));
    if (day) day.orders += 1;
  });

  visits.forEach((visit) => {
    const day = byKey.get(dateKey(new Date(visit.visited_at)));
    if (day) day.visits += 1;
  });

  return days;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}