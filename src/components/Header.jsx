import { getCategories, getPopularCities } from "@/lib/api";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import HeaderClient from "@/components/HeaderClient";
/**
 * Server shell for the site header. It loads the navigation data once and hands
 * it to the small client component that owns the menu/search interactions.
 */
export default async function Header() {
  const [categories, cities] = await Promise.all([getCategories(), getPopularCities()]);
  const nav = {
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      subCategories: c.subCategories.map((s) => ({ slug: s.slug, name: s.name })),
    })),
    cities: cities.slice(0, 12).map((c) => ({ slug: c.slug, name: c.name })),
  };
  return (
    <HeaderClient
      nav={nav}
      services={await buildServiceIndex()}
      allCities={await buildCityIndex()}
      popularCities={await popularCityIndex()}
    />
  );
}
export { default as Logo } from "@/components/Logo";
