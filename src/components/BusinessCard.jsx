import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Eye, MapPin, MessageCircle } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import BusinessLogo from "@/components/BusinessLogo";
import RevealPhone from "@/components/RevealPhone";
import QuoteDialog from "@/components/QuoteDialog";
import { shortAddress } from "@/lib/format";

/**
 * Listing card used on city, category and SEO pages.
 *
 * Laid out like a directory result: a square thumbnail on the left, then the
 * name, the facts that help someone choose, and the actions on one row.
 *
 * Every field comes straight from free_listing_tb. The schema stores no rating
 * or review count, so neither is shown; `views`, `verified_status` and
 * `estb_year` are the real signals available.
 *
 * Action hierarchy is deliberate: the phone is the filled button, because
 * calling is what a directory visitor is here to do; Get Quote and WhatsApp are
 * outlined, and View Profile is a plain link.
 */
export default function BusinessCard({ business }) {
  const href = `/business/${business.slug}/${business.id}`;
  const address = shortAddress(business);
  const years = yearsInBusiness(business.establishedYear);
  // Banner first, matching the live site: only 85 listings have gallery photos
  // and 186 have a banner of their own, but every listing falls back to its
  // category's default banner, so the frame is never empty.
  const photos = (business.gallery ?? []).filter((image) => image.src);
  const image = business.bannerUrl ?? photos[0]?.src ?? null;
  const extraPhotos = business.bannerUrl ? photos.length : Math.max(0, photos.length - 1);

  return (
    <article className="card card-hover p-4 transition-shadow">
      <div className="flex gap-4">
        <Link href={href} className="shrink-0">
          <BusinessLogo
            name={business.name}
            src={business.logoUrl}
            size={72}
            className="h-14 w-14 sm:h-[72px] sm:w-[72px]"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[17px] font-semibold text-navy-900 sm:text-[18.5px]">
              <Link href={href} className="transition-colors hover:text-brand-600">
                {business.name}
              </Link>
            </h3>
            {business.verified && <VerifiedBadge compact />}
          </div>

          {/* Facts worth scanning, all stored columns. */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-ink-500">
            {years !== null && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                {years === 0
                  ? "Opened this year"
                  : `${years} ${years === 1 ? "year" : "years"} in business`}
              </span>
            )}
            {typeof business.views === "number" && business.views > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                {business.views.toLocaleString("en-IN")} views
              </span>
            )}
          </div>

          {address && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-ink-600">
              <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              <span className="truncate">{address}</span>
            </p>
          )}

          {business.summary && (
            <p className="mt-1.5 truncate text-[15px] text-ink-500">{business.summary}</p>
          )}

          {business.categoryLabels.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {business.categoryLabels.map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[13.5px] text-ink-600"
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {image && (
          <Link
            href={href}
            className="relative hidden w-[236px] shrink-0 self-stretch overflow-hidden rounded-lg bg-canvas lg:block"
          >
            <Image
              src={image}
              alt=""
              fill
              loading="lazy"
              sizes="236px"
              className="object-cover object-center"
            />
            {extraPhotos > 0 && (
              <span className="absolute bottom-1 right-1 rounded bg-navy-900/75 px-1.5 py-0.5 text-[13px] font-medium text-white">
                +{extraPhotos} Photos
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <RevealPhone
          masked={business.phoneMasked}
          phone={business.phone}
          variant="button"
          className="min-w-0 flex-1 sm:flex-none"
        />

        {business.whatsapp && (
          <a
            href={`https://wa.me/91${business.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={`WhatsApp ${business.name}`}
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-4 text-[15.5px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas sm:flex-none"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
            WhatsApp
          </a>
        )}

        <QuoteDialog
          label="Send Enquiry"
          title={`Send an enquiry to ${business.name}`}
          context={`Your requirement is shared with ${business.name}${business.address.city ? `, ${business.address.city}` : ""}.`}
          variant="navy"
          className="!h-10 min-w-0 !flex-1 !px-4 !py-0 !text-[15.5px] sm:!flex-none"
        />

        <Link
          href={href}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas px-4 text-[15.5px] font-medium text-navy-900 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 sm:ml-auto sm:w-auto"
        >
          View Profile
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/**
 * Years since free_listing_tb.estb_year.
 *
 * mapListing has already reduced the stored datetime to a four-digit year, so
 * this only has to guard against it being absent or implausible; the badge is
 * left off rather than printing a nonsense age.
 */
function yearsInBusiness(established) {
  const year = Number(String(established ?? "").trim());
  if (!Number.isInteger(year)) return null;
  const now = new Date().getFullYear();
  if (year < 1900 || year > now) return null;
  return now - year;
}
