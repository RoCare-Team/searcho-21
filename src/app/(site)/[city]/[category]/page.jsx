import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryCard from "@/components/CategoryCard";
import BusinessCard from "@/components/BusinessCard";
import FilterBar from "@/components/FilterBar";
import EmptyListings, { hasActiveFilters } from "@/components/EmptyListings";
import Pagination from "@/components/Pagination";
import Section, { ChipLink } from "@/components/Section";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { getBusinesses, getCategory, getCity } from "@/lib/api";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/format";
export async function generateMetadata({ params }) {
  const { city: citySlug, category: categorySlug } = await params;
  const [city, category] = await Promise.all([getCity(citySlug), getCategory(categorySlug)]);
  if (!city || !category) return {};
  return buildMetadata({
    title: `${category.name} Services in ${city.name} — Searcho21`,
    description:
      `Find verified ${category.name.toLowerCase()} service providers in ${city.name}. ${category.description ?? ""} Compare service areas and get free quotes.`.trim(),
    path: `/${city.slug}/${category.slug}`,
    keywords: category.keywords,
  });
}
export default async function CategoryPage({ params, searchParams }) {
  const { city: citySlug, category: categorySlug } = await params;
  const query = await searchParams;
  const [city, category] = await Promise.all([getCity(citySlug), getCategory(categorySlug)]);
  if (!city || !category) notFound();
  const page = Number(query.page) || 1;
  const listings = await getBusinesses({
    citySlug: city.slug,
    categorySlug: category.slug,
    verifiedOnly: query.verified === "1",
    locality: query.locality,
    serviceType: query.type,
    sort: query.sort ?? undefined,
    page,
    perPage: 10,
  });
  const filtered = hasActiveFilters(query);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: city.name, href: `/${city.slug}` },
    { name: category.name, href: `/${city.slug}/${category.slug}` },
  ];
  const basePath = `/${city.slug}/${category.slug}`;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="border-b border-line bg-white">
        <div className="shell py-8 lg:py-10">
          <Breadcrumb items={crumbs} />
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
            {category.name} categories in {city.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-500">
              {category.description} Browse providers across {city.name}, {city.state}.
            </p>
          )}
        </div>
      </section>

      <div className="shell">
        <Section title={`Choose a ${category.name.toLowerCase()} service`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.subCategories.map((sub) => (
              <CategoryCard
                key={sub.slug}
                name={sub.name}
                description={sub.description}
                slug={sub.slug}
                href={`${basePath}/${sub.slug}`}
              />
            ))}
          </div>
        </Section>

        <Section
          title={`${category.name} providers in ${city.name}`}
          description={
            listings.total > 0
              ? `${listings.total} ${listings.total === 1 ? "listing" : "listings"} available`
              : undefined
          }
        >
          {(listings.total > 0 || filtered) && (
            <FilterBar
              options={{
                localities: city.localities,
                categories: category.subCategories.map((s) => ({ slug: s.slug, name: s.name })),
              }}
            />
          )}

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
                basePath={basePath}
                searchParams={query}
              />
            </>
          ) : (
            <EmptyListings
              filtered={filtered}
              subject={`${category.name} providers in ${city.name}`}
              quoteContext={`${category.name} requirement in ${city.name}.`}
              resetHref={basePath}
            />
          )}
        </Section>

        {city.nearby && city.nearby.length > 0 && (
          <Section title={`${category.name} in nearby cities`}>
            <ul className="flex flex-wrap gap-2">
              {city.nearby.slice(0, 12).map((slug) => (
                <li key={slug}>
                  <ChipLink href={`/${slug}/${category.slug}`}>{titleCaseSlug(slug)}</ChipLink>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="pb-14">
          <CTA
            title={`Looking for ${category.name.toLowerCase()} help in ${city.name}?`}
            description="Tell us what you need and providers nearby will get back to you with their charges."
            quoteContext={`${category.name} requirement in ${city.name}.`}
          />
        </div>
      </div>
    </>
  );
}
