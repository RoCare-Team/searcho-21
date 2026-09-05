import { Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import QuoteForm from "@/components/QuoteForm";
import { SUPPORT_PHONE, buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the Searcho21 team for help finding a service provider, or for support with your business listing.",
  path: "/contact-us",
});
const CHANNELS = [
  {
    Icon: Phone,
    label: "Customer care",
    value: SUPPORT_PHONE,
    href: `tel:+91${SUPPORT_PHONE}`,
  },
  {
    Icon: Mail,
    label: "Email",
    value: "support@searcho21.com",
    href: "mailto:support@searcho21.com",
  },
  {
    Icon: MapPin,
    label: "Serving",
    value: "PAN India",
  },
];
export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        description="Reach the Searcho21 team for help finding a service provider, or for support with a business listing."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact Us", href: "/contact-us" },
        ]}
      />

      <div className="shell py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="text-base font-semibold">Send us a message</h2>
            <p className="mt-1 text-[13px] text-ink-500">
              Tell us what you need and the team will get back to you.
            </p>
            <div className="card mt-4 max-w-lg p-5">
              <QuoteForm />
            </div>
          </div>

          <aside>
            <h2 className="text-base font-semibold">Other ways to reach us</h2>
            <ul className="mt-4 space-y-3">
              {CHANNELS.map(({ Icon, label, value, href }) => (
                <li key={label} className="card flex items-start gap-3 p-4">
                  <span className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium text-navy-900 transition-colors hover:text-brand-600"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-navy-900">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
