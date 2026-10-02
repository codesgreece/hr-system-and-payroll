import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { PageHeader, Table, Td } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate, fullName, labelize, toNumber } from "@/lib/utils";
import { ProjectsClient } from "../projects-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const owner = canAccessFinance(user);

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      teamLeader: true,
      members: { include: { employee: true } },
      tasks: { include: { assignee: true }, orderBy: { updatedAt: "desc" } },
      revenues: owner ? { orderBy: { date: "desc" } } : false,
      expenses: owner ? { orderBy: { date: "desc" } } : false,
    },
  });

  if (!project) notFound();

  const employees = await prisma.employee.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  const revenueTotal = Array.isArray(project.revenues)
    ? project.revenues.reduce((s, r) => s + toNumber(r.amount), 0)
    : 0;
  const expenseTotal = Array.isArray(project.expenses)
    ? project.expenses.reduce((s, e) => s + toNumber(e.amount), 0)
    : 0;

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.client || "No client"}
        actions={
          <ProjectsClient
            mode="edit"
            project={{
              ...project,
              memberIds: project.members.map((m) => m.employeeId),
            }}
            employees={employees}
          />
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant={statusBadgeVariant(project.status)}>{labelize(project.status)}</Badge>
        {project.deadline ? (
          <span className="text-xs text-[var(--muted-fg)]">
            Deadline {formatDate(project.deadline)}
          </span>
        ) : null}
      </div>

      {project.description ? (
        <p className="mb-6 max-w-2xl text-sm text-[var(--muted-fg)]">{project.description}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {project.teamLeader ? (
              <p>
                <span className="text-[var(--muted-fg)]">Lead · </span>
                {fullName(project.teamLeader.firstName, project.teamLeader.lastName)}
              </p>
            ) : null}
            {project.members.map((m) => (
              <Link
                key={m.id}
                href={`/employees/${m.employee.id}`}
                className="block hover:text-[var(--accent)]"
              >
                {fullName(m.employee.firstName, m.employee.lastName)}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <Link href="/tasks" className="text-xs text-[var(--accent)]">
              All tasks
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.tasks.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">No tasks</p>
            ) : (
              project.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{t.title}</span>
                  <div className="flex items-center gap-2">
                    {t.assignee ? (
                      <span className="hidden text-xs text-[var(--muted-fg)] sm:inline">
                        {t.assignee.firstName}
                      </span>
                    ) : null}
                    <Badge variant={statusBadgeVariant(t.status)}>{labelize(t.status)}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {owner ? (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profitability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[var(--muted-fg)]">Revenue</p>
                  <p className="text-xl font-semibold tabular-nums">{formatCurrency(revenueTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-fg)]">Expenses</p>
                  <p className="text-xl font-semibold tabular-nums">{formatCurrency(expenseTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-fg)]">Net</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {formatCurrency(revenueTotal - expenseTotal)}
                  </p>
                </div>
              </div>
              {Array.isArray(project.revenues) && project.revenues.length > 0 ? (
                <Table headers={["Date", "Client", "Amount", "Status"]}>
                  {project.revenues.map((r) => (
                    <tr key={r.id}>
                      <Td>{formatDate(r.date)}</Td>
                      <Td>{r.client}</Td>
                      <Td className="tabular-nums">{formatCurrency(toNumber(r.amount))}</Td>
                      <Td>
                        <Badge variant={statusBadgeVariant(r.paymentStatus)}>
                          {labelize(r.paymentStatus)}
                        </Badge>
                      </Td>
                    </tr>
                  ))}
                </Table>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
