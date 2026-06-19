import { ProductForm } from "@/components/product-form";
import { createClient } from "@/lib/supabase/server";
export default async function NewProductPage(){const supabase=await createClient();const {data:categories}=supabase?await supabase.from("categories").select("id,name").eq("active",true).order("name"):{data:[]};return <ProductForm categories={categories||[]}/>}
