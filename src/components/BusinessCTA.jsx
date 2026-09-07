import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

/**
 * Full-width vendor acquisition strip, closing a listing page.
 *
 * Placed where a provider browsing their own city and service will actually
 * reach it, rather than only in the footer.
 */
export default function BusinessCTA({ subject, cityName }) {
  return (
    <section className="mb-12 flex flex-col items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-6">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
        <Store className="h-6 w-6 text-brand-500" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[19px] font-semibold text-navy-900">
          Are you {article(subject)} {subject} provider?
        </p>
        <p className="mt-1 text-[15.5px] text-ink-600">
          List your business on Searcho21 and reach customers looking for you in {cityName}.
        </p>
      </div>

      <Link
        href="/list-your-business"
        className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-[16.5px] font-medium text-white transition-colors hover:bg-brand-600 sm:w-auto"
      >
        List Your Business
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

/** "an AC repair" vs "a water purifier" — the service names start either way. */
function article(subject) {
  return /^[aeiou]/i.test(String(subject).trim()) ? "an" : "a";
}
