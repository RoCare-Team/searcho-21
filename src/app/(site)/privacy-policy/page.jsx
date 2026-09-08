import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Searcho21 collects, uses and protects your information.",
  path: "/privacy-policy",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Privacy Policy"}
        description={"How Searcho21 collects, uses and protects your information."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy-policy" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Privacy Policy" />
      </div>
    </>
  );
}
