import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, EmptyState, Table, Td } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { daysUntil, formatDate, fullName, labelize } from "@/lib/utils";
import { DocumentsClient } from "./documents-client";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  await requireUser();
  const [documents, employees] = await Promise.all([
    prisma.document.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
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
        title="Documents"
        description="Employee documents with expiration warnings."
        actions={<DocumentsClient employees={employees} />}
      />

      {documents.length === 0 ? (
        <EmptyState title="No documents" description="Upload contracts, IDs, and certificates." />
      ) : (
        <Table headers={["Document", "Employee", "Category", "Expires", "Notes", "Actions"]}>
          {documents.map((d) => {
            const days = d.expirationDate ? daysUntil(d.expirationDate) : null;
            const expiring = days !== null && days <= 30;
            const expired = days !== null && days < 0;
            return (
              <tr key={d.id} className="hover:bg-[var(--muted)]/40">
                <Td>
                  <a
                    href={d.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:text-[var(--accent)]"
                  >
                    {d.name}
                  </a>
                </Td>
                <Td>{fullName(d.employee.firstName, d.employee.lastName)}</Td>
                <Td>{labelize(d.category)}</Td>
                <Td>
                  {d.expirationDate ? (
                    <span className="inline-flex items-center gap-2">
                      {formatDate(d.expirationDate)}
                      {expired ? (
                        <Badge variant="danger">Expired</Badge>
                      ) : expiring ? (
                        <Badge variant="warning">{days}d left</Badge>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="max-w-[140px] truncate text-[var(--muted-fg)]">
                  {d.notes || "—"}
                </Td>
                <Td>
                  <DocumentsClient employees={employees} deleteId={d.id} />
                </Td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
