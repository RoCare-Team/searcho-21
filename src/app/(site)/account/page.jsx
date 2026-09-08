import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Building2, Clock, ExternalLink, Eye, LogOut, Mail, Phone } from "lucide-react";
import { clearUserSession, getUser, getUserListings } from "@/lib/account";
import VerifiedBadge from "@/components/VerifiedBadge";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "My account",
  description: "Your Searcho21 business listings.",
  path: "/account",
  // A signed-in page has nothing for a crawler.
  index: false,
});

/** free_listing_tb.status, as the admin panel uses it. */
const STATUS = {
  0: { label: "Pending approval", className: "border-line bg-canvas text-ink-600", Icon: Clock },
  1: {
    label: "Live",
    className: "border-success-200 bg-success-50 text-success-700",
    Icon: BadgeCheck,
  },
  2: { label: "Rejected", className: "border-brand-200 bg-brand-50 text-brand-700", Icon: Clock },
};

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const listings = await getUserListings(user.id);
  const live = listings.filter((l) => l.status === "1").length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  async function signOut() {
    "use server";
    await clearUserSession();
    redirect("/login");
  }

  return (
    <div className="shell py-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold text-navy-900">
            {user.company || user.name || "My account"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[15px] text-ink-600">
            {user.mobile && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-ink-400" aria-hidden />
                +91 {user.mobile}
              </span>
            )}
            {user.email && (
              <span className="inline-flex items-center gap-1.5 break-all">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                {user.email}
              </span>
            )}
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line px-4 text-[15px] font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Listings", value: listings.length, Icon: Building2 },
          { label: "Live", value: live, Icon: BadgeCheck },
          { label: "Total views", value: totalViews, Icon: Eye },
        ].map(({ label, value, Icon }) => (
          <li key={label} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Icon className="h-5 w-5 text-brand-500" aria-hidden />
            </span>
            <span className="mt-3 block text-[26px] font-semibold leading-none text-navy-900">
              {value.toLocaleString("en-IN")}
            </span>
            <span className="mt-1.5 block text-[14.5px] text-ink-500">{label}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-9 text-[19px] font-semibold text-navy-900">Your listings</h2>

      {listings.length === 0 ? (
        <div className="card mt-3 px-5 py-10 text-center">
          <p className="text-[15.5px] font-medium text-navy-900">No listings yet</p>
          <p className="mt-1 text-[15px] text-ink-500">
            Add your business so customers can find you.
          </p>
          <Link
            href="/list-your-business"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand-500 px-4 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            List your business
          </Link>
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {listings.map((listing) => {
            const state = STATUS[listing.status] ?? STATUS[0];
            return (
              <li key={listing.id} className="card flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[16.5px] font-semibold text-navy-900">
                      {listing.name}
                    </span>
                    {listing.verified && <VerifiedBadge compact />}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14.5px] text-ink-500">
                    <span>{[listing.city, listing.state].filter(Boolean).join(", ") || "—"}</span>
                    {listing.views > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                        {listing.views.toLocaleString("en-IN")} views
                      </span>
                    )}
                  </span>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] font-medium ${state.className}`}
                >
                  <state.Icon className="h-3.5 w-3.5" aria-hidden />
                  {state.label}
                </span>

                {listing.status === "1" && (
                  <Link
                    href={`/business/${listing.slug}/${listing.id}`}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3.5 text-[14.5px] font-medium text-navy-900 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    View
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
