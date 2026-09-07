"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

/**
 * Vertical filter panel for the listing pages' left column.
 *
 * Shares the horizontal `FilterBar`'s contract exactly: every choice is a URL
 * query parameter, so results stay linkable and the server component reads the
 * same values. This is the wide-screen layout of the same idea — below `lg` the
 * page still uses FilterBar's drawer.
 *
 * The counts beside each service type are real: they come from the mapping
 * table the listings themselves are filtered on.
 */
export default function FilterPanel({ serviceTypes = [], localities = [], counts }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const activeType = params.get("type");
  const activeLocality = params.get("locality");
  const verifiedOnly = params.get("verified") === "1";
  const hasAny = Boolean(activeType || activeLocality || verifiedOnly);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-navy-900">Filter providers</h2>
        <SlidersHorizontal className="h-4 w-4 text-ink-400" aria-hidden />
      </div>

      {serviceTypes.length > 0 && (
        <fieldset className="mt-4">
          <legend className="text-[14.5px] font-semibold text-navy-900">Service type</legend>
          <ul className="mt-2 space-y-1.5">
            {serviceTypes.map((type) => (
              <li key={type.slug}>
                <label className="flex cursor-pointer items-center gap-2.5 text-[15.5px] text-ink-700">
                  <input
                    type="checkbox"
                    checked={activeType === type.slug}
                    onChange={() => setParam("type", activeType === type.slug ? null : type.slug)}
                    className="h-4 w-4 shrink-0 accent-brand-500"
                  />
                  <span className="min-w-0 flex-1 truncate">{type.name}</span>
                  {typeof counts?.[type.slug] === "number" && (
                    <span className="shrink-0 text-[14px] text-ink-400">
                      {counts[type.slug].toLocaleString("en-IN")}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {localities.length > 0 && (
        <div className="mt-5">
          <label
            htmlFor="filter-locality"
            className="block text-[14.5px] font-semibold text-navy-900"
          >
            Locality
          </label>
          <select
            id="filter-locality"
            value={activeLocality ?? ""}
            onChange={(e) => setParam("locality", e.target.value || null)}
            className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-[15.5px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="">Any area</option>
            {localities.map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-[15.5px] text-ink-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={() => setParam("verified", verifiedOnly ? null : "1")}
            className="h-4 w-4 shrink-0 accent-brand-500"
          />
          Verified providers only
        </label>
      </div>

      {hasAny && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="mt-4 h-11 w-full rounded-lg border border-line text-[15.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
