"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
const VARIANTS = {
  primary:
    "rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600",
  outline:
    "rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:border-line-strong hover:bg-canvas",
  soft: "rounded-lg bg-brand-50 px-4 py-2 text-[15.5px] font-medium text-brand-700 transition-colors hover:bg-brand-100",
  link: "text-[14.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline",
  navy: "rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800",
};
/**
 * Enquiry dialog with its own trigger button.
 *
 * The trigger lives inside this client component rather than being passed in as
 * a render prop, so server components can use it directly.
 */
export default function QuoteDialog({
  label,
  title,
  context,
  variant = "primary",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const heading = title ?? label;
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${VARIANTS[variant]} ${className}`}
      >
        {label}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
        >
          <div
            className="absolute inset-0 bg-navy-900/45"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="fade-in relative w-full max-w-md rounded-t-2xl bg-white p-5 shadow-pop sm:rounded-xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-base font-semibold text-navy-900">{heading}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-500 transition-colors hover:bg-canvas"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <QuoteForm compact context={context} />
          </div>
        </div>
      )}
    </>
  );
}
