"use client";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { submitRequestAction } from "@/app/(site)/enquiry-actions";

/**
 * "Submit your Request" — the popup enquiry the live site opens on the
 * homepage. Saves to `enquiry_tb` and forwards the lead to the CRM; see
 * lib/enquiry.js.
 *
 * It opens by itself once per browser session, and only after the visitor has
 * chosen a city. Two reasons: the city picker already opens on a first visit,
 * and two dialogs fighting for the screen is worse than either alone.
 */
const SESSION_KEY = "s21_request_shown";
const PURCHASE = ["Service", "New Purchase"];
const WORK = ["Repair/Service", "Installation/Uninstallation", "AMC"];

export default function RequestModal({ categories = [], states = [], cities = [], hasCity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  const [stateId, setStateId] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasCity) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private browsing can throw on access; treat it as "not shown yet".
    }
    if (shown) return;

    // A short delay so the page paints first — a dialog that appears mid-load
    // reads as an error, not an offer.
    const timer = setTimeout(() => {
      setIsOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* nothing to remember it with; it will offer again next page */
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [hasCity]);

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

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await submitRequestAction(null, data);
      if (result.ok) setDone(result.message);
      else setError(result.message);
    });
  }

  if (!isOpen) return null;

  const visibleCities = stateId
    ? cities.filter((c) => String(c.stateId) === String(stateId))
    : cities;

  const field =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submit your request"
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0 bg-navy-900/45"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      <div className="fade-in relative flex max-h-[88vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-pop sm:rounded-xl">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-[19px] font-semibold text-navy-900">Submit your request</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="-mr-1 rounded-md p-1.5 text-ink-500 transition-colors hover:bg-canvas"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-success-600" aria-hidden />
            <p className="mt-3 text-[17px] font-semibold text-navy-900">Request received</p>
            <p className="mt-1 text-[15px] text-ink-500">{done}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-5">
            <p className="rounded-lg bg-canvas px-3 py-2 text-[14px] font-medium text-ink-600">
              Basic details
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Full name" aria-label="Full name" className={field} />
              <input
                name="mobile"
                inputMode="numeric"
                placeholder="10 digit mobile number"
                aria-label="Mobile number"
                className={field}
              />
              <input
                name="email"
                type="email"
                placeholder="Your email"
                aria-label="Email"
                className={field}
              />
              <select name="categoryId" aria-label="Category" defaultValue="" className={field}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              name="pincode"
              inputMode="numeric"
              placeholder="Enter pin code"
              aria-label="Pin code"
              className={`${field} mt-3`}
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select
                name="state"
                aria-label="State"
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className={field}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select name="city" aria-label="City" defaultValue="" className={field}>
                <option value="">Select city</option>
                {visibleCities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="mt-3 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">What do you need?</legend>
              {PURCHASE.map((option, i) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-[15px] text-ink-700"
                >
                  <input
                    type="radio"
                    name="purchaseType"
                    value={option}
                    defaultChecked={i === 0}
                    className="h-4 w-4 accent-brand-500"
                  />
                  {option}
                </label>
              ))}
            </fieldset>

            <fieldset className="mt-3 grid gap-3 sm:grid-cols-3">
              <legend className="sr-only">Type of work</legend>
              {WORK.map((option, i) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-2.5 py-2.5 text-[13.5px] leading-tight text-ink-700"
                >
                  <input
                    type="radio"
                    name="workType"
                    value={option}
                    defaultChecked={i === 0}
                    className="h-4 w-4 shrink-0 accent-brand-500"
                  />
                  {option}
                </label>
              ))}
            </fieldset>

            <p className="mt-4 text-[14px] font-medium text-navy-900">Address</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <input
                name="house"
                placeholder="House no. / building no."
                aria-label="House or building number"
                className={field}
              />
              <input
                name="road"
                placeholder="Road name / area"
                aria-label="Road or area"
                className={field}
              />
            </div>
            <input
              name="landmark"
              placeholder="Nearby famous place / shop / school, etc."
              aria-label="Landmark"
              className={`${field} mt-3`}
            />

            {error && <p className="mt-3 text-[14.5px] text-brand-700">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Submit request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
