"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient(); await supabase?.auth.signOut(); redirect("/login");
}

export async function createStore(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sessao expirada.");
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const { data: store, error } = await supabase.from("stores").insert({ owner_id: user.id, name, slug, whatsapp: String(formData.get("whatsapp")), category: String(formData.get("category")), primary_color: String(formData.get("primary_color") || "#16a263"), published: true }).select("id").single();
  if (error) throw new Error(error.message);
  if (store) {
    const logoUrl = await uploadStoreAsset(supabase, store.id, formData.get("logo"), "logo");
    if (logoUrl) await supabase.from("stores").update({ logo_url: logoUrl }).eq("id", store.id);
  }
  revalidatePath("/dashboard"); redirect("/dashboard");
}

export async function updateStore(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug") || "").toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");
  const [logoUrl, bannerUrl] = await Promise.all([
    uploadStoreAsset(supabase, id, formData.get("logo"), "logo"),
    uploadStoreAsset(supabase, id, formData.get("banner"), "banner"),
  ]);
  const payload: Record<string, string | boolean | null> = {
    name: String(formData.get("name") || "").trim(),
    slug,
    description: String(formData.get("description") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    primary_color: String(formData.get("primary_color") || "#16a263"),
    secondary_color: String(formData.get("secondary_color") || "#14261d"),
    font_family: String(formData.get("font_family") || "Manrope"),
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description: String(formData.get("seo_description") || "").trim() || null,
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };
  if (logoUrl) payload.logo_url = logoUrl;
  if (bannerUrl) payload.banner_url = bannerUrl;
  const { error } = await supabase.from("stores").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/personalizar");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath(`/loja/${slug}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: store } = await supabase.from("stores").select("id").single();
  if (!store) throw new Error("Crie sua loja antes de cadastrar produtos.");
  const price = Number(String(formData.get("price")).replace(",", "."));
  const name = String(formData.get("name"));
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
  const { data: product, error } = await supabase.from("products").insert({ store_id: store.id, category_id: formData.get("category_id") || null, name, slug, description: String(formData.get("description") || ""), price, promotional_price: formData.get("promotional_price") ? Number(String(formData.get("promotional_price")).replace(",", ".")) : null, stock: Number(formData.get("stock") || 0), sku: String(formData.get("sku") || ""), internal_code: String(formData.get("internal_code") || ""), weight: formData.get("weight") ? Number(String(formData.get("weight")).replace(",", ".")) : null, active: formData.get("active") === "on" }).select("id").single();
  if (error) throw new Error(error.message);
  await uploadProductImages(supabase, product.id, formData.getAll("images"));
  revalidatePath("/dashboard/produtos"); redirect("/dashboard/produtos");
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const id = String(formData.get("id"));
  const { error } = await supabase.from("products").update({ category_id: formData.get("category_id") || null, name: String(formData.get("name")), description: String(formData.get("description") || ""), price: Number(String(formData.get("price")).replace(",", ".")), promotional_price: formData.get("promotional_price") ? Number(String(formData.get("promotional_price")).replace(",", ".")) : null, stock: Number(formData.get("stock") || 0), sku: String(formData.get("sku") || ""), internal_code: String(formData.get("internal_code") || ""), weight: formData.get("weight") ? Number(String(formData.get("weight")).replace(",", ".")) : null, active: formData.get("active") === "on", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  await uploadProductImages(supabase, id, formData.getAll("images"));
  revalidatePath("/dashboard/produtos"); revalidatePath(`/dashboard/produtos/${id}/editar`); redirect("/dashboard/produtos");
}

async function uploadProductImages(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, productId: string, values: FormDataEntryValue[]) {
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
  const files = values.filter((value): value is File => value instanceof File && value.size > 0);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const { count } = await supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
    await supabase.from("product_images").insert({ product_id: productId, url: data.publicUrl, storage_path: path, is_primary: (count || 0) === 0 && index === 0, position: (count || 0) + index });
  }
}

async function uploadStoreAsset(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, storeId: string, value: FormDataEntryValue | null, prefix: "logo" | "banner") {
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return null;
  if (!(value instanceof File) || value.size === 0) return null;
  const extension = value.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${storeId}/${prefix}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("store-assets").upload(path, value, { contentType: value.type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("store-assets").getPublicUrl(path).data.publicUrl;
}

export async function deleteProductImage(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const id = String(formData.get("id"));
  const { data: image } = await supabase.from("product_images").select("storage_path,product_id").eq("id", id).single(); if (!image) return;
  if (image.storage_path) await supabase.storage.from("product-images").remove([image.storage_path]); await supabase.from("product_images").delete().eq("id", id);
  const productId = image.product_id;
  revalidatePath(`/dashboard/produtos/${productId}/editar`);
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: store } = await supabase.from("stores").select("id").single(); if (!store) throw new Error("Loja nao encontrada.");
  const { error } = await supabase.from("categories").insert({ store_id: store.id, name: String(formData.get("name")), icon: String(formData.get("icon") || "Tag"), color: String(formData.get("color") || "#16a263") });
  if (error) throw new Error(error.message); revalidatePath("/dashboard/categorias");
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("categories").update({ name: String(formData.get("name")), icon: String(formData.get("icon") || "Tag"), color: String(formData.get("color") || "#16a263"), active: formData.get("active") === "on" }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/categorias");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("categories").delete().eq("id", String(formData.get("id"))); revalidatePath("/dashboard/categorias");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("orders").update({ status: String(formData.get("status")), updated_at: new Date().toISOString() }).eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/pedidos");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("products").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/produtos");
}
