import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import DataSourceNotice from "@/components/DataSourceNotice";
import { CitySelectionProvider } from "@/components/CitySelection";
import RequestModal from "@/components/RequestModal";
import { getSelectedCity } from "@/lib/city-cookie";
import { getCategories, getStatesAndCities } from "@/lib/api";
import { buildCityIndex, buildServiceIndex, popularCityIndex } from "@/lib/search-index";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
export default async function SiteLayout({ children }) {
  const [selectedCity, categories, { states, cities }] = await Promise.all([
    getSelectedCity(),
    getCategories(),
    getStatesAndCities(),
  ]);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-pop"
      >
        Skip to content
      </a>

      <CitySelectionProvider
        selected={selectedCity ? { slug: selectedCity.slug, name: selectedCity.name } : null}
        popular={await popularCityIndex()}
        all={await buildCityIndex()}
        services={await buildServiceIndex()}
      >
        <DataSourceNotice />
        {/* Inside the provider so it can see whether a city is chosen: the
            popup waits for that rather than stacking on the city picker. */}
        <RequestModal
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          states={states}
          cities={cities}
          hasCity={Boolean(selectedCity)}
        />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </CitySelectionProvider>

      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
    </>
  );
}
