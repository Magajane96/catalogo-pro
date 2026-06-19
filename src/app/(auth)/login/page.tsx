import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Entrar" };
export default function LoginPage() { return <div className="w-full"><p className="text-sm font-extrabold text-brand">BEM-VINDO DE VOLTA</p><h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight">Entre na sua conta</h1><p className="mt-3 text-slate-500">Acesse sua loja, produtos e pedidos.</p><AuthForm mode="login"/></div>; }
