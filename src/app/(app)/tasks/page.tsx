import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate, fullName, labelize } from "@/lib/utils";
import { TasksClient } from "./tasks-client";
import Link from "next/link";

export const metadata = { title: "Tasks" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const mine = params.mine === "1";

  const [tasks, projects, employees] = await Promise.all([
    prisma.task.findMany({
      where: mine && user.employeeId ? { assigneeId: user.employeeId } : undefined,
      include: { project: true, assignee: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.project.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={mine ? "My Tasks" : "Tasks"}
        description="Keep delivery simple and visible."
        actions={
          <div className="flex gap-2">
            <Link
              href={mine ? "/tasks" : "/tasks?mine=1"}
              className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              {mine ? "All tasks" : "My tasks"}
            </Link>
            <TasksClient mode="create" projects={projects} employees={employees} />
          </div>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState title="No tasks" />
      ) : (
        <Table headers={["Title", "Project", "Assignee", "Priority", "Status", "Due", "Actions"]}>
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{t.title}</Td>
              <Td>
                {t.project ? (
                  <Link href={`/projects/${t.project.id}`} className="hover:text-[var(--accent)]">
                    {t.project.name}
                  </Link>
                ) : (
                  "—"
                )}
              </Td>
              <Td>
                {t.assignee ? fullName(t.assignee.firstName, t.assignee.lastName) : "—"}
              </Td>
              <Td>
                <Badge variant={statusBadgeVariant(t.priority)}>{labelize(t.priority)}</Badge>
              </Td>
              <Td>
                <Badge variant={statusBadgeVariant(t.status)}>{labelize(t.status)}</Badge>
              </Td>
              <Td>{formatDate(t.dueDate)}</Td>
              <Td>
                <TasksClient mode="edit" task={t} projects={projects} employees={employees} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
