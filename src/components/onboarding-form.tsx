"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Store, Upload } from "lucide-react";
import { createStore } from "@/app/dashboard/actions";

const categories = ["Moda Feminina", "Moda Infantil", "Artesanato", "Semijoias", "Confeitaria", "Maquiagem", "Personalizados", "Moda Evangélica", "Outros"];

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return <div className="mx-auto max-w-3xl">
    <div className="mb-7 flex items-center gap-2">{[1, 2, 3, 4].map(n => <div key={n} className={`h-2 flex-1 rounded-full transition ${n <= step ? "bg-brand shadow-sm" : "bg-white ring-1 ring-slate-200"}`} />)}</div>
    <form action={createStore} className="premium-panel rounded-3xl p-6 sm:p-10">
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="slug" value={slug} />

      {step === 1 && <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-brand"><Store /></span>
        <h2 className="font-display mt-5 text-3xl font-extrabold">Vamos criar sua loja</h2>
        <p className="mt-2 text-slate-500">Conte um pouco sobre o seu negócio.</p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Nome da loja</span><input required value={name} onChange={event => { setName(event.target.value); setSlug(event.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} className="input-premium h-12 w-full rounded-2xl px-4" placeholder="Ex: Ateliê Luna" /></label>
          <label><span className="mb-2 block text-sm font-bold">WhatsApp</span><input name="whatsapp" required className="input-premium h-12 w-full rounded-2xl px-4" placeholder="(11) 99999-9999" /></label>
          <label><span className="mb-2 block text-sm font-bold">Categoria</span><select name="category" className="input-premium h-12 w-full rounded-2xl px-4">{categories.map(category => <option key={category}>{category}</option>)}</select></label>
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Endereço da loja</span><div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm"><span className="text-slate-400">mgdcatalogopro.com/loja/</span><span className="font-bold">{slug || "sua-loja"}</span></div></label>
        </div>
      </div>}

      {step === 2 && <div className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-brand"><Upload /></span><h2 className="font-display mt-5 text-3xl font-extrabold">Adicione seu logo</h2><p className="mt-2 text-slate-500">Você poderá trocar esta imagem quando quiser.</p><label className="mx-auto mt-8 grid h-48 max-w-md cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-sm font-bold text-slate-400 transition hover:border-emerald-300 hover:bg-emerald-50/40"><input type="file" name="logo" accept="image/png,image/jpeg,image/webp" className="sr-only" /><span>Selecionar logo em PNG, JPG ou WEBP</span></label></div>}

      {step === 3 && <div><h2 className="font-display text-3xl font-extrabold">Escolha a cor da marca</h2><p className="mt-2 text-slate-500">Ela será usada nos botões e destaques da sua loja.</p><div className="mt-8 flex flex-wrap gap-4">{["#16A34A", "#0F172A", "#6D5DFC", "#EF476F", "#F59E0B", "#0EA5E9"].map((color, index) => <label key={color} className="relative"><input type="radio" name="primary_color" value={color} defaultChecked={index === 0} className="peer sr-only" /><span style={{ background: color }} className="grid size-16 cursor-pointer place-items-center rounded-2xl text-white ring-offset-4 transition peer-checked:scale-105 peer-checked:ring-4 peer-checked:ring-slate-950 peer-focus-visible:ring-4 peer-focus-visible:ring-brand"><Check /></span></label>)}</div></div>}

      {step === 4 && <div className="text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-brand"><Check size={30} /></span><h2 className="font-display mt-6 text-3xl font-extrabold">Tudo pronto para publicar!</h2><p className="mx-auto mt-3 max-w-md text-slate-500">Sua loja <strong>{name}</strong> será criada e você poderá começar a cadastrar produtos imediatamente.</p></div>}

      <div className="mt-9 flex justify-between border-t border-slate-100 pt-6">{step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-slate-500"><ArrowLeft size={18} />Voltar</button> : <span />}{step < 4 ? <button type="button" disabled={step === 1 && !name} onClick={() => setStep(step + 1)} className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 disabled:opacity-40">Continuar<ArrowRight size={18} /></button> : <button className="rounded-xl bg-brand px-6 py-3 font-extrabold text-white shadow-lg shadow-emerald-700/20">Publicar minha loja</button>}</div>
    </form>
  </div>;
}


