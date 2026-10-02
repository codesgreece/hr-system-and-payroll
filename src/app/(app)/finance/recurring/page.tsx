import { prisma } from "@/lib/db";
import { requireFinanceAccess } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, labelize, toNumber } from "@/lib/utils";
import { RecurringClient } from "./recurring-client";

export const metadata = { title: "Recurring Expenses" };

export default async function RecurringPage() {
  await requireFinanceAccess();
  const items = await prisma.recurringExpense.findMany({
    orderBy: [{ active: "desc" }, { nextPaymentDate: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Recurring Expenses"
        description="Expected subscriptions and repeating costs — no payment processing."
        actions={<RecurringClient mode="create" />}
      />

      {items.length === 0 ? (
        <EmptyState title="No recurring expenses" />
      ) : (
        <Table headers={["Provider", "Amount", "Frequency", "Next payment", "Category", "Status", "Actions"]}>
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{r.provider}</Td>
              <Td className="tabular-nums">{formatCurrency(toNumber(r.amount))}</Td>
              <Td>{labelize(r.frequency)}</Td>
              <Td>{formatDate(r.nextPaymentDate)}</Td>
              <Td>{labelize(r.category)}</Td>
              <Td>
                <Badge variant={r.active ? "success" : "muted"}>
                  {r.active ? "Active" : "Inactive"}
                </Badge>
              </Td>
              <Td>
                <RecurringClient mode="edit" item={r} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
