import "server-only";
import { randomInt } from "node:crypto";
import { query, queryOne } from "@/lib/db";

/**
 * OTP, exactly as the live site does it.
 *
 * VendorLoginController generates its own six-digit code, stores it, and sends
 * it over the Savshka SMS gateway — it does not call an external verify API.
 * The two halves store the code in different places, and that split is
 * deliberate upstream, so it is kept:
 *
 *   registration  ->  user_otp_varification_tb (number, otp, status)
 *   login         ->  user_tb.otp on the matching row
 *
 * Keeping both means a code sent by the Laravel app verifies here and the other
 * way round: the two apps share one database and one flow.
 */

const SMS = {
  url: process.env.SMS_API_URL ?? "https://api.savshka.co.in/api/sms",
  key: process.env.SMS_API_KEY,
  from: process.env.SMS_SENDER_ID ?? "TLGCRO",
  entityId: process.env.SMS_ENTITY_ID ?? "1401519300000012435",
  // The DLT-registered template the message must match word for word, or the
  // operator rejects it.
  templateId: process.env.SMS_OTP_TEMPLATE_ID ?? "1007396380615496861",
};

/**
 * One test number with a fixed code, for while the SMS gateway is down.
 *
 * It lives in the environment rather than in this file on purpose. A fixed OTP
 * is a standing key to whatever account it names, so it must not sit in the
 * repository, and it must be absent from any deployment that has not
 * deliberately set it — .env.local is not committed and is not read by Vercel,
 * so this stays local unless someone adds it there by hand.
 *
 * Both halves must be set, or nothing is bypassed. Remove them once the gateway
 * works again.
 */
const TEST_LOGIN = {
  mobile: normaliseMobile(process.env.OTP_TEST_MOBILE),
  code: String(process.env.OTP_TEST_CODE ?? "").replace(/\D/g, ""),
};

/** The fixed code for this number, or null when it is not the test number. */
function testCodeFor(number) {
  if (!TEST_LOGIN.mobile || !TEST_LOGIN.code) return null;
  return number === TEST_LOGIN.mobile ? TEST_LOGIN.code : null;
}

