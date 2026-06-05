import { useEffect, useState } from "react";
import { ttsLocale } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function ListenButton({ text, lang, label }: { text: string; lang: Lang; label: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = ttsLocale[lang];
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  return (
    <button
      onClick={speak}
      className="inline-flex items-center gap-2 rounded-full bg-trust-soft px-4 py-2 text-sm font-bold text-trust transition active:scale-95"
    >
      <span className={speaking ? "animate-pulse" : ""}>{speaking ? "⏸" : "🔊"}</span>
      {label}
    </button>
  );
}
