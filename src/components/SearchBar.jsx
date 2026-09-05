"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import SearchSuggestions from "@/components/SearchSuggestions";
import { useCitySelection } from "@/components/CitySelection";
import { cityCookieValue } from "@/lib/city";
const RECENT_KEY = "s21:recent-searches";
const RECENT_LIMIT = 4;
function readRecent() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}
function writeRecent(term) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(0, RECENT_LIMIT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* Storage can be unavailable (private mode, blocked cookies) — ignore. */
  }
}
export default function SearchBar({
  services,
  cities,
  popularCities,
  defaultCitySlug,
  variant = "hero",
}) {
  const router = useRouter();
  const rootRef = useRef(null);
  const { city: chosenCity, openPicker } = useCitySelection();
  const initialCity = useMemo(() => {
    const slug = defaultCitySlug ?? chosenCity?.slug;
    return cities.find((c) => c.slug === slug) ?? null;
  }, [cities, defaultCitySlug, chosenCity]);
  const [service, setService] = useState("");
  const [location, setLocation] = useState(initialCity?.name ?? "");
  const [citySlug, setCitySlug] = useState(initialCity?.slug ?? "");
  const [openPanel, setOpenPanel] = useState(null);
  const [recent, setRecent] = useState([]);
  useEffect(() => setRecent(readRecent()), []);
  // Close the suggestion panel on outside click or Escape.
  useEffect(() => {
    if (!openPanel) return;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpenPanel(null);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpenPanel(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);
  const serviceMatches = useMemo(() => {
    const q = service.trim().toLowerCase();
    if (!q) return [];
    return services.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 6);
  }, [service, services]);
  const cityMatches = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) return [];
    return cities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [location, cities]);
  function go(path, term) {
    if (term) {
      writeRecent(term);
      setRecent(readRecent());
    }
    setOpenPanel(null);
    router.push(path);
  }
  function handleServicePick(picked) {
    setService(picked.label);
    const city = citySlug || chosenCity?.slug;
    if (!city) {
      openPicker();
      return;
    }
    go(`/${city}${picked.path}`, picked.label);
  }
  function handleCityPick(picked) {
    setLocation(picked.name);
    setCitySlug(picked.slug);
    setOpenPanel(null);
    // Remember it, so every city-scoped link on the site follows suit.
    document.cookie = cityCookieValue(picked.slug);
    router.refresh();
  }
  function handleSubmit(event) {
    event.preventDefault();
    const city = citySlug || chosenCity?.slug;
    if (!city) {
      openPicker();
      return;
    }
    const match =
      serviceMatches[0] ??
      services.find((s) => s.label.toLowerCase() === service.trim().toLowerCase());
    if (match) {
      go(`/${city}${match.path}`, match.label);
      return;
    }
    // Nothing matched — fall back to the city page, which lists every category.
    go(`/${city}`, service.trim() || undefined);
  }
  const isHero = variant === "hero";
  const fieldText = isHero ? "text-[15px]" : "text-sm";
  return (
    <div ref={rootRef} className="relative">
      <form
        onSubmit={handleSubmit}
        role="search"
        className={[
          "flex flex-col gap-2 rounded-xl border border-line bg-white p-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5",
          isHero ? "shadow-raised" : "shadow-card",
        ].join(" ")}
      >
        {/* Service field */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 sm:rounded-full">
          <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <label htmlFor="s21-service" className="sr-only">
            What service do you need?
          </label>
          <input
            id="s21-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            onFocus={() => setOpenPanel("service")}
            placeholder="What service do you need?"
            autoComplete="off"
            className={`w-full min-w-0 bg-transparent ${fieldText} text-ink-900 placeholder:text-ink-400 focus:outline-none`}
          />
        </div>

        <div className="hidden h-6 w-px bg-line sm:block" aria-hidden />

        {/* Location field */}
        <div className="flex min-w-0 items-center gap-2.5 rounded-lg px-3 py-2 sm:w-56 sm:rounded-full">
          <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <label htmlFor="s21-location" className="sr-only">
            Your city
          </label>
          <input
            id="s21-location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setCitySlug("");
            }}
            onFocus={() => setOpenPanel("location")}
            placeholder="Enter your city"
            autoComplete="off"
            className={`w-full min-w-0 bg-transparent ${fieldText} text-ink-900 placeholder:text-ink-400 focus:outline-none`}
          />
        </div>

        <button
          type="submit"
          className={[
            "shrink-0 rounded-lg bg-brand-500 font-medium text-white transition-colors hover:bg-brand-600 sm:rounded-full",
            isHero ? "px-6 py-2.5 text-sm" : "px-5 py-2 text-sm",
          ].join(" ")}
        >
          Search
        </button>
      </form>

      {openPanel && (
        <SearchSuggestions
          mode={openPanel}
          query={openPanel === "service" ? service : location}
          serviceMatches={serviceMatches}
          cityMatches={cityMatches}
          services={services}
          popularCities={popularCities}
          recent={recent}
          onPickService={handleServicePick}
          onPickCity={handleCityPick}
          onPickRecent={(term) => {
            setService(term);
            setOpenPanel("service");
          }}
        />
      )}
    </div>
  );
}
