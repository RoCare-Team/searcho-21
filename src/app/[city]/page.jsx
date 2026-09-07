import { notFound } from "next/navigation";
import { Check, MapPin, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import CardSlider from "@/components/CardSlider";
import CategoryIcon from "@/components/CategoryIcon";
import CategoryTile from "@/components/CategoryTile";
import BusinessCard from "@/components/BusinessCard";
import FilterBar from "@/components/FilterBar";
import EmptyListings, { hasActiveFilters } from "@/components/EmptyListings";
import Pagination from "@/components/Pagination";
import QuoteForm from "@/components/QuoteForm";
import TopListings from "@/components/TopListings";
import Section, { ChipLink } from "@/components/Section";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { getBusinesses, getCategories, getCities, getCity } from "@/lib/api";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/format";
import { assetUrl } from "@/lib/mappers";
/** Pre-render the popular cities; the rest are generated on demand. */
const WHY_SEARCHO21 = [
  "Verified listings carry a checked badge",
  "Service areas and working hours on every listing",
  "Contact the provider directly, no middleman",
  "Share your requirement once and compare replies",
];

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.filter((c) => c.popular).map((c) => ({ city: c.slug }));
}
export async function generateMetadata({ params }) {
  const { city: citySlug } = await params;
  const city = await getCity(citySlug);
  if (!city) return {};
  return buildMetadata({
    title: `Local Services in ${city.name} — Verified Experts Near You`,
    description: `Find verified water purifier, air conditioner, home care and repair service providers in ${city.name}, ${city.state}. Compare service areas and get free quotes on Searcho21.`,
    path: `/${city.slug}`,
  });
}
export default async function CityPage({ params, searchParams }) {
  const { city: citySlug } = await params;
  const query = await searchParams;
  const city = await getCity(citySlug);
  if (!city) notFound();
  const categories = await getCategories();
  const page = Number(query.page) || 1;
  const listings = await getBusinesses({
    citySlug: city.slug,
    verifiedOnly: query.verified === "1",
    locality: query.locality,
    serviceType: query.type,
    sort: query.sort ?? undefined,
    page,
    perPage: 10,
  });
  // The sidebar panel: the same city's listings, ordered by the views column.
  const mostViewed = await getBusinesses({ citySlug: city.slug, sort: "views", perPage: 5 });
  const cityPhoto = assetUrl("img_city", city.photo);
  const filtered = hasActiveFilters(query);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${city.slug}` },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      {/* ---------------- City header ----------------
          The city's own photograph carries the band where one exists; the eight
          cities the media library covers are listed in lib/city-photos.js, and
          the rest fall back to the plain tinted band. */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-r from-brand-50 to-white">
        {cityPhoto && (
          <>
            <Image
              src={cityPhoto}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-right"
            />
            {/* Left-weighted wash: the words sit on the left, so the photograph
                stays visible on the right instead of being dimmed flat. */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/30"
              aria-hidden
            />
          </>
        )}

        <div className="shell relative py-5 lg:py-7">
          <Breadcrumb items={crumbs} />

          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="mt-2.5 text-[24px] font-semibold sm:text-[28px]">
                Local services in {city.name}
              </h1>
              <p className="mt-1 text-[16px] text-ink-500">
                Find trusted service providers near you in{" "}
                {[city.name, city.state]
                  .filter((v, i, all) => v && all.indexOf(v) === i)
                  .join(", ")}
                .
              </p>
            </div>

            {listings.total > 0 && (
              <div className="hidden shrink-0 items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5 shadow-card lg:flex">
                <MapPin className="h-5 w-5 text-brand-500" aria-hidden />
                <span className="flex flex-col leading-tight">
                  <span className="text-[16.5px] font-semibold text-navy-900">{city.name}</span>
                  <span className="text-[14.5px] text-ink-500">
                    {listings.total.toLocaleString("en-IN")}{" "}
                    {listings.total === 1 ? "service provider" : "service providers"}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 max-w-2xl">
            <SearchBar
              variant="compact"
              services={await buildServiceIndex()}
              cities={await buildCityIndex()}
              popularCities={await popularCityIndex()}
              defaultCitySlug={city.slug}
            />
          </div>

          {/* Quick jumps into the busiest categories, straight from the tree. */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {categories
              .flatMap((category) =>
                category.subCategories.map((sub) => ({
                  name: sub.name,
                  slug: sub.slug,
                  href: `/${city.slug}/${category.slug}/${sub.slug}`,
                })),
              )
              .slice(0, 8)
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[15px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    <CategoryIcon slug={item.slug} className="h-3.5 w-3.5 text-brand-500" />
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <div className="shell">
        {/* ---------------- Listings ----------------
            Results on the left, a standing enquiry form on the right — the
            layout every directory listing page uses, and the one the service
            pages here already had. Someone who does not want to compare
            listings can state their requirement once instead. */}
        <div className="gap-8 py-8 lg:flex lg:items-start lg:py-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold sm:text-[24px]">
              Service providers in {city.name}
            </h2>
            {listings.total > 0 && (
              <p className="mt-1 text-sm text-ink-500">
                {listings.total.toLocaleString("en-IN")}{" "}
                {listings.total === 1 ? "listing" : "listings"} available
              </p>
            )}

            <div className="mt-5">
              <FilterBar options={{ localities: city.localities }} />
            </div>

            {listings.items.length > 0 ? (
              <>
                <div className="space-y-3">
                  {listings.items.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
                <Pagination
                  page={listings.page}
                  totalPages={listings.totalPages}
                  basePath={`/${city.slug}`}
                  searchParams={query}
                />
              </>
            ) : (
              <EmptyListings
                filtered={filtered}
                subject={`service providers in ${city.name}`}
                quoteContext={`Requirement in ${city.name}.`}
                resetHref={`/${city.slug}`}
              />
            )}
          </div>

          <aside className="mt-8 w-full shrink-0 lg:sticky lg:top-24 lg:mt-14 lg:w-80">
            <div className="card p-4">
              <h2 className="text-[17px] font-semibold">Get free quotes</h2>
              <p className="mt-0.5 text-[15px] text-ink-500">
                Tell us what you need. Providers in {city.name} will get back to you.
              </p>
              <div className="mt-3">
                <QuoteForm compact context={`Requirement in ${city.name}, ${city.state}.`} />
              </div>
            </div>

            <div className="mt-4">
              <TopListings businesses={mostViewed.items} title={`Most viewed in ${city.name}`} />
            </div>

            {/* What the site does, not what it scores. Every line here is a
                property of the product, so none of it needs a number behind
                it — and the schema has no ratings to quote anyway. */}
            <div className="card mt-4 p-4">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-navy-900">
                <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden />
                Why choose Searcho21
              </h2>
              <ul className="mt-3 space-y-2">
                {WHY_SEARCHO21.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[15px] text-ink-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-600" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* ---------------- Categories ----------------
            Below the listings, not above them: the page exists to show
            providers, and a category row at the top pushed them under the fold.
            One scrolling row rather than a wrapping eight-column grid, where
            every tile truncated ("Bathroom Cleaning" became "Bathro…"). */}
        <section className="border-t border-line py-8">
          <h2 className="text-[17px] font-semibold text-navy-900">Top categories in {city.name}</h2>
          <CardSlider className="mt-3" gapClass="gap-3">
            {categories.flatMap((category) =>
              category.subCategories.map((sub) => (
                <li
                  key={`${category.slug}/${sub.slug}`}
                  className="flex w-[60%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] lg:w-[calc((100%-4rem)/5)]"
                >
                  <CategoryTile
                    name={sub.name}
                    slug={sub.slug}
                    path={`/${category.slug}/${sub.slug}`}
                  />
                </li>
              )),
            )}
          </CardSlider>
        </section>

        {/* ---------------- Nearby cities ---------------- */}
        {city.nearby && city.nearby.length > 0 && (
          <Section
            title="Also serving nearby"
            description={`Service providers in cities close to ${city.name}.`}
          >
            <ul className="flex flex-wrap gap-2">
              {city.nearby.map((slug) => (
                <li key={slug}>
                  <ChipLink href={`/${slug}`}>{titleCaseSlug(slug)}</ChipLink>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ---------------- Localities ---------------- */}
        {city.localities && city.localities.length > 0 && (
          <Section title={`Popular localities in ${city.name}`}>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {city.localities.map((locality) => (
                <li key={locality}>
                  <Link
                    href={`/${city.slug}?locality=${encodeURIComponent(locality)}`}
                    className="block truncate py-1 text-[15.5px] text-ink-700 transition-colors hover:text-brand-600"
                  >
                    {locality}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="pb-14">
          <CTA
            title={`Need a service expert in ${city.name}?`}
            description="Share your requirement once and matching providers will call you back with their charges and availability."
            quoteContext={`Your requirement is shared with providers in ${city.name}.`}
          />
        </div>
        {/* Vendor acquisition, where a provider scrolling their own city will
            actually see it. */}
        <section className="mb-10 flex flex-wrap items-center gap-4 rounded-xl border border-brand-100 bg-brand-50 px-5 py-4">
          <Store className="h-8 w-8 shrink-0 text-brand-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold text-navy-900">Are you a service provider?</p>
            <p className="mt-0.5 text-[15.5px] text-ink-500">
              List your business on Searcho21 and reach customers in {city.name}.
            </p>
          </div>
          <Link
            href="/list-your-business"
            className="shrink-0 rounded-lg bg-brand-500 px-4 py-2.5 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            List Your Business
          </Link>
        </section>
      </div>
    </>
  );
}
