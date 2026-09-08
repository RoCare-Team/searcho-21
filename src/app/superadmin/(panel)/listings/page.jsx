import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Check, ExternalLink, Search, X } from "lucide-react";
import { getAdminListings, setListingDecision } from "@/lib/admin";
import { getAdmin } from "@/lib/admin-auth";
import Pagination from "@/components/Pagination";
import VerifiedBadge from "@/components/VerifiedBadge";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Listings — Superadmin",
  description: "Review business listings.",
  path: "/superadmin/listings",
  index: false,
});

const TABS = [
  { status: "0", label: "Pending" },
  { status: "1", label: "Live" },
  { status: "2", label: "Rejected" },
];

export default async function AdminListingsPage({ searchParams }) {
  const query = await searchParams;
  const status = TABS.some((t) => t.status === query.status) ? query.status : "0";
  const search = query.q?.trim() || undefined;

  const listings = await getAdminListings({
    status,
    search,
    page: Number(query.page) || 1,
    perPage: 25,
  });

  /** Approve or reject one listing, then re-read the list. */
  async function decide(formData) {
    "use server";
    // The layout guards the page, but a server action is its own endpoint and
    // has to check for itself.
    if (!(await getAdmin())) throw new Error("Not signed in");

    const id = String(formData.get("id") ?? "");
    const decision = String(formData.get("decision") ?? "");
    if (!id || (decision !== "approve" && decision !== "reject")) return;

    await setListingDecision(id, decision);
    revalidatePath("/superadmin/listings");
    revalidatePath("/superadmin");
  }

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-navy-900">Listings</h1>
      <p className="mt-1 text-[15px] text-ink-500">
        {listings.total.toLocaleString("en-IN")} {listings.total === 1 ? "listing" : "listings"}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.status}
              href={`/superadmin/listings?status=${tab.status}`}
              aria-current={tab.status === status ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-[14.5px] font-medium transition-colors ${
                tab.status === status
                  ? "bg-navy-900 text-white"
                  : "border border-line bg-white text-ink-700 hover:border-line-strong"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form action="/superadmin/listings" className="flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            <input
              name="q"
              defaultValue={search ?? ""}
              placeholder="Name, mobile or email"
              className="w-56 bg-transparent text-[14.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg border border-line bg-white px-3.5 text-[14.5px] font-medium text-navy-900 transition-colors hover:border-line-strong"
          >
            Search
          </button>
        </form>
      </div>

      {listings.items.length === 0 ? (
        <p className="card mt-5 px-5 py-10 text-center text-[15px] text-ink-500">
          No listings match this view.
        </p>
      ) : (
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[13.5px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listings.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-navy-900">{item.name}</span>
                      {item.verified && <VerifiedBadge compact />}
                    </span>
                    <Link
                      href={`/business/${item.slug}/${item.id}`}
                      target="_blank"
                      className="mt-0.5 inline-flex items-center gap-1 text-[13.5px] text-brand-600 hover:underline"
                    >
                      View public page
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[14.5px] text-ink-600">
                    <span className="block">{item.mobile || "—"}</span>
                    <span className="block break-all text-[13.5px] text-ink-400">
                      {item.email || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[14.5px] text-ink-600">
                    {[item.city, item.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-[14.5px] text-ink-500">
                    {item.createdAt ? String(item.createdAt).slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {status !== "1" && (
                        <form action={decide}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="decision" value="approve" />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-success-600 px-3 text-[14px] font-medium text-white transition-colors hover:bg-success-700"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Approve
                          </button>
                        </form>
                      )}
                      {status !== "2" && (
                        <form action={decide}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="decision" value="reject" />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[14px] font-medium text-navy-900 transition-colors hover:border-brand-300 hover:text-brand-600"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            Reject
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={listings.page}
        totalPages={listings.totalPages}
        basePath="/superadmin/listings"
        searchParams={{ status, q: search }}
      />
    </div>
  );
}
