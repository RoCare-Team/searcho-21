import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import DataSourceNotice from "@/components/DataSourceNotice";
import { CitySelectionProvider } from "@/components/CitySelection";
import { getSelectedCity } from "@/lib/city-cookie";
import { buildCityIndex, popularCityIndex } from "@/lib/search-index";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find verified local service experts near you. Compare water purifier, air conditioner, home care, personal care and gadget repair providers across India.",
  applicationName: SITE_NAME,
  formatDetection: { telephone: true },
};
export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};
export default async function RootLayout({ children }) {
  const selectedCity = await getSelectedCity();
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
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
        >
          <DataSourceNotice />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </CitySelectionProvider>

        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
