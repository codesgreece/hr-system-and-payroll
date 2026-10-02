import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { PositionsClient } from "./positions-client";

export const metadata = { title: "Positions" };

export default async function PositionsPage() {
  await requireUser();
  const positions = await prisma.position.findMany({
    include: { _count: { select: { employees: { where: { status: { not: "ARCHIVED" } } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Positions"
        description="Job titles used across the organization."
        actions={<PositionsClient mode="create" />}
      />

      {positions.length === 0 ? (
        <EmptyState title="No positions" />
      ) : (
        <Table headers={["Name", "Description", "Employees", "Actions"]}>
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
