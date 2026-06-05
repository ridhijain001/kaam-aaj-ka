import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { categoryMeta } from "@/lib/mock";

export const Route = createFileRoute("/recruiter/jobs")({
  component: RJobs,
});

function RJobs() {
  const { jobs, applications } = useApp();
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">📂 My Jobs</h1>
        <Link to="/recruiter/post" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          + New
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {jobs.map((j) => {
          const cat = categoryMeta[j.category];
          const apps = applications.filter((a) => a.jobId === j.id).length;
          return (
            <Link
              key={j.id}
              to="/recruiter/applicants/$jobId"
              params={{ jobId: j.id }}
              className="block rounded-2xl bg-surface p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-2xl">
                  {cat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{j.title}</div>
                  <div className="text-xs text-muted-foreground">
                    📍 {j.area} • ₹{j.salaryMin.toLocaleString()}–{j.salaryMax.toLocaleString()}
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                      Active
                    </span>
                    <span className="rounded-full bg-trust-soft px-2 py-0.5 text-[10px] font-bold text-trust">
                      {apps || Math.floor(Math.random() * 8) + 2} applicants
                    </span>
                    {j.simplified && (
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                        ✨ AI Hi/En/Ta
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