/** Ten digits, Indian mobile range. Returns null when the input is not one. */
export function normaliseMobile(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function isOtpConfigured() {
  return Boolean(SMS.key);
}

/** Six digits, from a cryptographic source rather than Math.random. */
function generateOtp() {
  return String(randomInt(100000, 1000000));
}

/**
 * The message body. Must stay word for word identical to the registered DLT
 * template — only the two variables change.
 */
function otpMessage(name, otp) {
  return `Dear ${name || "Customer"}, ${otp} is OTP to verify your mobile number for confirm request. Regards RO Care India.`;
}

/**
 * Sends one SMS.
 *
 * The gateway answers HTTP 200 to everything, a rejected key included — the
 * real outcome is in the JSON body, where `status` 100 means accepted and
 * anything else is a refusal ("AUTHENTICATION FAILURE!" for a dead key). So the
 * HTTP status tells us nothing and must not be trusted; only the body says
 * whether a code is actually on its way. Reading it is what stops the page
 * reporting "OTP sent" when nothing was sent.
 *
 * Failures are reported, never thrown into a page render.
 */
async function sendSms(number, body) {
  if (!SMS.key) return { ok: false, reason: "SMS key is not configured." };

  const url = `${SMS.url}?${new URLSearchParams({
    key: SMS.key,
    from: SMS.from,
    to: number,
    body,
    entityid: SMS.entityId,
    templateid: SMS.templateId,
  })}`;

  let payload;
  try {
    const response = await fetch(url, { cache: "no-store" });
    payload = await response.json();
  } catch (error) {
    return { ok: false, reason: `SMS gateway unreachable: ${error.message}` };
  }

  if (Number(payload?.status) === 100) return { ok: true };
  return { ok: false, reason: payload?.description || "SMS gateway refused the message." };
}

/* -------------------------------------------------------------------------- */
/* Registration                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Sends a registration OTP, storing it in user_otp_varification_tb.
 *
 * Updates the row when the number has asked before and inserts otherwise — the
 * same branch send_otp_registration takes, so a number never accumulates rows.
 */
export async function sendSignupOtp(mobile, name) {
  const number = normaliseMobile(mobile);
  if (!number) return { ok: false, message: "Please enter only 10 digit mobile number." };

  // The test number needs no gateway; every other number still does.
  const testCode = testCodeFor(number);
  if (!testCode && !isOtpConfigured()) {
    return { ok: false, message: "SMS service is not configured on this deployment." };
  }

  const otp = testCode ?? generateOtp();
  const existing = await queryOne(
    `SELECT id FROM user_otp_varification_tb WHERE number = ? ORDER BY id DESC LIMIT 1`,
    [number],
  );

  const stored = existing
    ? await query(
        `UPDATE user_otp_varification_tb SET otp = ?, status = '0', updated_at = NOW() WHERE number = ?`,
        [otp, number],
      )
    : await query(
        `INSERT INTO user_otp_varification_tb (number, otp, status, created_at) VALUES (?, ?, '0', NOW())`,
        [number, otp],
      );

  if (!stored) return { ok: false, message: "Could not send the OTP. Please try again." };

  if (testCode) {
    console.warn("[otp] test number %s — fixed code stored, no SMS sent", number);
    return { ok: true, message: "OTP sent successfully." };
  }

  const sent = await sendSms(number, otpMessage(name, otp));
  if (!sent.ok) {
    console.error("[otp] signup send failed for %s: %s", number, sent.reason);
    return { ok: false, message: "Could not send the OTP. Please try again." };
  }
  return { ok: true, message: "OTP sent successfully." };
}

/**
 * Verifies a registration OTP and marks it used.
 *
 * The upstream check is `where number and otp`, newest first; marking status
 * '1' afterwards is what stops the same code being replayed.
 */
export async function verifySignupOtp(mobile, otp) {
  const number = normaliseMobile(mobile);
  const code = String(otp ?? "").replace(/\D/g, "");
  if (!number) return { ok: false, message: "Please enter only 10 digit mobile number." };
  if (!code) return { ok: false, message: "OTP can not be blank." };

  const row = await queryOne(
    `SELECT id FROM user_otp_varification_tb
      WHERE number = ? AND otp = ? AND status = '0'
      ORDER BY id DESC LIMIT 1`,
    [number, code],
  );
  if (!row) return { ok: false, message: "OTP does not match." };

  await query(`UPDATE user_otp_varification_tb SET status = '1' WHERE number = ?`, [number]);
  return { ok: true, message: "Verified." };
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

/** Sends a login OTP, storing it on the user's own row as send_otp_login does. */
export async function sendLoginOtp(mobile) {
  const number = normaliseMobile(mobile);
  if (!number) return { ok: false, message: "Please enter only 10 digit mobile number." };

  const testCode = testCodeFor(number);
  if (!testCode && !isOtpConfigured()) {
    return { ok: false, message: "SMS service is not configured on this deployment." };
  }

  const user = await queryOne(`SELECT id, name FROM user_tb WHERE mobile = ? LIMIT 1`, [number]);
  if (!user) {
    return {
      ok: false,
      message: "You are not a registered user on Searcho21. Please register first.",
    };
  }

  const otp = testCode ?? generateOtp();
  const stored = await query(`UPDATE user_tb SET otp = ? WHERE mobile = ?`, [otp, number]);
  if (!stored) return { ok: false, message: "Could not send the OTP. Please try again." };

  if (testCode) {
    console.warn("[otp] test number %s — fixed code stored, no SMS sent", number);
    return { ok: true, message: `Dear ${user.name || "user"}, OTP sent to your mobile.` };
  }

  const sent = await sendSms(number, otpMessage(user.name, otp));
  if (!sent.ok) {
    console.error("[otp] login send failed for %s: %s", number, sent.reason);
    return { ok: false, message: "Could not send the OTP. Please try again." };
  }
  return { ok: true, message: `Dear ${user.name || "user"}, OTP sent to your mobile.` };
}

/**
 * Verifies a login OTP against user_tb.otp, then clears it.
 *
 * Clearing is this build's one addition: upstream leaves the code on the row,
 * which is why 283 accounts still carry a usable one. A code that stays valid
 * forever is a standing key to the account.
 */
export async function verifyLoginOtp(mobile, otp) {
  const number = normaliseMobile(mobile);
  const code = String(otp ?? "").replace(/\D/g, "");
  if (!number) return { ok: false, message: "Please enter only 10 digit mobile number." };
  if (!code) return { ok: false, message: "OTP can not be blank." };

  const user = await queryOne(
    `SELECT id FROM user_tb WHERE mobile = ? AND otp = ? AND otp <> '' LIMIT 1`,
    [number, code],
  );
  if (!user) return { ok: false, message: "OTP does not match." };

  await query(`UPDATE user_tb SET otp = '' WHERE id = ?`, [user.id]);
  return { ok: true, message: "Verified." };
}
