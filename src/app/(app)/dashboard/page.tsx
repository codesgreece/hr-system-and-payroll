import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDate,
  relativeTime,
  startOfMonth,
  endOfMonth,
  toNumber,
  fullName,
  labelize,
} from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const owner = canAccessFinance(user);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);

  const [
    totalEmployees,
    activeEmployees,
    onLeave,
    newEmployees,
    activeProjects,
    openTasks,
    completedTasks,
    recentAudit,
    upcomingLeave,
    upcomingTasks,
    upcomingRecurring,
    revenueAgg,
    expenseAgg,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "ON_LEAVE" } }),
    prisma.employee.count({
      where: { startDate: { gte: thirtyDaysAgo }, status: { not: "ARCHIVED" } },
    }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.task.count({ where: { status: { not: "COMPLETED" } } }),
    prisma.task.count({ where: { status: "COMPLETED" } }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.leave.findMany({
      where: {
        startDate: { gte: now, lte: soon },
        status: { in: ["PLANNED", "APPROVED"] },
      },
      take: 5,
      orderBy: { startDate: "asc" },
      include: { employee: true },
    }),
    prisma.task.findMany({
      where: {
        dueDate: { gte: now, lte: soon },
        status: { not: "COMPLETED" },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { project: true },
    }),
    owner
      ? prisma.recurringExpense.findMany({
          where: { active: true, nextPaymentDate: { lte: soon } },
          take: 5,
          orderBy: { nextPaymentDate: "asc" },
        })
      : Promise.resolve([]),
    owner
      ? prisma.revenue.aggregate({
          where: { date: { gte: monthStart, lte: monthEnd }, paymentStatus: { not: "CANCELLED" } },
          _sum: { amount: true },
        })
      : Promise.resolve(null),
    owner
      ? prisma.expense.aggregate({
          where: { date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        })
      : Promise.resolve(null),
  ]);

  const revenue = revenueAgg ? toNumber(revenueAgg._sum.amount) : 0;
  const expenses = expenseAgg ? toNumber(expenseAgg._sum.amount) : 0;
  const net = revenue - expenses;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name.split(" ")[0]}.`}
      />

      <SectionLabel>People</SectionLabel>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Active" value={activeEmployees} />
        <StatCard label="On Leave" value={onLeave} />
        <StatCard label="New (30 days)" value={newEmployees} />
      </div>

      <SectionLabel>Work</SectionLabel>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Active Projects" value={activeProjects} />
        <StatCard label="Open Tasks" value={openTasks} />
        <StatCard label="Completed Tasks" value={completedTasks} />
      </div>

      {owner ? (
        <>
          <SectionLabel>Finance · This Month</SectionLabel>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <StatCard label="Revenue" value={formatCurrency(revenue)} />
            <StatCard label="Expenses" value={formatCurrency(expenses)} />
            <StatCard
              label="Net Result"
              value={formatCurrency(net)}
              hint={net >= 0 ? "Positive" : "Negative"}
            />
          </div>
        </>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            {owner ? (
              <Link href="/audit" className="text-xs text-[var(--accent)] hover:underline">
                View all
              </Link>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3 !pt-0">
            {recentAudit.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted-fg)]">No activity yet</p>
            ) : (
              recentAudit.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{log.user?.name || "System"}</span>{" "}
                      <span className="text-[var(--muted-fg)]">{log.action}</span>{" "}
                      <span className="font-medium">{log.entity.toLowerCase()}</span>
                    </p>
                    {log.details ? (
                      <p className="mt-0.5 text-xs text-[var(--muted-fg)] line-clamp-1">
                        {log.details}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-[var(--muted-fg)]">
                    {relativeTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 !pt-0">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-fg)]">
                Leave
              </p>
              {upcomingLeave.length === 0 ? (
                <p className="text-sm text-[var(--muted-fg)]">Nothing scheduled</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingLeave.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-sm">
                      <span>
                        {fullName(l.employee.firstName, l.employee.lastName)}
                        <span className="text-[var(--muted-fg)]"> · {labelize(l.type)}</span>
                      </span>
                      <span className="text-xs text-[var(--muted-fg)]">
                        {formatDate(l.startDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-fg)]">
                Deadlines
              </p>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-[var(--muted-fg)]">No upcoming deadlines</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">
                        {t.title}
                        {t.project ? (
                          <span className="text-[var(--muted-fg)]"> · {t.project.name}</span>
                        ) : null}
                      </span>
                      <Badge variant={statusBadgeVariant(t.priority)}>{labelize(t.priority)}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {owner ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-fg)]">
                  Recurring Expenses
                </p>
                {upcomingRecurring.length === 0 ? (
                  <p className="text-sm text-[var(--muted-fg)]">None due soon</p>
                ) : (
                  <ul className="space-y-2">
                    {upcomingRecurring.map((r) => (
                      <li key={r.id} className="flex items-center justify-between text-sm">
                        <span>
                          {r.provider}
                          <span className="text-[var(--muted-fg)]">
                            {" "}
                            · {formatCurrency(toNumber(r.amount))}
                          </span>
                        </span>
                        <span className="text-xs text-[var(--muted-fg)]">
                          {formatDate(r.nextPaymentDate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
