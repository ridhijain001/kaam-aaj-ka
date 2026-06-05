import { Link } from "@tanstack/react-router";
import type { Job } from "@/lib/types";
import { categoryMeta } from "@/lib/mock";
import { useI18n } from "@/lib/i18n";

function salaryText(j: Job) {
  const unit = j.salaryType === "monthly" ? "/माह" : j.salaryType === "daily" ? "/दिन" : "/घंटा";
  return `₹${j.salaryMin.toLocaleString()} – ₹${j.salaryMax.toLocaleString()}${unit}`;
}

export function JobCard({ job }: { job: Job }) {
  const { lang } = useI18n();
  const cat = categoryMeta[job.category];
  const title = cat[lang] ?? cat.en;
  return (
    <Link
      to="/worker/jobs/$id"
      params={{ id: job.id }}
      className="block rounded-2xl bg-surface p-4 shadow-soft transition hover:shadow-pop active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
          {cat.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-foreground">{title}</div>
              <div className="truncate text-xs text-muted-foreground">
                📍 {job.area} • {job.distanceKm} km
              </div>
            </div>
            {job.verified && (
              <span className="shrink-0 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-extrabold text-success">{salaryText(job)}</span>
            <span className="text-[11px] text-muted-foreground">
              {job.shift} • {job.experience}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
