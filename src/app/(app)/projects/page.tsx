import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate, fullName, labelize } from "@/lib/utils";
import { ProjectsClient } from "./projects-client";

export const metadata = { title: "Έργα" };

export default async function ProjectsPage() {
  await requireUser();
  const [projects, employees] = await Promise.all([
    prisma.project.findMany({
      include: {
        teamLeader: true,
        _count: { select: { members: true, tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
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
        title="Έργα"
        description="Παραδόσεις πελατών και εσωτερική εργασία."
        actions={<ProjectsClient mode="create" employees={employees} />}
      />

      {projects.length === 0 ? (
        <EmptyState title="Δεν υπάρχουν έργα ακόμα" />
      ) : (
        <>
          <div className="hidden md:block">
            <Table headers={["Έργο", "Πελάτης", "Κατάσταση", "Υπεύθυνος", "Προθεσμία", "Ομάδα", ""]}>
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--muted)]/40">
                  <Td>
                    <Link href={`/projects/${p.id}`} className="font-medium hover:text-[var(--accent)]">
                      {p.name}
                    </Link>
                  </Td>
                  <Td>{p.client || "—"}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(p.status)}>{labelize(p.status)}</Badge>
                  </Td>
                  <Td>
                    {p.teamLeader
                      ? fullName(p.teamLeader.firstName, p.teamLeader.lastName)
                      : "—"}
                  </Td>
                  <Td>{formatDate(p.deadline)}</Td>
                  <Td className="tabular-nums">{p._count.members}</Td>
                  <Td>
                    <Link href={`/projects/${p.id}`}>
                      <span className="text-xs text-[var(--accent)]">Προβολή</span>
                    </Link>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--muted-fg)]">{p.client || "Χωρίς πελάτη"}</p>
                  </div>
                  <Badge variant={statusBadgeVariant(p.status)}>{labelize(p.status)}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
