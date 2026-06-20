import { ProductForm } from "@/components/product-form";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Lock, Package } from "lucide-react";

export default async function NewProductPage(){const supabase=await createClient();const [{data:categories},{data:profile},{count:products}]=supabase?await Promise.all([supabase.from("categories").select("id,name").eq("active",true).order("name"),supabase.from("profiles").select("plan").maybeSingle(),supabase.from("products").select("id",{count:"exact",head:true})]):[{data:[]},{data:null},{count:0}];const plan=profile?.plan==="pro"?"pro":"free";if(plan==="free"&&(products||0)>=20)return <ProductLimitReached used={products||0}/>;return <ProductForm categories={categories||[]}/>}

function ProductLimitReached({ used }: { used: number }) {
  return <div className="mx-auto max-w-2xl">
    <Link href="/dashboard/produtos" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={17} />Voltar para produtos</Link>
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-white text-amber-600"><Lock size={28} /></span>
      <h2 className="font-display mt-5 text-3xl font-extrabold">Limite do plano gratuito atingido</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">Sua loja ja possui {used} de 20 produtos. O banco tambem protege esse limite, e a estrutura do plano PRO ja esta pronta para liberar produtos ilimitados.</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-amber-700"><Package size={16} />Plano PRO em breve</div>
    </section>
  </div>;
}
