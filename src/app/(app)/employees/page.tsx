import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, fullName, labelize } from "@/lib/utils";
import { EmployeesClient } from "./employees-client";

export const metadata = { title: "Employees" };

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const q = params.q?.trim();

  const employees = await prisma.employee.findMany({
    where: {
      ...(params.status ? { status: params.status as "ACTIVE" } : { status: { not: "ARCHIVED" } }),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { position: true, department: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const [positions, departments, leaders] = await Promise.all([
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="People records for Nexus — not system users."
        actions={
          <EmployeesClient
            mode="create"
            positions={positions}
            departments={departments}
            leaders={leaders}
          />
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search employees…"
          className="h-9 flex-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          name="status"
          defaultValue={params.status || ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
        >
          <option value="">Active & on leave</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On leave</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
      </form>

      {employees.length === 0 ? (
        <EmptyState title="No employees found" description="Add your first team member." />
      ) : (
        <>
          <div className="hidden md:block">
            <Table headers={["Name", "Position", "Department", "Status", "Start Date", "Actions"]}>
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                  <Td>
                    <Link
                      href={`/employees/${e.id}`}
                      className="font-medium hover:text-[var(--accent)]"
                    >
                      {fullName(e.firstName, e.lastName)}
                    </Link>
                    <p className="text-xs text-[var(--muted-fg)]">{e.email}</p>
                  </Td>
                  <Td>{e.position?.name || "—"}</Td>
                  <Td>{e.department?.name || "—"}</Td>
                  <Td>
                    <Badge variant={statusBadgeVariant(e.status)}>{labelize(e.status)}</Badge>
                  </Td>
                  <Td>{formatDate(e.startDate)}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Link href={`/employees/${e.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <EmployeesClient
                        mode="edit"
                        employee={e}
                        positions={positions}
                        departments={departments}
                        leaders={leaders}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {employees.map((e) => (
              <Link
                key={e.id}
                href={`/employees/${e.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--accent)]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{fullName(e.firstName, e.lastName)}</p>
                    <p className="text-xs text-[var(--muted-fg)]">
                      {e.position?.name || "No position"} · {e.department?.name || "No dept"}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(e.status)}>{labelize(e.status)}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
