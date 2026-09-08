"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic, Square } from "lucide-react";
import { resolveVoiceQuery } from "@/lib/voice-match";

/**
 * Ask-by-voice: the assistant greets, listens, and routes to the service the
 * caller asked for.
 *
 * Uses the browser's own Web Speech API for both halves, so there is no API key
 * and no per-request cost. What was said is matched against the live service
 * and city indexes (see lib/voice-match.js), which come from the database — a
 * service added in the admin panel is speakable the same day.
 *
 * Two browser rules shape this:
 *
 * 1. Audio cannot start on its own. Chrome and Safari block speech synthesis
 *    until the visitor interacts, so the greeting plays on the button press
 *    rather than when the dialog opens.
 * 2. Recognition is not universal. Chrome and Edge support it on desktop and
 *    Android; Firefox does not, and iOS Safari is unreliable. The button is
 *    hidden entirely where it is missing, leaving the typed search intact.
 */
const GREETING = "Namaste. Searcho21 mein aapka swagat hai. Aapko kis service ki zarurat hai?";

export default function VoiceSearch({ services, cities, citySlug, onNoMatch }) {
  const router = useRouter();
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const Recognition =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(Boolean(Recognition));

    return () => {
      // Leaving the page mid-sentence should not keep the microphone open.
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  /** Speaks a line, resolving when it finishes so listening starts after. */
  const say = useCallback((text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) return resolve();
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 1.02;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      synth.speak(utterance);
    });
  }, []);

  const handleResult = useCallback(
    (heard) => {
      setState("thinking");
      const { href, service } = resolveVoiceQuery(heard, {
        services,
        cities,
        fallbackCitySlug: citySlug,
      });

      if (href) {
        setMessage(`Le ja rahe hain: ${service.label}`);
        router.push(href);
        return;
      }

      // Nothing matched. The words are not thrown away — the caller hands them
      // to the enquiry form so the visitor does not have to repeat themselves.
      setState("nomatch");
      setMessage("Samajh nahi aaya. Aap apni baat form mein likh sakte hain.");
      onNoMatch?.(heard);
    },
    [services, cities, citySlug, router, onNoMatch],
  );

  async function start() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    setTranscript("");
    setMessage("");
    setState("greeting");
    await say(GREETING);

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    // hi-IN copes with the Hindi-English mix people actually speak
    // ("water purifier chahiye") better than en-IN does.
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const heard = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      setTranscript(heard);
      if (event.results[event.results.length - 1].isFinal) handleResult(heard);
    };

    recognition.onerror = (event) => {
      setState("error");
      setMessage(
        event.error === "not-allowed"
          ? "Microphone ki permission nahi mili. Browser ki settings se allow kar dijiye."
          : event.error === "no-speech"
            ? "Kuch sunai nahi diya. Dobara koshish kijiye."
            : "Voice search abhi kaam nahi kar paya.",
      );
    };

    recognition.onend = () => {
      setState((current) => (current === "listening" ? "idle" : current));
    };

    setState("listening");
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop?.();
    window.speechSynthesis?.cancel?.();
    setState("idle");
  }

  if (!supported) return null;

  const busy = state === "greeting" || state === "thinking";
  const listening = state === "listening";

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-3.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={busy}
          aria-label={listening ? "Stop listening" : "Ask by voice"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors disabled:opacity-60 ${
            listening ? "bg-navy-900 hover:bg-navy-800" : "bg-brand-500 hover:bg-brand-600"
          }`}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : listening ? (
            <Square className="h-4 w-4" aria-hidden />
          ) : (
            <Mic className="h-5 w-5" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-navy-900">
            {listening ? "Sun rahe hain…" : "Bol kar poochhiye"}
          </p>
          <p className="mt-0.5 text-[13.5px] text-ink-600">
            {transcript || message || 'Jaise: "Delhi mein water purifier service chahiye"'}
          </p>
        </div>
      </div>

      {/* Announced to screen readers as it changes, since the state is
          otherwise conveyed by an animated icon alone. */}
      <p className="sr-only" role="status" aria-live="polite">
        {message || transcript}
      </p>
    </div>
  );
}
