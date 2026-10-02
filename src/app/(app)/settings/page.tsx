import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { PageHeader, Table, Td } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { formatDate, labelize } from "@/lib/utils";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireOwner();
  const [users, employees] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.employee.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="System users for the Control Center."
        actions={<SettingsClient employees={employees} />}
      />

      <Table headers={["Name", "Email", "Role", "Created"]}>
        {users.map((u) => (
          <tr key={u.id}>
            <Td className="font-medium">{u.name}</Td>
            <Td>{u.email}</Td>
            <Td>
              <Badge variant={u.role === "OWNER" ? "purple" : "muted"}>
                {labelize(u.role)}
              </Badge>
            </Td>
            <Td>{formatDate(u.createdAt)}</Td>
          </tr>
        ))}
      </Table>

      <p className="mt-6 text-xs text-[var(--muted-fg)]">
        Employees are not system users. Only Owner and HR accounts can sign in.
      </p>
    </div>
  );
}
