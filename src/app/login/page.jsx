import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "Login",
  description: "Log in to manage or update your Searcho21 business listing.",
  path: "/login",
  // Account pages should not be indexed.
  index: false,
});
export default function LoginPage() {
  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold">Log in</h1>
        <p className="mt-2 text-center text-sm text-ink-500">
          Manage or update your business listing.
        </p>

        <div className="card mt-6 p-5 sm:p-6">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-[13px] text-ink-500">
          Not listed yet?{" "}
          <Link
            href="/list-your-business"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            List your business
          </Link>
        </p>
      </div>
    </div>
  );
}
