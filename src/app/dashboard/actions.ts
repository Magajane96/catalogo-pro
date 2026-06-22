"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuidSchema = z.uuid();
const orderStatusSchema = z.enum(["new", "in_progress", "picking", "finished", "delivered", "cancelled"]);
const manualProDaysSchema = z.coerce.number().int().min(1).max(365);
const fontFamilySchema = z.enum(["Manrope", "Inter", "Poppins", "Montserrat", "Nunito"]);

export async function logout() {
  const supabase = await createClient(); await supabase?.auth.signOut(); redirect("/login");
}

export async function createStore(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Sessao expirada.");
  const payload = readStorePayload(formData, true);
  const { data: store, error } = await supabase.from("stores").insert({ owner_id: user.id, ...payload, published: true }).select("id").single();
  if (error) throw new Error(error.message);
  if (store) {
    const logoUrl = await uploadStoreAsset(supabase, store.id, formData.get("logo"), "logo");
    if (logoUrl) await supabase.from("stores").update({ logo_url: logoUrl }).eq("id", store.id);
  }
  revalidatePath("/dashboard"); redirect("/dashboard");
}

export async function updateStore(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const id = readRequiredUuid(formData, "id", "Loja");
  const [logoUrl, bannerUrl] = await Promise.all([
    uploadStoreAsset(supabase, id, formData.get("logo"), "logo"),
    uploadStoreAsset(supabase, id, formData.get("banner"), "banner"),
  ]);
  const payload: Record<string, string | boolean | null> = {
    ...readStorePayload(formData),
    published: formData.get("published") === "on",
    updated_at: new Date().toISOString(),
  };
  if (formData.has("seo_title")) payload.seo_title = String(formData.get("seo_title") || "").trim() || null;
  if (formData.has("seo_description")) payload.seo_description = String(formData.get("seo_description") || "").trim() || null;
  if (logoUrl) payload.logo_url = logoUrl;
  if (bannerUrl) payload.banner_url = bannerUrl;
  const { error } = await supabase.from("stores").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/personalizar");
  revalidatePath("/dashboard/configuracoes");
  revalidatePath(`/loja/${payload.slug}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: store } = await supabase.from("stores").select("id").single();
  if (!store) throw new Error("Crie sua loja antes de cadastrar produtos.");
  const payload = readProductPayload(formData);
  const slug = buildProductSlug(payload.name);
  const { data: product, error } = await supabase.from("products").insert({ store_id: store.id, slug, ...payload }).select("id").single();
  if (error) throw new Error(error.message);
  await syncProductOptions(supabase, product.id, formData);
  await syncProductVariants(supabase, product.id, formData);
  await uploadProductImages(supabase, product.id, formData.getAll("images"));
  revalidatePath("/dashboard/produtos"); redirect("/dashboard/produtos");
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const id = readRequiredUuid(formData, "id", "Produto");
  const { error } = await supabase.from("products").update({ ...readProductPayload(formData), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  await syncProductOptions(supabase, id, formData);
  await syncProductVariants(supabase, id, formData);
  await uploadProductImages(supabase, id, formData.getAll("images"));
  revalidatePath("/dashboard/produtos"); revalidatePath(`/dashboard/produtos/${id}/editar`); redirect("/dashboard/produtos");
}

async function syncProductOptions(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, productId: string, formData: FormData) {
  const optionNames = formData.getAll("option_names").map(value => String(value).trim());
  const optionValues = formData.getAll("option_values").map(value => String(value).trim());
  const optionColors = formData.getAll("option_colors").map(value => String(value).trim());
  const options = optionNames.map((name, index) => ({
    name,
    values: splitCsv(optionValues[index] || ""),
    colors: splitCsv(optionColors[index] || ""),
  })).filter(option => option.name && option.values.length);

  await supabase.from("product_options").delete().eq("product_id", productId);

  for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
    const option = options[optionIndex];
    const { data, error } = await supabase.from("product_options").insert({ product_id: productId, name: option.name, position: optionIndex }).select("id").single();
    if (error) throw new Error(error.message);
    const values = option.values.map((value, valueIndex) => ({
      option_id: data.id,
      value,
      color_hex: normalizeHexColor(option.colors[valueIndex]),
      position: valueIndex,
    }));
    if (values.length) {
      const { error: valuesError } = await supabase.from("product_option_values").insert(values);
      if (valuesError) throw new Error(valuesError.message);
    }
  }
}

function splitCsv(value: string) {
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

function normalizeHexColor(value?: string) {
  if (!value) return null;
  const color = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : null;
}

async function syncProductVariants(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, productId: string, formData: FormData) {
  const names = formData.getAll("variant_names").map(value => String(value).trim());
  const stocks = formData.getAll("variant_stocks").map(value => String(value).trim());
  const adjustments = formData.getAll("variant_price_adjustments").map(value => String(value).trim());
  const skus = formData.getAll("variant_skus").map(value => String(value).trim());
  const variants = names.map((name, index) => ({
    product_id: productId,
    name,
    sku: skus[index] || null,
    price_adjustment: adjustments[index] ? Number(adjustments[index].replace(",", ".")) : 0,
    stock: stocks[index] ? Math.max(0, Number(stocks[index])) : 0,
    active: formData.get(`variant_active_${index}`) === "on",
    option_values: {},
  })).filter(variant => variant.name);

  await supabase.from("product_variants").delete().eq("product_id", productId);
  if (!variants.length) return;

  const { error } = await supabase.from("product_variants").insert(variants);
  if (error) throw new Error(error.message);
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
  const id = readRequiredUuid(formData, "id", "Imagem");
  const { data: image } = await supabase.from("product_images").select("storage_path,product_id,is_primary").eq("id", id).single(); if (!image) return;
  if (image.storage_path) await supabase.storage.from("product-images").remove([image.storage_path]); await supabase.from("product_images").delete().eq("id", id);
  const productId = image.product_id;
  if (image.is_primary) {
    const { data: nextImage } = await supabase.from("product_images").select("id").eq("product_id", productId).order("position", { ascending: true }).limit(1).maybeSingle();
    if (nextImage) await supabase.from("product_images").update({ is_primary: true }).eq("id", nextImage.id);
  }
  revalidatePath(`/dashboard/produtos/${productId}/editar`);
}

export async function updateProductImages(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const productId = readRequiredUuid(formData, "product_id", "Produto");
  const primaryId = readOptionalUuid(formData, "primary_image_id");
  const imageIds = String(formData.get("image_ids") || "").split(",").map(id => id.trim()).filter(Boolean);
  const validImageIds = imageIds.filter(id => uuidSchema.safeParse(id).success);
  if (!validImageIds.length) return;

  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  for (let index = 0; index < validImageIds.length; index++) {
    await supabase.from("product_images").update({
      position: index,
      is_primary: validImageIds[index] === primaryId || (!primaryId && index === 0),
    }).eq("id", validImageIds[index]).eq("product_id", productId);
  }
  revalidatePath(`/dashboard/produtos/${productId}/editar`);
  revalidatePath("/dashboard/produtos");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) throw new Error("Configure o Supabase primeiro.");
  const { data: store } = await supabase.from("stores").select("id").single(); if (!store) throw new Error("Loja não encontrada.");
  const category = readCategoryPayload(formData);
  const { error } = await supabase.from("categories").insert({ store_id: store.id, ...category });
  if (error) throw new Error(error.message); await revalidateCategoryPaths(supabase);
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const id = readRequiredUuid(formData, "id", "Categoria");
  await supabase.from("categories").update({ ...readCategoryPayload(formData), active: formData.get("active") === "on" }).eq("id", id);
  await revalidateCategoryPaths(supabase);
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("categories").delete().eq("id", readRequiredUuid(formData, "id", "Categoria")); await revalidateCategoryPaths(supabase);
}

async function revalidateCategoryPaths(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>) {
  const { data: store } = await supabase.from("stores").select("slug").maybeSingle();
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categorias");
  if (store?.slug) revalidatePath(`/loja/${store.slug}`);
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const id = readRequiredUuid(formData, "id", "Pedido");
  const status = readOrderStatus(formData);
  const { error } = await supabase.rpc("update_order_status", { p_order_id: id, p_status: status });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/produtos");
}

export async function grantManualPro(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const profileId = readRequiredUuid(formData, "profile_id", "Usuário");
  const days = readManualProDays(formData);
  const { error } = await supabase.rpc("admin_grant_manual_pro", { p_profile_id: profileId, p_days: days });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/planos");
}

export async function revokeManualPro(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  const profileId = readRequiredUuid(formData, "profile_id", "Usuário");
  const { error } = await supabase.rpc("admin_revoke_manual_pro", { p_profile_id: profileId });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/planos");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient(); if (!supabase) return;
  await supabase.from("products").delete().eq("id", readRequiredUuid(formData, "id", "Produto"));
  revalidatePath("/dashboard/produtos");
}

function readRequiredUuid(formData: FormData, field: string, label: string) {
  const result = uuidSchema.safeParse(String(formData.get(field) || ""));
  if (!result.success) throw new Error(`${label} inválido.`);
  return result.data;
}

function readOptionalUuid(formData: FormData, field: string) {
  const value = String(formData.get(field) || "").trim();
  if (!value) return "";
  const result = uuidSchema.safeParse(value);
  return result.success ? result.data : "";
}

function readOrderStatus(formData: FormData) {
  const result = orderStatusSchema.safeParse(String(formData.get("status") || ""));
  if (!result.success) throw new Error("Status de pedido inválido.");
  return result.data;
}

function readManualProDays(formData: FormData) {
  const result = manualProDaysSchema.safeParse(formData.get("days") || 30);
  if (!result.success) throw new Error("Informe um prazo entre 1 e 365 dias.");
  return result.data;
}

function readCategoryPayload(formData: FormData) {
  const name = String(formData.get("name") || "").normalize("NFKC").trim().slice(0, 80);
  const icon = String(formData.get("icon") || "Tag").normalize("NFKC").trim().slice(0, 40) || "Tag";
  const color = String(formData.get("color") || "#16a263").trim();
  if (name.length < 2) throw new Error("Informe um nome de categoria valido.");
  return {
    name,
    icon,
    color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#16a263",
  };
}

function readProductPayload(formData: FormData) {
  const price = readMoney(formData, "price", "Preço");
  const promotionalPrice = readOptionalMoney(formData, "promotional_price", "Preço promocional");
  if (promotionalPrice !== null && promotionalPrice > price) throw new Error("O preço promocional não pode ser maior que o preço.");
  return {
    category_id: readOptionalUuid(formData, "category_id") || null,
    name: readText(formData, "name", 3, 140, "Nome do produto"),
    description: readText(formData, "description", 0, 2000, "Descrição"),
    price,
    promotional_price: promotionalPrice,
    stock: readNonNegativeInt(formData, "stock", "Estoque"),
    sku: readText(formData, "sku", 0, 80, "SKU"),
    internal_code: readText(formData, "internal_code", 0, 80, "Código interno"),
    weight: readOptionalMoney(formData, "weight", "Peso"),
    active: formData.get("active") === "on",
  };
}

function readText(formData: FormData, field: string, min: number, max: number, label: string) {
  const value = String(formData.get(field) || "").normalize("NFKC").trim().slice(0, max);
  if (value.length < min) throw new Error(`${label} inválido.`);
  return value;
}

function readMoney(formData: FormData, field: string, label: string) {
  const value = Number(String(formData.get(field) || "").replace(",", "."));
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} inválido.`);
  return Math.round(value * 100) / 100;
}

