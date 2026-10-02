import Link from "next/link";
import {
  Users,
  UserCheck,
  Palmtree,
  UserPlus,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Scale,
  ArrowRight,
  Plus,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/page";
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const metadata = { title: "Dashboard" };

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-fg)]">
        {title}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:opacity-80"
      >
        {linkLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

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
          where: {
            date: { gte: monthStart, lte: monthEnd },
            paymentStatus: { not: "CANCELLED" },
          },
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
  const isEmpty =
    totalEmployees === 0 &&
    activeProjects === 0 &&
    openTasks === 0 &&
    completedTasks === 0 &&
    (!owner || (revenue === 0 && expenses === 0));

  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/employees">
              <Button size="sm" variant="secondary">
                <Plus className="h-3.5 w-3.5" />
                Employee
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="sm" variant="secondary">
                <Plus className="h-3.5 w-3.5" />
                Project
              </Button>
            </Link>
            {owner ? (
              <Link href="/finance/revenue">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Revenue
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      {isEmpty ? (
        <Card className="mb-6 border-[var(--accent)]/20 bg-[var(--accent-muted)]/40">
          <CardContent className="flex flex-col gap-4 !py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Start with people & projects
              </p>
              <p className="mt-1 text-sm text-[var(--muted-fg)]">
                Your Control Center is ready. Add the first records to see live
                overview numbers here.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/employees">
                <Button size="sm">Add employee</Button>
              </Link>
              <Link href="/projects">
                <Button size="sm" variant="outline">
                  Add project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="mb-7">
        <SectionHeader title="People" href="/employees" linkLabel="View employees" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Employees" value={totalEmployees} icon={Users} />
          <StatCard label="Active" value={activeEmployees} icon={UserCheck} />
          <StatCard label="On Leave" value={onLeave} icon={Palmtree} />
          <StatCard label="New (30 days)" value={newEmployees} icon={UserPlus} />
        </div>
      </section>

      <section className="mb-7">
        <SectionHeader title="Work" href="/tasks" linkLabel="View tasks" />
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Active Projects" value={activeProjects} icon={FolderKanban} />
          <StatCard label="Open Tasks" value={openTasks} icon={ListTodo} />
          <StatCard label="Completed Tasks" value={completedTasks} icon={CheckCircle2} />
        </div>
      </section>

      {owner ? (
        <section className="mb-7">
          <SectionHeader title="Finance · This Month" href="/finance" linkLabel="Open finance" />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Revenue" value={formatCurrency(revenue)} icon={TrendingUp} />
            <StatCard label="Expenses" value={formatCurrency(expenses)} icon={Receipt} />
            <StatCard
              label="Net Result"
              value={formatCurrency(net)}
              icon={Scale}
              tone={net > 0 ? "positive" : net < 0 ? "negative" : "default"}
              hint={net > 0 ? "Positive" : net < 0 ? "Negative" : "Break even"}
            />
          </div>
        </section>
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
              <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center">
                <p className="text-sm font-medium">No activity yet</p>
                <p className="mt-1 text-xs text-[var(--muted-fg)]">
                  Actions across Nexus will appear here.
                </p>
              </div>
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
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted-fg)]">
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
                      <Badge variant={statusBadgeVariant(t.priority)}>
                        {labelize(t.priority)}
                      </Badge>
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
