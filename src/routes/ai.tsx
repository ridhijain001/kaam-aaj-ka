import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/ks/app-shell";
import { LangPills } from "@/components/ks/lang-pills";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Powered Features — KaamSetu" },
      { name: "description", content: "How KaamSetu uses AI to remove language and literacy barriers for India's informal workforce." },
    ],
  }),
  component: AIShowcase,
});

const features = [
  {
    icon: "✨",
    title: "AI Job Simplification",
    sub: "HR English → simple Hindi/Tamil/English",
    body: "Recruiters write naturally. AI rewrites the post in 3 worker-friendly languages with emojis, short lines, and zero jargon — so a guard, cook, or driver instantly understands.",
    accent: "from-primary-soft to-primary-soft",
  },
  {
    icon: "💬",
    title: "Explain This Job",
    sub: "Worker companion: 'Mujhe karna kya hoga?'",
    body: "Every job has an Explain button. AI answers in the worker's language: what the work really is, daily duties, who it suits, and what to watch out for. Conversational, warm, simple.",
    accent: "from-trust-soft to-trust-soft",
  },
  {
    icon: "🔊",
    title: "Voice Assistant",
    sub: "Listen instead of reading",
    body: "Built-in text-to-speech reads simplified posts and AI explanations in Hindi, Tamil and English — perfect for workers with limited literacy.",
    accent: "from-success-soft to-success-soft",
  },
  {
    icon: "🎯",
    title: "AI Match Score",
    sub: "How well a job fits you",
    body: "AI compares experience, location, language and salary expectation and explains the fit in 3 short bullets — so workers don't waste a day on the wrong job.",
    accent: "from-primary-soft to-trust-soft",
  },
  {
    icon: "📊",
    title: "Smart Job Summary",
    sub: "Highlights · Best for · Watch out",
    body: "AI auto-extracts the key facts of any job into chips and bullets — recruiters don't fill long forms, workers don't read essays.",
    accent: "from-warning-soft to-primary-soft",
  },
  {
    icon: "🌐",
    title: "Hyperlocal Multilingual",
    sub: "Hindi · English · Tamil",
    body: "Buttons, navigation, forms, errors, notifications — the entire app localises with one tap. Designed for budget Android phones on slow networks.",
    accent: "from-trust-soft to-primary-soft",
  },
];

function AIShowcase() {
  const nav = useNavigate();
  return (
    <AppShell>
      <div className="pb-10">
        <header className="rounded-b-3xl bg-gradient-to-br from-primary to-[oklch(0.55_0.22_280)] px-5 pb-10 pt-7 text-primary-foreground">
          <div className="flex items-center justify-between">
            <button onClick={() => history.back()} className="text-xl">←</button>
            <LangPills className="bg-white/15" />
          </div>
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/15 text-5xl backdrop-blur">
              ✨
            </div>
            <h1 className="mt-4 text-3xl font-extrabold">AI Powered Features</h1>
            <p className="mt-2 px-4 text-sm opacity-90">
              KaamSetu uses AI to remove the language and literacy barrier between India's
              informal workers and the people who want to hire them.
            </p>
          </div>
        </header>

        <div className="space-y-3 px-5 pt-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-3xl bg-gradient-to-br ${f.accent} p-5 shadow-soft`}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-2xl shadow-soft">
                  {f.icon}
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">{f.title}</div>
                  <div className="text-xs font-semibold text-primary">{f.sub}</div>
                  <p className="mt-2 text-sm text-foreground/80">{f.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 px-5">
          <button
            onClick={() => nav({ to: "/recruiter/post" })}
            className="w-full rounded-2xl bg-primary py-4 text-base font-extrabold text-primary-foreground shadow-pop"
          >
            ✨ Try AI Job Simplification
          </button>
          <button
            onClick={() => nav({ to: "/worker" })}
            className="w-full rounded-2xl bg-trust py-4 text-base font-extrabold text-trust-foreground shadow-soft"
          >
            💬 Try Explain This Job
          </button>
        </div>
      </div>
    </AppShell>
  );
}
