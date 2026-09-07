"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { cityCookieValue, clearCityCookieValue } from "@/lib/city";
const CityContext = createContext({ city: null, openPicker: () => {} });
export function useCitySelection() {
  return useContext(CityContext);
}
/**
 * Holds the visitor's chosen city and owns the single picker dialog.
 *
 * Every URL on the site is city-scoped, so a link cannot be built without one.
 * Rather than quietly defaulting to a city the visitor never picked, links that
 * need one open this picker instead (see `CityLink`).
 */
export function CitySelectionProvider({ selected, popular, all, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const openPicker = useCallback(() => setIsOpen(true), []);

  /**
   * The city the page is actually about.
   *
   * A city-scoped URL wins over the remembered cookie: landing on /mumbai from
   * a search result while the cookie still said Gurgaon left the header naming
   * one city and the listings showing another.
   *
   * Applied after mount rather than during render. The server has only the
   * cookie to go on, so deriving this from the pathname at render time made the
   * first client render disagree with the server's HTML — a hydration mismatch
   * that React reported and then re-rendered the whole tree to recover from.
   */
  const [urlCity, setUrlCity] = useState(null);

  useEffect(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    const match = first ? (all.find((c) => c.slug === first) ?? null) : null;
    setUrlCity(match);
    // Keep the cookie honest for the next page, too.
    if (match && match.slug !== selected?.slug) {
      document.cookie = cityCookieValue(match.slug);
    }
  }, [pathname, all, selected]);

  const city = urlCity ?? selected;

  // Every URL on the site is city-scoped, so a visitor without a city cannot
  // follow a single service link. The live site asks on arrival, and so does
  // this — but only when the URL does not already name one, or landing straight
  // on /mumbai would greet the visitor with a picker for a city they just chose.
  useEffect(() => {
    if (!city) setIsOpen(true);
  }, [city]);

  const value = useMemo(() => ({ city, openPicker }), [city, openPicker]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return all.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 12);
  }, [query, all]);
  function clearChoice() {
    document.cookie = clearCityCookieValue();
    setIsOpen(false);
    setQuery("");
    router.refresh();
  }

  /**
   * Where picking a city should take the visitor.
   *
   * Mirrors WebController's locality dropdown, which links straight to the
   * chosen locality: from the homepage to "/<city>", and from a city-scoped
   * page to the same page under the new city — its get_locality_ajax_wp emits
   * "/<locality>/<service path>" for exactly that. Pages that are not
   * city-scoped (a business profile, About, Login) stay where they are; only
   * their links change.
   */
  function destinationFor(slug) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${slug}`;
    const isCityScoped = all.some((c) => c.slug === segments[0]);
    if (!isCityScoped) return null;
    return `/${[slug, ...segments.slice(1)].join("/")}`;
  }

  function choose(slug) {
    document.cookie = cityCookieValue(slug);
    setIsOpen(false);
    setQuery("");

    const target = destinationFor(slug);
    if (target) {
      router.push(target);
      return;
    }
    // Server components build the city-scoped links, so re-render them.
    router.refresh();
  }
  return (
    <CityContext.Provider value={value}>
      {children}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose your city"
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
        >
          <div
            className="absolute inset-0 bg-navy-900/45"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          <div className="fade-in relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-xl">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 className="text-base font-semibold text-navy-900">Choose your city</h2>
                <p className="mt-0.5 text-[15.5px] text-ink-500">
                  Listings are shown for the city you pick.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-500 transition-colors hover:bg-canvas"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="border-b border-line p-5 pb-4">
              <label htmlFor="city-search" className="sr-only">
                Search for your city
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                <input
                  id="city-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for your city"
                  autoComplete="off"
                  className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {query.trim() ? (
                matches.length > 0 ? (
                  <ul className="space-y-1">
                    {matches.map((c) => (
                      <li key={c.slug}>
                        <button
                          type="button"
                          onClick={() => choose(c.slug)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink-900 transition-colors hover:bg-canvas"
                        >
                          {c.name}
                          <span className="text-xs text-ink-400">{c.state}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-ink-500">
                    No city matches &ldquo;{query.trim()}&rdquo;.
                  </p>
                )
              ) : (
                <>
                  <p className="mb-3 text-[13.5px] font-semibold uppercase tracking-wide text-ink-400">
                    Popular cities
                  </p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {popular.map((c) => {
                      const isActive = city?.slug === c.slug;
                      return (
                        <li key={c.slug}>
                          <button
                            type="button"
                            onClick={() => choose(c.slug)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? "border-brand-300 bg-brand-50 font-medium text-brand-700"
                                : "border-line text-ink-700 hover:border-line-strong hover:bg-canvas"
                            }`}
                          >
                            {c.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            {city && (
              <div className="border-t border-line px-5 py-3">
                <button
                  type="button"
                  onClick={clearChoice}
                  className="text-[15.5px] text-ink-500 transition-colors hover:text-brand-600"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CityContext.Provider>
  );
}
/** Header chip showing the active city, or prompting for one. */
export function CityChip() {
  const { city, openPicker } = useCitySelection();
  return (
    <button
      type="button"
      onClick={openPicker}
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[15.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
    >
      <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
      {city ? city.name : "Select city"}
      <ChevronDown className="h-3.5 w-3.5 text-ink-400" aria-hidden />
    </button>
  );
}
/**
 * A link to a city-scoped page, given the path *after* the city segment.
 *
 * With no city chosen there is nothing sensible to link to, so it opens the
 * picker instead of guessing one.
 */
export function CityLink({ path, className, children, ...rest }) {
  const { city, openPicker } = useCitySelection();
  if (!city) {
    // A button does not fill its container the way a block-level <a> does, so
    // callers styling this as a card would otherwise collapse to zero width.
    return (
      <button type="button" onClick={openPicker} className={className} {...rest}>
        {children}
      </button>
    );
  }
  return (
    <Link href={`/${city.slug}${path}`} className={className} {...rest}>
      {children}
    </Link>
  );
}
