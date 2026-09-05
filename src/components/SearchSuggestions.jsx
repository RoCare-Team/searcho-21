"use client";
import { Clock, MapPin, Search, TrendingUp } from "lucide-react";
function Group({ title, children }) {
  return (
    <div className="py-2">
      <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      {children}
    </div>
  );
}
function Row({ icon, primary, secondary, onClick }) {
  return (
    <button
      type="button"
      // onMouseDown fires before the input's blur, so the click always registers.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-canvas"
    >
      <span className="text-ink-400">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink-900">{primary}</span>
        {secondary && <span className="block truncate text-xs text-ink-500">{secondary}</span>}
      </span>
    </button>
  );
}
/**
 * Suggestion panel shown when a search field is focused.
 * With no query it offers recent searches, popular services and popular cities;
 * with a query it filters the same indexes.
 */
export default function SearchSuggestions({
  mode,
  query,
  serviceMatches,
  cityMatches,
  services,
  popularCities,
  recent,
  onPickService,
  onPickCity,
  onPickRecent,
}) {
  const hasQuery = query.trim().length > 0;
  const popularServices = services
    .filter((s) =>
      [
        "Water Purifier Routine & Repair Service",
        "Air Conditioner Repair & Service",
        "Water Purifier Installation / Uninstallation",
        "Water Purifier Dealer",
        "Salon",
        "Mobile Repair",
      ].includes(s.label),
    )
    .slice(0, 5);
  return (
    <div className="fade-in absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-[22rem] overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-pop">
      {mode === "service" ? (
        hasQuery ? (
          serviceMatches.length > 0 ? (
            <Group title="Services">
              {serviceMatches.map((s) => (
                <Row
                  key={s.path}
                  icon={<Search className="h-4 w-4" aria-hidden />}
                  primary={s.label}
                  secondary={s.category}
                  onClick={() => onPickService(s)}
                />
              ))}
            </Group>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-ink-500">
              No matching service. Try “RO repair” or “AC service”.
            </p>
          )
        ) : (
          <>
            {recent.length > 0 && (
              <Group title="Recent searches">
                {recent.map((term) => (
                  <Row
                    key={term}
                    icon={<Clock className="h-4 w-4" aria-hidden />}
                    primary={term}
                    onClick={() => onPickRecent(term)}
                  />
                ))}
              </Group>
            )}
            <Group title="Popular services">
              {popularServices.map((s) => (
                <Row
                  key={s.path}
                  icon={<TrendingUp className="h-4 w-4" aria-hidden />}
                  primary={s.label}
                  secondary={s.category}
                  onClick={() => onPickService(s)}
                />
              ))}
            </Group>
          </>
        )
      ) : hasQuery ? (
        cityMatches.length > 0 ? (
          <Group title="Cities">
            {cityMatches.map((c) => (
              <Row
                key={c.slug}
                icon={<MapPin className="h-4 w-4" aria-hidden />}
                primary={c.name}
                secondary={c.state}
                onClick={() => onPickCity(c)}
              />
            ))}
          </Group>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-ink-500">No matching city.</p>
        )
      ) : (
        <Group title="Popular locations">
          {popularCities.map((c) => (
            <Row
              key={c.slug}
              icon={<MapPin className="h-4 w-4" aria-hidden />}
              primary={c.name}
              secondary={c.state}
              onClick={() => onPickCity(c)}
            />
          ))}
        </Group>
      )}
    </div>
  );
}
