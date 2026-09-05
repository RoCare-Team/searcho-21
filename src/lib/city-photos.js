/**
 * City artwork shipped with the site, keyed by locality slug.
 *
 * `locality_tb.locality_icon` is the column meant to hold this, but it is empty
 * for all 1,169 localities, so nothing resolves from the database alone. The
 * photographs themselves do exist — they are in `assets/img_city`, saved under
 * ad-hoc names (`beng-img.png`, `chainee-img.png`) that match no slug.
 *
 * So the filename mapping lives here, keyed by `locality_tb.locality_url`. It is
 * a fallback, not a source of truth: `getCities` prefers `locality_icon`
 * whenever the admin panel fills it in, and a city missing from this map simply
 * renders without a photo rather than breaking.
 */
export const CITY_PHOTOS = {
  mumbai: "mumbai-img.png",
  delhi: "delhi-img.png",
  bangalore: "beng-img.png",
  hyderabad: "hyd-img.png",
  chennai: "chainee-img.png",
  kolkata: "kol-img.png",
  jaipur: "jaipur-img.png",
  gurgaon: "gurgaon-img.png",
};
