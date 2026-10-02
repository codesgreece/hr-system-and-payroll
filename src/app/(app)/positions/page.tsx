import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { PositionsClient } from "./positions-client";

export const metadata = { title: "Θέσεις" };

export default async function PositionsPage() {
  await requireUser();
  const positions = await prisma.position.findMany({
    include: { _count: { select: { employees: { where: { status: { not: "ARCHIVED" } } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Θέσεις"
        description="Τίτλοι θέσεων στον οργανισμό."
        actions={<PositionsClient mode="create" />}
      />

      {positions.length === 0 ? (
        <EmptyState title="Δεν υπάρχουν θέσεις" />
      ) : (
        <Table headers={["Όνομα", "Περιγραφή", "Υπάλληλοι", "Ενέργειες"]}>
          {positions.map((p) => (
            <tr key={p.id} className="hover:bg-[var(--muted)]/40">
              <Td className="font-medium">{p.name}</Td>
              <Td className="text-[var(--muted-fg)]">{p.description || "—"}</Td>
              <Td className="tabular-nums">{p._count.employees}</Td>
              <Td>
                <PositionsClient mode="edit" position={p} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
