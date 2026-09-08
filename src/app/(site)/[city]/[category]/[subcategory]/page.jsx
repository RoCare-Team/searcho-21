import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import CategoryCard from "@/components/CategoryCard";
import BusinessCard from "@/components/BusinessCard";
import BrandChip from "@/components/BrandChip";
import FilterBar from "@/components/FilterBar";
import EmptyListings, { hasActiveFilters } from "@/components/EmptyListings";
import Pagination from "@/components/Pagination";
import Section, { ChipLink } from "@/components/Section";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { getBusinesses, getCity, getSubCategory } from "@/lib/api";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/format";
export async function generateMetadata({ params }) {
  const { city: citySlug, category: categorySlug, subcategory } = await params;
  const [city, found] = await Promise.all([
    getCity(citySlug),
    getSubCategory(categorySlug, subcategory),
  ]);
  if (!city || !found) return {};
  return buildMetadata({
    title: `${found.subCategory.name} Service in ${city.name} @9311587725`,
    description: `Searcho21 lists verified ${found.subCategory.name.toLowerCase()} service providers in ${city.name}. Compare service areas and charges, then book at your doorstep.`,
    path: `/${city.slug}/${categorySlug}/${subcategory}`,
    keywords: found.subCategory.keywords,
  });
}
export default async function SubCategoryPage({ params, searchParams }) {
  const { city: citySlug, category: categorySlug, subcategory } = await params;
  const query = await searchParams;
  const [city, found] = await Promise.all([
    getCity(citySlug),
    getSubCategory(categorySlug, subcategory),
  ]);
  if (!city || !found) notFound();
  const { category, subCategory } = found;
  const basePath = `/${city.slug}/${category.slug}/${subCategory.slug}`;
  const page = Number(query.page) || 1;
  const listings = await getBusinesses({
    citySlug: city.slug,
    categorySlug: subCategory.slug,
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
    { name: subCategory.name, href: basePath },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="border-b border-line bg-white">
        <div className="shell py-8 lg:py-10">
          <Breadcrumb items={crumbs} />
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
            {subCategory.name} services in {city.name}
          </h1>
          {subCategory.description && (
            <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-500">
              {subCategory.description} All listings show the provider&apos;s locality and service
              areas across {city.name}.
            </p>
          )}
        </div>
      </section>

      <div className="shell">
        {/* Service types available under this subcategory. */}
        {subCategory.serviceTypes.length > 0 && (
          <Section
            title="What do you need?"
            description="Choose the type of work so we can show the right providers."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subCategory.serviceTypes.map((type) => (
                <CategoryCard
                  key={type.slug}
                  name={`${subCategory.name} ${type.name}`}
                  description={type.description}
                  slug={type.slug}
                  href={`${basePath}/${type.slug}`}
                />
              ))}
            </div>
          </Section>
        )}

        <Section
          title={`${subCategory.name} providers in ${city.name}`}
          description={
            listings.total > 0
              ? `${listings.total} ${listings.total === 1 ? "listing" : "listings"} available`
              : undefined
          }
        >
          {(listings.total > 0 || filtered) && (
            <FilterBar
              options={{
                serviceTypes: subCategory.serviceTypes.map((t) => ({ slug: t.slug, name: t.name })),
                localities: city.localities,
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
              subject={`${subCategory.name} providers in ${city.name}`}
              quoteContext={`${subCategory.name} requirement in ${city.name}.`}
              resetHref={basePath}
            />
          )}
        </Section>

        {/* Brands with dedicated pages, if this subcategory has any. */}
        {subCategory.brands && subCategory.brands.length > 0 && subCategory.serviceTypes[0] && (
          <Section
            title={`Brands serviced in ${city.name}`}
            description="Jump straight to providers who handle a particular brand."
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {subCategory.brands
                .filter((brand) => brand.slugs[subCategory.serviceTypes[0].slug])
                .map((brand) => (
                  <li key={brand.name}>
                    <BrandChip
                      name={brand.name}
                      serviceLabel={
                        subCategory.serviceTypes[0].seoName ?? subCategory.serviceTypes[0].name
                      }
                      href={`${basePath}/${subCategory.serviceTypes[0].slug}/${brand.slugs[subCategory.serviceTypes[0].slug]}`}
                    />
                  </li>
                ))}
            </ul>
          </Section>
        )}

        {city.nearby && city.nearby.length > 0 && (
          <Section title={`${subCategory.name} in nearby cities`}>
            <ul className="flex flex-wrap gap-2">
              {city.nearby.slice(0, 12).map((slug) => (
                <li key={slug}>
                  <ChipLink href={`/${slug}/${category.slug}/${subCategory.slug}`}>
                    {titleCaseSlug(slug)}
                  </ChipLink>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="pb-14">
          <CTA
            title={`Book ${subCategory.name.toLowerCase()} service in ${city.name}`}
            description="Share your requirement once and providers nearby will call you back with their charges and earliest slot."
            quoteContext={`${subCategory.name} requirement in ${city.name}.`}
          />
        </div>
      </div>
    </>
  );
}
