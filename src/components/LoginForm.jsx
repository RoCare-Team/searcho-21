"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { requestOtpAction, verifyOtpAction } from "@/app/(site)/login/actions";

/**
 * Business login by OTP.
 *
 * Both calls go through server actions, so the code itself never reaches the
 * browser — it is generated and checked server-side against user_tb.otp.
 */
export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function run(action, formData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action(null, formData);
      if (result.step === "done") {
        // The session cookie is set; a full navigation lets the server read it.
        router.replace("/account");
        return;
      }
      setStep(result.step);
      if (result.ok) setMessage(result.message);
      else setError(result.message);
    });
  }

  function requestOtp(event) {
    event.preventDefault();
    const data = new FormData();
    data.set("mobile", mobile);
    run(requestOtpAction, data);
  }

  function submitOtp(event) {
    event.preventDefault();
    const data = new FormData();
    data.set("mobile", mobile);
    data.set("otp", otp);
    run(verifyOtpAction, data);
  }

  if (step === "unregistered") {
    return (
      <div className="flex flex-col items-center px-2 py-8 text-center">
        <CheckCircle2 className="h-9 w-9 text-success-600" aria-hidden />
        <p className="mt-3 text-base font-semibold text-navy-900">Mobile verified</p>
        <p className="mt-1 text-[15.5px] text-ink-500">
          No business is registered against +91 {mobile} yet.
        </p>
        <Link
          href="/list-your-business"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-brand-500 px-4 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600"
        >
          List your business
        </Link>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-[15.5px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200";
  const button =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-[15.5px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60";

  return (
    <form onSubmit={step === "mobile" ? requestOtp : submitOtp} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="login-mobile"
          className="mb-1.5 block text-[15.5px] font-medium text-navy-900"
        >
          Registered mobile number <span className="text-brand-600">*</span>
        </label>
        <input
          id="login-mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={mobile}
          readOnly={step === "otp"}
          onChange={(e) => setMobile(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`${field} ${error ? "border-brand-600" : "border-line"} ${
            step === "otp" ? "bg-canvas text-ink-500" : ""
          }`}
        />
      </div>

      {step === "otp" && (
        <div>
          <label
            htmlFor="login-otp"
            className="mb-1.5 block text-[15.5px] font-medium text-navy-900"
          >
            Enter OTP <span className="text-brand-600">*</span>
          </label>
          <input
            id="login-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`${field} tracking-[0.3em] ${error ? "border-brand-600" : "border-line"}`}
          />
        </div>
      )}

      {error && <p className="text-[14px] text-brand-700">{error}</p>}
      {message && step === "otp" && <p className="text-[14px] text-success-700">{message}</p>}

      <button type="submit" disabled={pending} className={button}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {step === "mobile" ? "Send OTP" : "Verify OTP"}
      </button>

      {step === "otp" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const data = new FormData();
            data.set("mobile", mobile);
            run(requestOtpAction, data);
          }}
          className="w-full text-center text-[14.5px] font-medium text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-60"
        >
          Resend OTP
        </button>
      )}
    </form>
  );
}
