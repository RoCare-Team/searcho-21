"use server";
import { revalidatePath } from "next/cache";
import {
  createListing,
  createUser,
  createUserSession,
  findUserByMobile,
  getUser,
} from "@/lib/account";
import { sendSignupOtp, verifySignupOtp } from "@/lib/otp";

/**
 * Vendor sign-up: name, email and mobile, confirmed by an OTP stored in
 * user_otp_varification_tb — the table send_otp_registration uses. Both calls
 * stay on the server; see lib/otp.js.
 */

export async function signupSendOtpAction(_prev, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "");

  if (!name)
    return { step: "details", name, email, mobile, ok: false, message: "Enter your name." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { step: "details", name, email, mobile, ok: false, message: "Enter a valid email." };
  }

  const existing = await findUserByMobile(mobile);
  if (existing) {
    return {
      step: "details",
      name,
      email,
      mobile,
      ok: false,
      message:
        "This mobile number is already registered with us. Please login with this number to add or update your business.",
    };
  }

  const result = await sendSignupOtp(mobile, name);
  return { step: result.ok ? "otp" : "details", name, email, mobile, ...result };
}

export async function signupVerifyAction(_prev, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "");
  const otp = String(formData.get("otp") ?? "");

  const result = await verifySignupOtp(mobile, otp);
  if (!result.ok) return { step: "otp", name, email, mobile, ...result };

  const account = await createUser({ name, email, mobile });
  if (!account) {
    return {
      step: "otp",
      name,
      email,
      mobile,
      ok: false,
      message: "Could not create the account. Please try again.",
    };
  }

  await createUserSession(account.id);
  return { step: "done", name, email, mobile, ok: true, message: "Account ready." };
}

/**
 * Saves a business listing for the signed-in vendor.
 *
 * Refuses when there is no session: the listing has to belong to somebody, and
 * a server action is its own endpoint, so it checks rather than trusting the
 * page that rendered the form.
 */
export async function createListingAction(_prev, formData) {
  const user = await getUser();
  if (!user) return { ok: false, message: "Please sign in again to add your business." };

  const name = String(formData.get("name") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "")
    .replace(/\D/g, "")
    .slice(-10);
  if (!name) return { ok: false, message: "Enter your business name." };
  if (mobile.length !== 10) return { ok: false, message: "Enter a valid 10-digit mobile number." };

  const listing = await createListing(user.id, {
    name,
    mobile,
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    city: formData.get("city"),
    address: formData.get("address"),
    about: formData.get("about"),
    categoryId: Number(formData.get("categoryId")) || 0,
  });

  if (!listing) return { ok: false, message: "Could not save the listing. Please try again." };

  revalidatePath("/account");
  return {
    ok: true,
    message: "Your business has been submitted and is awaiting approval.",
  };
}
