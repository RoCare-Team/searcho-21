"use client";
import { useState } from "react";
import { Phone } from "lucide-react";
/**
 * Mirrors the existing "View Mobile" behaviour: the number stays masked until
 * the user asks for it, then becomes a tel: link.
 */
export default function RevealPhone({ masked, phone, className = "" }) {
  const [revealed, setRevealed] = useState(false);
  if (revealed && phone) {
    return (
      <a
        href={`tel:+91${phone}`}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 ${className}`}
      >
        <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        +91 {phone}
      </a>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
        <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        {masked}
      </span>
      {phone && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          View mobile
        </button>
      )}
    </span>
  );
}
