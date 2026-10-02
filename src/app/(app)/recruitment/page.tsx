import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate, labelize } from "@/lib/utils";
import { RecruitmentClient } from "./recruitment-client";

export const metadata = { title: "Προσλήψεις" };

export default async function RecruitmentPage() {
  await requireUser();
  const [candidates, positions] = await Promise.all([
    prisma.candidate.findMany({
      include: { position: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Προσλήψεις"
        description="Απλό pipeline υποψηφίων."
        actions={<RecruitmentClient mode="create" positions={positions} />}
      />

      {candidates.length === 0 ? (
        <EmptyState title="Δεν υπάρχουν υποψήφιοι" />
      ) : (
        <Table headers={["Όνομα", "Email", "Τηλέφωνο", "Θέση", "Κατάσταση", "Προστέθηκε", "Ενέργειες"]}>
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{c.name}</Td>
              <Td>{c.email}</Td>
              <Td>{c.phone || "—"}</Td>
              <Td>{c.position?.name || "—"}</Td>
              <Td>
                <Badge variant={statusBadgeVariant(c.status)}>{labelize(c.status)}</Badge>
              </Td>
              <Td>{formatDate(c.createdAt)}</Td>
              <Td>
                <RecruitmentClient mode="edit" candidate={c} positions={positions} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
