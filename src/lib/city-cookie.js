import { cookies } from "next/headers";
import { getCities } from "@/lib/api";
import { CITY_COOKIE } from "@/lib/city";
/**
 * The visitor's chosen city.
 *
 * Stored in a cookie rather than localStorage because the links on
 * server-rendered pages (`/[city]/...`) have to be built with it. Nothing
 * assumes a city on the visitor's behalf: when the cookie is absent the UI asks
 * them to pick one instead of silently sending them to some default.
 */
export { CITY_COOKIE } from "@/lib/city";
/** Reads the chosen city slug, validated against the real city list. */
export async function getSelectedCitySlug() {
  const store = await cookies();
  const slug = store.get(CITY_COOKIE)?.value;
  if (!slug) return null;
  const cities = await getCities();
  return cities.some((c) => c.slug === slug) ? slug : null;
}
/** The chosen city, or null when the visitor has not picked one yet. */
export async function getSelectedCity() {
  const slug = await getSelectedCitySlug();
  if (!slug) return null;
  const cities = await getCities();
  return cities.find((c) => c.slug === slug) ?? null;
}
