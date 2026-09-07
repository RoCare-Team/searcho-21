import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
import BusinessLogo from "@/components/BusinessLogo";
import VerifiedBadge from "@/components/VerifiedBadge";

/**
 * Sidebar panel of the most-viewed listings, shown under the enquiry form.
 *
 * Ranked by `free_listing_tb.views`, the one popularity signal the schema
 * actually stores — there is no rating or review table, so nothing here claims
 * a score. The position is numbered and the count printed, so the ordering is
 * explained rather than asserted.
 */
export default function TopListings({ businesses, title = "Most viewed" }) {
  if (businesses.length === 0) return null;

  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-line px-4 py-3 text-[17px] font-semibold text-navy-900">
        {title}
      </h2>

      <ul className="divide-y divide-line">
        {businesses.map((business, index) => (
          <li key={business.id}>
            <Link
              href={`/business/${business.slug}/${business.id}`}
              className="group flex gap-3 px-4 py-3.5 transition-colors hover:bg-canvas"
            >
              <span className="relative shrink-0">
                <BusinessLogo
                  name={business.name}
                  src={business.logoUrl}
                  size={48}
                  className="h-12 w-12"
                />
                {/* The position, so the panel's order reads as deliberate. */}
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[12.5px] font-semibold text-white">
                  {index + 1}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                {/* Two lines rather than one truncated: several listing names
                    are long enough that a single line showed only the brand. */}
                <span className="flex items-start gap-1.5">
                  <span className="line-clamp-2-safe text-[15.5px] font-semibold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
                    {business.name}
                  </span>
                  {business.verified && (
                    <span className="mt-0.5 shrink-0">
                      <VerifiedBadge compact />
                    </span>
                  )}
                </span>

                {business.address.locality && (
                  <span className="mt-1 flex items-center gap-1 text-[14px] text-ink-500">
                    <MapPin className="h-3 w-3 shrink-0 text-ink-400" aria-hidden />
                    <span className="truncate">{business.address.locality}</span>
                  </span>
                )}

                {typeof business.views === "number" && business.views > 0 && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-canvas px-1.5 py-0.5 text-[13.5px] text-ink-500">
                    <Eye className="h-3 w-3 text-ink-400" aria-hidden />
                    {business.views.toLocaleString("en-IN")} views
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
