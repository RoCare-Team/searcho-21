/**
 * Cookie holding the visitor's chosen city.
 *
 * Kept in its own module because both client components (which set it) and the
 * server helper in `city-cookie.ts` (which reads it via `next/headers`) need the
 * name — and `next/headers` cannot be pulled into a client bundle.
 */
export const CITY_COOKIE = "s21_city";
/**
 * Written from the browser.
 *
 * No max-age, so this is a session cookie: the choice holds while the visitor
 * browses and is gone when the browser closes. A year-long cookie meant someone
 * who once picked a city could never get back to the neutral starting state,
 * which is not what the site should do on a fresh visit.
 */
export function cityCookieValue(slug) {
  return `${CITY_COOKIE}=${slug}; path=/; samesite=lax`;
}

/** Expires the cookie, returning the visitor to the "no city chosen" state. */
export function clearCityCookieValue() {
  return `${CITY_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
