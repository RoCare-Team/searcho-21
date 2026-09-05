import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Advertise Your Business",
  description: "Promote your listing to customers searching in your city.",
  path: "/advertise-your-business",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Advertise Your Business"}
        description={"Promote your listing to customers searching in your city."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Advertise Your Business", href: "/advertise-your-business" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="advertising" />
      </div>
    </>
  );
}
