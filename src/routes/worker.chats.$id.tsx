import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/worker/chats/$id")({
  component: ChatThreadView,
});

function ChatThreadView() {
  const { id } = useParams({ from: "/worker/chats/$id" });
  const { chats, appendMessage } = useApp();
  const nav = useNavigate();
  const chat = chats.find((c) => c.id === id);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat?.messages.length]);

  if (!chat) {
    return <div className="p-8 text-center text-sm">Chat not found</div>;
  }

  const send = () => {
    if (!text.trim()) return;
    appendMessage(chat.id, text.trim());
    setText("");
    // mock reply
    setTimeout(() => appendMessage(chat.id, "ठीक है, धन्यवाद! 🙏", "them"), 900);
  };

  return (
    <div className="flex h-[calc(100dvh-72px)] flex-col bg-[oklch(0.96_0.02_85)]">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 shadow-soft">
        <button onClick={() => nav({ to: "/worker/chats" })} className="text-xl">←</button>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-xl">
          {chat.emoji}
        </div>
        <div>
          <div className="font-bold">{chat.name}</div>
          <div className="text-[11px] text-muted-foreground">{chat.role}</div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {chat.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-soft ${
              m.from === "me"
                ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                : "mr-auto rounded-bl-sm bg-surface text-foreground"
            }`}
          >
            {m.text}
            <div className={`mt-0.5 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.at}</div>
          </div>
        ))}
      </div>

      <div className="safe-bottom flex items-center gap-2 border-t border-border bg-surface p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-full bg-muted px-4 py-3 text-sm outline-none"
        />
        <button onClick={send} className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg text-primary-foreground">
          ➤
        </button>
      </div>
    </div>
  );
}
