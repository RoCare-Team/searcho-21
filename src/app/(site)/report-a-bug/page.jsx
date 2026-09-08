import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Report a Bug",
  description: "Tell us about a problem you found on Searcho21.",
  path: "/report-a-bug",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Report a Bug"}
        description={"Tell us about a problem you found on Searcho21."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Report a Bug", href: "/report-a-bug" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Report a Bug" />
      </div>
    </>
  );
}
