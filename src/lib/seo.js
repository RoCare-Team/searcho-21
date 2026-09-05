import { formatAddress } from "@/lib/format";
export const SITE_NAME = "Searcho21";
export const SITE_TAGLINE = "India's Fastest Growing Local Search Engine";
export const SUPPORT_PHONE = "9311587725";

/**
 * Homepage meta, copied from the live site's <head>.
 *
 * These are not in the database: global_setting_tb.website_keyword holds a
 * different, older string ("Find The Best Ro Service Nearest your Location"),
 * while the live homepage's blade template hardcodes the values below. Fill that
 * column in with these and `getGlobalSettings()` can supply them instead.
 */
export const SITE_DESCRIPTION =
  "Searcho21 is India's fasted growing search engine. You can search any kind of business and can also book product and services from variety of options.";
export const SITE_KEYWORDS =
  "local search engine, indian search engine, searcho21, directory website, business listing website";
export const SITE_AUTHOR = "searcho21";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.searcho21.com").replace(
  /\/$/,
  "",
);
/**
 * Whether this deployment may be indexed by search engines.
 *
 * Off unless SEARCHO21_ALLOW_INDEXING is explicitly "true". A development or
 * staging copy shares the production database, and therefore its titles,
 * descriptions and URLs — indexing one would compete with the real site for the
 * same queries, so the safe default is noindex and production opts in.
 */
export const ALLOW_INDEXING = process.env.SEARCHO21_ALLOW_INDEXING === "true";

export function absoluteUrl(path) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
/** Single place where every page's title, canonical, OG and robots are produced. */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  type = "website",
}) {
  const url = absoluteUrl(path);
  // A page opts out on its own merits, and the whole deployment can opt out.
  const indexable = index && ALLOW_INDEXING;
  return {
    title,
    description,
    keywords: normaliseKeywords(keywords),
    authors: [{ name: SITE_AUTHOR }],
    alternates: { canonical: url },
    robots: indexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: type === "profile" ? "website" : type,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
/**
 * Turns a stored meta_keyword value into the array Next expects.
 *
 * The columns hold a comma-separated string ("Home Appliance Care"), sometimes
 * empty. Returning undefined for an empty one keeps the tag off the page rather
 * than emitting an empty attribute.
 */
export function normaliseKeywords(value) {
  if (!value) return undefined;
  const list = (Array.isArray(value) ? value : String(value).split(","))
    .map((k) => String(k).trim())
    .filter(Boolean);
  return list.length > 0 ? [...new Set(list)] : undefined;
}

export function breadcrumbJsonLd(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}
export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
export function localBusinessJsonLd(business) {
  const url = absoluteUrl(`/business/${business.slug}/${business.id}`);
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    name: business.name,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: formatAddress([business.address.line1, business.address.line2]),
      addressLocality: business.address.locality ?? business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.pincode,
      addressCountry: "IN",
    },
  };
  if (business.summary) data.description = business.summary;
  if (business.phone) data.telephone = `+91${business.phone}`;
  if (business.email) data.email = business.email;
  if (business.logoUrl) data.logo = business.logoUrl;
  if (business.bannerUrl) data.image = business.bannerUrl;
  if (business.establishedYear) data.foundingDate = business.establishedYear;
  // The site stores social profiles in free_listing_tb.socale_links.
  const social = Object.values(business.social ?? {}).filter(Boolean);
  const sameAs = [business.website, ...social].filter(Boolean);
  if (sameAs.length > 0) data.sameAs = sameAs;
  // No aggregateRating: the schema has no reviews or ratings tables, and
  // emitting one without stored reviews would be structured-data spam.
  if (business.openingHours?.length) {
    data.openingHoursSpecification = business.openingHours
      .filter((h) => h.hours)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        description: h.hours,
      }));
  }
  if (business.keywords?.length) {
    data.makesOffer = business.keywords.map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    }));
  }
  return data;
}
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+91${SUPPORT_PHONE}`,
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };
}
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
