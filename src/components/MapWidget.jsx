import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";

/**
 * Local-area card for the listing sidebar.
 *
 * There is no map yet, and deliberately no fake one: `free_listing_tb` has no
 * latitude or longitude column, so nothing here could be plotted. Rather than
 * showing a decorative image of a map that pins nothing, this lists the real
 * localities the page already knows about — the same names the locality filter
 * uses — and each one filters the results.
 *
 * When coordinates are added to the schema, give this component a `points`
 * prop and render the map above the list; the surrounding layout will not need
 * to change.
 */
export default function MapWidget({ cityName, localities = [], basePath, points }) {
  if (localities.length === 0 && !points) return null;

  return (
    <section className="card overflow-hidden">
      <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-[17px] font-semibold text-navy-900">
        <MapPin className="h-4 w-4 text-brand-500" aria-hidden />
        Areas in {cityName}
      </h2>

      <ul className="flex flex-wrap gap-2 p-4">
        {localities.slice(0, 10).map((locality) => (
          <li key={locality}>
            <Link
              href={`${basePath}?locality=${encodeURIComponent(locality)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[14.5px] text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              <Navigation className="h-3 w-3 text-ink-400" aria-hidden />
              {locality}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
