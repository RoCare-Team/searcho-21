import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db";

/**
 * Superadmin authentication, matching the existing panel exactly.
 *
 * SuperadminLoginController checks `user_tb` for user_type_key = 'superadmin'
 * with an MD5 password, matched on either `mobile` or `user_id`. This verifies
 * the same way so the account already in the database keeps working — it does
 * not migrate or rewrite any stored password.
 *
 * MD5 is not a safe password hash, and this does not make it one. It is kept
 * because the credential lives in a database the Laravel app also uses; moving
 * to bcrypt means changing both sides together, which is a separate decision
 * for whoever owns the existing panel.
 */

/** Signing key for the session cookie. Without it, sign-in is refused. */
const SESSION_SECRET = process.env.SEARCHO21_ADMIN_SECRET;
const COOKIE = "s21_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export function isAdminConfigured() {
  return Boolean(SESSION_SECRET);
}

/**
 * Checks a login against user_tb.
 *
 * @returns {Promise<{id: number, name: string, userId: string} | null>}
 */
export async function verifyAdmin(identifier, password) {
  const id = String(identifier ?? "").trim();
  const pass = String(password ?? "");
  if (!id || !pass) return null;

  const digest = createHash("md5").update(pass).digest("hex");

  // The controller matches on mobile OR user_id; both are compared here in one
  // statement so a wrong identifier and a wrong password fail identically.
  const row = await queryOne(
    `SELECT id, name, user_id
       FROM user_tb
      WHERE user_type_key = 'superadmin'
        AND status = '1'
        AND password = ?
        AND (mobile = ? OR user_id = ?)
      LIMIT 1`,
    [digest, id.replace(/\D/g, ""), id],
  );

  if (!row) return null;
  return { id: row.id, name: row.name, userId: String(row.user_id) };
}

/* -------------------------------------------------------------------------- */
/* Session cookie                                                             */
/* -------------------------------------------------------------------------- */

function sign(value) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

/** Constant-time compare, so a wrong signature leaks nothing by timing. */
function signatureMatches(value, signature) {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(String(signature));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function createAdminSession(admin) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${admin.id}.${expires}`;
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * The signed-in admin, or null.
 *
 * The cookie carries only an id and an expiry, both covered by the signature,
 * so it cannot be edited client-side to become another user or to last longer.
 */
export async function getAdmin() {
  if (!SESSION_SECRET) return null;

  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  const [id, expires, signature] = raw.split(".");
  if (!id || !expires || !signature) return null;
  if (!signatureMatches(`${id}.${expires}`, signature)) return null;
  if (Number(expires) < Date.now()) return null;

  const row = await queryOne(
    `SELECT id, name, user_id
       FROM user_tb
      WHERE id = ? AND user_type_key = 'superadmin' AND status = '1'
      LIMIT 1`,
    [id],
  );
  if (!row) return null;
  return { id: row.id, name: row.name, userId: String(row.user_id) };
}
