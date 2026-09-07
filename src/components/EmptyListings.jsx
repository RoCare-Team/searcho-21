import Link from "next/link";
import { SearchX } from "lucide-react";
import QuoteDialog from "@/components/QuoteDialog";
/**
 * Empty state for a listing page.
 *
 * Distinguishes the two cases that look identical but need different wording:
 * results were filtered away (offer a reset), or nothing is listed here at all
 * (offer the enquiry form and the vendor sign-up instead of telling the visitor
 * to clear filters they never set).
 */
export default function EmptyListings({ filtered, subject, quoteContext, resetHref }) {
  if (filtered) {
    return (
      <div className="card flex flex-col items-center px-5 py-12 text-center">
        <SearchX className="h-7 w-7 text-ink-400" aria-hidden />
        <p className="mt-3 text-sm font-medium text-navy-900">No listings match these filters</p>
        <p className="mt-1 max-w-sm text-[15.5px] text-ink-500">
          Try removing a filter to see more providers.
        </p>
        {resetHref && (
          <Link
            href={resetHref}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-[15.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
          >
            Clear filters
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="card flex flex-col items-center px-5 py-12 text-center">
      <SearchX className="h-7 w-7 text-ink-400" aria-hidden />
      <p className="mt-3 text-sm font-medium text-navy-900">No {subject} yet</p>
      <p className="mt-1 max-w-md text-[15.5px] text-ink-500">
        We have not listed a provider here so far. Share your requirement and the Searcho21 team
        will find one for you.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <QuoteDialog
          label="Share your requirement"
          title="Tell us what you need"
          context={quoteContext}
          className="!px-4 !py-2 !text-[15.5px]"
        />
        <Link
          href="/list-your-business"
          className="rounded-lg border border-line px-4 py-2 text-[15.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
        >
          List your business
        </Link>
      </div>
    </div>
  );
}
/** True when the visitor has applied any listing filter. */
export function hasActiveFilters(query) {
  return Boolean(query.verified || query.locality || query.type);
}
