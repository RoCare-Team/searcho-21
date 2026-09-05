import { notFound } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryTile from "@/components/CategoryTile";
import BusinessCard from "@/components/BusinessCard";
import FilterBar from "@/components/FilterBar";
import EmptyListings, { hasActiveFilters } from "@/components/EmptyListings";
import Pagination from "@/components/Pagination";
import Section, { ChipLink } from "@/components/Section";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { getBusinesses, getCategories, getCities, getCity } from "@/lib/api";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/format";
/** Pre-render the popular cities; the rest are generated on demand. */
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
    sort: query.sort ?? undefined,
    page,
    perPage: 10,
  });
  const filtered = hasActiveFilters(query);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${city.slug}` },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      {/* ---------------- City header ---------------- */}
      <section className="border-b border-line bg-white">
        <div className="shell py-8 lg:py-10">
          <Breadcrumb items={crumbs} />

          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">Local services in {city.name}</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-500">
            Browse verified service providers across {city.name}, {city.state}. Compare their
            service areas and working hours, then call them directly or request a quote.
          </p>

          <div className="mt-6 max-w-2xl">
            <SearchBar
              variant="compact"
              services={await buildServiceIndex()}
              cities={await buildCityIndex()}
              popularCities={await popularCityIndex()}
              defaultCitySlug={city.slug}
            />
          </div>
        </div>
      </section>

      <div className="shell">
        {/* ---------------- Categories ---------------- */}
        <Section
          title={`Top categories in ${city.name}`}
          description="Pick a category to see the providers available near you."
        >
          <ul className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-6 lg:grid-cols-8">
            {categories.flatMap((category) =>
              category.subCategories.map((sub) => (
                <li key={`${category.slug}/${sub.slug}`}>
                  <CategoryTile
                    name={sub.name}
                    slug={sub.slug}
                    path={`/${category.slug}/${sub.slug}`}
                  />
                </li>
              )),
            )}
          </ul>
        </Section>

        {/* ---------------- Listings ---------------- */}
        <Section
          title={`Service providers in ${city.name}`}
          description={
            listings.total > 0
              ? `${listings.total} ${listings.total === 1 ? "listing" : "listings"} available`
              : undefined
          }
        >
          <FilterBar options={{ localities: city.localities }} />

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
        </Section>

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
                    className="block truncate py-1 text-[13px] text-ink-700 transition-colors hover:text-brand-600"
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
      </div>
    </>
  );
}
