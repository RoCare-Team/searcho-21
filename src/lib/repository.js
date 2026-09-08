import "server-only";
import { query, queryOne } from "@/lib/db";
/**
 * Reads of the live Searcho21 tables.
 *
 * Each function mirrors a query the existing Laravel app already runs; the
 * comment names the `WebController` method it comes from so the two stay
 * comparable. Everything is read-only — the frontend never writes to these
 * tables.
 *
 * Returns null when no database is configured, which is the signal for
 * `src/lib/api.ts` to fall back to the sample dataset in `src/data`.
 */
/** locality_tb WHERE status = 1 */
export function fetchLocalities(limit = 2000) {
  return query(
    `SELECT id, locality_name, locality_url, city_id, state_id, city_name, state_name,
            locality_icon, popular_locality, status
       FROM locality_tb
      WHERE status = 1
      ORDER BY id ASC
      LIMIT ?`,
    [limit],
  );
}
/** locality_tb WHERE locality_url = ? — WebController::locality_or_category() */
export function fetchLocalityBySlug(slug) {
  return queryOne(
    `SELECT id, locality_name, locality_url, city_id, state_id, city_name, state_name,
            locality_icon, locality_content, meta_title, meta_description,
            popular_locality, status
       FROM locality_tb
      WHERE locality_url = ? AND status = 1
      LIMIT 1`,
    [slug],
  );
}
/** Other localities in the same city — powers the "nearby" blocks. */
export function fetchSiblingLocalities(cityId, excludeId, limit = 24) {
  return query(
    `SELECT id, locality_name, locality_url, city_id, state_id, city_name, state_name, status
       FROM locality_tb
      WHERE city_id = ? AND id <> ? AND status = 1
      ORDER BY id ASC
      LIMIT ?`,
    [cityId, excludeId, limit],
  );
}
/** category_tb WHERE status = 1 */
export function fetchCategories() {
  return query(`SELECT * FROM category_tb WHERE status = '1' ORDER BY id ASC`);
}
/** category_level_one_tb WHERE status = 1 */
export function fetchLevelOne() {
  return query(`SELECT * FROM category_level_one_tb WHERE status = '1' ORDER BY id ASC`);
}
/** category_level_two_tb WHERE status = 1 */
export function fetchLevelTwo() {
  return query(`SELECT * FROM category_level_two_tb WHERE status = '1' ORDER BY id ASC`);
}
/** category_level_three_tb WHERE status = 1 — these are the brand pages. */
export function fetchLevelThree() {
  return query(`SELECT * FROM category_level_three_tb WHERE status = '1' ORDER BY id ASC`);
}
/**
 * location_category_mapping_tb for one exact URL.
 *
 * The table stores 0 for levels that do not apply, which is how the controllers
 * tell a category page from a level-three page.
 */
export function fetchPageMapping(
  localityId,
  categoryId,
  levelOneId = 0,
  levelTwoId = 0,
  levelThreeId = 0,
) {
  return queryOne(
    `SELECT * FROM location_category_mapping_tb
      WHERE locality_id = ? AND category_id = ?
        AND cat_level_one_id = ? AND cat_level_two_id = ? AND cat_level_three_id = ?
      LIMIT 1`,
    [localityId, categoryId, levelOneId, levelTwoId, levelThreeId],
  );
}
/**
 * WebController::locality_category() and friends:
 *   free_listing_tb JOIN free_listing_category_location_maping_tb
 *   WHERE status = 1 [AND locality_id / category_id / level ids]
 *   GROUP BY free_listing_tb.id ORDER BY listing_order DESC
 */
/**
 * Sort clauses, kept as a lookup so the value from the URL can never reach the
 * SQL string. Anything unrecognised falls back to the controllers' own default,
 * listing_order descending.
 */
const ORDER_BY = {
  relevance: "f.listing_order DESC",
  views: "f.views DESC, f.listing_order DESC",
  name: "f.business_name ASC",
};

