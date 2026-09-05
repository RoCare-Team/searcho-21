"use client";
import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";
function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.mobile.trim()) {
    errors.mobile = "Please enter your mobile number.";
  } else if (!/^[6-9]\d{9}$/.test(values.mobile.replace(/\s+/g, ""))) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.requirement.trim()) errors.requirement = "Tell us briefly what you need.";
  return errors;
}
/**
 * Enquiry form. Submission is a no-op placeholder — wire the handler to the
 * existing enquiry endpoint when the backend is connected. No field values are
 * sent anywhere today.
 */
export default function QuoteForm({ context, compact = false, onDone }) {
  const uid = useId();
  const [values, setValues] = useState({ name: "", email: "", mobile: "", requirement: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    // TODO: POST to the Searcho21 enquiry endpoint once the backend is wired up.
    setSubmitted(true);
    onDone?.();
  }
  if (submitted) {
    return (
      <div className="flex flex-col items-center px-2 py-8 text-center">
        <CheckCircle2 className="h-9 w-9 text-success-600" aria-hidden />
        <p className="mt-3 text-base font-semibold text-navy-900">Requirement received</p>
        <p className="mt-1 max-w-xs text-sm text-ink-500">
          Providers matching your requirement will get in touch shortly.
        </p>
      </div>
    );
  }
  const gap = compact ? "space-y-3.5" : "space-y-4";
  return (
    <form onSubmit={handleSubmit} noValidate className={gap}>
      {context && (
        <p className="rounded-lg bg-canvas px-3 py-2 text-[13px] text-ink-500">{context}</p>
      )}

      <Field
        id={`${uid}-name`}
        label="Name"
        required
        value={values.name}
        error={errors.name}
        onChange={(v) => set("name", v)}
        autoComplete="name"
      />

      <Field
        id={`${uid}-mobile`}
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
        id={`${uid}-email`}
        label="Email"
        hint="Optional"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(v) => set("email", v)}
        autoComplete="email"
      />

      <div>
        <label
          htmlFor={`${uid}-req`}
          className="mb-1.5 block text-[13px] font-medium text-navy-900"
        >
          Requirement <span className="text-brand-600">*</span>
        </label>
        <textarea
          id={`${uid}-req`}
          rows={3}
          value={values.requirement}
          onChange={(e) => set("requirement", e.target.value)}
          aria-invalid={Boolean(errors.requirement)}
          aria-describedby={errors.requirement ? `${uid}-req-err` : undefined}
          placeholder="e.g. Kent RO not giving water, needs a service visit this week."
          className={`w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${errors.requirement ? "border-brand-600" : "border-line"}`}
        />
        {errors.requirement && (
          <p id={`${uid}-req-err`} className="mt-1 text-xs text-brand-700">
            {errors.requirement}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Submit requirement
      </button>

      <p className="text-center text-xs text-ink-400">
        By submitting you agree to be contacted by matching service providers.
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
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-navy-900">
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
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${error ? "border-brand-600" : "border-line"}`}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-brand-700">
          {error}
        </p>
      )}
    </div>
  );
}
