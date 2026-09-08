import { getDataSourceStatus, isDbConfigured } from "@/lib/db";
import * as repo from "@/lib/repository";
import { mapListing } from "@/lib/mappers";
import { stripHtml } from "@/lib/format";
import { CITY_PHOTOS } from "@/lib/city-photos";
/**
 * Data access layer — the single seam between the UI and the data.
 *
 * Everything here reads the live Searcho21 tables through
 * `src/lib/repository.ts`. There is no bundled dataset: with the database
 * unconfigured or unreachable these return empty, and the UI shows its empty
 * states rather than content that came from somewhere other than the database.
 *
 * `SEARCHO21_DB_HOST` / `_USER` / `_PASSWORD` / `_NAME` switch it on.
 */
export { getDataSourceStatus };

/** True when the database connection is configured. */
export function isLive() {
  return isDbConfigured();
}
/* -------------------------------------------------------------------------- */
/* Localities                                                                  */
/* -------------------------------------------------------------------------- */
/** locality_tb WHERE status = 1 */
export async function getCities() {
  const rows = await repo.fetchLocalities();
  if (!rows) return [];
  return rows.map((row) => ({
    id: row.id,
    slug: row.locality_url,
    name: row.locality_name,
    city: row.city_name ?? undefined,
    state: row.state_name ?? "",
    // locality_icon is the column for this, but it is empty for every row, so
    // fall back to the artwork shipped in assets/img_city.
    photo: row.locality_icon || CITY_PHOTOS[row.locality_url],
    // popular_locality is enum('0','1') — comparing it to 1 in SQL matches the
    // first enum member, i.e. '0', so the check has to happen here.
    popular: row.popular_locality === "1",
  }));
}
/** locality_tb WHERE locality_url = ? — WebController::locality_or_category() */
export async function getCity(slug) {
  const row = await repo.fetchLocalityBySlug(slug);
  if (!row) return null;
  // Sibling localities in the same city power the "also serving nearby" block.
  const siblings = row.city_id ? await repo.fetchSiblingLocalities(row.city_id, row.id) : null;
  return {
    id: row.id,
    slug: row.locality_url,
    name: row.locality_name,
    city: row.city_name ?? undefined,
    state: row.state_name ?? "",
    nearby: siblings?.map((s) => s.locality_url),
    localities: siblings?.map((s) => s.locality_name),
    // Same two fields getCities() derives; the city page needs them too.
    photo: row.locality_icon || CITY_PHOTOS[row.locality_url],
    popular: row.popular_locality === "1",
  };
}
/**
 * Cities to feature on the homepage.
 *
 * locality_tb.popular_locality is the curated flag, but no row is set to '1'
 * yet, so it yields nothing on its own. Until someone flags cities in the admin
 * panel, fall back to the ones the media library actually has a photograph for —
 * a row that mixes photo tiles with empty frames reads as broken artwork. Both
 * lists come from the database; only the ordering differs.
 */
export async function getPopularCities() {
  const all = await getCities();
  const flagged = all.filter((city) => city.popular);
  if (flagged.length > 0) return flagged.slice(0, 18);
  return all.filter((city) => city.photo).slice(0, 18);
}
/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */
/**
 * The whole category tree, assembled from the four level tables.
 *
 * The live schema splits it across category_tb → category_level_one_tb →
 * _two_tb → _three_tb; this stitches them back into the nested shape the UI
 * uses, so a page never has to know about the split.
 */
