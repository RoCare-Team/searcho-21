"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signupSendOtpAction, signupVerifyAction } from "@/app/(site)/list-your-business/actions";

/**
 * "Sign up to add your business" — name, email, mobile, confirmed by OTP.
 *
 * The same two-step shape as the login form, and the same reason for the server
 * actions: the OTP token stays out of the browser bundle.
 */
export default function VendorSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState("details");
  const [values, setValues] = useState({ name: "", email: "", mobile: "", otp: "" });
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function run(action, extra = {}) {
    setError(null);
    setNotice(null);
    const data = new FormData();
    for (const [k, v] of Object.entries({ ...values, ...extra })) data.set(k, v);

    startTransition(async () => {
      const result = await action(null, data);
      if (result.step === "done") {
        router.replace("/vendor/addbusiness");
        return;
      }
      setStep(result.step);
      if (result.ok) {
        setNotice(result.message);
      } else {
        setError(result.message);
      }
    });
  }

  const field =
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200";
  const border = error ? "border-brand-600" : "border-line";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(step === "details" ? signupSendOtpAction : signupVerifyAction);
      }}
      noValidate
      className="card p-5 sm:p-6"
    >
      <h2 className="text-[19px] font-semibold text-navy-900">Sign up to add your business</h2>

      <div className="mt-5 space-y-3">
        <input
          name="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Enter your name"
          autoComplete="name"
          aria-label="Your name"
          readOnly={step === "otp"}
          className={`${field} ${border} ${step === "otp" ? "bg-canvas text-ink-500" : ""}`}
        />
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          aria-label="Your email"
          readOnly={step === "otp"}
          className={`${field} ${border} ${step === "otp" ? "bg-canvas text-ink-500" : ""}`}
        />
        <input
          name="mobile"
          type="tel"
          inputMode="numeric"
          value={values.mobile}
          onChange={(e) => set("mobile", e.target.value)}
          placeholder="Enter your mobile"
          autoComplete="tel"
          aria-label="Your mobile number"
          readOnly={step === "otp"}
          className={`${field} ${border} ${step === "otp" ? "bg-canvas text-ink-500" : ""}`}
        />

        {step === "otp" && (
          <input
            name="otp"
            inputMode="numeric"
            maxLength={8}
            value={values.otp}
            onChange={(e) => set("otp", e.target.value)}
            placeholder="Enter OTP"
            autoComplete="one-time-code"
            aria-label="OTP"
            className={`${field} ${border} tracking-[0.3em]`}
          />
        )}
      </div>

      {error && <p className="mt-3 text-[14.5px] text-brand-700">{error}</p>}
      {notice && <p className="mt-3 text-[14.5px] text-success-700">{notice}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {step === "details" ? "Send OTP" : "Verify & continue"}
      </button>

      {step === "otp" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(signupSendOtpAction)}
          className="mt-3 block w-full text-center text-[14.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-60"
        >
          Resend OTP
        </button>
      )}

      <p className="mt-5 text-center text-[15px] text-ink-500">
        Have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
