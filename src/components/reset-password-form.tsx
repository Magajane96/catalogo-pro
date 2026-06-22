"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("confirmation") || "");

    try {
      if (password !== confirmation) throw new Error("As senhas precisam ser iguais.");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar sua senha.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
      <span className="flex items-center gap-2"><ShieldCheck size={18} />Crie uma nova senha para acessar sua loja.</span>
    </div>
    <label className="block">
      <span className="mb-2 block text-sm font-bold">Nova senha</span>
      <span className="relative block">
        <input name="password" required minLength={6} type={show ? "text" : "password"} autoComplete="new-password" placeholder="Mínimo de 6 caracteres" className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 outline-none transition focus:border-brand focus:ring-4 focus:ring-emerald-100" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button>
      </span>
    </label>
    <label className="block">
      <span className="mb-2 block text-sm font-bold">Confirmar senha</span>
      <input name="confirmation" required minLength={6} type={show ? "text" : "password"} autoComplete="new-password" placeholder="Digite novamente" className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-emerald-100" />
    </label>
    <button disabled={loading} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand font-extrabold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-[#128452] disabled:opacity-60">
      {loading ? <Loader2 className="animate-spin" size={20} /> : <>Salvar nova senha<ArrowRight size={18} /></>}
    </button>
    <p className="text-center text-sm text-slate-500">Lembrou sua senha? <Link href="/login" className="font-extrabold text-brand hover:underline">Entrar</Link></p>
  </form>;
}


