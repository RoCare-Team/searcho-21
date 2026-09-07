import { stripHtml } from "@/lib/format";
/**
 * DB rows → view models.
 *
 * This is the single place that knows the database's column names. When the
 * backend is connected, feed real rows into these functions and every component
 * keeps working unchanged.
 */
/**
 * Base URL for uploaded images.
 *
 * The live Laravel app stores only a filename and serves it from
 * `assets/<folder>/<filename>`. Locally those folders are copied into
 * `public/assets`, so the default works in development. In production set
 * NEXT_PUBLIC_ASSET_BASE_URL to the origin that already hosts them
 * (e.g. https://www.searcho21.com) instead of shipping ~285 MB of images.
 */
const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/$/, "");
/**
 * Image folders, and which storage root each one lives under.
 *
 * `assets/` is written by the Laravel app — VendorController moves vendor
 * uploads into assets/logo_img, assets/banner_image and assets/gallery_image,
 * and the admin panel writes category artwork to assets/category.
 *
 * `uploads/` is the shared media library: 112 appliance brand logos plus the
 * orange line-icon set used for categories and service types.
 */
const ASSET_ROOTS = {
  // assets/
  logo_img: "assets",
  banner_image: "assets",
  gallery_image: "assets",
  category: "assets",
  /** Service photos used on the homepage cards (assets/img/category). */
  img_category: "assets",
  /** City photos used on the "popular cities" cards (assets/img/city). */
  img_city: "assets",
  /** Hero artwork (assets/img/bg) — transparent cut-outs used on the homepage. */
  img_hero: "assets",
  // uploads/
  /** Designed 16:9 category banners — the label is typeset into the artwork. */
  templates: "uploads",
  brand_image: "uploads",
  others: "uploads",
  logo_image: "uploads",
  vendor_logo_image: "uploads",
  category_image: "uploads",
  sub_category_image: "uploads",
  slider_image: "uploads",
  slides_image: "uploads",
  home_pages: "uploads",
};
/** Resolves a stored filename to a public URL. Returns null when unset. */
export function assetUrl(folder, filename) {
  if (!filename) return null;
  // Already an absolute URL — pass it through untouched.
  if (/^https?:\/\//i.test(filename)) return filename;
  return `${ASSET_BASE}/${ASSET_ROOTS[folder]}/${folder}/${encodeURIComponent(filename)}`;
}
/**
 * Masks a mobile number the way the existing site does: the first few digits
 * and the last three stay visible, the middle is starred out.
 */
export function maskPhone(mobile) {
  if (!mobile) return "";
  const digits = mobile.replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return mobile;
  return `+91 ${digits.slice(0, 2)}${"*".repeat(5)}${digits.slice(-3)}`;
}
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
/**
 * Parses free_listing_tb.closing_time.
 *
 * The column holds a JSON object keyed by day. A missing or empty day means the
 * business is closed, which renders as "Closed" rather than being hidden.
 */
export function parseOpeningHours(closingTime) {
  if (!closingTime) return undefined;
  let parsed;
  try {
    parsed = JSON.parse(closingTime);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const record = parsed;
  const hours = DAY_ORDER.map((day) => {
    const value = record[day] ?? record[day.toLowerCase()];
    return {
      day,
      hours: typeof value === "string" && value.trim() ? value.trim() : null,
    };
  });
  // Nothing set at all — treat as "not provided" rather than "closed all week".
  return hours.some((h) => h.hours) ? hours : undefined;
}
/** Parses free_listing_tb.socale_links (the DB's spelling), dropping empties. */
export function parseSocialLinks(raw) {
  if (!raw) return undefined;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  const out = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value.trim()) {
      out[key] = value.trim();
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
export function mapLocality(row, extras = {}) {
  return {
    id: row.id,
    slug: row.locality_url,
    name: row.locality_name,
    city: row.city_name,
    state: row.state_name ?? "",
    ...extras,
  };
}
export function mapCategoryImage(row) {
  return assetUrl("category", row.cat_image);
}
/** free_listing_tb row → Business view model. */
export function mapListing(row, extras = {}) {
  return {
    id: String(row.id),
    slug: row.listing_url,
    name: row.business_name,
    verified: row.verified_status === "1",
    summary: stripHtml(row.business_summary),
    address: {
      line1: row.physical_address ?? undefined,
      line2: row.physical_address_two ?? undefined,
      locality: row.locality ?? undefined,
      city: row.city ?? undefined,
      citySlug: extras.citySlug,
      state: row.state ?? undefined,
      pincode: row.pincode ?? undefined,
    },
    phoneMasked: maskPhone(row.mobile_no),
    phone: row.mobile_no ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    establishedYear: establishedYear(row.estb_year),
    contactPerson: row.cont_person ?? undefined,
    designation: row.designation ?? undefined,
    gstNumber: row.gst_number ?? undefined,
    logoUrl: assetUrl("logo_img", row.logo_img),
    bannerUrl: assetUrl("banner_image", row.banner_image),
    views: row.views,
    openingHours: parseOpeningHours(row.closing_time),
    social: parseSocialLinks(row.socale_links),
    keywords: extras.keywords,
    categories: extras.categories ?? [],
    categoryLabels: extras.categoryLabels ?? [],
    gallery: extras.gallery?.map((g) => ({
      src: assetUrl("gallery_image", g.image) ?? "",
      alt: `${row.business_name} photo`,
    })),
    metaTitle: row.meta_title ?? undefined,
    metaDescription: stripHtml(row.meta_desc),
    metaKeywords: row.meta_keyword ?? undefined,
  };
}
/** Initials shown when a listing has no logo image. */
export function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The year a business was established.
 *
 * free_listing_tb.estb_year is a datetime rather than a year — values look like
 * "2018-11-06 18:30:00" — so it is reduced to the four-digit year here. Values
 * that hold no plausible year (blanks, "N/A") return undefined, and every
 * consumer then leaves the field out rather than printing nonsense.
 */
function establishedYear(value) {
  const match = String(value ?? "").match(/\b(19|20)\d{2}\b/);
  if (!match) return undefined;
  const year = Number(match[0]);
  return year <= new Date().getFullYear() ? String(year) : undefined;
}