export async function getCategories() {
  const [cats, l1, l2, l3] = await Promise.all([
    repo.fetchCategories(),
    repo.fetchLevelOne(),
    repo.fetchLevelTwo(),
    repo.fetchLevelThree(),
  ]);
  if (!cats || !l1 || !l2 || !l3) return [];
  return cats.map((cat) => ({
    id: cat.id,
    slug: cat.cat_url,
    name: cat.cat_name,
    description: stripHtml(cat.cat_desc),
    image: cat.cat_image ?? undefined,
    keywords: cat.cat_meta_keyword ?? undefined,
    subCategories: l1
      .filter((one) => one.category_id === cat.id)
      .map((one) => {
        const types = l2.filter((two) => two.cat_level_one_id === one.id);
        // Level three rows are the brand pages; the same brand appears under
        // several level-two parents with a different slug each.
        const brands = new Map();
        for (const three of l3) {
          const parent = types.find((two) => two.id === three.cat_level_two_id);
          if (!parent) continue;
          const existing = brands.get(three.cat_level_three_name) ?? {
            name: three.cat_level_three_name,
            slugs: {},
            image: three.cat_level_three_image ?? undefined,
            keywords: three.cat_level_three_meta_keyword ?? undefined,
          };
          existing.slugs[parent.cat_level_two_url] = three.cat_level_three_url;
          brands.set(three.cat_level_three_name, existing);
        }
        return {
          id: one.id,
          slug: one.cat_level_one_url,
          name: one.cat_level_one_name,
          description: stripHtml(one.cat_level_one_description),
          image: one.cat_level_one_image ?? undefined,
          // `cat_level_one_icon` is named for an icon but stores a photograph
          // of the service (assets/category), and a distinct one per service —
          // unlike cat_level_one_image, which is the same wide phone-number
          // banner for nine of the twelve. It is the usable artwork here.
          photo: one.cat_level_one_icon ?? undefined,
          keywords: one.cat_level_one_meta_keyword ?? undefined,
          serviceTypes: types.map((two) => ({
            id: two.id,
            slug: two.cat_level_two_url,
            name: two.cat_level_two_name,
            description: stripHtml(two.cat_level_two_description),
            image: two.cat_level_two_image ?? undefined,
            photo: two.cat_level_two_icon ?? undefined,
            keywords: two.cat_level_two_meta_keyword ?? undefined,
          })),
          brands: [...brands.values()],
        };
      }),
  }));
}
/** category_tb WHERE cat_url = ? */
export async function getCategory(slug) {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}
/** category_level_one_tb WHERE cat_level_one_url = ? */
export async function getSubCategory(categorySlug, subCategorySlug) {
  const category = await getCategory(categorySlug);
  if (!category) return null;
  const subCategory = category.subCategories.find((s) => s.slug === subCategorySlug);
  return subCategory ? { category, subCategory } : null;
}
/** category_level_two_tb WHERE cat_level_two_url = ? */
export async function getServiceType(categorySlug, subCategorySlug, serviceTypeSlug) {
  const found = await getSubCategory(categorySlug, subCategorySlug);
  if (!found) return null;
  const serviceType = found.subCategory.serviceTypes.find((s) => s.slug === serviceTypeSlug);
  return serviceType ? { ...found, serviceType } : null;
}
/** category_level_three_tb WHERE cat_level_three_url = ? */
export async function getBrandBySlug(categorySlug, subCategorySlug, serviceTypeSlug, brandSlug) {
  const found = await getSubCategory(categorySlug, subCategorySlug);
  if (!found) return null;
  return found.subCategory.brands?.find((b) => b.slugs[serviceTypeSlug] === brandSlug) ?? null;
}
/** category_level_three_tb WHERE cat_level_two_id = ? */
export async function getBrandsForServiceType(categorySlug, subCategorySlug, serviceTypeSlug) {
  const found = await getSubCategory(categorySlug, subCategorySlug);
  if (!found) return [];
  return (found.subCategory.brands ?? []).filter((b) => Boolean(b.slugs[serviceTypeSlug]));
}
/** location_category_mapping_tb — the stored SEO copy for one exact URL. */
export async function getPageContent(ids) {
  if (!isDbConfigured() || !ids.localityId || !ids.categoryId) return null;
  return repo.fetchPageMapping(
    ids.localityId,
    ids.categoryId,
    ids.levelOneId ?? 0,
    ids.levelTwoId ?? 0,
    ids.levelThreeId ?? 0,
  );
}
/** Resolves a slug to the numeric ids the mapping table stores. */
async function resolveIds(citySlug, categorySlug) {
  const [city, categories] = await Promise.all([
    citySlug ? getCity(citySlug) : Promise.resolve(null),
    categorySlug ? getCategories() : Promise.resolve([]),
  ]);
  let categoryId;
  let levelOneId;
  for (const category of categories) {
    if (category.slug === categorySlug) {
      categoryId = category.id;
      break;
    }
    const sub = category.subCategories.find((s) => s.slug === categorySlug);
    if (sub) {
      categoryId = category.id;
      levelOneId = sub.id;
      break;
    }
  }
  return { localityId: city?.id, categoryId, levelOneId };
}
/**
 * free_listing_tb JOIN free_listing_category_location_maping_tb
 * WHERE status = 1 GROUP BY id ORDER BY listing_order DESC
 */
