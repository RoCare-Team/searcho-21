import { BadgeCheck, PhoneCall, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import VendorSignupForm from "@/components/VendorSignupForm";
import { getCategories } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "List Your Business",
  description:
    "Add your business to Searcho21 and reach customers looking for local service experts in your city. Listing is free.",
  path: "/list-your-business",
});
const REASONS = [
  {
    Icon: Search,
    title: "Be found locally",
    description: "Your listing appears when customers search for your service in your city.",
  },
  {
    Icon: PhoneCall,
    title: "Receive enquiries",
    description: "Customers reach you directly by call, WhatsApp or a quote request.",
  },
  {
    Icon: BadgeCheck,
    title: "Build trust",
    description: "Verified listings carry a badge, so customers know your details were checked.",
  },
];
export default async function ListYourBusinessPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        title="List your business on Searcho21"
        description="Reach customers looking for local service experts in your city. Listing is free — fill in your details and our team will verify them before your listing goes live."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "List Your Business", href: "/list-your-business" },
        ]}
      />

      <div className="shell py-10 lg:py-12">
        <ul className="mb-8 grid gap-3 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <li key={reason.title} className="card p-5">
              <span className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
                <reason.Icon className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="mt-3 text-[17px] font-medium">{reason.title}</h2>
              <p className="mt-1 text-[15.5px] leading-relaxed text-ink-500">
                {reason.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="max-w-md">
          <VendorSignupForm />
        </div>
      </div>
    </>
  );
}
