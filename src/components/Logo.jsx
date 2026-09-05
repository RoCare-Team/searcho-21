import Link from "next/link";
/**
 * Wordmark used in the header and footer.
 *
 * Kept in its own module so the client-side header can import it without
 * pulling in `Header.tsx`, which reaches the server-only data layer.
 */
export default function Logo({ tone = "dark" }) {
  return (
    <Link
      href="/"
      aria-label="Searcho21 home"
      className="inline-flex shrink-0 items-baseline gap-px text-[19px] font-semibold tracking-tight"
    >
      <span className={tone === "dark" ? "text-navy-900" : "text-white"}>Searcho</span>
      <span className="text-brand-500">21</span>
    </Link>
  );
}
