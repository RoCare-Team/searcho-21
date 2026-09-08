import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db";

/**
 * Vendor accounts — the people who own the listings.
 *
 * The session is created only after the existing OTP service has verified the
 * number (see lib/otp.js), so possession of the phone is the credential. No
 * password is read or written here; `user_tb.password` is the Laravel app's
 * business and is left alone.
 */

const SESSION_SECRET = process.env.SEARCHO21_ADMIN_SECRET;
const COOKIE = "s21_user";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function signatureMatches(value, signature) {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(String(signature));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The account registered against a mobile number, or null. */
export function findUserByMobile(mobile) {
  const digits = String(mobile ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (digits.length !== 10) return null;
  return queryOne(
    `SELECT id, name, email, mobile, company, address, status
       FROM user_tb
      WHERE user_type_key = 'user' AND mobile = ?
      LIMIT 1`,
    [digits],
  );
}

export async function createUserSession(userId) {
  if (!SESSION_SECRET) return false;
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expires}`;
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * The signed-in vendor, or null.
 *
 * Only the id and expiry travel in the cookie, both covered by the signature,
 * so it cannot be edited to become another account or to outlive its window.
 */
export async function getUser() {
  if (!SESSION_SECRET) return null;
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  const [id, expires, signature] = raw.split(".");
  if (!id || !expires || !signature) return null;
  if (!signatureMatches(`${id}.${expires}`, signature)) return null;
  if (Number(expires) < Date.now()) return null;

  const row = await queryOne(
    `SELECT id, name, email, mobile, company, address
       FROM user_tb
      WHERE id = ? AND user_type_key = 'user' AND status = '1'
      LIMIT 1`,
    [id],
  );
  if (!row) return null;

  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    mobile: row.mobile ?? "",
    company: row.company ?? "",
    address: row.address ?? "",
  };
}

/**
 * The listings this account owns.
 *
 * Joined on free_listing_tb.user_id, which is filled in on all 11,575 rows —
 * matching on the mobile number instead would miss the ones whose contact
 * number was later edited.
 */
export async function getUserListings(userId) {
  const rows = await query(
    `SELECT id, business_name, listing_url, city, state, status, verified_status, views
       FROM free_listing_tb
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 200`,
    [userId],
  );

  return (rows ?? []).map((row) => ({
    id: String(row.id),
    name: row.business_name,
    slug: row.listing_url,
    city: row.city ?? "",
    state: row.state ?? "",
    status: String(row.status),
    verified: row.verified_status === "1",
    views: Number(row.views ?? 0),
  }));
}

/**
 * Creates a vendor account after the OTP has been verified.
 *
 * Mirrors VendorLoginController's insert: user_type_key 'user', user_type_id 1,
 * user_category 1 (vendor). No password is set — this build signs people in by
 * OTP, and writing a password here would put a credential in the database that
 * nothing checks.
 *
 * Returns the existing row when the number is already registered, so a repeat
 * signup signs the person in instead of creating a duplicate account.
 */
export async function createUser({ name, email, mobile }) {
  const digits = String(mobile ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (digits.length !== 10) return null;

  const existing = await findUserByMobile(digits);
  if (existing) return { id: existing.id, created: false };

  const result = await query(
    `INSERT INTO user_tb (name, email, mobile, user_type_id, user_type_key, user_category, status, created_at)
     VALUES (?, ?, ?, 1, 'user', 1, '1', NOW())`,
    [String(name ?? "").trim(), String(email ?? "").trim(), digits],
  );
  if (!result) return null;

  const row = await findUserByMobile(digits);
  return row ? { id: row.id, created: true } : null;
}

/**
 * "business name" -> "business-name", the way WebController::seo_friendly_url
 * does it: HTML entities become words ("&" -> "amp"), then everything that is
 * not a letter or digit becomes a hyphen. Matching that keeps new URLs the same
 * shape as the 11,575 already in the table.
 */
function listingSlug(name) {
  return String(name ?? "")
    .replace(/&/g, " amp ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

/**
 * Creates a business listing owned by a signed-in vendor.
 *
 * Saved as status '0' — awaiting approval — which is what the existing panel
 * expects and why a new listing does not appear on the public site until an
 * admin approves it.
 *
 * The three columns the schema requires but the form has no answer for are
 * given the same neutral values existing rows use: `listing_order` 0 and an
 * empty `closing_time`.
 */
export async function createListing(userId, form) {
  const name = String(form.name ?? "").trim();
  const mobile = String(form.mobile ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (!userId || !name || mobile.length !== 10) return null;

  const result = await query(
    `INSERT INTO free_listing_tb
       (user_id, business_name, listing_url, cont_person, mobile_no, email,
        city, physical_address, business_summary, status, verified_status,
        listing_order, closing_time, views, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '0', '0', 0, '', 0, NOW())`,
    [
      userId,
      name,
      listingSlug(name),
      String(form.contactPerson ?? "").trim(),
      mobile,
      String(form.email ?? "").trim(),
      String(form.city ?? "").trim(),
      String(form.address ?? "").trim(),
      String(form.about ?? "").trim(),
    ],
  );
  if (!result) return null;

  const row = await queryOne(
    `SELECT id FROM free_listing_tb WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
    [userId],
  );
  if (!row) return null;

  // The mapping row is what makes a listing findable under a category; without
  // it the listing exists but no category or city page would ever show it.
  if (form.categoryId) {
    await query(
      `INSERT INTO free_listing_category_location_maping_tb
         (free_listing_id, category_id, cat_level_one_id, cat_level_two_id,
          cat_level_three_id, locality_id, created_at)
       VALUES (?, ?, 0, 0, 0, ?, NOW())`,
      [row.id, form.categoryId, form.localityId ?? 0],
    );
  }

  return { id: String(row.id) };
}
