"use client";

import { Plus, Wand2 } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

type ProductOption = {
  id: string;
  name: string;
  position: number;
  product_option_values: { id: string; value: string; color_hex: string | null; position: number }[];
};

type ProductVariant = {
  id?: string;
  name: string;
  sku: string | null;
  price_adjustment: number | null;
  stock: number;
  active: boolean;
};

const variationPlaceholders = [
  { name: "Cor", values: "Vermelho, Azul, Preto, Branco", colors: "#ef4444, #2563eb, #111827, #ffffff" },
  { name: "Tamanho", values: "P, M, G, GG", colors: "" },
  { name: "Modelo", values: "Classico, Premium", colors: "" },
];

export function ProductVariationBuilder({ initialOptions, initialVariants, inputClass }: { initialOptions: ProductOption[]; initialVariants: ProductVariant[]; inputClass: string }) {
  const [options, setOptions] = useOptionRows(initialOptions);
  const [variants, setVariants] = useVariantRows(initialVariants);

  function generateVariants() {
    const groups = options
      .map(option => splitCsv(option.values))
      .filter(values => values.length);
    if (!groups.length) return;

    const combinations = combine(groups).map(values => values.join(" / "));
    setVariants(current => {
      const byName = new Map(current.filter(variant => variant.name).map(variant => [variant.name, variant]));
      return combinations.map(name => byName.get(name) || { name, sku: "", price_adjustment: 0, stock: 0, active: true });
    });
  }

  function addVariant() {
    setVariants(current => [...current, { name: "", sku: "", price_adjustment: 0, stock: 0, active: true }]);
  }

  return <>
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h3 className="font-display text-lg font-extrabold">Variacoes</h3>
        <p className="mt-1 text-sm text-slate-500">Cadastre opcoes como Cor, Tamanho ou Modelo. Separe os valores por virgula.</p>
      </div>
      <div className="mt-5 space-y-5">
        {options.map((option, index) => {
          const placeholder = variationPlaceholders[index];
          return <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <label>
                <span className="mb-2 block text-sm font-bold">Opcao {index + 1}</span>
                <input name="option_names" value={option.name} onChange={event => updateOption(setOptions, index, { name: event.target.value })} className={inputClass} placeholder={placeholder.name} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold">Valores</span>
                <input name="option_values" value={option.values} onChange={event => updateOption(setOptions, index, { values: event.target.value })} className={inputClass} placeholder={placeholder.values} />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">Cores em HEX, opcional</span>
              <input name="option_colors" value={option.colors} onChange={event => updateOption(setOptions, index, { colors: event.target.value })} className={inputClass} placeholder={placeholder.colors || "#ef4444, #2563eb"} />
            </label>
          </div>;
        })}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-display text-lg font-extrabold">Estoque por variante</h3>
          <p className="mt-1 text-sm text-slate-500">Gere combinacoes a partir das opcoes ou ajuste manualmente cada linha.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={generateVariants} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-sm font-extrabold text-brand"><Wand2 size={16} />Gerar</button>
          <button type="button" onClick={addVariant} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-extrabold text-slate-600"><Plus size={16} />Linha</button>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {variants.map((variant, index) => <div key={`${variant.id || "new"}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_140px_140px]">
            <label>
              <span className="mb-2 block text-sm font-bold">Nome da variante</span>
              <input name="variant_names" value={variant.name} onChange={event => updateVariant(setVariants, index, { name: event.target.value })} className={inputClass} placeholder="Ex: Vermelho / P" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Estoque</span>
              <input name="variant_stocks" type="number" min="0" value={variant.stock} onChange={event => updateVariant(setVariants, index, { stock: Number(event.target.value || 0) })} className={inputClass} placeholder="0" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Ajuste de preco</span>
              <input name="variant_price_adjustments" inputMode="decimal" value={variant.price_adjustment || ""} onChange={event => updateVariant(setVariants, index, { price_adjustment: Number(String(event.target.value || "0").replace(",", ".")) })} className={inputClass} placeholder="Ex: 10,00" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
            <label>
              <span className="mb-2 block text-sm font-bold">SKU da variante</span>
              <input name="variant_skus" value={variant.sku || ""} onChange={event => updateVariant(setVariants, index, { sku: event.target.value })} className={inputClass} placeholder="Codigo especifico" />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold">
              <input name={`variant_active_${index}`} type="checkbox" checked={variant.active} onChange={event => updateVariant(setVariants, index, { active: event.target.checked })} className="size-5 accent-emerald-600" />
              Ativa
            </label>
          </div>
        </div>)}
      </div>
    </section>
  </>;
}

function useOptionRows(initialOptions: ProductOption[]) {
  const rows = variationPlaceholders.map((_, index) => {
    const option = initialOptions[index];
    const values = option?.product_option_values?.sort((a, b) => a.position - b.position) || [];
    return {
      name: option?.name || "",
      values: values.map(value => value.value).join(", "),
      colors: values.map(value => value.color_hex || "").join(", "),
    };
  });
  return useStateShim(rows);
}

function useVariantRows(initialVariants: ProductVariant[]) {
  const rows: ProductVariant[] = initialVariants.length ? initialVariants : Array.from({ length: 4 }, () => ({ name: "", sku: "", price_adjustment: 0, stock: 0, active: true }));
  return useStateShim(rows);
}

function useStateShim<T>(initialValue: T) {
  return useState(initialValue);
}

function updateOption(setOptions: Dispatch<SetStateAction<{ name: string; values: string; colors: string }[]>>, index: number, patch: Partial<{ name: string; values: string; colors: string }>) {
  setOptions(current => current.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option));
}

function updateVariant(setVariants: Dispatch<SetStateAction<ProductVariant[]>>, index: number, patch: Partial<ProductVariant>) {
  setVariants(current => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...patch } : variant));
}

function splitCsv(value: string) {
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

function combine(groups: string[][]): string[][] {
  return groups.reduce<string[][]>((acc, group) => acc.flatMap(items => group.map(item => [...items, item])), [[]]);
}
