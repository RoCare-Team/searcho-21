import { getCategories, getCities, getPopularCities } from "@/lib/api";
/**
 * Flattens the category tree into a list the search box matches against.
 *
 * Built from whatever the database returns, so a service added there becomes
 * searchable without a code change.
 */
export async function buildServiceIndex() {
  const categories = await getCategories();
  const out = [];
  for (const category of categories) {
    for (const sub of category.subCategories) {
      if (sub.serviceTypes.length === 0) {
        out.push({
          label: sub.name,
          path: `/${category.slug}/${sub.slug}`,
          category: category.name,
        });
        continue;
      }
      for (const type of sub.serviceTypes) {
        out.push({
          label: `${sub.name} ${type.name}`,
          path: `/${category.slug}/${sub.slug}/${type.slug}`,
          category: category.name,
        });
      }
    }
  }
  return out;
}
export async function buildCityIndex() {
  const cities = await getCities();
  return cities.map((c) => ({ slug: c.slug, name: c.name, state: c.state }));
}
export async function popularCityIndex() {
  const cities = await getPopularCities();
  return cities.slice(0, 8).map((c) => ({ slug: c.slug, name: c.name, state: c.state }));
}
