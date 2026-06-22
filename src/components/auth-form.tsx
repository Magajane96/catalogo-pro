"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const email = String(data.get("email"));
      const password = String(data.get("password"));
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name: String(data.get("name")) }, emailRedirectTo: `${location.origin}/auth/callback` } });
        if (error) throw error;
        toast.success("Conta criada! Confira seu e-mail para confirmar o cadastro.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    const email = prompt("Digite o e-mail da sua conta:");
    if (!email) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/auth/redefinir-senha` });
      if (error) throw error;
      toast.success("Enviamos as instruções para seu e-mail.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar o e-mail.");
    }
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    {isSignup && <label className="block"><span className="mb-2 block text-sm font-bold">Seu nome</span><input name="name" required autoComplete="name" placeholder="Como podemos chamar você?" className="input-premium h-13 w-full rounded-2xl px-4" /></label>}
    <label className="block"><span className="mb-2 block text-sm font-bold">E-mail</span><input name="email" required type="email" autoComplete="email" placeholder="voce@exemplo.com" className="input-premium h-13 w-full rounded-2xl px-4" /></label>
    <label className="block"><span className="mb-2 flex items-center justify-between text-sm font-bold">Senha {!isSignup && <button type="button" onClick={resetPassword} className="text-xs text-brand hover:underline">Esqueci minha senha</button>}</span><span className="relative block"><input name="password" required minLength={6} type={show ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="Mínimo de 6 caracteres" className="input-premium h-13 w-full rounded-2xl px-4 pr-12" /><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
    <button disabled={loading} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-extrabold text-white shadow-lg shadow-emerald-700/15 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={20} /> : <>{isSignup ? "Criar minha conta" : "Entrar no painel"}<ArrowRight size={18} /></>}</button>
    <p className="text-center text-sm text-slate-500">{isSignup ? "Já possui uma conta?" : "Ainda não tem uma conta?"} <Link href={isSignup ? "/login" : "/cadastro"} className="font-extrabold text-brand hover:underline">{isSignup ? "Entrar" : "Criar grátis"}</Link></p>
  </form>;
}


