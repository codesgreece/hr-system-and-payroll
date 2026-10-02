import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { fullName } from "@/lib/utils";
import { DepartmentsClient } from "./departments-client";

export const metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  await requireUser();
  const departments = await prisma.department.findMany({
    include: {
      lead: true,
      _count: { select: { employees: { where: { status: { not: "ARCHIVED" } } } } },
    },
    orderBy: { name: "asc" },
  });
  const employees = await prisma.employee.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize people by team structure."
        actions={<DepartmentsClient mode="create" employees={employees} />}
      />

      {departments.length === 0 ? (
        <EmptyState title="No departments" />
      ) : (
        <Table headers={["Name", "Description", "Lead", "Active Employees", "Actions"]}>
          {departments.map((d) => (
            <tr key={d.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{d.name}</Td>
              <Td className="max-w-xs truncate text-[var(--muted-fg)]">
                {d.description || "—"}
              </Td>
              <Td>
                {d.lead ? fullName(d.lead.firstName, d.lead.lastName) : "—"}
              </Td>
              <Td className="tabular-nums">{d._count.employees}</Td>
              <Td>
                <DepartmentsClient mode="edit" department={d} employees={employees} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
