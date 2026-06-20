import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/loja/"],
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/cadastro"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}
