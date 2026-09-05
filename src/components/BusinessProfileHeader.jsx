import Image from "next/image";
import { Eye, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import BusinessLogo from "@/components/BusinessLogo";
import QuoteDialog from "@/components/QuoteDialog";
import { fullAddress } from "@/lib/format";
/**
 * Identity block at the top of a business profile.
 *
 * Renders free_listing_tb.banner_image when the listing has one; otherwise the
 * card starts at the identity row rather than showing a placeholder band.
 */
export default function BusinessProfileHeader({ business }) {
  const address = fullAddress(business);
  return (
    <div className="card overflow-hidden">
      {business.bannerUrl && (
        <div className="relative h-36 w-full bg-canvas sm:h-48">
          <Image
            src={business.bannerUrl}
            alt={`${business.name} banner`}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <BusinessLogo name={business.name} src={business.logoUrl} size={64} />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="text-xl font-semibold sm:text-2xl">{business.name}</h1>
                {business.verified && <VerifiedBadge />}
              </div>

              {typeof business.views === "number" && business.views > 0 && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-ink-500">
                  <Eye className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                  {business.views.toLocaleString("en-IN")} profile views
                </p>
              )}

              {address && (
                <address className="mt-3 flex items-start gap-2 text-[13px] not-italic text-ink-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                  <span>{address}</span>
                </address>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px]">
                {business.phone && (
                  <a
                    href={`tel:+91${business.phone}`}
                    className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-brand-600"
                  >
                    <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    +91 {business.phone}
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-brand-600"
                  >
                    <Mail className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    {business.email}
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-brand-600"
                  >
                    <Globe className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Desktop action stack — hidden on mobile, where the sticky bar takes over. */}
          <div className="hidden shrink-0 flex-col gap-2 lg:flex lg:w-52">
            <QuoteDialog
              label="Get Quote"
              title={`Get a quote from ${business.name}`}
              context={`Your requirement is shared with ${business.name}${business.address.city ? `, ${business.address.city}` : ""}.`}
            />

            <QuoteDialog
              label="Book Service"
              variant="outline"
              title={`Book a service with ${business.name}`}
              context={`Share your preferred date and the issue; ${business.name} will confirm the slot.`}
            />

            <div className="flex gap-2">
              {business.phone && (
                <a
                  href={`tel:+91${business.phone}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
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
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Chat
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
