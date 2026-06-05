import { Link, useLocation } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import type { Role } from "@/lib/types";

const workerNav = [
  { to: "/worker", icon: "🏠", key: "home" as const },
  { to: "/worker/applications", icon: "📋", key: "apps" as const },
  { to: "/worker/chats", icon: "💬", key: "chat" as const },
  { to: "/worker/profile", icon: "👤", key: "profile" as const },
];

const recruiterNav = [
  { to: "/recruiter", icon: "🏠", key: "home" as const },
  { to: "/recruiter/post", icon: "➕", key: "post" as const },
  { to: "/recruiter/jobs", icon: "📂", key: "manage" as const },
  { to: "/recruiter/chats", icon: "💬", key: "chat" as const },
];

export function BottomNav({ role }: { role: Role }) {
  const { t } = useI18n();
  const items = role === "worker" ? workerNav : recruiterNav;
  const loc = useLocation();
  return (
    <nav className="safe-bottom sticky bottom-0 z-30 mt-auto border-t border-border bg-surface/95 backdrop-blur">
      <ul className="grid grid-cols-4 px-1">
        {items.map((it) => {
          const active =
            it.to === `/${role}` ? loc.pathname === it.to : loc.pathname.startsWith(it.to);
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="text-xl leading-none">{it.icon}</span>
                <span>{t(it.key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
