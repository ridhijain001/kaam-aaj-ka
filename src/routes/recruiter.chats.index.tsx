import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/recruiter/chats/")({
  component: RChatsList,
});

function RChatsList() {
  const { chats } = useApp();
  return (
    <div className="p-5">
      <h1 className="text-2xl font-extrabold">💬 Worker Chats</h1>
      <div className="mt-4 space-y-2">
        {chats.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return (
            <Link
              key={c.id}
              to="/recruiter/chats/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-2xl">
                {c.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-bold">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{last?.at}</div>
                </div>
                <div className="truncate text-xs text-muted-foreground">{last?.text}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
