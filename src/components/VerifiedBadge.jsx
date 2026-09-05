import { BadgeCheck } from "lucide-react";
/**
 * Small green verification chip. Deliberately understated — it sits beside the
 * business name without competing with it.
 */
export default function VerifiedBadge({ compact = false }) {
  if (compact) {
    return (
      <span
        title="Verified listing"
        className="inline-flex items-center gap-1 text-[11px] font-medium text-success-700"
      >
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700">
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      Verified
    </span>
  );
}
