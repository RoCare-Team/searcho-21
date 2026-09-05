import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import BusinessCard from "@/components/BusinessCard";
import BrandChip from "@/components/BrandChip";
import FilterBar from "@/components/FilterBar";
import EmptyListings, { hasActiveFilters } from "@/components/EmptyListings";
import Pagination from "@/components/Pagination";
import Section, { ChipLink, ProseSection } from "@/components/Section";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import QuoteForm from "@/components/QuoteForm";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/format";
/**
 * Shared template for the two SEO landing levels:
 *   /[city]/[category]/[sub]/[serviceType]
 *   /[city]/[category]/[sub]/[serviceType]/[brandSlug]
 *
 * Content comes entirely from the `content` prop, so the same layout renders
 * whatever copy the backend stores for a given URL.
 */
export default async function ServiceSeoPage({
  city,
  category,
  subCategory,
  serviceType,
  brand,
  content,
  crumbs,
  basePath,
  listings,
  searchParams,
  relatedBrands,
}) {
  const filtered = hasActiveFilters(searchParams);
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(content.faqs)]} />

      {/* ---------------- Header ---------------- */}
      <section className="border-b border-line bg-white">
        <div className="shell py-8 lg:py-10">
          <Breadcrumb items={crumbs} />
          <h1 className="mt-4 max-w-3xl text-2xl font-semibold sm:text-3xl">{content.h1}</h1>
          {content.intro && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-500">
              {content.intro}
            </p>
          )}
        </div>
      </section>

      <div className="shell">
        <div className="gap-10 lg:flex lg:items-start">
          {/* ---------------- Main column ---------------- */}
          <div className="min-w-0 flex-1">
            {/* Brands */}
            {relatedBrands.length > 0 && (
              <Section
                title={`Choose a brand`}
                description={`Jump straight to providers who work on a particular ${subCategory.name.toLowerCase()} brand.`}
              >
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {relatedBrands.map((item) => {
                    const slug = item.slugs[serviceType.slug];
                    if (!slug) return null;
                    return (
                      <li key={item.name}>
                        <BrandChip
                          name={item.name}
                          serviceLabel={serviceType.seoName ?? serviceType.name}
                          href={`/${city.slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}/${slug}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            <Section
              title={`Providers in ${city.name}`}
              description={
                listings.total > 0
                  ? `${listings.total} ${listings.total === 1 ? "listing" : "listings"} available`
                  : undefined
              }
            >
              {(listings.total > 0 || filtered) && (
                <FilterBar
                  options={{
                    serviceTypes: subCategory.serviceTypes.map((t) => ({
                      slug: t.slug,
                      name: t.name,
                    })),
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
                    searchParams={searchParams}
                  />
                </>
              ) : (
                <EmptyListings
                  filtered={filtered}
                  subject={`${content.h1.replace(/^Top /, "").replace(/ Providers.*$/, "")} providers in ${city.name}`}
                  quoteContext={`${brand ? `${brand.name} ` : ""}${subCategory.name} ${serviceType.name} in ${city.name}.`}
                  resetHref={basePath}
                />
              )}
            </Section>

            {/* Why Searcho21 */}
            {content.benefits && content.benefits.length > 0 && (
              <Section title="Why book through Searcho21">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {content.benefits.map((benefit) => (
                    <li key={benefit.title} className="card p-4">
                      <h3 className="text-[14px] font-medium">{benefit.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                        {benefit.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* How it works */}
            {content.howItWorks && content.howItWorks.length > 0 && (
              <Section title="How it works">
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {content.howItWorks.map((step, i) => (
                    <li key={step.title} className="card p-4">
                      <span className="text-xs font-semibold text-brand-600">0{i + 1}</span>
                      <h3 className="mt-1.5 text-[14px] font-medium">{step.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                        {step.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Service areas */}
            {city.localities && city.localities.length > 0 && (
              <Section
                title={`Service areas in ${city.name}`}
                description="Providers on this page attend requests across these localities."
              >
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                  {city.localities.map((locality) => (
                    <li key={locality}>
                      <Link
                        href={`${basePath}?locality=${encodeURIComponent(locality)}`}
                        className="block truncate py-1 text-[13px] text-ink-700 transition-colors hover:text-brand-600"
                      >
                        {locality}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Long-form copy: the stored content_text when the admin panel has
            authored one, otherwise the generated sections. */}
            {content.contentHtml ? (
              <section className="py-10 lg:py-12">
                <div
                  className="prose-seo max-w-3xl"
                  // Authored by Searcho21 admins in location_category_mapping_tb,
                  // the same trusted source the existing site already renders.
                  dangerouslySetInnerHTML={{ __html: content.contentHtml }}
                />
              </section>
            ) : (
              content.sections.length > 0 && (
                <section className="space-y-8 py-10 lg:py-12">
                  {content.sections.map((section) => (
                    <ProseSection
                      key={section.heading}
                      heading={section.heading}
                      paragraphs={section.paragraphs}
                    />
                  ))}
                </section>
              )
            )}

            {/* FAQs */}
            <section className="pb-10 lg:pb-12">
              <FAQ items={content.faqs} title="Frequently asked questions" />
            </section>
          </div>

          {/* ---------------- Sidebar enquiry ---------------- */}
          <aside className="hidden w-80 shrink-0 py-10 lg:block lg:py-12">
            <div className="sticky top-24 card p-5">
              <h2 className="text-base font-semibold">Get free quotes</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Tell us what you need. Providers in {city.name} will get back to you.
              </p>
              <div className="mt-4">
                <QuoteForm
                  compact
                  context={`${brand ? `${brand.name} ` : ""}${subCategory.name} ${serviceType.name} in ${city.name}.`}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* ---------------- Related links ---------------- */}
        <Section title="Related services">
          <ul className="flex flex-wrap gap-2">
            {subCategory.serviceTypes
              .filter((type) => type.slug !== serviceType.slug)
              .map((type) => (
                <li key={type.slug}>
                  <ChipLink
                    href={`/${city.slug}/${category.slug}/${subCategory.slug}/${type.slug}`}
                  >
                    {subCategory.name} {type.name}
                  </ChipLink>
                </li>
              ))}
            {category.subCategories
              .filter((sub) => sub.slug !== subCategory.slug)
              .map((sub) => (
                <li key={sub.slug}>
                  <ChipLink href={`/${city.slug}/${category.slug}/${sub.slug}`}>
                    {sub.name}
                  </ChipLink>
                </li>
              ))}
          </ul>
        </Section>

        {city.nearby && city.nearby.length > 0 && (
          <Section title="Available in nearby cities">
            <ul className="flex flex-wrap gap-2">
              {city.nearby.slice(0, 16).map((slug) => (
                <li key={slug}>
                  <ChipLink
                    href={`/${slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}${brand?.slugs[serviceType.slug] ? `/${brand.slugs[serviceType.slug]}` : ""}`}
                  >
                    {titleCaseSlug(slug)}
                  </ChipLink>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Mobile enquiry — the sidebar is desktop-only. */}
        <section className="pb-14 lg:hidden">
          <div className="card p-5">
            <h2 className="text-base font-semibold">Get free quotes</h2>
            <p className="mt-1 text-[13px] text-ink-500">
              Tell us what you need. Providers in {city.name} will get back to you.
            </p>
            <div className="mt-4">
              <QuoteForm
                compact
                context={`${brand ? `${brand.name} ` : ""}${subCategory.name} ${serviceType.name} in ${city.name}.`}
              />
            </div>
          </div>
        </section>

        <div className="hidden pb-14 lg:block">
          <CTA
            title={`Need help choosing a provider in ${city.name}?`}
            description="Call the Searcho21 support line and we will connect you with a provider who covers your locality."
            quoteContext={`${brand ? `${brand.name} ` : ""}${subCategory.name} ${serviceType.name} in ${city.name}.`}
          />
        </div>
      </div>
    </>
  );
}
