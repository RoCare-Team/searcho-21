import Link from "next/link";
import { ChevronRight } from "lucide-react";
/**
 * Breadcrumb trail. The last crumb is the current page and is not a link.
 * Structured data for the same trail is emitted separately via breadcrumbJsonLd.
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs text-ink-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex shrink-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-400" aria-hidden />}
              {isLast ? (
                <span className="font-medium text-ink-700" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-brand-600">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
