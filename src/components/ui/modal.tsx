"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl sm:rounded-2xl animate-in slide-in",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

type ToastItem = { id: number; message: string; type: "success" | "error" | "info" };

let toastId = 0;
const listeners = new Set<(t: ToastItem) => void>();

export function toast(message: string, type: ToastItem["type"] = "success") {
  const item = { id: ++toastId, message, type };
  listeners.forEach((l) => l(item));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((item: ToastItem) => {
    setItems((prev) => [...prev, item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== item.id));
    }, 3200);
  }, []);

  useEffect(() => {
    listeners.add(push);
    return () => {
      listeners.delete(push);
    };
  }, [push]);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg border px-4 py-2.5 text-sm shadow-lg animate-in slide-in",
              t.type === "success" &&
                "border-emerald-500/20 bg-[var(--card)] text-emerald-600 dark:text-emerald-400",
              t.type === "error" &&
                "border-rose-500/20 bg-[var(--card)] text-rose-600 dark:text-rose-400",
              t.type === "info" &&
                "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
