import Link from "next/link";
import { ArrowRight } from "lucide-react";
/** Consistent section header + spacing used across every template. */
export default function Section({
  title,
  description,
  action,
  as: Heading = "h2",
  children,
  className = "",
}) {
  return (
    <section className={`py-10 lg:py-12 ${className}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <Heading className="text-xl font-semibold sm:text-[22px]">{title}</Heading>
          {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
        </div>

        {action && (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}
/** Wrapper for the long-form SEO copy blocks. */
export function ProseSection({ heading, paragraphs }) {
  return (
    <div className="prose-seo max-w-3xl">
      <h2 className="mb-3 text-base font-semibold sm:text-lg">{heading}</h2>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}
/** Simple chip link used for popular searches, brands, localities and cities. */
export function ChipLink({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-700 transition-colors hover:border-line-strong hover:text-brand-600"
    >
      {children}
    </Link>
  );
}
