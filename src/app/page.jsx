import { BadgeCheck, Clock, PhoneCall, Search as SearchIcon } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HeroTiles from "@/components/HeroTiles";
import CategoryTile, { AllCategoriesTile } from "@/components/CategoryTile";
import HomeServicePanel from "@/components/HomeServicePanel";
import CityCard from "@/components/CityCard";
import Section from "@/components/Section";
import CTA from "@/components/CTA";
import { getCategories, getHomeServices, getPopularCities } from "@/lib/api";
import { getCategoryTemplates } from "@/lib/templates";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: `${SITE_NAME} - ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: SITE_KEYWORDS,
});
const HOW_IT_WORKS = [
  {
    Icon: SearchIcon,
    title: "Search your service",
    description: "Pick the service you need and the city you are in.",
  },
  {
    Icon: BadgeCheck,
    title: "Compare providers",
    description: "Check service areas, working hours and verification before you decide.",
  },
  {
    Icon: PhoneCall,
    title: "Call or get a quote",
    description: "Reach the provider directly, or share your requirement once.",
  },
];
export default async function HomePage() {
  const [categories, cities, templates, homeServices] = await Promise.all([
    getCategories(),
    getPopularCities(),
    getCategoryTemplates(),
    getHomeServices(),
  ]);
  /**
   * Hero banners: every level-one category the template library has artwork
   * for, in taxonomy order. Nothing is listed by hand, so the row follows the
   * data rather than a fixed set of five.
   */
  const heroTiles = categories.flatMap((category) =>
    category.subCategories
      .filter((sub) => templates.has(sub.slug))
      .map((sub) => ({
        name: sub.name,
        template: templates.get(sub.slug),
        path: `/${category.slug}/${sub.slug}`,
      })),
  );
  /** One tile per level-one category, e.g. Water Purifier, Gym, Salon. */
  const services = categories.flatMap((category) =>
    category.subCategories.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
      path: `/${category.slug}/${sub.slug}`,
    })),
  );
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      {/* The tint is warm at the top-left and cools toward the bottom-right, all
          of it within a few percent of white — enough to separate the hero from
          the page and to let the white search bar and banner cards sit on top of
          it, without becoming a coloured band. */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-100 via-brand-50 to-navy-100">
        {/* Two soft washes for depth, instead of a busy background image. */}
        <div
          className="pointer-events-none absolute -right-32 -top-48 h-[30rem] w-[30rem] rounded-full bg-brand-200/60 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-navy-100 blur-3xl"
          aria-hidden
        />

        {/* Deliberately tight: heading, search and tiles all above the fold. */}
        <div className="shell relative py-7 lg:py-9">
          <h1 className="text-[26px] font-semibold leading-[1.15] tracking-tight sm:text-[32px] lg:text-[34px]">
            Find Trusted Experts for <span className="text-brand-500">Every Need</span>
          </h1>

          <div className="mt-4 max-w-3xl">
            <SearchBar
              services={await buildServiceIndex()}
              cities={await buildCityIndex()}
              popularCities={await popularCityIndex()}
            />
          </div>

          {/* Bold category tiles, the way people actually enter the site. */}
          <div className="mt-6">
            <HeroTiles tiles={heroTiles} />
          </div>
        </div>
      </section>

      <div className="shell">
        {/* ---------------- Categories ----------------
            No heading here: the tiles are self-labelling and sit directly under
            the hero, so a title and blurb above them only added noise. */}
        <section className="py-10 lg:py-12">
          {/* Full width, seven across: with a 144px tile the columns still sit
            close together, so no width cap is needed. */}
          <ul className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-6 lg:grid-cols-8">
            {services.map((service) => (
              <li key={service.path}>
                <CategoryTile name={service.name} slug={service.slug} path={service.path} />
              </li>
            ))}
            <li>
              <AllCategoriesTile path="" />
            </li>
          </ul>
        </section>

        {/* ---------------- Curated service sections ----------------
            home_page_services_tb, exactly as WebController::index() reads it:
            one panel per category, each tile carrying its own stored label,
            expert count and image. */}
        {homeServices.length > 0 && (
          <Section title="Popular services">
            <div className="grid gap-4 lg:grid-cols-2">
              {homeServices.map((section) => (
                <HomeServicePanel key={section.id} title={section.title} items={section.items} />
              ))}
            </div>
          </Section>
        )}

        {/* ---------------- How it works ---------------- */}
        <Section title="How Searcho21 works">
          <ol className="grid gap-3 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.title} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <step.Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-ink-400">Step {i + 1}</span>
                </div>
                <h3 className="mt-3 text-[15px] font-medium">{step.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ---------------- Cities ---------------- */}
        <Section
          title="Popular cities"
          description="Searcho21 lists service providers across India."
        >
          <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
            {/* Only cities the media library has a photo for — a row that mixes
            photo tiles with bare text tiles reads as broken artwork. Every
            other city stays reachable from the header and footer. */}
            {cities
              .filter((city) => city.photo)
              .slice(0, 8)
              .map((city) => (
                <li key={city.slug}>
                  <CityCard name={city.name} slug={city.slug} photo={city.photo} />
                </li>
              ))}
          </ul>
        </Section>

        {/* ---------------- Trust / listing CTA ---------------- */}
        <div className="pb-4">
          <CTA
            title="Not sure who to call?"
            description="Share your requirement once and providers in your city will get back to you with their availability and charges."
            quoteContext="Your requirement is shared with matching providers in your city."
            secondary={{ href: "/list-your-business", label: "List your business" }}
          />
        </div>

        {/* A quiet closing note — no invented statistics. */}
        <section className="pb-14">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-ink-500">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-success-600" aria-hidden />
              Verification badge on checked listings
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-400" aria-hidden />
              Working hours and service areas on every listing
            </span>
            <span className="inline-flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-ink-400" aria-hidden />
              Support on 9311587725
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
