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
          <p className="mt-1 text-[13px] text-ink-500">
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

        <div className="mt-8">
          <ProfileTabs tabs={tabs} />
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

        {/* Full address in plain text, mirroring the existing profile page. */}
        <p className="sr-only">{fullAddress(business)}</p>
      </div>

      <MobileActionBar business={business} />
    </>
  );
}
