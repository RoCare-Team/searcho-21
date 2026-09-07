import { Clock } from "lucide-react";

/**
 * Weekly opening hours, parsed from free_listing_tb.closing_time.
 *
 * A day with no value stored is shown as closed rather than hidden, so the
 * week always reads as seven complete rows.
 *
 * Note there is deliberately no "Open now" badge: this renders on the server,
 * and a cached page would keep asserting a status computed at build time long
 * after it stopped being true.
 */
export default function OpeningHours({ hours, className = "" }) {
  if (!hours?.length) return null;

  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="flex items-center gap-2 text-[17px] font-semibold text-navy-900">
        <Clock className="h-4 w-4 text-brand-500" aria-hidden />
        Opening hours
      </h2>

      <dl className="mt-3 divide-y divide-line">
        {hours.map((entry) => (
          <div key={entry.day} className="flex items-center justify-between gap-4 py-2">
            <dt className="text-[14.5px] text-ink-600">{entry.day}</dt>
            <dd className={`text-[14.5px] ${entry.hours ? "text-navy-900" : "text-ink-400"}`}>
              {entry.hours || "Closed"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
