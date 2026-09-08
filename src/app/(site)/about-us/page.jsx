import PageHeader from "@/components/PageHeader";
import CTA from "@/components/CTA";
import { SITE_TAGLINE, buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Searcho21 is a local search platform connecting customers with verified service providers across India.",
  path: "/about-us",
});
export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Searcho21"
        description={SITE_TAGLINE}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About Us", href: "/about-us" },
        ]}
      />

      <div className="shell py-10 lg:py-12">
        <div className="prose-seo max-w-2xl">
          <p>
            Searcho21 connects customers with local service providers across India. The platform
            offers 24×7 support and puts the best local service provider in front of the customer,
            at their doorstep, PAN India.
          </p>
          <p>
            Listings cover home appliances such as water purifiers and air conditioners, along with
            home care, personal care, fitness, gadget repair and commercial services. Each listing
            shows where the provider is based, the areas they cover and how to reach them, so
            customers can compare before they book.
          </p>
          <p>
            Businesses can list on Searcho21 free of charge. Details are checked before a listing
            goes live, and verified listings carry a badge so customers can tell them apart.
          </p>
        </div>

        <div className="mt-10">
          <CTA
            title="List your business on Searcho21"
            description="Reach customers looking for your service in your city. Listing is free."
            secondary={{ href: "/list-your-business", label: "Start listing" }}
          />
        </div>
      </div>
    </>
  );
}
