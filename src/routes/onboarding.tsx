import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/ks/app-shell";
import { useApp } from "@/lib/store";
import { useI18n, langLabel } from "@/lib/i18n";
import type { Lang, Role } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(0);
  const [chosenRole, setChosenRole] = useState<Role | null>(null);
  const { setRole, setOnboarded, setCity, setName, name } = useApp();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();

  const finish = () => {
    if (!chosenRole) return;
    setRole(chosenRole);
    setOnboarded(true);
    navigate({ to: chosenRole === "worker" ? "/worker" : "/recruiter" });
  };

  return (
    <AppShell>
      <div className="flex min-h-dvh flex-col">
        <div className="px-5 pt-6">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col px-5 pt-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-primary-soft text-4xl">
                🤝
              </div>
              <h1 className="text-2xl font-extrabold">{t("welcome")} • KaamSetu</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                आपके पास भरोसेमंद काम और कारीगर — सिर्फ़ एक टैप दूर।
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setChosenRole("worker")}
                className={`w-full rounded-3xl border-2 p-5 text-left transition active:scale-[0.99] ${
                  chosenRole === "worker"
                    ? "border-primary bg-primary-soft shadow-pop"
                    : "border-border bg-surface"
                }`}
              >
                <div className="mb-1 text-3xl">🧰</div>
                <div className="text-lg font-bold">{t("iWantWork")}</div>
                <div className="text-xs text-muted-foreground">Find trusted work nearby</div>
              </button>
              <button
                onClick={() => setChosenRole("recruiter")}
                className={`w-full rounded-3xl border-2 p-5 text-left transition active:scale-[0.99] ${
                  chosenRole === "recruiter"
                    ? "border-primary bg-primary-soft shadow-pop"
                    : "border-border bg-surface"
                }`}
              >
                <div className="mb-1 text-3xl">🏢</div>
                <div className="text-lg font-bold">{t("iWantHire")}</div>
                <div className="text-xs text-muted-foreground">Hire trusted workers nearby</div>
              </button>
            </div>

            <div className="mt-auto pb-6 pt-8">
              <PrimaryButton disabled={!chosenRole} onClick={() => setStep(1)}>
                {t("continue")}
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col px-5 pt-8">
            <h1 className="text-2xl font-extrabold">{t("chooseLanguage")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              पूरी ऐप आपकी भाषा में दिखेगी।
            </p>

            <div className="mt-6 space-y-3">
              {(["hi", "en", "ta"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex w-full items-center justify-between rounded-3xl border-2 p-5 transition ${
                    lang === l
                      ? "border-primary bg-primary-soft shadow-pop"
                      : "border-border bg-surface"
                  }`}
                >
                  <span className="text-xl font-bold">{langLabel[l]}</span>
                  <span className="text-2xl">{lang === l ? "✓" : ""}</span>
                </button>
              ))}
            </div>

            {chosenRole === "recruiter" && (
              <div className="mt-6">
                <label className="text-xs font-bold text-muted-foreground">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mrs. Kapoor"
                  className="mt-1 w-full rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="mt-auto pb-6 pt-8">
              <PrimaryButton onClick={() => setStep(2)}>{t("continue")}</PrimaryButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col px-5 pt-8">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-trust-soft text-5xl">
              📍
            </div>
            <h1 className="text-center text-2xl font-extrabold">{t("locationTitle")}</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">{t("locationSub")}</p>

            <div className="mt-6 rounded-2xl bg-muted p-4 text-sm">
              <div className="font-bold">Your city</div>
              <select
                onChange={(e) => setCity(e.target.value)}
                defaultValue="Delhi"
                className="mt-2 w-full rounded-xl border-2 border-border bg-surface px-3 py-2 font-semibold outline-none focus:border-primary"
              >
                {["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Pune"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mt-auto space-y-3 pb-6 pt-8">
              <PrimaryButton
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      () => finish(),
                      () => finish(),
                      { timeout: 4000 },
                    );
                  } else finish();
                }}
              >
                {t("allow")}
              </PrimaryButton>
              <button
                onClick={finish}
                className="w-full rounded-2xl py-3 text-sm font-bold text-muted-foreground"
              >
                {t("skip")}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-2xl bg-primary py-4 text-base font-extrabold text-primary-foreground shadow-pop transition active:scale-[0.98] disabled:opacity-40"
    >
      {children}
    </button>
  );
}
