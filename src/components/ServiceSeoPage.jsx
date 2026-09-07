import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, ChevronRight, IndianRupee, PhoneCall, Scale } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchBar from "@/components/SearchBar";
import MapWidget from "@/components/MapWidget";
import BusinessCTA from "@/components/BusinessCTA";
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
import { assetUrl } from "@/lib/mappers";
import FilterPanel from "@/components/FilterPanel";
/**
 * Shared template for the two SEO landing levels:
 *   /[city]/[category]/[sub]/[serviceType]
 *   /[city]/[category]/[sub]/[serviceType]/[brandSlug]
 *
 * Content comes entirely from the `content` prop, so the same layout renders
 * whatever copy the backend stores for a given URL.
 */
const SERVICE_PROMISES = [
  {
    Icon: BadgeCheck,
    label: "Verified providers",
    detail: "Checked listings carry the badge",
  },
  { Icon: Scale, label: "Compare quotes", detail: "Ask several providers at once" },
  { Icon: PhoneCall, label: "Contact directly", detail: "Numbers shown, no middleman" },
  { Icon: IndianRupee, label: "Free to use", detail: "No charge to send an enquiry" },
];

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
  serviceTypeCounts,
  searchServices,
  searchCities,
  searchPopularCities,
}) {
  const filtered = hasActiveFilters(searchParams);
  // cat_level_one_icon holds a photograph of the service; see lib/api.js.
  const heroPhoto = assetUrl("category", subCategory.photo);
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(content.faqs)]} />

      {/* ---------------- Header ----------------
          The service's own artwork carries the band. The chips below are
          properties of the site, not statistics: nothing here claims a user
          count or a rating, because the schema stores neither. */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-r from-brand-50 to-white">
        {heroPhoto && (
          <>
            <Image
              src={heroPhoto}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-right"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/40"
              aria-hidden
            />
          </>
        )}

        <div className="shell relative py-7 lg:py-9">
          <Breadcrumb items={crumbs} />
          <h1 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">{content.h1}</h1>
          {content.intro && (
            <p className="mt-2.5 max-w-xl text-[17px] leading-relaxed text-ink-500">
              {content.intro}
            </p>
          )}

          {searchServices && searchCities && (
            <div className="mt-5 max-w-2xl">
              <SearchBar
                variant="compact"
                services={searchServices}
                cities={searchCities}
                popularCities={searchPopularCities}
                defaultCitySlug={city.slug}
              />
            </div>
          )}

          {/* The sibling services under the same product — real rows of
              category_level_two_tb, not a hand-written list. */}
          {subCategory.serviceTypes.length > 1 && (
            <ul className="mt-3.5 flex flex-wrap gap-2">
              {subCategory.serviceTypes.map((type) => {
                const active = type.slug === serviceType.slug;
                return (
                  <li key={type.slug}>
                    <Link
                      href={`/${city.slug}/${category.slug}/${subCategory.slug}/${type.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[15px] font-medium transition-colors ${
                        active
                          ? "border-brand-300 bg-brand-50 text-brand-700"
                          : "border-line bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600"
                      }`}
                    >
                      {type.seoName ?? `${subCategory.name} ${type.name}`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] wide:grid-cols-[248px_minmax(0,1fr)_304px]">
          {/* ---------------- Filters ----------------
              Desktop only: below lg the same controls live in FilterBar's
              drawer, which the results column still renders. */}
          <aside className="hidden py-8 lg:block">
            <div className="sticky top-[90px]">
              <FilterPanel
                serviceTypes={subCategory.serviceTypes}
                localities={city.localities ?? []}
                counts={serviceTypeCounts}
              />
            </div>
          </aside>

          {/* ---------------- Main column ---------------- */}
          <div className="min-w-0 py-8">
            {/* Brands */}
            {relatedBrands.length > 0 && (
              <section className="mb-6">
                <ul className="no-scrollbar flex snap-x gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible xl:grid-cols-4">
                  {relatedBrands.map((item) => {
                    const slug = item.slugs[serviceType.slug];
                    if (!slug) return null;
                    return (
                      <li key={item.name} className="w-[46%] shrink-0 snap-start sm:w-auto">
                        <BrandChip
                          name={item.name}
                          serviceLabel={serviceType.seoName ?? serviceType.name}
                          href={`/${city.slug}/${category.slug}/${subCategory.slug}/${serviceType.slug}/${slug}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section>
              {/* Below lg only: the left column's FilterPanel is the desktop form
                  of these same controls, and rendering both showed every
                  filter twice. */}
              {(listings.total > 0 || filtered) && (
                <div className="lg:hidden">
                  <FilterBar
                    options={{
                      serviceTypes: subCategory.serviceTypes.map((t) => ({
                        slug: t.slug,
                        name: t.name,
                      })),
                      localities: city.localities,
                    }}
                  />
                </div>
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
            </section>
          </div>

          {/* ---------------- Sidebar enquiry ---------------- */}
          <aside className="hidden self-start py-8 wide:sticky wide:top-[90px] wide:block">
            <div className="card p-5">
              <h2 className="text-base font-semibold">Get free quotes</h2>
              <p className="mt-1 text-[15.5px] text-ink-500">
                Tell us what you need. Providers in {city.name} will get back to you.
              </p>
              <div className="mt-4">
                <QuoteForm
                  compact
                  context={`${brand ? `${brand.name} ` : ""}${subCategory.name} ${serviceType.name} in ${city.name}.`}
                />
              </div>
            </div>

            {/* Product properties, not statistics. */}
            <div className="card mt-4 p-4">
              <ul className="space-y-3">
                {SERVICE_PROMISES.map(({ Icon, label, detail }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                      <Icon className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[15px] font-semibold text-navy-900">{label}</span>
                      <span className="text-[14px] text-ink-500">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The sibling services under the same product, as a link list. */}
            {subCategory.serviceTypes.length > 1 && (
              <div className="card mt-4 p-4">
                <h2 className="text-[16.5px] font-semibold text-navy-900">
                  Popular services in {city.name}
                </h2>
                <ul className="mt-2 divide-y divide-line">
                  {subCategory.serviceTypes.map((type) => (
                    <li key={type.slug}>
                      <Link
                        href={`/${city.slug}/${category.slug}/${subCategory.slug}/${type.slug}`}
                        className="flex items-center justify-between gap-2 py-2.5 text-[15px] text-ink-700 transition-colors hover:text-brand-600"
                      >
                        <span className="min-w-0 truncate">
                          {type.seoName ?? `${subCategory.name} ${type.name}`} in {city.name}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <MapWidget
                cityName={city.name}
                localities={city.localities ?? []}
                basePath={basePath}
              />
            </div>
          </aside>
        </div>

        {/* ---------------- Page copy ----------------
            Outside the three-column block, so the prose, the FAQs and the
            service-area list run the full width. Inside the results column they
            were squeezed into roughly half the page, which made the long-form
            copy read as a narrow ribbon. */}
        {/* Why Searcho21 */}
        {content.benefits && content.benefits.length > 0 && (
          <Section title="Why book through Searcho21">
            <ul className="grid gap-3 sm:grid-cols-2">
              {content.benefits.map((benefit) => (
                <li key={benefit.title} className="card p-4">
                  <h3 className="text-[16.5px] font-medium">{benefit.title}</h3>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-ink-500">
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
                  <h3 className="mt-1.5 text-[16.5px] font-medium">{step.title}</h3>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-ink-500">
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
                    className="block truncate py-1 text-[15.5px] text-ink-700 transition-colors hover:text-brand-600"
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
              className="prose-seo"
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
            <p className="mt-1 text-[15.5px] text-ink-500">
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
        <BusinessCTA subject={subCategory.name} cityName={city.name} />
      </div>
    </>
  );
}
