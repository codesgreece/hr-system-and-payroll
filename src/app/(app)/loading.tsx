export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-[var(--muted)]" />
        <div className="h-4 w-72 rounded-lg bg-[var(--muted)]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}
