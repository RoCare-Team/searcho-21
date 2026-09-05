import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Business Support",
  description: "Help for businesses listed on Searcho21.",
  path: "/business-support",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Business Support"}
        description={"Help for businesses listed on Searcho21."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Business Support", href: "/business-support" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Business Support" />
      </div>
    </>
  );
}