export function fetchListings(q) {
  const where = ["f.status = '1'"];
  const params = [];
  if (q.localityId) {
    where.push("m.locality_id = ?");
    params.push(q.localityId);
  }
  if (q.categoryId) {
    where.push("m.category_id = ?");
    params.push(q.categoryId);
  }
  if (q.levelOneId) {
    where.push("m.cat_level_one_id = ?");
    params.push(q.levelOneId);
  }
  if (q.levelTwoId) {
    where.push("m.cat_level_two_id = ?");
    params.push(q.levelTwoId);
  }
  if (q.verifiedOnly) {
    where.push("f.verified_status = '1'");
  }
  params.push(q.limit, q.offset);
  return query(
    `SELECT f.*
       FROM free_listing_tb f
       JOIN free_listing_category_location_maping_tb m ON m.free_listing_id = f.id
      WHERE ${where.join(" AND ")}
      GROUP BY f.id
      ORDER BY ${ORDER_BY[q.sort] ?? ORDER_BY.relevance}
      LIMIT ? OFFSET ?`,
    params,
  );
}
/** Total for the same filters, so pagination can be rendered. */
export function fetchListingCount(q) {
  const where = ["f.status = '1'"];
  const params = [];
  if (q.localityId) {
    where.push("m.locality_id = ?");
    params.push(q.localityId);
  }
  if (q.categoryId) {
    where.push("m.category_id = ?");
    params.push(q.categoryId);
  }
  if (q.levelOneId) {
    where.push("m.cat_level_one_id = ?");
    params.push(q.levelOneId);
  }
  if (q.levelTwoId) {
    where.push("m.cat_level_two_id = ?");
    params.push(q.levelTwoId);
  }
  if (q.verifiedOnly) {
    where.push("f.verified_status = '1'");
  }
  return queryOne(
    `SELECT COUNT(DISTINCT f.id) AS total
       FROM free_listing_tb f
       JOIN free_listing_category_location_maping_tb m ON m.free_listing_id = f.id
      WHERE ${where.join(" AND ")}`,
    params,
  );
}
/** WebController::free_listing_inner($listingurl, $listingid) */
export function fetchListingById(id) {
  return queryOne(`SELECT * FROM free_listing_tb WHERE id = ? LIMIT 1`, [id]);
}
/** gallery_images_tb WHERE free_listing_id = ? */
export function fetchGallery(listingId) {
  return query(`SELECT * FROM gallery_images_tb WHERE free_listing_id = ?`, [listingId]);
}
/** vendor_business_keyword_tb JOIN keyword_tb — the services shown on a listing. */
export function fetchListingKeywords(listingId) {
  return query(
    `SELECT k.keyword_name
       FROM vendor_business_keyword_tb v
       JOIN keyword_tb k ON k.id = v.keyword_id
      WHERE v.free_listing_id = ?
      ORDER BY v.keyword_id ASC`,
    [listingId],
  );
}
/** The category rows a listing is mapped to, for its chips and related links. */
export function fetchListingMappings(listingId) {
  return query(
    `SELECT locality_id, category_id, cat_level_one_id, cat_level_two_id, cat_level_three_id
       FROM free_listing_category_location_maping_tb
      WHERE free_listing_id = ?`,
    [listingId],
  );
}

/**
 * The homepage service tiles — WebController::index().
 *
 * The live homepage is not built from the category tree: it reads this curated
 * table, grouped by `category` (1 = Water Purifier, 2 = AC, matching
 * category_level_one_tb ids). Each row carries its own label, expert count,
 * city-relative URL and image path.
 */
export function fetchHomePageServices() {
  return query(
    `SELECT id, category, service_name, experts, url, image_url
       FROM home_page_services_tb
      WHERE status = '1'
      ORDER BY category ASC, id ASC`,
  );
}

/** global_setting_tb — a single row of site-wide settings. */
export function fetchGlobalSettings() {
  return queryOne(`SELECT * FROM global_setting_tb WHERE status = 1 LIMIT 1`);
}

/**
 * How many listings are mapped to each level-one category.
 *
 * Counted from free_listing_category_location_maping_tb, the same table the
 * listing pages filter on, so the number on a category card matches what the
 * visitor finds after clicking it.
 */
export function fetchCategoryListingCounts() {
  return query(
    `SELECT o.id, COUNT(DISTINCT m.free_listing_id) AS listings
       FROM category_level_one_tb o
       LEFT JOIN free_listing_category_location_maping_tb m
              ON m.cat_level_one_id = o.id
      WHERE o.status = '1'
      GROUP BY o.id`,
  );
}

/**
 * How many listings are mapped to each level-two service, keyed by its slug.
 *
 * Counted from free_listing_category_location_maping_tb, the same table the
 * listing pages filter on, so a count shown on a card matches what the visitor
 * finds after clicking it.
 */
export function fetchServiceTypeListingCounts() {
  return query(
    `SELECT t.cat_level_two_url AS slug,
            COUNT(DISTINCT m.free_listing_id) AS listings
       FROM category_level_two_tb t
       LEFT JOIN free_listing_category_location_maping_tb m
              ON m.cat_level_two_id = t.id
      WHERE t.status = '1'
      GROUP BY t.id`,
  );
}

/**
 * Listings per level-two service, for the filter panel's counts.
 *
 * Scoped to the same locality and level-one the page is showing, so the number
 * beside "AC Installation" is what that checkbox would actually return.
 */
