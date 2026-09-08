import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createAdminSession, getAdmin, isAdminConfigured, verifyAdmin } from "@/lib/admin-auth";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Superadmin sign in — Searcho21",
  description: "Staff sign in.",
  path: "/superadmin/login",
  index: false,
});

/**
 * Superadmin sign-in, matching the existing panel: the identifier is either the
 * user id or the mobile number on the `user_tb` row.
 */
export default async function AdminLoginPage({ searchParams }) {
  if (await getAdmin()) redirect("/superadmin");
  const { error } = await searchParams;

  async function signIn(formData) {
    "use server";
    if (!isAdminConfigured()) redirect("/superadmin/login?error=unconfigured");

    const admin = await verifyAdmin(formData.get("identifier"), formData.get("password"));
    // One message for every failure: saying which half was wrong would confirm
    // whether an identifier exists.
    if (!admin) redirect("/superadmin/login?error=invalid");

    await createAdminSession(admin);
    redirect("/superadmin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
            <ShieldCheck className="h-5 w-5 text-brand-500" aria-hidden />
          </span>
          <div>
            <h1 className="text-[19px] font-semibold text-navy-900">Superadmin</h1>
            <p className="text-[14px] text-ink-500">Searcho21 staff access</p>
          </div>
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[14px] text-brand-700">
            {error === "unconfigured"
              ? "SEARCHO21_ADMIN_SECRET is not set, so sessions cannot be signed."
              : "Those details do not match an active superadmin account."}
          </p>
        )}

        <form action={signIn} className="mt-5 space-y-3.5">
          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block text-[14.5px] font-medium text-navy-900"
            >
              User ID or mobile
            </label>
            <input
              id="identifier"
              name="identifier"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15.5px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[14.5px] font-medium text-navy-900"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15.5px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-brand-500 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
