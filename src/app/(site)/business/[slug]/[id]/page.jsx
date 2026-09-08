import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import BusinessProfileHeader from "@/components/BusinessProfileHeader";
import BusinessInfo, { TagList } from "@/components/BusinessInfo";
import SocialLinks from "@/components/SocialLinks";
import Gallery from "@/components/Gallery";
import ProfileTabs from "@/components/ProfileTabs";
import MobileActionBar from "@/components/MobileActionBar";
import BusinessCard from "@/components/BusinessCard";
import Section from "@/components/Section";
import QuoteForm from "@/components/QuoteForm";
import ContactCard from "@/components/ContactCard";
import OpeningHours from "@/components/OpeningHours";
import JsonLd from "@/components/JsonLd";
import { getBusiness, getRelatedBusinesses } from "@/lib/api";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLd } from "@/lib/seo";
import { fullAddress } from "@/lib/format";
export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const business = await getBusiness(slug, id);
  if (!business) return {};
  const where = [business.address.locality, business.address.city].filter(Boolean).join(", ");
  // Prefer the listing's own meta_title / meta_desc columns when set.
  return buildMetadata({
    title:
      business.metaTitle ?? `${business.name}${where ? `, ${where}` : ""} — Contact & Services`,
    description:
      business.metaDescription ??
      business.summary ??
      `${business.name}${where ? ` in ${where}` : ""}. View services, working hours and contact details on Searcho21.`,
    path: `/business/${business.slug}/${business.id}`,
    keywords: business.metaKeywords,
    type: "profile",
  });
}
/** Overview panel — prose, not one card per paragraph. */
function Overview({ business }) {
  const hasBody = Boolean(business.summary) || Boolean(business.keywords?.length);
  return (
    <div className="space-y-8">
      {business.summary ? (
        <div>
          <h2 className="mb-2 text-base font-semibold">About {business.name}</h2>
          <div className="prose-seo max-w-3xl">
            <p>{business.summary}</p>
          </div>
        </div>
      ) : (
        !hasBody && (
          <p className="text-sm text-ink-500">This listing has not added a description yet.</p>
        )
      )}

      <TagList title="Services offered" items={business.keywords} />
      <SocialLinks links={business.social} />
      <BusinessInfo business={business} />
    </div>
  );
}
export default async function BusinessProfilePage({ params }) {
  const { slug, id } = await params;
  const business = await getBusiness(slug, id);
  if (!business) notFound();
  const related = await getRelatedBusinesses(business);
  const crumbs = [
    { name: "Home", href: "/" },
    ...(business.address.citySlug && business.address.city
      ? [{ name: business.address.city, href: `/${business.address.citySlug}` }]
      : []),
    { name: business.name, href: `/business/${business.slug}/${business.id}` },
  ];
  // Only the panels this listing has content for.
  const tabs = [
    { id: "overview", label: "Overview", content: <Overview business={business} /> },
    {
      id: "services",
      label: "Services",
      content: business.keywords?.length ? (
        <TagList title="Services offered" items={business.keywords} />
      ) : (
        <div className="card px-5 py-10 text-center">
          <p className="text-sm font-medium text-navy-900">No services listed yet</p>
          <p className="mt-1 text-[15.5px] text-ink-500">
            This listing has not added the services it offers.
          </p>
        </div>
      ),
    },
    { id: "gallery", label: "Gallery", content: <Gallery images={business.gallery} /> },
    { id: "about", label: "About", content: <BusinessInfo business={business} /> },
  ];
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(crumbs), localBusinessJsonLd(business)]} />

      {/* Bottom padding leaves room for the sticky mobile action bar. */}
      <div className="shell pb-28 pt-6 lg:pb-14">
        <Breadcrumb items={crumbs} />

        <div className="mt-4">
          <BusinessProfileHeader business={business} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <ProfileTabs tabs={tabs} />

            <div className="lg:hidden">
              <ContactCard business={business} className="mt-6" />
              {business.openingHours?.length > 0 && (
                <OpeningHours hours={business.openingHours} className="mt-4" />
              )}
            </div>

            {related.length > 0 && (
              <Section
                title="Related businesses"
                description={
                  business.address.city ? `Other providers in ${business.address.city}.` : undefined
                }
              >
                <div className="space-y-3">
                  {related.map((item) => (
                    <BusinessCard key={item.id} business={item} />
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Desktop only: on a phone the same actions live in the sticky
              MobileActionBar at the bottom of the screen. */}
          <aside className="hidden self-start lg:sticky lg:top-[90px] lg:block">
            <div className="card p-5">
              <h2 className="text-[17px] font-semibold text-navy-900">
                Get a quote from {business.name}
              </h2>
              <p className="mt-1 text-[14px] text-ink-500">
                Tell them what you need and they will get back to you.
              </p>
              <div className="mt-4">
                <QuoteForm
                  compact
                  context={`Enquiry for ${business.name}${
                    business.address.city ? `, ${business.address.city}` : ""
                  }.`}
                />
              </div>
            </div>

            <ContactCard business={business} />

            {business.openingHours?.length > 0 && (
              <OpeningHours hours={business.openingHours} className="mt-4" />
            )}
          </aside>
        </div>

        {/* Full address in plain text, mirroring the existing profile page. */}
        <p className="sr-only">{fullAddress(business)}</p>
      </div>

      <MobileActionBar business={business} />
    </>
  );
}
