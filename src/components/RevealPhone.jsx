"use client";
import { useState } from "react";
import { Phone } from "lucide-react";

const STYLES = {
  // Inline, for places where the number is one fact among several.
  inline: {
    wrap: "inline-flex items-center gap-2",
    shown: "inline-flex items-center gap-1.5 text-sm font-medium text-navy-900",
    masked: "inline-flex items-center gap-1.5 text-sm text-ink-500",
    action: "text-[15.5px] font-medium text-brand-600 transition-colors hover:text-brand-700",
  },
  // A filled button, for the listing card's primary action.
  button: {
    wrap: "inline-flex",
    shown:
      "inline-flex h-10 items-center justify-center gap-1.5 truncate rounded-lg bg-brand-500 px-4 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600",
    masked: "hidden",
    action:
      "inline-flex h-10 items-center justify-center gap-1.5 truncate rounded-lg bg-brand-500 px-4 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600",
  },
};

/**
 * Mirrors the existing "View Mobile" behaviour: the number stays masked until
 * the user asks for it, then becomes a tel: link.
 *
 * The button variant shows the masked number on the button itself, so the
 * listing card gets one control instead of a number plus a separate link.
 */
export default function RevealPhone({ masked, phone, variant = "inline", className = "" }) {
  const [revealed, setRevealed] = useState(false);
  const style = STYLES[variant] ?? STYLES.inline;

  if (revealed && phone) {
    return (
      <a href={`tel:+91${phone}`} className={`${style.shown} ${className}`}>
        <Phone className="h-3.5 w-3.5" aria-hidden />
        +91 {phone}
      </a>
    );
  }

  return (
    <span className={`${style.wrap} ${className}`}>
      <span className={style.masked}>
        <Phone className="h-3.5 w-3.5 text-ink-400" aria-hidden />
        {masked}
      </span>
      {phone && (
        <button type="button" onClick={() => setRevealed(true)} className={style.action}>
          {variant === "button" && <Phone className="h-3.5 w-3.5" aria-hidden />}
          {variant === "button" ? masked : "View mobile"}
        </button>
      )}
    </span>
  );
}
