import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Media",
  description: "Press and media resources for Searcho21.",
  path: "/media",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Media"}
        description={"Press and media resources for Searcho21."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Media", href: "/media" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Media" />
      </div>
    </>
  );
}
