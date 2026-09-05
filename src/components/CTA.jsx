import Link from "next/link";
import { Phone } from "lucide-react";
import { SUPPORT_PHONE } from "@/lib/seo";
import QuoteDialog from "@/components/QuoteDialog";
/**
 * Calm call-to-action band. Navy ground, one filled action, one quiet one —
 * used once per page at most.
 */
export default function CTA({ title, description, quoteContext, secondary }) {
  return (
    <section className="rounded-xl bg-navy-900 px-6 py-8 text-white sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <QuoteDialog
            label="Get Free Quotes"
            title="Tell us what you need"
            context={quoteContext}
            className="!px-5"
          />

          <a
            href={`tel:+91${SUPPORT_PHONE}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {SUPPORT_PHONE}
          </a>

          {secondary && (
            <Link
              href={secondary.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
