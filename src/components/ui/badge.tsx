import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted" | "purple";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--accent-muted)] text-[var(--accent)]",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  muted: "bg-[var(--muted)] text-[var(--muted-fg)]",
  purple: "bg-[var(--accent-muted)] text-[var(--accent)]",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeVariant {
  const s = status.toUpperCase();
  if (["ACTIVE", "PAID", "APPROVED", "COMPLETED", "HIRED"].includes(s)) return "success";
  if (["PENDING", "PLANNED", "SCREENING", "INTERVIEW", "OFFER", "REVIEW", "TODO"].includes(s))
    return "warning";
  if (["CANCELLED", "REJECTED", "ARCHIVED", "OVERDUE"].includes(s)) return "danger";
  if (["ON_LEAVE", "IN_PROGRESS", "NEW"].includes(s)) return "info";
  if (["URGENT", "HIGH"].includes(s)) return "danger";
  return "muted";
}
