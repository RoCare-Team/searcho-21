import Link from "next/link";
import { Eye, MapPin, MessageCircle, Phone } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import BusinessLogo from "@/components/BusinessLogo";
import RevealPhone from "@/components/RevealPhone";
import QuoteDialog from "@/components/QuoteDialog";
import { shortAddress } from "@/lib/format";
/**
 * Listing card used on city, category and SEO pages.
 *
 * Fields come straight from free_listing_tb. The schema stores no rating or
 * review count, so neither is shown; `views` is the real signal available.
 *
 * Action hierarchy is deliberate: Get Quote is the single filled button,
 * Call and WhatsApp are outlined, and View Profile is a plain link.
 */
export default function BusinessCard({ business }) {
  const href = `/business/${business.slug}/${business.id}`;
  const address = shortAddress(business);
  return (
    <article className="card card-hover p-4 sm:p-5">
      <div className="flex gap-4">
        <BusinessLogo
          name={business.name}
          src={business.logoUrl}
          size={56}
          className="h-12 w-12 sm:h-14 sm:w-14"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[15px] font-semibold text-navy-900 sm:text-base">
              <Link href={href} className="transition-colors hover:text-brand-600">
                {business.name}
              </Link>
            </h3>
            {business.verified && <VerifiedBadge compact />}
          </div>

          {business.summary && (
            <p className="line-clamp-2-safe mt-1.5 text-[13px] leading-snug text-ink-500">
              {business.summary}
            </p>
          )}

          {address && (
            <p className="mt-2 flex items-start gap-1.5 text-[13px] text-ink-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
              <span className="min-w-0">{address}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <RevealPhone masked={business.phoneMasked} phone={business.phone} />
            {typeof business.views === "number" && business.views > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {business.views.toLocaleString("en-IN")} views
              </span>
            )}
          </div>

          {business.categoryLabels.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {business.categoryLabels.map((label) => (
                <li
                  key={label}
                  className="rounded border border-line bg-canvas px-2 py-0.5 text-[11px] text-ink-500"
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <QuoteDialog
          label="Get Quote"
          title={`Get a quote from ${business.name}`}
          context={`Your requirement is shared with ${business.name}${business.address.city ? `, ${business.address.city}` : ""}.`}
          className="!px-4 !py-2 !text-[13px]"
        />

        {business.phone && (
          <a
            href={`tel:+91${business.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            Call
          </a>
        )}

        {business.whatsapp && (
          <a
            href={`https://wa.me/91${business.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            WhatsApp
          </a>
        )}

        <Link
          href={href}
          className="ml-auto text-[13px] font-medium text-ink-500 transition-colors hover:text-brand-600"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
