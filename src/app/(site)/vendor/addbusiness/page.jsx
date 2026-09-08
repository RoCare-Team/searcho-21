import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import VendorRegistrationForm from "@/components/VendorRegistrationForm";
import { getUser } from "@/lib/account";
import { getCategories } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Add your business",
  description: "Add your business details to Searcho21.",
  path: "/vendor/addbusiness",
  // A signed-in page has nothing for a crawler.
  index: false,
});

/**
 * Business details, filled in after signing up.
 *
 * The route matches the live site: VendorLoginController sends a vendor here
 * once their OTP is verified. Signing up asks only for a name, email and
 * mobile; everything about the business is asked here, once the account exists
 * to own it.
 */
export default async function AddBusinessPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const categories = await getCategories();

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Add your business", href: "/vendor/addbusiness" },
        ]}
        title="Add your business"
        description={`Signed in as ${user.name || user.mobile}. Your listing is reviewed before it goes live.`}
      />

      <div className="shell pb-14">
        <div className="max-w-3xl">
          <VendorRegistrationForm
            categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
          />
        </div>
      </div>
    </>
  );
}
