import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { workers, categoryMeta } from "@/lib/mock";
import type { Application } from "@/lib/types";

export const Route = createFileRoute("/recruiter/applicants/$jobId")({
  component: Applicants,
});

function Applicants() {
  const { jobId } = useParams({ from: "/recruiter/applicants/$jobId" });
  const { jobs, applications, setApplicationStatus } = useApp();
  const nav = useNavigate();
  const job = jobs.find((j) => j.id === jobId);

  // Combine real applications + mock candidates for demo
  const realApps = applications.filter((a) => a.jobId === jobId);
  const mockCandidates = workers.filter((w) => !job || w.category === job.category).slice(0, 4);

  return (
    <div className="p-5 pb-10">
      <button onClick={() => nav({ to: "/recruiter/jobs" })} className="text-sm font-bold text-muted-foreground">
        ← Back
      </button>
      <h1 className="mt-2 text-2xl font-extrabold">Applicants</h1>
      <p className="text-sm text-muted-foreground">{job?.title}</p>

      <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Applied to your job ({realApps.length})
      </h2>
      <div className="mt-2 space-y-3">
        {realApps.length === 0 && (
          <div className="rounded-2xl bg-muted p-5 text-center text-sm text-muted-foreground">
            No direct applications yet — top matches below 👇
          </div>
        )}
        {realApps.map((a) => (
          <ApplicantCard
            key={a.id}
            name={a.workerName}
            phone={a.workerPhone}
            emoji="👤"
            sub={`${a.experience} • applied ${new Date(a.appliedAt).toLocaleDateString()}`}
            rating={4.5}
            verified
            status={a.status}
            onShortlist={() => setApplicationStatus(a.id, "shortlisted")}
            onHire={() => setApplicationStatus(a.id, "hired")}
            onReject={() => setApplicationStatus(a.id, "rejected")}
          />
        ))}
      </div>

      <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        ✨ AI suggested matches nearby
      </h2>
      <div className="mt-2 space-y-3">
        {mockCandidates.map((w) => (
          <ApplicantCard
            key={w.id}
            name={w.name}
            phone={w.phone}
            emoji={w.emoji}
            sub={`${categoryMeta[w.category].en} • ${w.experience} • 📍 ${w.distanceKm} km`}
            rating={w.rating}
            verified={w.verified}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicantCard({
  name,
  phone,
  emoji,
  sub,
  rating,
  verified,
  status,
  onShortlist,
  onHire,
  onReject,
}: {
  name: string;
  phone: string;
  emoji: string;
  sub: string;
  rating: number;
  verified: boolean;
  status?: Application["status"];
  onShortlist?: () => void;
  onHire?: () => void;
  onReject?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-2xl">
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="font-bold">{name}</div>
            {status && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                {status}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{sub}</div>
          <div className="mt-1 text-xs">⭐ {rating} {verified && "• ✓ Verified"}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <a href={`tel:${phone}`} className="rounded-xl bg-success-soft py-2 text-center text-xs font-bold text-success">📞</a>
        <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" className="rounded-xl bg-success py-2 text-center text-xs font-bold text-success-foreground">💬 Wa</a>
        <button onClick={onShortlist} className="rounded-xl bg-trust-soft py-2 text-xs font-bold text-trust">⭐ Shortlist</button>
        <button onClick={onHire} className="rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground">✓ Hire</button>
      </div>
      {onReject && (
        <button onClick={onReject} className="mt-2 w-full text-center text-[11px] font-semibold text-muted-foreground">
          Reject application
        </button>
      )}
    </div>
  );
}
