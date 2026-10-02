import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate, fullName, labelize } from "@/lib/utils";
import { LeaveClient } from "./leave-client";

export const metadata = { title: "Άδειες" };

export default async function LeavePage() {
  await requireUser();
  const [leaves, employees] = await Promise.all([
    prisma.leave.findMany({
      include: { employee: true },
      orderBy: { startDate: "desc" },
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
        title="Άδειες"
        description="Παρακολούθηση προγραμματισμένων και εγκεκριμένων αδειών."
        actions={<LeaveClient mode="create" employees={employees} />}
      />

      {leaves.length === 0 ? (
        <EmptyState title="Δεν υπάρχουν άδειες" />
      ) : (
        <Table headers={["Υπάλληλος", "Τύπος", "Έναρξη", "Λήξη", "Κατάσταση", "Σημειώσεις", "Ενέργειες"]}>
          {leaves.map((l) => (
            <tr key={l.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">
                {fullName(l.employee.firstName, l.employee.lastName)}
              </Td>
              <Td>{labelize(l.type)}</Td>
              <Td>{formatDate(l.startDate)}</Td>
              <Td>{formatDate(l.endDate)}</Td>
              <Td>
                <Badge variant={statusBadgeVariant(l.status)}>{labelize(l.status)}</Badge>
              </Td>
              <Td className="max-w-[160px] truncate text-[var(--muted-fg)]">
                {l.notes || "—"}
              </Td>
              <Td>
                <LeaveClient mode="edit" leave={l} employees={employees} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
