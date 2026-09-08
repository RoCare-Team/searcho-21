import Link from "next/link";
import { BadgeCheck, Building2, ClipboardList, Inbox, MapPin, Users } from "lucide-react";
import { getAdminCounts } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Dashboard — Superadmin",
  description: "Searcho21 staff dashboard.",
  path: "/superadmin",
  index: false,
});

/**
 * Dashboard. Every figure is a live COUNT against the tables the panel acts on,
 * so a number here always matches what the corresponding list shows.
 */
export default async function AdminDashboard() {
  const counts = await getAdminCounts();

  const cards = [
    {
      label: "Pending approval",
      value: counts.pending,
      Icon: ClipboardList,
      href: "/superadmin/listings?status=0",
      accent: true,
    },
    {
      label: "Live listings",
      value: counts.live,
      Icon: Building2,
      href: "/superadmin/listings?status=1",
    },
    { label: "Verified", value: counts.verified, Icon: BadgeCheck },
    { label: "Enquiries", value: counts.enquiries, Icon: Inbox },
    { label: "Popup enquiries", value: counts.popupEnquiries, Icon: Inbox },
    { label: "Vendors", value: counts.vendors, Icon: Users },
    { label: "Localities", value: counts.localities, Icon: MapPin },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-navy-900">Dashboard</h1>
      <p className="mt-1 text-[15px] text-ink-500">Live counts from the Searcho21 database.</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon, href, accent }) => {
          const body = (
            <>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  accent ? "bg-brand-50" : "bg-canvas"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${accent ? "text-brand-500" : "text-ink-500"}`}
                  aria-hidden
                />
              </span>
              <span className="mt-3 block text-[26px] font-semibold leading-none text-navy-900">
                {value.toLocaleString("en-IN")}
              </span>
              <span className="mt-1.5 block text-[14.5px] text-ink-500">{label}</span>
            </>
          );

          return (
            <li key={label}>
              {href ? (
                <Link href={href} className="card card-hover block p-5">
                  {body}
                </Link>
              ) : (
                <div className="card p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
