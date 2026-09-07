import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Brand card linking to that brand's listings.
 *
 * Shows the name rather than a logo, which is what the live site does and the
 * only thing the data supports: `brand_tb` is empty, so the logo files in
 * uploads/brand_image (named brand_<id>.png) have no id to resolve against, and
 * `cat_level_three_image` is one shared banner repeated across every brand in a
 * service type. Rendering that fallback produced six identical pictures with no
 * names on them.
 */
export default function BrandChip({ name, href, serviceLabel }) {
  return (
    <Link
      href={href}
      className="card card-hover group flex h-full min-h-[112px] w-full flex-col justify-between gap-3 p-5"
    >
      <span className="text-[17px] font-semibold leading-snug text-navy-900 transition-colors group-hover:text-brand-600">
        {shortName(name, serviceLabel)}
      </span>
      <span className="inline-flex items-center gap-1 text-[15px] font-medium text-brand-600">
        View providers
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}

/**
 * "Kent RO Repair Service" → "Kent RO" on a repair-service page.
 *
 * Level-three names embed their parent's service ("Kent RO Dealer",
 * "Aquaguard Repair Service"), so on a page that is already about that service
 * the suffix is repeated on every card. Trimmed only when it actually matches,
 * so an unexpected name is left alone rather than mangled.
 */
function shortName(name, serviceLabel) {
  if (!serviceLabel) return name;
  const suffix = serviceLabel.trim().toLowerCase();
  const value = name.trim();
  if (!suffix || !value.toLowerCase().endsWith(suffix)) return value;
  const trimmed = value.slice(0, value.length - suffix.length).trim();
  return trimmed || value;
}
