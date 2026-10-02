import { prisma } from "@/lib/db";
import { requireSalaryAccess } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate, fullName, labelize, toNumber } from "@/lib/utils";
import { PaymentsClient } from "./payments-client";

export const metadata = { title: "Πληρωμές & Μισθοί" };

export default async function PaymentsPage() {
  await requireSalaryAccess();
  const [payments, employees] = await Promise.all([
    prisma.payment.findMany({
      include: { employee: true },
      orderBy: { date: "desc" },
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
        title="Πληρωμές & Μισθοί"
        description="Καταγραφές μισθοδοσίας και bonus — μόνο Ιδιοκτήτης."
        actions={<PaymentsClient mode="create" employees={employees} />}
      />

      {payments.length === 0 ? (
        <EmptyState title="Δεν υπάρχουν καταγραφές πληρωμών" />
      ) : (
        <Table headers={["Ημερομηνία", "Υπάλληλος", "Τύπος", "Ποσό", "Περίοδος", "Κατάσταση", "Ενέργειες"]}>
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-[var(--muted)]/40">
              <Td>{formatDate(p.date)}</Td>
              <Td className="font-medium">
                {fullName(p.employee.firstName, p.employee.lastName)}
              </Td>
              <Td>{labelize(p.type)}</Td>
              <Td className="tabular-nums">{formatCurrency(toNumber(p.amount))}</Td>
              <Td>{p.period || "—"}</Td>
              <Td>
                <Badge variant={statusBadgeVariant(p.status)}>{labelize(p.status)}</Badge>
              </Td>
              <Td>
                <PaymentsClient mode="edit" payment={p} employees={employees} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
