import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { categoryMeta } from "@/lib/mock";

export const Route = createFileRoute("/worker/applications")({
  component: Applications,
});

const statusMeta: Record<string, { label: string; cls: string }> = {
  applied: { label: "Applied", cls: "bg-trust-soft text-trust" },
  shortlisted: { label: "Shortlisted", cls: "bg-primary-soft text-primary" },
  hired: { label: "Hired 🎉", cls: "bg-success-soft text-success" },
  rejected: { label: "Closed", cls: "bg-muted text-muted-foreground" },
};

function Applications() {
  const { applications, jobs } = useApp();
  return (
    <div className="p-5">
      <h1 className="text-2xl font-extrabold">📋 My Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">{applications.length} total</p>

      <div className="mt-5 space-y-3">
        {applications.length === 0 && (
          <div className="rounded-2xl bg-muted p-8 text-center">
            <div className="text-4xl">📭</div>
            <div className="mt-2 font-bold">No applications yet</div>
            <Link to="/worker" className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              Find jobs →
            </Link>
          </div>
        )}
        {applications.map((a) => {
          const job = jobs.find((j) => j.id === a.jobId);
          const cat = job ? categoryMeta[job.category] : null;
          const s = statusMeta[a.status];
          return (
            <Link
              key={a.id}
              to={job ? "/worker/jobs/$id" : "/worker"}
              params={job ? { id: job.id } : undefined as never}
              className="block rounded-2xl bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">
                  {cat?.icon ?? "💼"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{job?.title ?? "Job"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {job?.area} • Applied {new Date(a.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold ${s.cls}`}>
                  {s.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
