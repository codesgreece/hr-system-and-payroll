import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Audit Log" };

export default async function AuditPage() {
  await requireOwner();
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Important actions across the Control Center."
      />

      {logs.length === 0 ? (
        <EmptyState title="No audit entries" />
      ) : (
        <Table headers={["User", "Action", "Entity", "Details", "Date"]}>
          {logs.map((l) => (
            <tr key={l.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{l.user?.name || "System"}</Td>
              <Td>{l.action}</Td>
              <Td>{l.entity}</Td>
              <Td className="max-w-xs truncate text-[var(--muted-fg)]">
                {l.details || "—"}
              </Td>
              <Td className="whitespace-nowrap text-[var(--muted-fg)]">
                {formatDateTime(l.createdAt)}
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
