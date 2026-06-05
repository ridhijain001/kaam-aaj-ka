import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KaamSetu — Trusted work, simple language" },
      { name: "description", content: "AI-powered multilingual hiring for India's informal workforce." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { onboarded, role } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!onboarded || !role) navigate({ to: "/onboarding" });
      else navigate({ to: role === "worker" ? "/worker" : "/recruiter" });
    }, 600);
    return () => clearTimeout(t);
  }, [onboarded, role, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary-soft via-background to-trust-soft">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-primary text-5xl text-primary-foreground shadow-pop animate-in zoom-in duration-500">
          🤝
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">KaamSetu</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Trusted work in simple language • भरोसेमंद काम आसान भाषा में
        </p>
      </div>
    </div>
  );
}
