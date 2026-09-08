import { BadgeCheck, Clock, PhoneCall, Search as SearchIcon } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import HeroTiles from "@/components/HeroTiles";
import HomeServiceGroup from "@/components/HomeServicePanel";
import CityCard from "@/components/CityCard";
import Section from "@/components/Section";
import CTA from "@/components/CTA";
import {
  getCategories,
  getCategoryListingCounts,
  getDefaultBanners,
  getHomeServices,
  getPopularCities,
} from "@/lib/api";
import HeroCollage from "@/components/HeroCollage";
import { CityLink } from "@/components/CitySelection";
import { getCategoryTemplates } from "@/lib/templates";
import { assetUrl } from "@/lib/mappers";
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
  const [categories, cities, templates, homeServices, listingCounts, defaultBanners] =
    await Promise.all([
      getCategories(),
      getPopularCities(),
      getCategoryTemplates(),
      getHomeServices(),
      getCategoryListingCounts(),
      getDefaultBanners(),
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
  /** One card per level-one category, e.g. Water Purifier, Gym, Salon. */
  const services = categories.flatMap((category) =>
    category.subCategories.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
      path: `/${category.slug}/${sub.slug}`,
      photo: sub.photo,
      listings: listingCounts.get(sub.id) ?? 0,
    })),
  );
  // The collage uses the three best-stocked categories, so the hero shows what
  // the site actually has rather than a hand-picked set.
  // Hero artwork: the default category banners, which are stored at 1500px and
  // up. The per-service photos are only 280x120 and looked soft blown up to
  // tile size.
  const collagePhotos = [...defaultBanners.values()]
    .flat()
    .slice(0, 3)
    .map((file) => assetUrl("banner_image", file))
    .filter(Boolean);
  const popularServices = [...services]
    .filter((service) => service.listings > 0)
    .sort((a, b) => b.listings - a.listings)
    .slice(0, 6);
  return (
    <>
      {/* ---------------- Hero ----------------
          Two columns: the words and the search on the left, a small collage of
          real service photographs on the right. The ground is a few percent of
          rose over white, so the white search bar and cards sit clearly on it
          without the section becoming a coloured band. */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden
        />

        <div className="shell relative py-8 lg:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_34rem] lg:gap-7">
            <div>
              <p className="flex items-center gap-2.5 text-[15px] font-medium uppercase tracking-wide text-brand-600">
                <span className="h-px w-7 bg-brand-300" aria-hidden />
                {SITE_TAGLINE}
              </p>

              <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight sm:text-[40px] lg:text-[46px]">
                Find Trusted Experts
                <br />
                <span className="relative inline-block text-brand-500">
                  for Every Need
                  {/* A hand-drawn underline rather than a text-decoration rule,
                      which would sit too close to the descenders at this size. */}
                  <svg
                    viewBox="0 0 240 10"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 h-2 w-full text-brand-300"
                    aria-hidden
                  >
                    <path
                      d="M2 7c40-5 90-6 140-4 30 1 60 3 96 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-500">
                Discover verified local businesses and service providers near you.
              </p>

              <div className="mt-6 max-w-2xl">
                <SearchBar
                  services={await buildServiceIndex()}
                  cities={await buildCityIndex()}
                  popularCities={await popularCityIndex()}
                />
              </div>

              {/* The busiest categories, by real listing count — not a
                  hand-written list of things the site wishes it had. */}
              {popularServices.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-medium text-ink-500">Popular:</span>
                  {popularServices.map((service) => (
                    <CityLink
                      key={service.path}
                      path={service.path}
                      className="rounded-full border border-line bg-white px-3 py-1 text-[15px] text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
                    >
                      {service.name}
                    </CityLink>
                  ))}
                </div>
              )}
            </div>

            <HeroCollage photos={collagePhotos} />
          </div>
        </div>
      </section>

      {/* The designed category banners, kept as their own band below the hero. */}
      <section className="border-b border-line bg-white">
        <div className="shell py-6">
          <HeroTiles tiles={heroTiles} />
        </div>
      </section>

      <div className="shell">
        {/* ---------------- Curated service sections ----------------
            home_page_services_tb, exactly as WebController::index() reads it:
            one panel per category, each tile carrying its own stored label,
            expert count and image. */}
        {homeServices.length > 0 && (
          <Section title="Popular services">
            <div className="grid gap-9">
              {homeServices.map((section) => (
                <HomeServiceGroup key={section.id} title={section.title} items={section.items} />
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
                <h3 className="mt-3 text-[17px] font-medium">{step.title}</h3>
                <p className="mt-1 text-[15.5px] leading-relaxed text-ink-500">
                  {step.description}
                </p>
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
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[15.5px] text-ink-500">
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
