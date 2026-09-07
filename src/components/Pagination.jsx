import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
function buildHref(basePath, page, params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value && key !== "page") qs.set(key, value);
  }
  if (page > 1) qs.set("page", String(page));
  const query = qs.toString();
  return query ? `${basePath}?${query}` : basePath;
}
/** Server-rendered pagination — links, not buttons, so pages stay crawlable. */
export default function Pagination({ page, totalPages, basePath, searchParams }) {
  if (totalPages <= 1) return null;
  // Show a short window around the current page rather than every number.
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-[15.5px] transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, page - 1, searchParams)}
          rel="prev"
          aria-label="Previous page"
          className={`${base} border-line bg-white text-ink-700 hover:border-line-strong`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className={`${base} border-line bg-white text-ink-400`} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className={`${base} border-navy-900 bg-navy-900 font-medium text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, searchParams)}
            className={`${base} border-line bg-white text-ink-700 hover:border-line-strong`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, page + 1, searchParams)}
          rel="next"
          aria-label="Next page"
          className={`${base} border-line bg-white text-ink-700 hover:border-line-strong`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className={`${base} border-line bg-white text-ink-400`} aria-disabled="true">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
