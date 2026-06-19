import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Criar conta" };
export default function SignupPage() { return <div className="w-full"><p className="text-sm font-extrabold text-brand">COMECE GRATIS</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight">Crie sua loja hoje</h1><p className="mt-3 text-slate-500">Sem cartao de credito. Configure em poucos minutos.</p><AuthForm mode="signup"/></div>; }
