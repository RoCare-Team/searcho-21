import Link from "next/link";
import { FileText } from "lucide-react";
import { SUPPORT_PHONE } from "@/lib/seo";
/**
 * Used on pages whose copy already exists on the live Searcho21 site (legal
 * text, policy pages, support pages). The layout is final; the body text is
 * carried over from the existing page when the content source is connected,
 * rather than being rewritten here.
 */
export default function ContentPlaceholder({ page }) {
  return (
    <div className="card max-w-2xl p-6">
      <span className="inline-flex rounded-lg bg-canvas p-2 text-ink-400">
        <FileText className="h-4 w-4" aria-hidden />
      </span>
      <h2 className="mt-3 text-base font-semibold">Content pending migration</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        The {page} copy is published on the existing Searcho21 site and will be carried across
        unchanged when the content source is connected. It has deliberately not been rewritten here.
      </p>
      <p className="mt-4 text-sm text-ink-500">
        For anything urgent, call{" "}
        <a
          href={`tel:+91${SUPPORT_PHONE}`}
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          {SUPPORT_PHONE}
        </a>{" "}
        or{" "}
        <Link
          href="/contact-us"
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          contact us
        </Link>
        .
      </p>
    </div>
  );
}
