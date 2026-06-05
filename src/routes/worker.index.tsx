import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { categoryMeta } from "@/lib/mock";
import { JobCard } from "@/components/ks/job-card";
import { LangPills } from "@/components/ks/lang-pills";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/worker/")({
  component: WorkerHome,
});

const cats: Category[] = [
  "maid", "electrician", "plumber", "cook", "driver",
  "security", "carpenter", "nanny", "delivery", "housekeeping",
];

function WorkerHome() {
  const { jobs, city, name } = useApp();
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (activeCat && j.category !== activeCat) return false;
      if (!q) return true;
      const hay = `${j.title} ${j.area} ${categoryMeta[j.category].en} ${categoryMeta[j.category].hi}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [jobs, q, activeCat]);

  return (
    <div className="pb-4">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary via-primary to-[oklch(0.65_0.2_30)] px-5 pb-8 pt-7 text-primary-foreground">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs opacity-90">📍 {city}</div>
            <h1 className="mt-0.5 text-2xl font-extrabold">
              नमस्ते{name ? `, ${name}` : ""} 👋
            </h1>
            <p className="text-sm opacity-90">{t("nearYou")} • अच्छी नौकरियाँ</p>
          </div>
          <LangPills className="bg-white/15" />
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 text-foreground shadow-soft">
          <span className="text-lg">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <section className="px-5 pt-5">
        <Link
          to="/ai"
          className="block rounded-2xl bg-gradient-to-r from-trust-soft to-primary-soft p-4 shadow-soft"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <div className="flex-1">
              <div className="text-sm font-extrabold">AI आपकी मदद के लिए है</div>
              <div className="text-xs text-muted-foreground">
                किसी भी नौकरी पर “Explain this job” दबाएँ — आसान भाषा में समझाएँगे
              </div>
            </div>
            <span className="text-primary">→</span>
          </div>
        </Link>
      </section>

      <section className="pt-5">
        <div className="px-5 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Categories
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
          <button
            onClick={() => setActiveCat(null)}
            className={`shrink-0 rounded-2xl border-2 px-3 py-2 text-xs font-bold ${
              activeCat === null ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface"
            }`}
          >
            All
          </button>
          {cats.map((c) => {
            const m = categoryMeta[c];
            const active = activeCat === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCat(active ? null : c)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border-2 px-3 py-2 ${
                  active ? "border-primary bg-primary-soft" : "border-border bg-surface"
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-[11px] font-bold">{m[lang] ?? m.en}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold">{t("nearYou")}</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} jobs</span>
        </div>
        {filtered.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            कोई नौकरी नहीं मिली। फ़िल्टर बदलें।
          </div>
        )}
      </section>
    </div>
  );
}
