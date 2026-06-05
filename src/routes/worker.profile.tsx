import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useI18n, langLabel } from "@/lib/i18n";
import { LangPills } from "@/components/ks/lang-pills";

export const Route = createFileRoute("/worker/profile")({
  component: Profile,
});

function Profile() {
  const { name, setName, city, role, reset } = useApp();
  const { lang } = useI18n();
  return (
    <div className="p-5">
      <header className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary-soft text-5xl">
          👤
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{name || "Worker"}</h1>
        <p className="text-sm text-muted-foreground">📍 {city}</p>
        <div className="mt-2 inline-flex rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
          ✓ Verified profile
        </div>
      </header>

      <section className="mt-6 rounded-3xl bg-surface p-4 shadow-soft">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl bg-muted px-3 py-2 font-semibold outline-none"
        />
      </section>

      <section className="mt-3 rounded-3xl bg-surface p-4 shadow-soft">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Preferred language ({langLabel[lang]})
        </div>
        <LangPills />
      </section>

      <section className="mt-3 rounded-3xl bg-surface p-4 shadow-soft">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mode</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-bold capitalize">{role}</span>
          <Link to="/" className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            Switch mode
          </Link>
        </div>
      </section>

      <Link
        to="/ai"
        className="mt-3 block rounded-3xl bg-gradient-to-r from-primary-soft to-trust-soft p-4 shadow-soft"
      >
        <div className="text-sm font-extrabold">✨ See AI features</div>
        <div className="text-xs text-muted-foreground">How KaamSetu helps you understand jobs</div>
      </Link>

      <button
        onClick={reset}
        className="mt-6 w-full rounded-2xl border-2 border-destructive/30 py-3 text-sm font-bold text-destructive"
      >
        Reset demo data
      </button>
    </div>
  );
}