export async function getBusinesses(query = {}) {
  const {
    citySlug,
    categorySlug,
    sort,
    verifiedOnly,
    locality,
    serviceType,
    page = 1,
    perPage = 10,
  } = query;
  const base = await resolveIds(citySlug, categorySlug);
  const ids = { ...base, ...(await resolveFilters({ base, locality, serviceType })), verifiedOnly };
  const countRow = await repo.fetchListingCount(ids);
  const total = Number(countRow?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rows = await repo.fetchListings({
    ...ids,
    sort,
    limit: perPage,
    offset: (safePage - 1) * perPage,
  });
  if (!rows) return { items: [], total: 0, page: 1, perPage, totalPages: 1 };
  const items = await Promise.all(rows.map((row) => buildBusiness(row)));
  return { items, total, page: safePage, perPage, totalPages };
}
/** WebController::free_listing_inner($listingurl, $listingid) */
export async function getBusiness(slug, id) {
  const row = await repo.fetchListingById(id);
  // The slug is validated so a wrong one does not serve the page.
  if (!row || row.listing_url !== slug) return null;
  return buildBusiness(row);
}
/** Related listings: same locality and category as the current one. */
export async function getRelatedBusinesses(business, limit = 3) {
  const result = await getBusinesses({
    citySlug: business.address.citySlug,
    categorySlug: business.categories[1] ?? business.categories[0],
    perPage: limit + 1,
  });
  return result.items.filter((b) => b.id !== business.id).slice(0, limit);
}
/** Count for a city/category pair, or null when there are none. */
export async function getListingCount(citySlug, categorySlug) {
  const result = await getBusinesses({ citySlug, categorySlug, perPage: 1 });
  return result.total > 0 ? result.total : null;
}
/* -------------------------------------------------------------------------- */
/* Row → view model                                                            */
/* -------------------------------------------------------------------------- */
/** A listing row plus its joined gallery, keywords and category mappings. */
async function buildBusiness(row) {
  const id = String(row.id);
  const [gallery, keywords, mappings, categories, allCities, defaultBanners] = await Promise.all([
    repo.fetchGallery(id),
    repo.fetchListingKeywords(id),
    repo.fetchListingMappings(id),
    getCategories(),
    getCities(),
    getDefaultBanners(),
  ]);
  const categorySlugs = new Set();
  const labels = new Set();
  for (const m of mappings ?? []) {
    const category = categories.find((c) => c.id === m.category_id);
    if (category) categorySlugs.add(category.slug);
    const sub = category?.subCategories.find((s) => s.id === m.cat_level_one_id);
    if (sub) {
      categorySlugs.add(sub.slug);
      labels.add(sub.name);
    }
  }
  // The listing's own banner where it has one, otherwise its category's — the
  // fallback WebController applies, and the reason the live site shows artwork
  // on every card.
  const categoryId = mappings?.[0]?.category_id;
  const fallbackList = categoryId ? defaultBanners.get(categoryId) : undefined;
  const fallbackBanner = fallbackList?.length
    ? fallbackList[Number(row.id) % fallbackList.length]
    : undefined;

  const localityId = mappings?.[0]?.locality_id;
  const citySlug = allCities.find((c) => c.id === localityId)?.slug;
  return mapListing(row, {
    fallbackBanner,
    gallery: gallery ?? undefined,
    keywords: keywords?.map((k) => k.keyword_name),
    categories: [...categorySlugs],
    categoryLabels: [...labels],
    citySlug,
  });
}

/* -------------------------------------------------------------------------- */
/* Homepage                                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Resolves home_page_services_tb.image_url.
 *
 * Unlike every other image column, this one stores a whole relative path
 * ("assets/img/category/ac-repair.jpg") rather than a bare filename, so it does
 * not go through `assetUrl`. The live server serves that path verbatim; the
 * local copy of the media library flattened `assets/img/<x>` to `assets/img_<x>`,
 * so the path is rewritten when serving from `public/`.
 */
function homeServiceImage(path) {
  if (!path) return null;
  const clean = String(path).trim().replace(/^\/+/, "");
  if (!clean) return null;
  const base = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/$/, "");
  if (base) return `${base}/${clean}`;
  return `/${clean.replace(/^assets\/img\/([a-z_-]+)\//i, "assets/img_$1/")}`;
}

/**
 * The homepage service sections — WebController::index().
 *
 * Two sections, one per `category` value, titled with the matching
 * category_level_one_tb name so the heading never drifts from the taxonomy.
 * `experts` is a real stored count, not a computed or invented one.
 */
