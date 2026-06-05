import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/ks/app-shell";
import { BottomNav } from "@/components/ks/bottom-nav";

export const Route = createFileRoute("/recruiter")({
  component: RecruiterLayout,
});

function RecruiterLayout() {
  return (
    <AppShell>
      <div className="flex min-h-dvh flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <BottomNav role="recruiter" />
      </div>
    </AppShell>
  );
}
