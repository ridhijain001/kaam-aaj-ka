import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { categoryMeta, workers } from "@/lib/mock";
import { LangPills } from "@/components/ks/lang-pills";

export const Route = createFileRoute("/recruiter/")({
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const { jobs, applications, name } = useApp();
  const { t } = useI18n();
  const active = jobs.length;
  const apps = applications.length || 12;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length || 3;
  const hired = applications.filter((a) => a.status === "hired").length || 1;

  return (
    <div className="pb-6">
      <header className="rounded-b-3xl bg-gradient-to-br from-primary to-[oklch(0.6_0.2_30)] px-5 pb-8 pt-7 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs opacity-90">{t("welcome")}</div>
            <h1 className="text-2xl font-extrabold">{name || "Recruiter"} 👋</h1>
            <p className="text-sm opacity-90">Apke kaarigar yahan hain</p>
          </div>
          <LangPills className="bg-white/15" />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          <Stat label="Active" value={active} />
          <Stat label="Applied" value={apps} />
          <Stat label="Shortlist" value={shortlisted} />
          <Stat label="Hired" value={hired} />
        </div>
      </header>

      <section className="px-5 pt-5">
        <Link
          to="/recruiter/post"
          className="block rounded-3xl bg-gradient-to-r from-primary to-[oklch(0.62_0.22_30)] p-5 text-primary-foreground shadow-pop"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl">➕</div>
            <div className="flex-1">
              <div className="text-lg font-extrabold">Post a new job</div>
              <div className="text-xs opacity-90">✨ AI will write it in Hindi, English, Tamil</div>
            </div>
            <span>→</span>
          </div>
        </Link>
      </section>

      <section className="px-5 pt-5">
        <h2 className="mb-2 text-base font-extrabold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard to="/recruiter/jobs" icon="📂" title="My Jobs" sub={`${active} active`} />
          <QuickCard to="/recruiter/chats" icon="💬" title="Chats" sub="2 new" />
          <QuickCard to="/ai" icon="✨" title="AI features" sub="See magic" />
          <QuickCard to="/" icon="🔁" title="Switch mode" sub="Worker view" />
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-2 text-base font-extrabold">Top nearby workers</h2>
        <div className="space-y-2">
          {workers.slice(0, 4).map((w) => {
            const m = categoryMeta[w.category];
            return (
              <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-2xl">
                  {w.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{w.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {m.en} • ⭐ {w.rating} • 📍 {w.distanceKm} km
                  </div>
                </div>
                {w.verified && (
                  <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold text-success">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-2 text-base font-extrabold">Recent activity</h2>
        <ul className="space-y-2 text-sm">
          {[
            { icon: "📩", text: "Sunita Devi applied to Maid — GK-2", time: "10m ago" },
            { icon: "✓", text: "AI simplified your job into 3 languages", time: "2h ago" },
            { icon: "📞", text: "Ramesh Kumar accepted interview", time: "Yesterday" },
            { icon: "⭐", text: "Mrs. Kapoor left a 5★ review", time: "2d ago" },
          ].map((a, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-surface p-3 shadow-soft">
              <span className="text-xl">{a.icon}</span>
              <span className="flex-1">{a.text}</span>
              <span className="text-[10px] text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 text-center">
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-[10px] uppercase opacity-85">{label}</div>
    </div>
  );
}

function QuickCard({
  to,
  icon,
  title,
  sub,
}: {
  to: string;
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <Link to={to} className="rounded-2xl bg-surface p-4 shadow-soft">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 font-extrabold">{title}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </Link>
  );
}
