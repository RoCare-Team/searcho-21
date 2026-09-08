/**
 * Turns a spoken sentence into a city and a service from the live indexes.
 *
 * Deliberately a plain function with no browser APIs and no network call: the
 * indexes it matches against are already built from the database
 * (`buildServiceIndex`, `buildCityIndex`), so "water purifier service" resolves
 * against the real taxonomy rather than a hand-written list of intents — and a
 * service added in the admin panel becomes speakable with no code change.
 */

/**
 * Words that carry no meaning for matching.
 *
 * Both languages, because people say "mujhe water purifier service chahiye" as
 * readily as "I need a water purifier service".
 */
const FILLER = new Set([
  // Hindi
  "mujhe",
  "muje",
  "hume",
  "chahiye",
  "chahie",
  "karna",
  "karwana",
  "karana",
  "hai",
  "he",
  "ho",
  "ka",
  "ki",
  "ke",
  "ko",
  "me",
  "mein",
  "par",
  "pe",
  "se",
  "aur",
  "ek",
  "koi",
  "kya",
  "kaun",
  "kahan",
  "wala",
  "wali",
  "yaar",
  "bhai",
  "please",
  "plz",
  "acha",
  "achha",
  "batao",
  "dikhao",
  "chahta",
  "chahti",
  // English
  "i",
  "a",
  "an",
  "the",
  "want",
  "need",
  "looking",
  "for",
  "find",
  "get",
  "my",
  "me",
  "near",
  "nearby",
  "best",
  "good",
  "top",
  "some",
  "any",
  "service",
  "services",
  "show",
  "search",
  "book",
  "hire",
]);

/** Lowercase, strip punctuation, split into meaningful words. */
function words(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function meaningful(text) {
  return words(text).filter((w) => !FILLER.has(w));
}

/**
 * The city named in the sentence, if any.
 *
 * Longest name first, so "navi mumbai" is not swallowed by "mumbai".
 */
export function matchCity(transcript, cities) {
  const said = ` ${words(transcript).join(" ")} `;
  let best = null;

  for (const city of cities) {
    const name = words(city.name).join(" ");
    if (!name) continue;
    if (!said.includes(` ${name} `)) continue;
    if (!best || name.length > best.matchedLength) {
      best = { city, matchedLength: name.length };
    }
  }

  return best?.city ?? null;
}

/**
 * The best-matching service, or null when nothing is close enough.
 *
 * Scores by how much of the entry's own name the speaker actually said, so
 * "water purifier" prefers the shorter "Water Purifier Dealer" over a longer
 * entry that happens to share one word. A single shared word is not enough —
 * that would send someone to a random page for saying "repair".
 */
export function matchService(transcript, services) {
  const said = new Set(meaningful(transcript));
  if (said.size === 0) return null;

  let best = null;
  for (const service of services) {
    const terms = meaningful(service.label);
    if (terms.length === 0) continue;

    const hits = terms.filter((term) => said.has(term)).length;
    if (hits === 0) continue;

    // Share of the service's own name that was spoken, nudged by the raw hit
    // count so a two-word match beats a one-word match at the same ratio.
    const score = hits / terms.length + hits * 0.01;
    if (!best || score > best.score) best = { service, score, hits };
  }

  if (!best) return null;
  // One word out of a multi-word name is a coincidence, not a request.
  if (best.hits < 2 && best.score < 1) return null;
  return best.service;
}

/**
 * Resolves a spoken sentence into somewhere to go.
 *
 * @returns {{ city: object|null, service: object|null, href: string|null }}
 *   `href` is null when there is no service to route to; the caller then falls
 *   back to the enquiry form rather than guessing.
 */
export function resolveVoiceQuery(transcript, { services, cities, fallbackCitySlug }) {
  const city = matchCity(transcript, cities);
  const service = matchService(transcript, services);
  const citySlug = city?.slug ?? fallbackCitySlug ?? null;

  return {
    city,
    service,
    href: service && citySlug ? `/${citySlug}${service.path}` : null,
  };
}
