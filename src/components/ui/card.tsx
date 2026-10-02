import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn("text-sm font-semibold tracking-tight", className)}>{children}</h3>;
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative" | "accent";
}) {
  return (
    <Card className="transition-colors duration-150 hover:border-[var(--accent)]/25">
      <CardContent className="space-y-3 !p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted-fg)]">
            {label}
          </p>
          {Icon ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-fg)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          ) : null}
        </div>
        <div>
          <p
            className={cn(
              "text-2xl font-semibold tracking-tight tabular-nums",
              tone === "positive" && "text-emerald-600 dark:text-emerald-400",
              tone === "negative" && "text-rose-600 dark:text-rose-400",
              tone === "accent" && "text-[var(--accent)]"
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-[var(--muted-fg)]">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
