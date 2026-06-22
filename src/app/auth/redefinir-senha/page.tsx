import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata = { title: "Redefinir senha" };

export default function ResetPasswordPage() {
  return <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="flex flex-col bg-white px-6 py-7 sm:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
        <div className="w-full">
          <p className="text-sm font-extrabold text-brand">SEGURANCA DA CONTA</p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight">Redefina sua senha</h1>
          <p className="mt-3 text-slate-500">Use o link enviado por e-mail para criar uma nova senha de acesso.</p>
          <ResetPasswordForm />
        </div>
      </div>
    </section>
    <aside className="relative hidden overflow-hidden bg-[#14261d] p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 opacity-20 dot-grid" />
      <div className="relative">
        <span className="inline-flex rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300">Acesso protegido</span>
        <h2 className="font-display mt-8 max-w-lg text-5xl font-extrabold leading-tight tracking-tight">Volte para sua lojá com uma senha nova e segura.</h2>
      </div>
    </aside>
  </main>;
}

