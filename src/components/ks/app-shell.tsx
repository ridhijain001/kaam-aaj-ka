import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/40">
      <main className="app-shell flex flex-col shadow-[0_0_60px_-20px_rgba(0,0,0,0.15)]">
        {children}
      </main>
    </div>
  );
}
