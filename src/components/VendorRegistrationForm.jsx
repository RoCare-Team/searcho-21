"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { createListingAction } from "@/app/(site)/list-your-business/actions";
import { CheckCircle2 } from "lucide-react";
const EMPTY = {
  businessName: "",
  ownerName: "",
  mobile: "",
  email: "",
  city: "",
  category: "",
  address: "",
  about: "",
};
function validate(values) {
  const errors = {};
  if (!values.businessName.trim()) errors.businessName = "Enter your business name.";
  if (!values.ownerName.trim()) errors.ownerName = "Enter the contact person's name.";
  if (!values.mobile.trim()) {
    errors.mobile = "Enter a mobile number.";
  } else if (!/^[6-9]\d{9}$/.test(values.mobile.replace(/\s+/g, ""))) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.city.trim()) errors.city = "Enter the city you operate in.";
  if (!values.category) errors.category = "Choose a category.";
  if (!values.address.trim()) errors.address = "Enter your business address.";
  return errors;
}
/**
 * Vendor registration form.
 *
 * Submission is a placeholder — connect it to the existing "List Your Business"
 * endpoint when the backend is wired up. Nothing is transmitted today.
 */
export default function VendorRegistrationForm({ categories }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [pending, startTransition] = useTransition();
  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaveError(null);
    const data = new FormData();
    data.set("name", values.businessName);
    data.set("contactPerson", values.ownerName);
    data.set("mobile", values.mobile);
    data.set("email", values.email);
    data.set("city", values.city);
    data.set("address", values.address);
    data.set("about", values.about);
    // The form holds the category slug; the insert needs its numeric id.
    data.set("categoryId", categories.find((c) => c.slug === values.category)?.id ?? "");

    startTransition(async () => {
      const result = await createListingAction(null, data);
      if (result.ok) setSubmitted(result.message);
      else setSaveError(result.message);
    });
  }
  if (submitted) {
    return (
      <div className="card flex flex-col items-center px-6 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-success-600" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">Business submitted</h2>
        <p className="mt-1 max-w-sm text-[15.5px] text-ink-500">{submitted}</p>
        <Link
          href="/account"
          className="mt-5 inline-flex h-11 items-center rounded-lg bg-brand-500 px-4 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600"
        >
          Go to my account
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-5 sm:p-6">
      {saveError && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[14.5px] text-brand-700">
          {saveError}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="biz-name"
          label="Business name"
          required
          value={values.businessName}
          error={errors.businessName}
          onChange={(v) => set("businessName", v)}
        />
        <Field
          id="biz-owner"
          label="Contact person"
          required
          value={values.ownerName}
          error={errors.ownerName}
          onChange={(v) => set("ownerName", v)}
          autoComplete="name"
        />
        <Field
          id="biz-mobile"
          label="Mobile number"
          required
          type="tel"
          inputMode="numeric"
          value={values.mobile}
          error={errors.mobile}
          onChange={(v) => set("mobile", v)}
          autoComplete="tel"
        />
        <Field
          id="biz-email"
          label="Email"
          hint="Optional"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(v) => set("email", v)}
          autoComplete="email"
        />
        <Field
          id="biz-city"
          label="City"
          required
          value={values.city}
          error={errors.city}
          onChange={(v) => set("city", v)}
          autoComplete="address-level2"
        />

        <div>
          <label
            htmlFor="biz-category"
            className="mb-1.5 block text-[15.5px] font-medium text-navy-900"
          >
            Category <span className="text-brand-600">*</span>
          </label>
          <select
            id="biz-category"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            aria-invalid={Boolean(errors.category)}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.category ? "border-brand-600" : "border-line"}`}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-brand-700">{errors.category}</p>}
        </div>
      </div>

      <TextArea
        id="biz-address"
        label="Business address"
        required
        rows={2}
        value={values.address}
        error={errors.address}
        onChange={(v) => set("address", v)}
      />

      <TextArea
        id="biz-about"
        label="About your business"
        hint="Optional"
        rows={3}
        value={values.about}
        onChange={(v) => set("about", v)}
        placeholder="Services you offer, brands you handle, areas you cover."
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 sm:w-auto sm:px-8"
      >
        Register my business
      </button>

      <p className="text-xs text-ink-400">
        Listing on Searcho21 is free. Your details are verified before the listing goes live.
      </p>
    </form>
  );
}
function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  inputMode,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15.5px] font-medium text-navy-900">
        {label}{" "}
        {required ? (
          <span className="text-brand-600">*</span>
        ) : (
          hint && <span className="font-normal text-ink-400">({hint})</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 ${error ? "border-brand-600" : "border-line"}`}
      />
      {error && <p className="mt-1 text-xs text-brand-700">{error}</p>}
    </div>
  );
}
function TextArea({ id, label, value, onChange, error, hint, required, rows = 3, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15.5px] font-medium text-navy-900">
        {label}{" "}
        {required ? (
          <span className="text-brand-600">*</span>
        ) : (
          hint && <span className="font-normal text-ink-400">({hint})</span>
        )}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${error ? "border-brand-600" : "border-line"}`}
      />
      {error && <p className="mt-1 text-xs text-brand-700">{error}</p>}
    </div>
  );
}
