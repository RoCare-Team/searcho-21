"use client";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
/** Mobile filter surface: a bottom sheet rather than a crowded inline bar. */
export default function FilterDrawer({ options, activeCount, active, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-[15.5px] font-medium text-navy-900"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-500 px-1.5 text-[13.5px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-navy-900/45"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          <div className="fade-in absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2 className="text-base font-semibold text-navy-900">Filters</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close filters"
                className="rounded-md p-1.5 text-ink-500"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="space-y-6 px-5 py-5">
              {options.serviceTypes && options.serviceTypes.length > 0 && (
                <Group title="Service type">
                  <ChipRow
                    value={active.type}
                    onChange={(v) => onChange("type", v)}
                    items={options.serviceTypes.map((t) => ({ value: t.slug, label: t.name }))}
                  />
                </Group>
              )}

              <Group title="Verification">
                <ChipRow
                  value={active.verified}
                  onChange={(v) => onChange("verified", v)}
                  items={[{ value: "1", label: "Verified only" }]}
                />
              </Group>

              {options.localities && options.localities.length > 0 && (
                <Group title="Locality">
                  <ChipRow
                    value={active.locality}
                    onChange={(v) => onChange("locality", v)}
                    items={options.localities.map((l) => ({ value: l, label: l }))}
                  />
                </Group>
              )}
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-line bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  ["verified", "locality", "type"].forEach((k) => onChange(k, null));
                }}
                className="flex-1 rounded-lg border border-line py-2.5 text-sm font-medium text-navy-900"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function Group({ title, children }) {
  return (
    <div>
      <p className="mb-2.5 text-[15.5px] font-medium text-navy-900">{title}</p>
      {children}
    </div>
  );
}
function ChipRow({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(isActive ? null : item.value)}
            className={`rounded-full border px-3 py-1.5 text-[15.5px] transition-colors ${
              isActive
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-line bg-white text-ink-700"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
