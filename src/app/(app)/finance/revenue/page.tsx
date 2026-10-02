import { prisma } from "@/lib/db";
import { requireFinanceAccess } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate, labelize, toNumber } from "@/lib/utils";
import { RevenueClient } from "./revenue-client";

export const metadata = { title: "Revenue" };

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; category?: string; status?: string }>;
}) {
  await requireFinanceAccess();
  const params = await searchParams;

  const [revenues, projects] = await Promise.all([
    prisma.revenue.findMany({
      where: {
        ...(params.client
          ? { client: { contains: params.client, mode: "insensitive" } }
          : {}),
        ...(params.category ? { category: params.category as "WEBSITE" } : {}),
        ...(params.status ? { paymentStatus: params.status as "PAID" } : {}),
      },
      include: { project: true },
      orderBy: { date: "desc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true, client: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Revenue"
        description="Manually record income from clients and projects."
        actions={<RevenueClient mode="create" projects={projects} />}
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          name="client"
          defaultValue={params.client}
          placeholder="Filter client…"
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
        />
        <select
          name="category"
          defaultValue={params.category || ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
        >
          <option value="">All categories</option>
          {["WEBSITE", "LANDING_PAGE", "ECOMMERCE", "MAINTENANCE", "ADVERTISING", "CONSULTING", "OTHER"].map(
            (c) => (
              <option key={c} value={c}>
                {labelize(c)}
              </option>
            )
          )}
        </select>
        <select
          name="status"
          defaultValue={params.status || ""}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
        >
          <option value="">All statuses</option>
          {["PENDING", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
            <option key={s} value={s}>
              {labelize(s)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--muted)]"
        >
          Filter
        </button>
      </form>

      {revenues.length === 0 ? (
        <EmptyState title="No revenue recorded" />
      ) : (
        <Table headers={["Date", "Client", "Project", "Category", "Amount", "Status", "Actions"]}>
          {revenues.map((r) => (
            <tr key={r.id} className="hover:bg-[var(--muted)]/40">
              <Td>{formatDate(r.date)}</Td>
              <Td className="font-medium">{r.client}</Td>
              <Td>{r.project?.name || r.projectLabel || "—"}</Td>
              <Td>{labelize(r.category)}</Td>
              <Td className="tabular-nums font-medium">
                {formatCurrency(toNumber(r.amount))}
              </Td>
              <Td>
                <Badge variant={statusBadgeVariant(r.paymentStatus)}>
                  {labelize(r.paymentStatus)}
                </Badge>
              </Td>
              <Td>
                <RevenueClient mode="edit" revenue={r} projects={projects} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
