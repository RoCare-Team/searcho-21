import Link from "next/link";
import { Facebook, Instagram, Phone, Twitter } from "lucide-react";
import { getCategories, getPopularCities } from "@/lib/api";
import { SUPPORT_PHONE, SITE_TAGLINE } from "@/lib/seo";
import { CityLink } from "@/components/CitySelection";
/** Footer link groups, mirroring the sections the live site already publishes. */
const COMPANY = [
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/customer-care", label: "Customer Care" },
  { href: "/media", label: "Media" },
];
const FOR_BUSINESS = [
  { href: "/list-your-business", label: "List Your Business" },
  { href: "/login", label: "Login / Update Business" },
  { href: "/advertise-your-business", label: "Advertise Your Business" },
  { href: "/business-support", label: "Business Support" },
];
const LEGAL = [
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/faqs", label: "FAQs" },
  { href: "/report-a-bug", label: "Report a Bug" },
];
const SOCIAL = [
  { href: "https://www.facebook.com/", label: "Facebook", Icon: Facebook },
  { href: "https://twitter.com/", label: "Twitter", Icon: Twitter },
  { href: "https://www.instagram.com/", label: "Instagram", Icon: Instagram },
];
function Column({ title, links }) {
  return (
    <div>
      <h3 className="mb-3 text-[13.5px] font-semibold uppercase tracking-wide text-white/50">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[15.5px] text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default async function Footer() {
  const [cities, categories] = await Promise.all([getPopularCities(), getCategories()]);
  // The first few level-two services in taxonomy order — no hand-written list,
  // so a service added to the database shows up here on its own.
  const popularServices = categories
    .flatMap((category) =>
      category.subCategories.flatMap((sub) =>
        sub.serviceTypes.length > 0
          ? sub.serviceTypes.map((type) => ({
              path: `/${category.slug}/${sub.slug}/${type.slug}`,
              label: type.seoName ?? `${sub.name} ${type.name}`,
            }))
          : [{ path: `/${category.slug}/${sub.slug}`, label: sub.name }],
      ),
    )
    .slice(0, 6);
  return (
    <footer className="mt-20 bg-navy-900 text-white">
      <div className="shell py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-1">
            <p className="text-[20px] font-semibold tracking-tight">
              Searcho<span className="text-brand-500">21</span>
            </p>
            <p className="mt-2 max-w-xs text-[15.5px] leading-relaxed text-white/60">
              {SITE_TAGLINE}. Find verified local service experts near you.
            </p>
            <a
              href={`tel:+91${SUPPORT_PHONE}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-brand-300"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {SUPPORT_PHONE}
            </a>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="rounded-md border border-white/15 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <Column title="Company" links={COMPANY} />
          <Column title="For Businesses" links={FOR_BUSINESS} />
          <div>
            <h3 className="mb-3 text-[13.5px] font-semibold uppercase tracking-wide text-white/50">
              Popular Services
            </h3>
            <ul className="space-y-2">
              {popularServices.map((link) => (
                <li key={link.path}>
                  <CityLink
                    path={link.path}
                    className="text-left text-[15.5px] text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </CityLink>
                </li>
              ))}
            </ul>
          </div>
          <Column title="Legal" links={LEGAL} />
        </div>

        {/* Popular cities — a single wrapped row rather than a fifth tall column. */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <h3 className="mb-3 text-[13.5px] font-semibold uppercase tracking-wide text-white/50">
            Popular Cities
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/${city.slug}`}
                  className="text-[15.5px] text-white/70 transition-colors hover:text-white"
                >
                  {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Searcho21. All rights reserved.</p>
          <p>Made in India</p>
        </div>
      </div>
    </footer>
  );
}
