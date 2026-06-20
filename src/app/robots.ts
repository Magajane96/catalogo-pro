import type { MetadataRoute } from "next";

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/loja/"],
        disallow: ["/dashboard/", "/api/", "/auth/", "/login", "/cadastro"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
