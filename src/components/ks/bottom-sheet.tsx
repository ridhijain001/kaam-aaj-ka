import { useEffect, useRef, type ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-in fade-in"
      />
      <div
        ref={ref}
        className="relative mx-auto w-full max-w-[460px] rounded-t-3xl bg-surface shadow-2xl animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-12 rounded-full bg-muted" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pt-3">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground hover:bg-muted/80"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[80dvh] overflow-y-auto px-5 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}
