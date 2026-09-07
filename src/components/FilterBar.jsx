"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import FilterDrawer from "@/components/FilterDrawer";
const SORTS = [
  { value: "relevance", label: "Featured" },
  { value: "views", label: "Most viewed" },
  { value: "name", label: "Name (A–Z)" },
];
/**
 * Filter controls for listing pages.
 *
 * State lives in the URL query string so results stay linkable and the server
 * component can read the same values when the backend is connected.
 */
export default function FilterBar({ options }) {
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
  const active = {
    verified: params.get("verified"),
    locality: params.get("locality"),
    type: params.get("type"),
    sort: params.get("sort") ?? "relevance",
  };
  const activeCount = [active.verified, active.locality, active.type].filter(Boolean).length;
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      {/* Mobile: everything behind one drawer. */}
      <div className="lg:hidden">
        <FilterDrawer
          options={options}
          activeCount={activeCount}
          onChange={setParam}
          active={active}
        />
      </div>

      {/* Desktop: a compact inline bar. */}
      <div className="hidden min-w-0 flex-wrap items-center gap-2 lg:flex">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[15.5px] text-ink-500">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
        </span>

        {options.serviceTypes && options.serviceTypes.length > 0 && (
          <Select
            label="Service type"
            value={active.type ?? ""}
            onChange={(v) => setParam("type", v)}
            options={options.serviceTypes.map((t) => ({ value: t.slug, label: t.name }))}
          />
        )}

        {options.localities && options.localities.length > 0 && (
          <Select
            label="Locality"
            value={active.locality ?? ""}
            onChange={(v) => setParam("locality", v)}
            options={options.localities.map((l) => ({ value: l, label: l }))}
          />
        )}

        <button
          type="button"
          onClick={() => setParam("verified", active.verified ? null : "1")}
          aria-pressed={Boolean(active.verified)}
          className={`rounded-lg border px-3 py-1.5 text-[15.5px] transition-colors ${
            active.verified
              ? "border-success-200 bg-success-50 text-success-700"
              : "border-line bg-white text-ink-700 hover:border-line-strong"
          }`}
        >
          Verified only
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(pathname, { scroll: false })}
            className="inline-flex items-center gap-1 text-[15.5px] text-ink-500 transition-colors hover:text-brand-600"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        )}
      </div>

      {/* Sort sits on the right on every breakpoint. */}
      <div className="shrink-0">
        <Select
          label="Sort"
          value={active.sort}
          onChange={(v) => setParam("sort", v === "relevance" ? null : v)}
          options={SORTS}
          allowEmpty={false}
        />
      </div>
    </div>
  );
}
export function Select({ label, value, onChange, options, allowEmpty = true }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[15.5px] transition-colors focus-within:border-line-strong">
      <span className="text-ink-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[10rem] cursor-pointer bg-transparent pr-1 text-ink-900 focus:outline-none"
      >
        {allowEmpty && <option value="">Any</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