export async function getHomeServices() {
  const [rows, levelOne, counts] = await Promise.all([
    repo.fetchHomePageServices(),
    repo.fetchLevelOne(),
    repo.fetchServiceTypeListingCounts(),
  ]);
  if (!rows || rows.length === 0) return [];

  const nameById = new Map((levelOne ?? []).map((one) => [one.id, one.cat_level_one_name]));
  const listingsBySlug = new Map(
    (counts ?? []).map((row) => [row.slug, Number(row.listings) || 0]),
  );
  const sections = new Map();
  for (const row of rows) {
    if (!sections.has(row.category)) {
      sections.set(row.category, {
        id: row.category,
        title: nameById.get(row.category) ?? "",
        items: [],
      });
    }
    const slug = String(row.url).split("/").filter(Boolean).pop();
    sections.get(row.category).items.push({
      id: row.id,
      name: row.service_name,
      // Stored without a leading slash and without the city, which the visitor's
      // chosen city supplies: "/<city>/home-appliance/water-purifier/service".
      path: `/${String(row.url).replace(/^\/+/, "")}`,
      // Last URL segment is the level-two slug: it picks the icon and the count.
      slug,
      // Counted live, not read from home_page_services_tb.experts: that column
      // is stale — it claims 43 providers for water purifier repair, where the
      // mapping table actually has 7,504.
      experts: listingsBySlug.get(slug) || undefined,
      image: homeServiceImage(row.image_url),
    });
  }
  return [...sections.values()].filter((s) => s.title && s.items.length > 0);
}

/**
 * global_setting_tb — the site-wide settings row.
 *
 * Only one row exists; it holds the website keywords the live homepage puts in
 * its meta tag, along with the contact details shown in the footer.
 */
export async function getGlobalSettings() {
  const row = await repo.fetchGlobalSettings();
  if (!row) return null;
  return {
    name: row.website_name ?? undefined,
    keywords: row.website_keyword ?? undefined,
    description: stripHtml(row.website_description),
    email: row.email ?? undefined,
    phone: row.phone_no ?? undefined,
  };
}

/**
 * Listing counts keyed by level-one category id.
 *
 * Returns an empty map when the database is unreachable, so a card simply drops
 * its count rather than showing a wrong one.
 */
export async function getCategoryListingCounts() {
  const rows = await repo.fetchCategoryListingCounts();
  if (!rows) return new Map();
  return new Map(rows.map((row) => [row.id, Number(row.listings) || 0]));
}

/**
 * Turns the filter panel's URL values into the ids the mapping table stores.
 *
 * A locality arrives as a name ("Vashi") because that is what the page lists,
 * and a service type as a slug. Anything that does not resolve is dropped
 * rather than guessed, so a stale link degrades to an unfiltered page.
 */
async function resolveFilters({ base, locality, serviceType }) {
  const out = {};

  if (locality) {
    const cities = await getCities();
    const match = cities.find((c) => c.name === locality);
    if (match?.id) out.localityId = match.id;
  }

  if (serviceType) {
    const categories = await getCategories();
    for (const category of categories) {
      for (const sub of category.subCategories) {
        const type = sub.serviceTypes.find((t) => t.slug === serviceType);
        if (type?.id) {
          out.levelTwoId = type.id;
          return out;
        }
      }
    }
  }

  return out;
}

/** Listing counts per level-two slug, for the filter panel. */
export async function getServiceTypeCounts({ citySlug, categorySlug, subCategorySlug }) {
  const ids = await resolveIds(citySlug, categorySlug);
  let levelOneId = ids.levelOneId;
  if (!levelOneId && subCategorySlug) {
    const found = await getSubCategory(categorySlug, subCategorySlug);
    levelOneId = found?.subCategory.id;
  }
  const rows = await repo.fetchServiceTypeCounts({ localityId: ids.localityId, levelOneId });
  if (!rows) return {};
  return Object.fromEntries(rows.map((row) => [row.slug, Number(row.listings) || 0]));
}

/**
 * Fallback banners keyed by category id, in table order.
 *
 * A category has several (Home Appliance has eleven), so a listing picks one by
 * its own id: every card gets artwork, neighbouring cards differ, and the same
 * listing keeps the same banner on every page it appears on.
 */
export async function getDefaultBanners() {
  const rows = await repo.fetchDefaultBanners();
  if (!rows) return new Map();
  const byCategory = new Map();
  for (const row of rows) {
    const list = byCategory.get(row.category_id) ?? [];
    list.push(row.banner_image);
    byCategory.set(row.category_id, list);
  }
  return byCategory;
}

/** States and cities for the enquiry popup's dropdowns. */
export async function getStatesAndCities() {
  const [states, cities] = await Promise.all([repo.fetchStates(), repo.fetchCities()]);
  return {
    states: (states ?? []).map((row) => ({ id: row.id, name: row.state_name })),
    cities: (cities ?? []).map((row) => ({
      id: row.id,
      name: row.city_name,
      stateId: row.state_id,
    })),
  };
}
