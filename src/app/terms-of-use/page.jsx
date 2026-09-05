import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "The terms that govern your use of Searcho21.",
  path: "/terms-of-use",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Terms of Use"}
        description={"The terms that govern your use of Searcho21."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Terms of Use", href: "/terms-of-use" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Terms of Use" />
      </div>
    </>
  );
}
