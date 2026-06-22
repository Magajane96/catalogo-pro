import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Criar conta" };

export default function SignupPage() {
  return <div className="w-full fade-in-up">
    <p className="text-xs font-extrabold uppercase tracking-[.2em] text-brand">Comece grátis</p>
    <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-slate-950">Crie sua loja hoje</h1>
    <p className="mt-3 text-slate-500">Sem cartão de crédito. Configure sua vitrine digital em poucos minutos.</p>
    <AuthForm mode="signup" />
  </div>;
}


