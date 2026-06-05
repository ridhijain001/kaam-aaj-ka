import { useI18n, langLabel } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const langs: Lang[] = ["hi", "en", "ta"];

export function LangPills({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex rounded-full bg-muted p-1 ${className}`}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            lang === l ? "bg-surface text-primary shadow-soft" : "text-muted-foreground"
          }`}
        >
          {langLabel[l]}
        </button>
      ))}
    </div>
  );
}