export function fetchServiceTypeCounts({ localityId, levelOneId }) {
  const where = ["f.status = '1'"];
  const params = [];
  if (localityId) {
    where.push("m.locality_id = ?");
    params.push(localityId);
  }
  if (levelOneId) {
    where.push("m.cat_level_one_id = ?");
    params.push(levelOneId);
  }
  return query(
    `SELECT t.cat_level_two_url AS slug, COUNT(DISTINCT m.free_listing_id) AS listings
       FROM category_level_two_tb t
       JOIN free_listing_category_location_maping_tb m ON m.cat_level_two_id = t.id
       JOIN free_listing_tb f ON f.id = m.free_listing_id
      WHERE ${where.join(" AND ")}
      GROUP BY t.id`,
    params,
  );
}

/**
 * default_banner_tb — the fallback artwork a listing shows when it has none.
 *
 * WebController does the same lookup on its listing pages
 * (`default_banner_tb::where('category_id', …)`), which is why the live site
 * shows a banner on every card: only 186 of 11,542 listings have one of their
 * own.
 */
export function fetchDefaultBanners() {
  return query(
    `SELECT category_id, cat_level_one_id, banner_image
       FROM default_banner_tb
      WHERE status = '1' AND banner_image IS NOT NULL AND banner_image <> ''
      ORDER BY id ASC`,
  );
}

/* -------------------------------------------------------------------------- */
/* Superadmin                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Dashboard counters, in one round trip.
 *
 * Mirrors what the existing panel's lists are filtered on: pending listings are
 * status '0', live ones '1'.
 */
export function fetchAdminCounts() {
  return queryOne(
    `SELECT
       (SELECT COUNT(*) FROM free_listing_tb WHERE status = '0') AS pending,
       (SELECT COUNT(*) FROM free_listing_tb WHERE status = '1') AS live,
       (SELECT COUNT(*) FROM free_listing_tb WHERE status = '1' AND verified_status = '1') AS verified,
       (SELECT COUNT(*) FROM enquiry_tb) AS enquiries,
       (SELECT COUNT(*) FROM get_popup_enquiry_tb) AS popup_enquiries,
       (SELECT COUNT(*) FROM user_tb WHERE user_type_key = 'user') AS vendors,
       (SELECT COUNT(*) FROM locality_tb WHERE status = 1) AS localities`,
  );
}

/**
 * Listings awaiting a decision — SuperadminController::list_free_listing().
 *
 * Same filters the existing screen offers, all optional.
 */
export function fetchAdminListings(q = {}) {
  const where = ["f.status = ?"];
  const params = [q.status ?? "0"];

  if (q.search) {
    where.push("(f.business_name LIKE ? OR f.mobile_no LIKE ? OR f.email LIKE ?)");
    const like = `%${q.search}%`;
    params.push(like, like, like);
  }
  if (q.verifiedStatus) {
    where.push("f.verified_status = ?");
    params.push(q.verifiedStatus);
  }
  if (q.city) {
    where.push("f.city = ?");
    params.push(q.city);
  }

  params.push(q.limit ?? 25, q.offset ?? 0);
  return query(
    `SELECT f.id, f.business_name, f.listing_url, f.mobile_no, f.email, f.city, f.state,
            f.verified_status, f.status, f.created_at, f.logo_img
       FROM free_listing_tb f
      WHERE ${where.join(" AND ")}
      ORDER BY f.id DESC
      LIMIT ? OFFSET ?`,
    params,
  );
}

/** Total for the same filters, so the list can be paged. */
export function fetchAdminListingCount(q = {}) {
  const where = ["f.status = ?"];
  const params = [q.status ?? "0"];

  if (q.search) {
    where.push("(f.business_name LIKE ? OR f.mobile_no LIKE ? OR f.email LIKE ?)");
    const like = `%${q.search}%`;
    params.push(like, like, like);
  }
  if (q.verifiedStatus) {
    where.push("f.verified_status = ?");
    params.push(q.verifiedStatus);
  }
  if (q.city) {
    where.push("f.city = ?");
    params.push(q.city);
  }

  return queryOne(
    `SELECT COUNT(*) AS total FROM free_listing_tb f WHERE ${where.join(" AND ")}`,
    params,
  );
}

/**
 * Sets a listing's status — SuperadminController::approve_listing() and
 * reject_listing().
 *
 * The only write the panel performs so far. It is deliberately narrow: one
 * column, one row, and the value is checked by the caller rather than passed
 * through from a request.
 */
export function setListingStatus(listingId, status) {
  if (status !== "0" && status !== "1" && status !== "2") {
    throw new Error(`Refusing to write unexpected listing status: ${status}`);
  }
  return query(`UPDATE free_listing_tb SET status = ? WHERE id = ? LIMIT 1`, [status, listingId]);
}

/** state_tb — the enquiry popup's state dropdown. */
export function fetchStates() {
  return query(`SELECT id, state_name FROM state_tb WHERE status = '1' ORDER BY state_name ASC`);
}

/** city_tb — the enquiry popup's city dropdown, narrowed by state in the UI. */
export function fetchCities() {
  return query(
    `SELECT id, city_name, state_id FROM city_tb WHERE status = '1' ORDER BY city_name ASC`,
  );
}
