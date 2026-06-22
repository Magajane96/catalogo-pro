import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return <div className="w-full fade-in-up">
    <p className="text-xs font-extrabold uppercase tracking-[.2em] text-brand">Bem-vindo de volta</p>
    <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-slate-950">Entre no seu painel</h1>
    <p className="mt-3 text-slate-500">Acesse sua loja, acompanhe pedidos e gerencie seu catálogo profissional.</p>
    <AuthForm mode="login" />
  </div>;
}

