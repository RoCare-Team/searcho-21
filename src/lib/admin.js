import "server-only";
import * as repo from "@/lib/repository";

/**
 * Data access for the superadmin panel.
 *
 * Kept apart from `lib/api.js` so the public site's seam stays read-only and
 * obviously so: nothing the directory renders can reach a write from here.
 */

/** Dashboard counters. Missing values read as zero rather than breaking. */
export async function getAdminCounts() {
  const row = await repo.fetchAdminCounts();
  return {
    pending: Number(row?.pending ?? 0),
    live: Number(row?.live ?? 0),
    verified: Number(row?.verified ?? 0),
    enquiries: Number(row?.enquiries ?? 0),
    popupEnquiries: Number(row?.popup_enquiries ?? 0),
    vendors: Number(row?.vendors ?? 0),
    localities: Number(row?.localities ?? 0),
  };
}

/**
 * One page of listings for the admin list.
 *
 * `status` is the same flag the existing panel filters on: '0' is awaiting a
 * decision, '1' is live.
 */
export async function getAdminListings(query = {}) {
  const { page = 1, perPage = 25, ...filters } = query;
  const countRow = await repo.fetchAdminListingCount(filters);
  const total = Number(countRow?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const rows = await repo.fetchAdminListings({
    ...filters,
    limit: perPage,
    offset: (safePage - 1) * perPage,
  });

  return {
    items: (rows ?? []).map((row) => ({
      id: String(row.id),
      name: row.business_name,
      slug: row.listing_url,
      mobile: row.mobile_no ?? "",
      email: row.email ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      verified: row.verified_status === "1",
      status: String(row.status),
      createdAt: row.created_at ?? null,
    })),
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

/**
 * Approves or rejects a listing.
 *
 * Mirrors the existing panel's two actions: approve sets status '1', reject
 * sets '2'. The SMS the Laravel controller sends on approval is not sent here —
 * that goes through a third-party gateway with its own credentials, and firing
 * it from a second place would double-message the vendor.
 *
 * @param {string} id
 * @param {"approve" | "reject"} decision
 */
export async function setListingDecision(id, decision) {
  const status = decision === "approve" ? "1" : "2";
  const result = await repo.setListingStatus(id, status);
  return result !== null;
}
