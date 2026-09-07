import { Globe, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { fullAddress } from "@/lib/format";

/**
 * The ways to reach a listing, gathered in one sidebar card.
 *
 * Every row is a stored column on free_listing_tb, so a listing that has only a
 * phone number shows one row rather than a grid of blanks. The card disappears
 * entirely when none of them is filled in.
 */
export default function ContactCard({ business, className = "mt-4" }) {
  const address = fullAddress(business);
  const rows = [
    business.phone && {
      Icon: Phone,
      label: "Phone",
      value: `+91 ${business.phone}`,
      href: `tel:+91${business.phone}`,
    },
    business.whatsapp && {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: `+91 ${business.whatsapp}`,
      href: `https://wa.me/91${business.whatsapp}`,
      external: true,
    },
    business.email && {
      Icon: Mail,
      label: "Email",
      value: business.email,
      href: `mailto:${business.email}`,
    },
    business.website && {
      Icon: Globe,
      label: "Website",
      value: business.website.replace(/^https?:\/\//, ""),
      href: business.website,
      external: true,
    },
    business.contactPerson && {
      Icon: User,
      label: business.designation || "Contact person",
      value: business.contactPerson,
    },
    address && { Icon: MapPin, label: "Address", value: address },
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="text-[17px] font-semibold text-navy-900">Contact details</h2>

      <ul className="mt-3 space-y-3.5">
        {rows.map(({ Icon, label, value, href, external }) => (
          <li key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <Icon className="h-4 w-4 text-brand-500" aria-hidden />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] uppercase tracking-wide text-ink-400">
                {label}
              </span>
              {href ? (
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
                  className="block break-words text-[15px] text-navy-900 transition-colors hover:text-brand-600"
                >
                  {value}
                </a>
              ) : (
                <span className="block break-words text-[15px] text-navy-900">{value}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
