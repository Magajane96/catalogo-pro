import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

type StoreRow = {
  slug: string;
  updated_at: string;
};

type ProductRow = {
  slug: string | null;
  updated_at: string;
  stores: { slug: string } | { slug: string }[] | null;
};

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteBaseUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const supabase = supabaseClient();
  if (!supabase) return staticRoutes;

  const [{ data: stores }, { data: products }] = await Promise.all([
    supabase.from("stores").select("slug,updated_at").eq("published", true),
    supabase
      .from("products")
      .select("slug,updated_at,stores!inner(slug)")
      .eq("active", true)
      .eq("stores.published", true),
  ]);

  const storeRoutes = ((stores || []) as StoreRow[]).map(store => ({
    url: `${baseUrl}/loja/${store.slug}`,
    lastModified: new Date(store.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productRoutes = ((products || []) as ProductRow[]).flatMap(product => {
    const store = Array.isArray(product.stores) ? product.stores[0] : product.stores;
    if (!product.slug || !store?.slug) return [];
    return [{
      url: `${baseUrl}/loja/${store.slug}/produto/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }];
  });

  return [...staticRoutes, ...storeRoutes, ...productRoutes];
}
