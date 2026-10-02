import { cn } from "@/lib/utils";

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
    <div className={cn("flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)]", className)}>
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
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="transition-colors duration-150 hover:border-[var(--accent)]/30">
      <CardContent className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-fg)]">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint ? <p className="text-xs text-[var(--muted-fg)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
