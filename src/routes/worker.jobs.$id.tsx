import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { categoryMeta, recruiters } from "@/lib/mock";
import { BottomSheet } from "@/components/ks/bottom-sheet";
import { ListenButton } from "@/components/ks/listen-button";
import { LangPills } from "@/components/ks/lang-pills";
import { explainJob, matchScore } from "@/lib/ai.functions";

export const Route = createFileRoute("/worker/jobs/$id")({
  component: JobDetail,
});

function JobDetail() {
  const { id } = useParams({ from: "/worker/jobs/$id" });
  const { jobs, addApplication, name: storedName } = useApp();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const job = useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);
  const [explainOpen, setExplainOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [appliedOk, setAppliedOk] = useState(false);

  const explainFn = useServerFn(explainJob);
  const matchFn = useServerFn(matchScore);

  const explainMut = useMutation({
    mutationFn: () =>
      explainFn({
        data: {
          jobTitle: job!.title,
          role: categoryMeta[job!.category].en,
          salary: `₹${job!.salaryMin}-${job!.salaryMax} ${job!.salaryType}`,
          experience: job!.experience,
          shift: job!.shift,
          area: job!.area,
          requirements: job!.requirements,
          lang,
        },
      }),
  });

  const matchMut = useMutation({
    mutationFn: () =>
      matchFn({
        data: {
          workerCategory: categoryMeta[job!.category].en,
          workerExperience: "3 years",
          workerArea: job!.area,
          workerLangs: [lang],
          jobCategory: categoryMeta[job!.category].en,
          jobExperience: job!.experience,
          jobArea: job!.area,
          jobDistanceKm: job!.distanceKm,
          jobSalary: `${job!.salaryMin}-${job!.salaryMax}`,
        },
      }),
  });

  if (!job) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Job not found.
        <div className="mt-4">
          <Link to="/worker" className="font-bold text-primary">← Back</Link>
        </div>
      </div>
    );
  }

  const cat = categoryMeta[job.category];
  const recruiter = recruiters.find((r) => r.id === job.recruiterId);
  const simplified = job.simplified?.[lang] ?? job.simplified?.en ?? job.requirements;

  const openExplain = () => {
    setExplainOpen(true);
    if (!explainMut.data && !explainMut.isPending) explainMut.mutate();
  };
  const openMatch = () => {
    setMatchOpen(true);
    if (!matchMut.data && !matchMut.isPending) matchMut.mutate();
  };

  return (
    <div className="pb-24">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-[oklch(0.6_0.2_30)] px-5 pb-8 pt-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/worker" })}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-lg"
            aria-label="Back"
          >
            ←
          </button>
          <LangPills className="bg-white/15" />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-3xl">
            {cat.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider opacity-85">{cat[lang] ?? cat.en}</div>
            <h1 className="truncate text-xl font-extrabold">{job.title}</h1>
            <div className="text-xs opacity-90">📍 {job.area} • {job.distanceKm} km</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Pill label="Salary" value={`₹${(job.salaryMin / 1000).toFixed(0)}k+`} />
          <Pill label="Shift" value={job.shift} />
          <Pill label="Exp" value={job.experience} />
        </div>
      </header>

      <div className="space-y-3 px-5 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openExplain}
            className="flex-1 rounded-2xl bg-primary-soft px-4 py-3 text-sm font-extrabold text-primary shadow-soft active:scale-[0.99]"
          >
            {t("explainJob")}
          </button>
          <button
            onClick={openMatch}
            className="flex-1 rounded-2xl bg-trust-soft px-4 py-3 text-sm font-extrabold text-trust shadow-soft active:scale-[0.99]"
          >
            🎯 {t("matchScore")} Score
          </button>
        </div>

        {/* AI Simplified */}
        <section className="rounded-3xl bg-surface p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wide text-primary">
              {t("aiSimplified")}
            </div>
            <ListenButton text={simplified} lang={lang} label={t("listen")} />
          </div>
          <pre className="whitespace-pre-wrap font-[inherit] text-[15px] leading-relaxed text-foreground">
            {simplified}
          </pre>
        </section>

        {/* Smart Summary */}
        {job.summary && (
          <section className="rounded-3xl bg-surface p-5 shadow-soft">
            <h2 className="text-base font-extrabold">{t("smartSummary")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.summary.highlights.map((h) => (
                <span key={h} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                  ✓ {h}
                </span>
              ))}
            </div>
            <SummaryBlock title={t("bestFor")} items={job.summary.bestFor} tone="trust" />
            <SummaryBlock title={t("thingsToKnow")} items={job.summary.thingsToKnow} tone="warning" />
            <SummaryBlock title={t("benefits")} items={job.summary.benefits} tone="success" />
          </section>
        )}

        {/* Recruiter */}
        {recruiter && (
          <section className="rounded-3xl bg-surface p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-trust-soft text-2xl">
                {recruiter.emoji}
              </div>
              <div className="flex-1">
                <div className="font-extrabold">{recruiter.name}</div>
                <div className="text-xs text-muted-foreground">{recruiter.org}</div>
              </div>
              {recruiter.verified && (
                <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`tel:${recruiter.phone}`}
                className="rounded-2xl bg-success-soft py-3 text-center text-sm font-extrabold text-success"
              >
                📞 {t("call")}
              </a>
              <a
                href={`https://wa.me/91${recruiter.phone}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-success py-3 text-center text-sm font-extrabold text-success-foreground"
              >
                💬 {t("whatsapp")}
              </a>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Apply */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[460px] border-t border-border bg-surface/95 px-5 py-3 backdrop-blur">
        <button
          onClick={() => setApplyOpen(true)}
          className="w-full rounded-2xl bg-primary py-4 text-base font-extrabold text-primary-foreground shadow-pop active:scale-[0.98]"
        >
          {t("apply")} →
        </button>
      </div>

      {/* Explain sheet */}
      <BottomSheet open={explainOpen} onClose={() => setExplainOpen(false)} title="💬 AI is explaining">
        {explainMut.isPending && <ThinkingShimmer label={t("generating")} />}
        {explainMut.isError && (
          <p className="text-sm text-destructive">AI is unavailable right now. Please try again.</p>
        )}
        {explainMut.data && (
          <div className="space-y-4">
            <pre className="whitespace-pre-wrap font-[inherit] text-[15px] leading-relaxed">
              {explainMut.data.text}
            </pre>
            <ListenButton text={explainMut.data.text} lang={lang} label={t("listen")} />
          </div>
        )}
      </BottomSheet>

      {/* Match sheet */}
      <BottomSheet open={matchOpen} onClose={() => setMatchOpen(false)} title="🎯 AI Match Score">
        {matchMut.isPending && <ThinkingShimmer label="AI is checking match…" />}
        {matchMut.data && (
          <div className="space-y-4">
            <div className="grid place-items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-primary-soft to-trust-soft">
                <div className="text-4xl font-extrabold text-primary">{matchMut.data.score}%</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-success">Why it fits</div>
              <ul className="mt-1 space-y-1 text-sm">
                {matchMut.data.reasons.map((r, i) => (
                  <li key={i}>✓ {r}</li>
                ))}
              </ul>
            </div>
            {matchMut.data.gaps?.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-warning">Watch out</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {matchMut.data.gaps.map((r, i) => (
                    <li key={i}>⚠ {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Apply sheet */}
      <BottomSheet open={applyOpen} onClose={() => setApplyOpen(false)} title={appliedOk ? "" : t("apply")}>
        {!appliedOk ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addApplication({
                id: String(Date.now()),
                jobId: job.id,
                workerName: String(fd.get("name") || storedName || "Worker"),
                workerPhone: String(fd.get("phone") || ""),
                experience: String(fd.get("exp") || ""),
                available: fd.get("avail") === "yes",
                status: "applied",
                appliedAt: new Date().toISOString(),
              });
              setAppliedOk(true);
            }}
            className="space-y-3"
          >
            <Field name="name" label="Your name" defaultValue={storedName} required />
            <Field name="phone" label="Phone" type="tel" required />
            <Field name="exp" label="Experience" defaultValue="2 years" />
            <div>
              <div className="mb-1 text-xs font-bold text-muted-foreground">Can you start immediately?</div>
              <div className="flex gap-2">
                {["yes", "no"].map((v) => (
                  <label key={v} className="flex-1">
                    <input type="radio" name="avail" value={v} defaultChecked={v === "yes"} className="peer sr-only" />
                    <div className="cursor-pointer rounded-2xl border-2 border-border bg-surface py-3 text-center text-sm font-bold peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary">
                      {v === "yes" ? "हाँ" : "नहीं"}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full rounded-2xl bg-primary py-4 text-base font-extrabold text-primary-foreground">
              {t("apply")} →
            </button>
          </form>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-success-soft text-4xl">
              ✓
            </div>
            <div className="text-xl font-extrabold">{t("appliedOk")}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Recruiter will contact you shortly.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setApplyOpen(false);
                  setAppliedOk(false);
                  navigate({ to: "/worker/applications" });
                }}
                className="rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
              >
                My applications
              </button>
              <button
                onClick={() => {
                  setApplyOpen(false);
                  setAppliedOk(false);
                  navigate({ to: "/worker" });
                }}
                className="rounded-2xl bg-muted py-3 text-sm font-bold"
              >
                More jobs
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2">
      <div className="text-[10px] uppercase opacity-80">{label}</div>
      <div className="text-sm font-extrabold capitalize">{value}</div>
    </div>
  );
}

function SummaryBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "trust" | "warning" | "success";
}) {
  const toneCls =
    tone === "trust"
      ? "text-trust"
      : tone === "warning"
      ? "text-[oklch(0.6_0.16_70)]"
      : "text-success";
  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className={`text-xs font-extrabold uppercase tracking-wide ${toneCls}`}>{title}</div>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((it) => (
          <li key={it}>• {it}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function ThinkingShimmer({ label }: { label: string }) {
  return (
    <div className="py-6">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
        <span className="inline-flex">
          <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
          <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "120ms" }} />
          <span className="mx-0.5 h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "240ms" }} />
        </span>
        {label}
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
