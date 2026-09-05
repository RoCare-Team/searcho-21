import PageHeader from "@/components/PageHeader";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import { SUPPORT_PHONE, buildMetadata, faqJsonLd } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "FAQs",
  description: "Answers to common questions about using Searcho21 and listing a business.",
  path: "/faqs",
});
const CUSTOMER_FAQS = [
  {
    question: "How do I find a service provider on Searcho21?",
    answer:
      "Search for the service you need and pick your city, or browse the category pages. Each listing shows the provider's locality, service areas and contact options.",
  },
  {
    question: "Does Searcho21 charge customers?",
    answer:
      "No. Searching, comparing providers and submitting a requirement are free. You pay the provider directly for the work they do.",
  },
  {
    question: "What does the Verified badge mean?",
    answer:
      "A green Verified badge means the business details on that listing have been checked. Listings without the badge have not been through that check.",
  },
  {
    question: "How do I contact a provider?",
    answer:
      "Use the Call, WhatsApp or Get Quote actions on any listing. You can also call the Searcho21 support line on " +
      SUPPORT_PHONE +
      " and the team will connect you.",
  },
];
const BUSINESS_FAQS = [
  {
    question: "How do I list my business?",
    answer:
      "Fill in the form on the List Your Business page. The Searcho21 team reviews your details and gets in touch before the listing goes live.",
  },
  {
    question: "Is listing free?",
    answer: "Yes, a standard listing is free.",
  },
  {
    question: "How do I update my listing?",
    answer:
      "Log in from the header, or contact business support with the changes you need and the team will update the listing for you.",
  },
];
export default function FaqsPage() {
  return (
    <>
      <JsonLd data={faqJsonLd([...CUSTOMER_FAQS, ...BUSINESS_FAQS])} />

      <PageHeader
        title="Frequently asked questions"
        description="Answers to the questions we are asked most often, for customers and for businesses."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQs", href: "/faqs" },
        ]}
      />

      <div className="shell space-y-10 py-10 lg:py-12">
        <div className="max-w-3xl">
          <FAQ items={CUSTOMER_FAQS} title="For customers" />
        </div>
        <div className="max-w-3xl">
          <FAQ items={BUSINESS_FAQS} title="For businesses" />
        </div>
      </div>
    </>
  );
}
