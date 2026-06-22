import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteUrl } from "@/lib/seo";

type StoreRow = {
  slug: string;
  updated_at: string;
};

type ProductRow = {
  slug: string | null;
  updated_at: string;
  stores: { slug: string } | { slug: string }[] | null;
};

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl("/"),
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
      .is("archived_at", null)
      .eq("stores.published", true),
  ]);

  const storeRoutes = ((stores || []) as StoreRow[]).map(store => ({
    url: siteUrl(`/loja/${store.slug}`),
    lastModified: new Date(store.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productRoutes = ((products || []) as ProductRow[]).flatMap(product => {
    const store = Array.isArray(product.stores) ? product.stores[0] : product.stores;
    if (!product.slug || !store?.slug) return [];
    return [{
      url: siteUrl(`/loja/${store.slug}/produto/${product.slug}`),
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }];
  });

  return [...staticRoutes, ...storeRoutes, ...productRoutes];
}
