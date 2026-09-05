import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
export default function CategoryCard({ name, href, description, count, slug }) {
  return (
    <Link href={href} className="card card-hover group flex items-start gap-3.5 p-4">
      <span className="mt-0.5 shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600">
        <CategoryIcon slug={slug} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium text-navy-900">{name}</span>
        {description && (
          <span className="line-clamp-2-safe mt-0.5 block text-[13px] leading-snug text-ink-500">
            {description}
          </span>
        )}
        {typeof count === "number" && count > 0 && (
          <span className="mt-1.5 block text-xs text-ink-400">
            {count} {count === 1 ? "listing" : "listings"}
          </span>
        )}
      </span>

      <ArrowRight
        className="mt-1 h-4 w-4 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600"
        aria-hidden
      />
    </Link>
  );
}
