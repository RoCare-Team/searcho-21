import PageHeader from "@/components/PageHeader";
import ContentPlaceholder from "@/components/ContentPlaceholder";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Customer Care",
  description: "Help with finding a provider, bookings and enquiries.",
  path: "/customer-care",
});
export default function Page() {
  return (
    <>
      <PageHeader
        title={"Customer Care"}
        description={"Help with finding a provider, bookings and enquiries."}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Customer Care", href: "/customer-care" },
        ]}
      />
      <div className="shell py-10 lg:py-12">
        <ContentPlaceholder page="Customer Care" />
      </div>
    </>
  );
}