function readOptionalMoney(formData: FormData, field: string, label: string) {
  const raw = String(formData.get(field) || "").trim();
  if (!raw) return null;
  return readMoney(formData, field, label);
}

function readNonNegativeInt(formData: FormData, field: string, label: string) {
  const value = Number(formData.get(field) || 0);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} inválido.`);
  return value;
}

function buildProductSlug(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base || "produto"}-${Date.now().toString(36)}`;
}

function readStorePayload(formData: FormData, creating = false) {
  const name = readText(formData, "name", 2, 100, "Nome da loja");
  const requestedSlug = String(formData.get("slug") || "").trim() || name;
  const slug = normalizeSlug(requestedSlug);
  if (slug.length < 3) throw new Error("Slug da loja inválido.");
  const fontResult = fontFamilySchema.safeParse(String(formData.get("font_family") || "Manrope"));
  return {
    name,
    slug,
    description: readText(formData, "description", 0, 600, "Descrição da loja"),
    whatsapp: readPhoneDigits(formData, "whatsapp", "WhatsApp"),
    category: readText(formData, "category", 2, 80, "Categoria"),
    primary_color: readHexColor(formData, "primary_color", "#16a263"),
    secondary_color: readHexColor(formData, "secondary_color", "#14261d"),
    font_family: fontResult.success ? fontResult.data : "Manrope",
    ...(creating ? { seo_title: null, seo_description: null } : {}),
  };
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function readPhoneDigits(formData: FormData, field: string, label: string) {
  const digits = String(formData.get(field) || "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 20) throw new Error(`${label} inválido.`);
  return digits;
}

function readHexColor(formData: FormData, field: string, fallback: string) {
  const value = String(formData.get(field) || fallback).trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}



