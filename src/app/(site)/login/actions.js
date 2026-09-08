"use server";
import { createUserSession, findUserByMobile } from "@/lib/account";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/otp";

/**
 * Server actions for the login form.
 *
 * The form is a client component, so these keep the OTP on the server: the
 * browser only ever posts a mobile number and a code, and gets back a message.
 * The code itself lives in user_tb.otp, as VendorLoginController stores it.
 */

export async function requestOtpAction(_prev, formData) {
  const mobile = String(formData.get("mobile") ?? "");

  const existing = await findUserByMobile(mobile);
  if (!existing) {
    return {
      step: "mobile",
      mobile,
      ok: false,
      message: "You are not a registered user on Searcho21. Please register first.",
    };
  }

  const result = await sendLoginOtp(mobile);
  return { step: result.ok ? "otp" : "mobile", mobile, ...result };
}

export async function verifyOtpAction(_prev, formData) {
  const mobile = String(formData.get("mobile") ?? "");
  const otp = String(formData.get("otp") ?? "");

  const result = await verifyLoginOtp(mobile, otp);
  if (!result.ok) return { step: "otp", mobile, ...result };

  // Already checked before the OTP went out; this only catches an account
  // removed in between.
  const user = await findUserByMobile(mobile);
  if (!user) {
    return {
      step: "mobile",
      mobile,
      ok: false,
      message: "You are not a registered user on Searcho21. Please register first.",
    };
  }
  if (String(user.status) !== "1") {
    return {
      step: "otp",
      mobile,
      ok: false,
      message: "This account is not active. Please contact Searcho21 support.",
    };
  }

  await createUserSession(user.id);
  return { step: "done", mobile, ok: true, message: "Signed in." };
}
