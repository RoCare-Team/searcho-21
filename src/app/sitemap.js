import { getCategories, getCities } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
/**
 * Sitemap covering the existing URL architecture:
 *   /                                                     home
 *   /[city]                                               city
 *   /[city]/[category]                                    category
 *   /[city]/[category]/[sub]                              subcategory
 *   /[city]/[category]/[sub]/[serviceType]                service listing
 *   /[city]/[category]/[sub]/[serviceType]/[brandSlug]    brand SEO page
 *
 * The live site splits this across a sitemap index. Once the backend supplies
 * the full city list (~1,100 slugs), split this into `generateSitemaps()`
 * shards to stay under the 50,000-URL per-file limit.
 */
export default async function sitemap() {
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
  const lastModified = new Date();
  const staticPaths = [
    "/",
    "/about-us",
    "/contact-us",
    "/list-your-business",
    "/faqs",
    "/customer-care",
    "/business-support",
    "/advertise-your-business",
    "/media",
    "/report-a-bug",
    "/terms-of-use",
    "/privacy-policy",
  ];
  const entries = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
  for (const city of cities) {
    entries.push({
      url: `${SITE_URL}/${city.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const category of categories) {
      const categoryPath = `/${city.slug}/${category.slug}`;
      entries.push({
        url: `${SITE_URL}${categoryPath}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      for (const sub of category.subCategories) {
        const subPath = `${categoryPath}/${sub.slug}`;
        entries.push({
          url: `${SITE_URL}${subPath}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        });
        for (const type of sub.serviceTypes) {
          const typePath = `${subPath}/${type.slug}`;
          entries.push({
            url: `${SITE_URL}${typePath}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.6,
          });
          for (const brand of sub.brands ?? []) {
            const brandSlug = brand.slugs[type.slug];
            if (!brandSlug) continue;
            entries.push({
              url: `${SITE_URL}${typePath}/${brandSlug}`,
              lastModified,
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        }
      }
    }
  }
  return entries;
}
