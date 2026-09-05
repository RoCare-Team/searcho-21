import { ALLOW_INDEXING, SITE_URL } from "@/lib/seo";

/**
 * robots.txt.
 *
 * Must agree with the robots meta tag: when this deployment is not allowed to be
 * indexed, nothing is crawlable and no sitemap is advertised.
 */
export default function robots() {
  if (!ALLOW_INDEXING) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account pages carry no indexable content.
        disallow: ["/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
