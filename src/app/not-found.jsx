import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        The page you are looking for does not exist, or the city or service is not listed on
        Searcho21 yet.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Go to homepage
        </Link>
        <Link
          href="/contact-us"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
