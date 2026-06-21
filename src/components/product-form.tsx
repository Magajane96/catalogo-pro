import Link from "next/link";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { createProduct, updateProduct } from "@/app/dashboard/actions";
import { ProductImageManager } from "@/components/product-image-manager";

type Category = { id: string; name: string };
type ProductOption = {
  id: string;
  name: string;
  position: number;
  product_option_values: { id: string; value: string; color_hex: string | null; position: number }[];
};
type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  sku: string | null;
  internal_code: string | null;
  weight: number | null;
  active: boolean;
  product_images: { id: string; url: string; storage_path: string | null; is_primary: boolean; position: number }[];
  product_options?: ProductOption[];
  product_variants?: { id: string; name: string; sku: string | null; price_adjustment: number | null; stock: number; active: boolean }[];
};

const variationPlaceholders = [
  { name: "Cor", values: "Vermelho, Azul, Preto, Branco", colors: "#ef4444, #2563eb, #111827, #ffffff" },
  { name: "Tamanho", values: "P, M, G, GG", colors: "" },
  { name: "Modelo", values: "Classico, Premium", colors: "" },
];

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const editing = Boolean(product);
  const input = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-emerald-100";
  const options = [...(product?.product_options || [])].sort((a, b) => a.position - b.position);
  const variants = product?.product_variants || [];

  return <div className="mx-auto max-w-5xl">
    <Link href="/dashboard/produtos" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={17} />Voltar para produtos</Link>
    <div>
      <p className="text-sm font-bold text-slate-400">{editing ? "EDITAR ITEM" : "NOVO ITEM"}</p>
      <h2 className="font-display mt-1 text-3xl font-extrabold">{editing ? "Editar produto" : "Cadastrar produto"}</h2>
    </div>

    <form action={editing ? updateProduct : createProduct} className="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]" encType="multipart/form-data">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Informacoes principais</h3>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Nome do produto</span>
              <input name="name" required defaultValue={product?.name} className={input} placeholder="Ex: Vestido midi floral" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Categoria</span>
              <select name="category_id" defaultValue={product?.category_id || ""} className={input}>
                <option value="">Sem categoria</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Descricao</span>
              <textarea name="description" rows={6} defaultValue={product?.description} className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-brand" placeholder="Conte os detalhes, materiais e diferenciais..." />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Fotos do produto</h3>
          {product?.product_images?.length ? <ProductImageManager productId={product.id} images={product.product_images} /> : null}
          <label className="mt-5 grid min-h-40 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
            <input type="file" name="images" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" />
            <div className="text-slate-400">
              <ImagePlus className="mx-auto mb-2" />
              <p className="text-sm font-bold">Selecionar imagens</p>
              <p className="mt-1 text-xs">PNG, JPG ou WEBP, ate 5 MB</p>
            </div>
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-extrabold">Variacoes</h3>
            <p className="mt-1 text-sm text-slate-500">Cadastre opcoes como Cor, Tamanho ou Modelo. Separe os valores por virgula.</p>
          </div>
          <div className="mt-5 space-y-5">
            {variationPlaceholders.map((placeholder, index) => {
              const option = options[index];
              const values = option?.product_option_values?.sort((a, b) => a.position - b.position) || [];
              return <div key={placeholder.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <label>
                    <span className="mb-2 block text-sm font-bold">Opcao {index + 1}</span>
                    <input name="option_names" defaultValue={option?.name || ""} className={input} placeholder={placeholder.name} />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold">Valores</span>
                    <input name="option_values" defaultValue={values.map(value => value.value).join(", ")} className={input} placeholder={placeholder.values} />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-bold">Cores em HEX, opcional</span>
                  <input name="option_colors" defaultValue={values.map(value => value.color_hex || "").join(", ")} className={input} placeholder={placeholder.colors || "#ef4444, #2563eb"} />
                </label>
              </div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-extrabold">Estoque por variante</h3>
            <p className="mt-1 text-sm text-slate-500">Use linhas como Vermelho / P ou Azul / GG quando cada combinacao tiver estoque ou preco diferente.</p>
          </div>
          <div className="mt-5 space-y-4">
            {Array.from({ length: Math.max(4, variants.length + 1) }, (_, index) => {
              const variant = variants[index];
              return <div key={variant?.id || index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-4 md:grid-cols-[1fr_140px_140px]">
                  <label>
                    <span className="mb-2 block text-sm font-bold">Nome da variante</span>
                    <input name="variant_names" defaultValue={variant?.name || ""} className={input} placeholder="Ex: Vermelho / P" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold">Estoque</span>
                    <input name="variant_stocks" type="number" min="0" defaultValue={variant?.stock ?? ""} className={input} placeholder="0" />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold">Ajuste de preco</span>
                    <input name="variant_price_adjustments" inputMode="decimal" defaultValue={variant?.price_adjustment || ""} className={input} placeholder="Ex: 10,00" />
                  </label>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
                  <label>
                    <span className="mb-2 block text-sm font-bold">SKU da variante</span>
                    <input name="variant_skus" defaultValue={variant?.sku || ""} className={input} placeholder="Codigo especifico" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold">
                    <input name={`variant_active_${index}`} type="checkbox" defaultChecked={variant?.active ?? true} className="size-5 accent-emerald-600" />
                    Ativa
                  </label>
                </div>
              </div>;
            })}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-extrabold">Preco e estoque</h3>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Preco</span>
              <input name="price" required inputMode="decimal" defaultValue={product?.price} className={input} placeholder="0,00" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Preco promocional</span>
              <input name="promotional_price" inputMode="decimal" defaultValue={product?.promotional_price || ""} className={input} placeholder="Opcional" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Estoque</span>
              <input name="stock" type="number" min="0" defaultValue={product?.stock || 0} className={input} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">SKU</span>
              <input name="sku" defaultValue={product?.sku || ""} className={input} placeholder="Codigo de estoque" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Codigo interno</span>
              <input name="internal_code" defaultValue={product?.internal_code || ""} className={input} placeholder="Seu codigo" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Peso em kg</span>
              <input name="weight" inputMode="decimal" defaultValue={product?.weight || ""} className={input} placeholder="Ex: 0,350" />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold">
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-5 accent-emerald-600" />
              Produto publicado
            </label>
          </div>
        </section>
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-extrabold text-white"><Save size={18} />{editing ? "Salvar alteracoes" : "Salvar e publicar"}</button>
      </div>
    </form>
  </div>;
}
