"use client";
import { useState } from "react";
/**
 * Business login. The submit handler is a placeholder — connect it to the
 * existing authentication endpoint when the backend is wired up. No credentials
 * are transmitted or stored today.
 */
export default function LoginForm() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  function handleSubmit(event) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\s+/g, ""))) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    // TODO: call the existing OTP endpoint.
    setSent(true);
  }
  if (sent) {
    return (
      <p className="py-6 text-center text-sm text-ink-500">
        An OTP would be sent to <span className="font-medium text-navy-900">+91 {mobile}</span> once
        authentication is connected.
      </p>
    );
  }
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="login-mobile"
          className="mb-1.5 block text-[13px] font-medium text-navy-900"
        >
          Registered mobile number <span className="text-brand-600">*</span>
        </label>
        <input
          id="login-mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-mobile-err" : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 ${error ? "border-brand-600" : "border-line"}`}
        />
        {error && (
          <p id="login-mobile-err" className="mt-1 text-xs text-brand-700">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
      >
        Send OTP
      </button>
    </form>
  );
}
