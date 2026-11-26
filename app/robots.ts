import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

// Panel, konto, koszyk i kasa nie mają czego szukać w wynikach wyszukiwania.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/konto", "/koszyk", "/kasa", "/logowanie", "/newsletter"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
