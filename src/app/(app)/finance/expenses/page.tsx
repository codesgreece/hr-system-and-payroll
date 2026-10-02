import { prisma } from "@/lib/db";
import { requireFinanceAccess } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, labelize, toNumber } from "@/lib/utils";
import { ExpensesClient } from "./expenses-client";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  await requireFinanceAccess();
  const [expenses, projects] = await Promise.all([
    prisma.expense.findMany({
      include: { project: true },
      orderBy: { date: "desc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track software, hosting, tools, and operating costs."
        actions={<ExpensesClient mode="create" projects={projects} />}
      />

      {expenses.length === 0 ? (
        <EmptyState title="No expenses recorded" />
      ) : (
        <Table headers={["Date", "Provider", "Category", "Amount", "Project", "Recurring", "Actions"]}>
          {expenses.map((e) => (
            <tr key={e.id} className="hover:bg-[var(--muted)]/40">
              <Td>{formatDate(e.date)}</Td>
              <Td>
                <p className="font-medium">{e.provider}</p>
                {e.description ? (
                  <p className="text-xs text-[var(--muted-fg)]">{e.description}</p>
                ) : null}
              </Td>
              <Td>{labelize(e.category)}</Td>
              <Td className="tabular-nums font-medium">
                {formatCurrency(toNumber(e.amount))}
              </Td>
              <Td>{e.project?.name || "—"}</Td>
              <Td>{e.recurring ? <Badge variant="info">Yes</Badge> : "—"}</Td>
              <Td>
                <ExpensesClient mode="edit" expense={e} projects={projects} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
