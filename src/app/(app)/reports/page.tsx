import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  endOfMonth,
  formatCurrency,
  fullName,
  labelize,
  startOfMonth,
  toNumber,
} from "@/lib/utils";

export const metadata = { title: "Αναφορές" };

export default async function ReportsPage() {
  const user = await requireUser();
  const owner = canAccessFinance(user);
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [
    employeesByDept,
    leaveCount,
    candidatesByStatus,
    revenueTotal,
    expenseTotal,
    paymentsTotal,
    projects,
  ] = await Promise.all([
    prisma.department.findMany({
      include: { _count: { select: { employees: { where: { status: { not: "ARCHIVED" } } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.leave.count({
      where: { startDate: { gte: from, lte: to } },
    }),
    prisma.candidate.groupBy({ by: ["status"], _count: true }),
    owner
      ? prisma.revenue.aggregate({
          where: { date: { gte: from, lte: to }, paymentStatus: { not: "CANCELLED" } },
          _sum: { amount: true },
        })
      : null,
    owner
      ? prisma.expense.aggregate({
          where: { date: { gte: from, lte: to } },
          _sum: { amount: true },
        })
      : null,
    owner
      ? prisma.payment.aggregate({
          where: { date: { gte: from, lte: to }, status: "PAID" },
          _sum: { amount: true },
        })
      : null,
    owner
      ? prisma.project.findMany({
          include: { revenues: true, expenses: true },
        })
      : [],
  ]);

  const employeeRows = await prisma.employee.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: { department: true, position: true },
    orderBy: { lastName: "asc" },
  });

  const leaveRows = await prisma.leave.findMany({
    include: { employee: true },
    orderBy: { startDate: "desc" },
    take: 200,
  });

  const candidateRows = await prisma.candidate.findMany({
    include: { position: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Αναφορές"
        description="Απλές λειτουργικές εξαγωγές — όχι BI."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard
          title="Υπάλληλοι ανά τμήμα"
          href={csvHref(
            "employees-by-dept",
            ["Τμήμα", "Πλήθος"],
            employeesByDept.map((d) => [d.name, String(d._count.employees)])
          )}
        />
        <ReportCard
          title="Κατάλογος υπαλλήλων"
          href={csvHref(
            "employees",
            ["Όνομα", "Email", "Θέση", "Τμήμα", "Κατάσταση"],
            employeeRows.map((e) => [
              fullName(e.firstName, e.lastName),
              e.email,
              e.position?.name || "",
              e.department?.name || "",
              e.status,
            ])
          )}
        />
        <ReportCard
          title="Αναφορά αδειών"
          hint={`${leaveCount} αυτόν τον μήνα`}
          href={csvHref(
            "leave",
            ["Υπάλληλος", "Τύπος", "Έναρξη", "Λήξη", "Κατάσταση"],
            leaveRows.map((l) => [
              fullName(l.employee.firstName, l.employee.lastName),
              l.type,
              l.startDate.toISOString().slice(0, 10),
              l.endDate.toISOString().slice(0, 10),
              l.status,
            ])
          )}
        />
        <ReportCard
          title="Αναφορά προσλήψεων"
          href={csvHref(
            "recruitment",
            ["Όνομα", "Email", "Θέση", "Κατάσταση"],
            candidateRows.map((c) => [
              c.name,
              c.email,
              c.position?.name || "",
              c.status,
            ])
          )}
        />
      </div>

      {owner && revenueTotal && expenseTotal ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent>
                <p className="text-xs text-[var(--muted-fg)]">Έσοδα αυτού του μήνα</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(toNumber(revenueTotal._sum.amount))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs text-[var(--muted-fg)]">Έξοδα αυτού του μήνα</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(toNumber(expenseTotal._sum.amount))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-xs text-[var(--muted-fg)]">Κόστος υπαλλήλων (πληρωμένο)</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(toNumber(paymentsTotal?._sum.amount))}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ReportCard
              title="Αναφορά εσόδων"
              href="/api/reports/revenue"
            />
            <ReportCard title="Αναφορά εξόδων" href="/api/reports/expenses" />
            <ReportCard
              title="Κερδοφορία έργων"
              href={csvHref(
                "project-profit",
                ["Έργο", "Έσοδα", "Έξοδα", "Καθαρό"],
                (Array.isArray(projects) ? projects : []).map((p) => {
                  const rev = p.revenues.reduce((s, r) => s + toNumber(r.amount), 0);
                  const exp = p.expenses.reduce((s, e) => s + toNumber(e.amount), 0);
                  return [p.name, String(rev), String(exp), String(rev - exp)];
                })
              )}
            />
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Αναφορές HR</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-fg)]">
            Οι οικονομικές αναφορές είναι διαθέσιμες μόνο στον Ιδιοκτήτη. Χρησιμοποιήστε τις εξαγωγές CSV υπαλλήλων, αδειών και προσλήψεων παραπάνω.
            <div className="mt-3 space-y-1">
              {candidatesByStatus.map((c) => (
                <p key={c.status}>
                  {labelize(c.status)}: {c._count}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReportCard({
  title,
  href,
  hint,
}: {
  title: string;
  href: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--accent)]/40"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-[var(--muted-fg)]">{hint || "Λήψη CSV"}</p>
    </Link>
  );
}

function csvHref(name: string, headers: string[], rows: string[][]) {
  const lines = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(lines)}`;
}
