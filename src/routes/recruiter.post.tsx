import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useApp } from "@/lib/store";
import { useI18n, langLabel } from "@/lib/i18n";
import { categoryMeta } from "@/lib/mock";
import type {
  Category,
  Gender,
  Job,
  Lang,
  SalaryType,
  ShiftType,
} from "@/lib/types";
import { simplifyJob, smartSummary } from "@/lib/ai.functions";
import { ListenButton } from "@/components/ks/listen-button";

export const Route = createFileRoute("/recruiter/post")({
  component: PostWizard,
});

interface Draft {
  category: Category | null;
  gender: Gender;
  ageMin: number;
  ageMax: number;
  experience: string;
  verificationRequired: boolean;
  salaryType: SalaryType;
  salaryMin: number;
  salaryMax: number;
  area: string;
  pincode: string;
  radius: number;
  shift: ShiftType;
  workingDays: string;
  requirements: string;
}

const initial: Draft = {
  category: null,
  gender: "any",
  ageMin: 25,
  ageMax: 45,
  experience: "1-2 Years",
  verificationRequired: true,
  salaryType: "monthly",
  salaryMin: 12000,
  salaryMax: 18000,
  area: "",
  pincode: "",
  radius: 5,
  shift: "full",
  workingDays: "Mon-Sat",
  requirements: "",
};

const TOTAL = 7;

function PostWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initial);
  const [previewLang, setPreviewLang] = useState<Lang>("hi");
  const update = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const { addJob } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();

  const simplifyFn = useServerFn(simplifyJob);
  const summaryFn = useServerFn(smartSummary);
  const simplifyMut = useMutation({ mutationFn: simplifyFn });
  const summaryMut = useMutation({ mutationFn: summaryFn });

  const canNext = (() => {
    if (step === 0) return draft.category !== null;
    if (step === 3) return draft.area.trim().length > 0;
    return true;
  })();

  const onNext = async () => {
    if (step === TOTAL - 2) {
      // entering preview → fire AI
      if (draft.category) {
        const role = categoryMeta[draft.category].en;
        simplifyMut.mutate({
          data: {
            role,
            salaryMin: draft.salaryMin,
            salaryMax: draft.salaryMax,
            salaryType: draft.salaryType,
            experience: draft.experience,
            shift: draft.shift,
            area: draft.area,
            requirements: draft.requirements || `Need a ${role}.`,
          },
        });
        summaryMut.mutate({
          data: {
            role,
            salaryMin: draft.salaryMin,
            salaryMax: draft.salaryMax,
            salaryType: draft.salaryType,
            experience: draft.experience,
            shift: draft.shift,
            area: draft.area,
            distanceKm: 2,
            requirements: draft.requirements || `Need a ${role}.`,
          },
        });
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL - 1));
  };

  const publish = () => {
    if (!draft.category) return;
    const job: Job = {
      id: String(Date.now()),
      category: draft.category,
      title: `${categoryMeta[draft.category].en} — ${draft.area}`,
      recruiterId: "r1",
      salaryType: draft.salaryType,
      salaryMin: draft.salaryMin,
      salaryMax: draft.salaryMax,
      area: draft.area,
      pincode: draft.pincode,
      distanceKm: Math.round(Math.random() * 5 * 10) / 10,
      shift: draft.shift,
      workingDays: draft.workingDays,
      gender: draft.gender,
      ageMin: draft.ageMin,
      ageMax: draft.ageMax,
      experience: draft.experience,
      verificationRequired: draft.verificationRequired,
      requirements: draft.requirements,
      postedAt: new Date().toISOString(),
      verified: true,
      simplified: simplifyMut.data ?? undefined,
      summary: summaryMut.data ?? undefined,
    };
    addJob(job);
    navigate({ to: "/recruiter/jobs" });
  };

  const stepTitle = [
    t("stepCategory"),
    t("stepReq"),
    t("stepSalary"),
    t("stepLocation"),
    t("stepShift"),
    t("stepExtra"),
    t("stepPreview"),
  ][step];

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-10 bg-surface px-5 pb-3 pt-5 shadow-soft">
        <div className="flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? navigate({ to: "/recruiter" }) : setStep((s) => s - 1))}
            className="text-xl"
          >
            ←
          </button>
          <div className="text-xs font-bold text-muted-foreground">
            Step {step + 1} of {TOTAL}
          </div>
          <div className="w-4" />
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <h1 className="mt-4 text-xl font-extrabold">{stepTitle}</h1>
      </header>

      <div className="px-5 pt-4">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(categoryMeta) as Category[]).map((c) => {
              const m = categoryMeta[c];
              const active = draft.category === c;
              return (
                <button
                  key={c}
                  onClick={() => update("category", c)}
                  className={`rounded-3xl border-2 p-4 text-left transition ${
                    active ? "border-primary bg-primary-soft" : "border-border bg-surface"
                  }`}
                >
                  <div className="text-3xl">{m.icon}</div>
                  <div className="mt-2 font-extrabold">{m.en}</div>
                  <div className="text-[11px] text-muted-foreground">{m.hi}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <FieldGroup label="Gender">
              <Pills
                value={draft.gender}
                onChange={(v) => update("gender", v as Gender)}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "any", label: "Any" },
                ]}
              />
            </FieldGroup>
            <FieldGroup label="Age range">
              <Pills
                value={`${draft.ageMin}-${draft.ageMax}`}
                onChange={(v) => {
                  const [a, b] = v.split("-").map(Number);
                  update("ageMin", a);
                  update("ageMax", b);
                }}
                options={[
                  { value: "18-25", label: "18-25" },
                  { value: "25-35", label: "25-35" },
                  { value: "35-45", label: "35-45" },
                  { value: "45-60", label: "45+" },
                ]}
              />
            </FieldGroup>
            <FieldGroup label="Experience">
              <Pills
                value={draft.experience}
                onChange={(v) => update("experience", v)}
                options={[
                  { value: "Fresher", label: "Fresher" },
                  { value: "1-2 Years", label: "1-2 yrs" },
                  { value: "3-5 Years", label: "3-5 yrs" },
                  { value: "5+ Years", label: "5+ yrs" },
                ]}
              />
            </FieldGroup>
            <label className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-soft">
              <div>
                <div className="font-bold">Verification required</div>
                <div className="text-xs text-muted-foreground">ID/Aadhaar verified workers only</div>
              </div>
              <input
                type="checkbox"
                checked={draft.verificationRequired}
                onChange={(e) => update("verificationRequired", e.target.checked)}
                className="h-6 w-6 accent-primary"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <FieldGroup label="Salary type">
              <Pills
                value={draft.salaryType}
                onChange={(v) => update("salaryType", v as SalaryType)}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "daily", label: "Daily" },
                  { value: "hourly", label: "Hourly" },
                ]}
              />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Minimum (₹)"
                value={draft.salaryMin}
                onChange={(v) => update("salaryMin", v)}
              />
              <NumberField
                label="Maximum (₹)"
                value={draft.salaryMax}
                onChange={(v) => update("salaryMax", v)}
              />
            </div>
            <div className="rounded-2xl bg-trust-soft p-4 text-sm text-trust">
              💡 Workers in this area earn ₹
              {Math.round(draft.salaryMin * 0.95).toLocaleString()} – ₹
              {Math.round(draft.salaryMax * 1.05).toLocaleString()} on average.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <TextField
              label="Area / Locality"
              placeholder="e.g. Dwarka Sector 12"
              value={draft.area}
              onChange={(v) => update("area", v)}
            />
            <TextField
              label="Pincode"
              placeholder="110075"
              value={draft.pincode}
              onChange={(v) => update("pincode", v)}
            />
            <FieldGroup label="Search radius">
              <Pills
                value={String(draft.radius)}
                onChange={(v) => update("radius", Number(v))}
                options={[
                  { value: "1", label: "1 km" },
                  { value: "5", label: "5 km" },
                  { value: "10", label: "10 km" },
                  { value: "20", label: "20 km" },
                ]}
              />
            </FieldGroup>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <FieldGroup label="Shift">
              <Pills
                value={draft.shift}
                onChange={(v) => update("shift", v as ShiftType)}
                options={[
                  { value: "day", label: "Day" },
                  { value: "night", label: "Night" },
                  { value: "rotational", label: "Rotational" },
                  { value: "part", label: "Part-time" },
                  { value: "full", label: "Full-time" },
                ]}
              />
            </FieldGroup>
            <FieldGroup label="Working days">
              <Pills
                value={draft.workingDays}
                onChange={(v) => update("workingDays", v)}
                options={[
                  { value: "Mon-Fri", label: "Weekdays" },
                  { value: "Sat-Sun", label: "Weekends" },
                  { value: "Mon-Sat", label: "Mon-Sat" },
                  { value: "Daily", label: "All days" },
                ]}
              />
            </FieldGroup>
          </div>
        )}

        {step === 5 && (
          <div>
            <label className="text-xs font-bold text-muted-foreground">Additional notes (HR English is fine, AI will simplify)</label>
            <textarea
              value={draft.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              placeholder="e.g. Must know basic English, apartment experience preferred, immediate joining…"
              rows={6}
              className="mt-1 w-full rounded-2xl border-2 border-border bg-surface p-4 text-base outline-none focus:border-primary"
            />
            <div className="mt-3 rounded-2xl bg-primary-soft p-4 text-sm">
              <div className="font-bold text-primary">✨ Don't worry about language</div>
              <div className="mt-1 text-muted-foreground">
                Write naturally. KaamSetu AI rewrites this in simple Hindi, English &amp; Tamil
                so workers can understand instantly.
              </div>
            </div>
          </div>
        )}

        {step === 6 && draft.category && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.6_0.22_30)] p-5 text-primary-foreground shadow-pop">
              <div className="text-xs opacity-90">Preview</div>
              <div className="mt-1 text-xl font-extrabold">
                {categoryMeta[draft.category].en} — {draft.area || "your area"}
              </div>
              <div className="mt-1 text-sm opacity-90">
                💰 ₹{draft.salaryMin.toLocaleString()}–{draft.salaryMax.toLocaleString()} {draft.salaryType} • 📍 {draft.area}
              </div>
            </div>

            <div className="rounded-3xl bg-surface p-5 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-extrabold text-primary">✨ AI simplified (multi-lingual)</div>
                <div className="inline-flex rounded-full bg-muted p-1">
                  {(["hi", "en", "ta"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setPreviewLang(l)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        previewLang === l ? "bg-surface text-primary shadow-soft" : "text-muted-foreground"
                      }`}
                    >
                      {langLabel[l]}
                    </button>
                  ))}
                </div>
              </div>

              {simplifyMut.isPending && <Shimmer label="AI is writing in 3 languages…" />}
              {simplifyMut.isError && (
                <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  AI is unavailable. Job will be published with your original text.
                </div>
              )}
              {simplifyMut.data && (
                <>
                  <pre className="whitespace-pre-wrap font-[inherit] text-[15px] leading-relaxed">
                    {simplifyMut.data[previewLang]}
                  </pre>
                  <div className="mt-3">
                    <ListenButton text={simplifyMut.data[previewLang]} lang={previewLang} label="🔊 Listen" />
                  </div>
                </>
              )}
            </div>

            {summaryMut.data && (
              <div className="rounded-3xl bg-surface p-5 shadow-soft">
                <div className="text-sm font-extrabold">✨ Smart Summary</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {summaryMut.data.highlights.map((h) => (
                    <span key={h} className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'white', zIndex: 100 }}>
        {step < TOTAL - 1 ? (
          <button
            onClick={onNext}
            style={{ width: '100%', padding: '1rem', background: 'blue', color: 'white' }}
          >
            Next →
          </button>
        ) : (
          <button
            style={{ width: '100%', padding: '1rem', background: 'green', color: 'white' }}
          >
            ✓ Publish
          </button>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function Pills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function Shimmer({ label }: { label: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-primary">{label}</div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
