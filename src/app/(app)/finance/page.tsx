import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireFinanceAccess } from "@/lib/auth";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  endOfMonth,
  endOfYear,
  formatCurrency,
  labelize,
  startOfMonth,
  startOfYear,
  toNumber,
} from "@/lib/utils";

export const metadata = { title: "Οικονομικά" };

export default async function FinanceOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requireFinanceAccess();
  const params = await searchParams;
  const now = new Date();

  let from: Date;
  let to: Date;
  const range = params.range || "this_month";

  if (range === "last_month") {
    from = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    to = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  } else if (range === "this_year") {
    from = startOfYear(now);
    to = endOfYear(now);
  } else if (range === "custom" && params.from && params.to) {
    from = new Date(params.from);
    to = new Date(params.to);
    to.setHours(23, 59, 59, 999);
  } else {
    from = startOfMonth(now);
    to = endOfMonth(now);
  }

  const [revenues, expenses, projects] = await Promise.all([
    prisma.revenue.findMany({
      where: { date: { gte: from, lte: to }, paymentStatus: { not: "CANCELLED" } },
      include: { project: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
      include: { project: true },
    }),
    prisma.project.findMany({ select: { id: true, name: true, client: true } }),
  ]);

  const revenueTotal = revenues.reduce((s, r) => s + toNumber(r.amount), 0);
  const expenseTotal = expenses.reduce((s, e) => s + toNumber(e.amount), 0);
  const net = revenueTotal - expenseTotal;

  const revByCat = groupSum(revenues.map((r) => ({ key: r.category, amount: toNumber(r.amount) })));
  const expByCat = groupSum(expenses.map((e) => ({ key: e.category, amount: toNumber(e.amount) })));

  const byProject = new Map<string, { name: string; revenue: number; expenses: number }>();
  for (const p of projects) {
    byProject.set(p.id, { name: p.name, revenue: 0, expenses: 0 });
  }
  for (const r of revenues) {
    if (r.projectId && byProject.has(r.projectId)) {
      byProject.get(r.projectId)!.revenue += toNumber(r.amount);
    } else {
      const key = r.projectLabel || r.client;
      const existing = byProject.get(`label:${key}`) || { name: key, revenue: 0, expenses: 0 };
      existing.revenue += toNumber(r.amount);
      byProject.set(`label:${key}`, existing);
    }
  }
  for (const e of expenses) {
    if (e.projectId && byProject.has(e.projectId)) {
      byProject.get(e.projectId)!.expenses += toNumber(e.amount);
    }
  }

  const projectRows = [...byProject.values()]
    .filter((p) => p.revenue > 0 || p.expenses > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const monthly = buildMonthly(revenues, expenses, from, to);
  const maxMonthly = Math.max(...monthly.map((m) => Math.max(m.revenue, m.expenses)), 1);

  const links = [
    { href: "/finance?range=this_month", label: "Τρέχων μήνας", key: "this_month" },
    { href: "/finance?range=last_month", label: "Προηγούμενος μήνας", key: "last_month" },
    { href: "/finance?range=this_year", label: "Τρέχον έτος", key: "this_year" },
  ];

  return (
    <div>
      <PageHeader
        title="Επισκόπηση οικονομικών"
        description="Έσοδα, έξοδα και κέρδος με μια ματιά."
        actions={
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  range === l.key
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border border-[var(--border)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/finance/revenue"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
            >
              Έσοδα
            </Link>
            <Link
              href="/finance/expenses"
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium"
            >
              Έξοδα
            </Link>
          </div>
        }
      />

      <form className="mb-6 flex flex-wrap items-end gap-2">
        <input type="hidden" name="range" value="custom" />
        <div>
          <label className="mb-1 block text-xs text-[var(--muted-fg)]">Από</label>
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--muted-fg)]">Έως</label>
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--muted)]"
        >
          Προσαρμοσμένο διάστημα
        </button>
      </form>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Έσοδα" value={formatCurrency(revenueTotal)} />
        <StatCard label="Έξοδα" value={formatCurrency(expenseTotal)} />
        <StatCard label="Καθαρό αποτέλεσμα" value={formatCurrency(net)} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <CategoryBars title="Έσοδα ανά κατηγορία" rows={revByCat} />
        <CategoryBars title="Έξοδα ανά κατηγορία" rows={expByCat} />
      </div>

      <SectionLabel>Μηνιαία έσοδα vs έξοδα</SectionLabel>
      <Card className="mb-8">
        <CardContent className="space-y-3">
          {monthly.map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--muted-fg)]">
                <span>{m.label}</span>
                <span>
                  {formatCurrency(m.revenue)} / {formatCurrency(m.expenses)}
                </span>
              </div>
              <div className="flex h-2 gap-1">
                <div
                  className="rounded-full bg-[var(--accent)]"
                  style={{ width: `${(m.revenue / maxMonthly) * 100}%` }}
                />
                <div
                  className="rounded-full bg-[var(--muted-fg)]/30"
                  style={{ width: `${(m.expenses / maxMonthly) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <SectionLabel>Κέρδος ανά ιστοσελίδα / έργο</SectionLabel>
      <Card>
        <CardContent className="space-y-3">
          {projectRows.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν ακόμα οικονομικά συνδεδεμένα με έργα</p>
          ) : (
            projectRows.map((p) => (
              <div
                key={p.name}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <p className="font-medium">{p.name}</p>
                <div className="flex gap-4 text-sm tabular-nums">
                  <span className="text-[var(--muted-fg)]">
                    Έσ. {formatCurrency(p.revenue)}
                  </span>
                  <span className="text-[var(--muted-fg)]">
                    Έξ. {formatCurrency(p.expenses)}
                  </span>
                  <span className="font-semibold">
                    Καθ. {formatCurrency(p.revenue - p.expenses)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryBars({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; amount: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν δεδομένα</p>
        ) : (
          rows.map((r) => (
            <div key={r.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{labelize(r.key)}</span>
                <span className="tabular-nums">{formatCurrency(r.amount)}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(r.amount / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function groupSum(items: { key: string; amount: number }[]) {
  const map = new Map<string, number>();
  for (const i of items) map.set(i.key, (map.get(i.key) || 0) + i.amount);
  return [...map.entries()]
    .map(([key, amount]) => ({ key, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function buildMonthly(
  revenues: { date: Date; amount: unknown }[],
  expenses: { date: Date; amount: unknown }[],
  from: Date,
  to: Date
) {
  const months: { label: string; key: string; revenue: number; expenses: number }[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(to.getFullYear(), to.getMonth(), 1);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    months.push({
      key,
      label: cursor.toLocaleString("el", { month: "short", year: "2-digit" }),
      revenue: 0,
      expenses: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const index = Object.fromEntries(months.map((m, i) => [m.key, i]));
  for (const r of revenues) {
    const k = `${r.date.getFullYear()}-${r.date.getMonth()}`;
    if (k in index) months[index[k]].revenue += toNumber(r.amount);
  }
  for (const e of expenses) {
    const k = `${e.date.getFullYear()}-${e.date.getMonth()}`;
    if (k in index) months[index[k]].expenses += toNumber(e.amount);
  }
  return months;
}
