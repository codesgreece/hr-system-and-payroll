import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSalary } from "@/lib/permissions";
import { PageHeader, SectionLabel, Table, Td } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatCurrency, formatDate, fullName, labelize, toNumber } from "@/lib/utils";
import { EmployeesClient, ArchiveButton } from "../employees-client";
import { SalaryClient } from "../salary-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await prisma.employee.findUnique({ where: { id } });
  return { title: emp ? fullName(emp.firstName, emp.lastName) : "Υπάλληλος" };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const showSalary = canAccessSalary(user);

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      position: true,
      department: true,
      teamLeader: true,
      leaves: { orderBy: { startDate: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
      tasks: { orderBy: { updatedAt: "desc" }, take: 10, include: { project: true } },
      projectMemberships: { include: { project: true } },
      salaries: showSalary
        ? { orderBy: { effectiveDate: "desc" } }
        : false,
      payments: showSalary
        ? { orderBy: { date: "desc" }, take: 10 }
        : false,
    },
  });

  if (!employee) notFound();

  const [positions, departments, leaders] = await Promise.all([
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      where: { status: { not: "ARCHIVED" }, id: { not: id } },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={fullName(employee.firstName, employee.lastName)}
        description={employee.email}
        actions={
          <div className="flex gap-2">
            <EmployeesClient
              mode="edit"
              employee={employee}
              positions={positions}
              departments={departments}
              leaders={leaders}
            />
            {employee.status !== "ARCHIVED" ? <ArchiveButton id={employee.id} /> : null}
          </div>
        }
      />

      <div className="mb-4">
        <Badge variant={statusBadgeVariant(employee.status)}>{labelize(employee.status)}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Προσωπικά στοιχεία</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Όνομα" value={fullName(employee.firstName, employee.lastName)} />
            <Row label="Email" value={employee.email} />
            <Row label="Τηλέφωνο" value={employee.phone || "—"} />
            <Row label="Διεύθυνση" value={employee.address || "—"} />
            <Row label="Έκτακτη ανάγκη" value={employee.emergencyContact || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Απασχόληση</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Θέση" value={employee.position?.name || "—"} />
            <Row label="Τμήμα" value={employee.department?.name || "—"} />
            <Row
              label="Υπεύθυνος ομάδας"
              value={
                employee.teamLeader
                  ? fullName(employee.teamLeader.firstName, employee.teamLeader.lastName)
                  : "—"
              }
            />
            <Row label="Τύπος" value={labelize(employee.employmentType)} />
            <Row label="Ημερομηνία έναρξης" value={formatDate(employee.startDate)} />
            <Row label="Κατάσταση" value={labelize(employee.status)} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Έργα</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {employee.projectMemberships.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν έργα</p>
            ) : (
              employee.projectMemberships.map((m) => (
                <Link
                  key={m.id}
                  href={`/projects/${m.project.id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/40"
                >
                  <span>{m.project.name}</span>
                  <Badge variant={statusBadgeVariant(m.project.status)}>
                    {labelize(m.project.status)}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Εργασίες</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {employee.tasks.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν εργασίες</p>
            ) : (
              employee.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <span className="truncate">{t.title}</span>
                  <Badge variant={statusBadgeVariant(t.status)}>{labelize(t.status)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Άδειες</CardTitle>
            <Link href="/leave" className="text-xs text-[var(--accent)]">
              Διαχείριση
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {employee.leaves.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν άδειες</p>
            ) : (
              employee.leaves.map((l) => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span>
                    {labelize(l.type)} · {formatDate(l.startDate)} – {formatDate(l.endDate)}
                  </span>
                  <Badge variant={statusBadgeVariant(l.status)}>{labelize(l.status)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Έγγραφα</CardTitle>
            <Link href="/documents" className="text-xs text-[var(--accent)]">
              Διαχείριση
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {employee.documents.length === 0 ? (
              <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχουν έγγραφα</p>
            ) : (
              employee.documents.map((d) => (
                <div key={d.id} className="flex justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="text-[var(--muted-fg)]">{labelize(d.category)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {employee.performanceNotes ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Σημειώσεις απόδοσης</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-[var(--muted-fg)]">
              {employee.performanceNotes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {showSalary && Array.isArray(employee.salaries) ? (
        <div className="mt-8">
          <SectionLabel>Αποδοχές · Μόνο Ιδιοκτήτης</SectionLabel>
          <div className="mb-3 flex justify-end">
            <SalaryClient employeeId={employee.id} />
          </div>
          {employee.salaries.length === 0 ? (
            <p className="text-sm text-[var(--muted-fg)]">Δεν υπάρχει ιστορικό μισθού</p>
          ) : (
            <Table headers={["Ποσό", "Συχνότητα", "Ισχύς", "Σημειώσεις"]}>
              {employee.salaries.map((s) => (
                <tr key={s.id}>
                  <Td className="font-medium tabular-nums">{formatCurrency(toNumber(s.amount))}</Td>
                  <Td>{labelize(s.frequency)}</Td>
                  <Td>{formatDate(s.effectiveDate)}</Td>
                  <Td>{s.notes || "—"}</Td>
                </tr>
              ))}
            </Table>
          )}

          {Array.isArray(employee.payments) && employee.payments.length > 0 ? (
            <div className="mt-6">
              <SectionLabel>Καταγραφές πληρωμών</SectionLabel>
              <Table headers={["Ημερομηνία", "Τύπος", "Ποσό", "Περίοδος", "Κατάσταση"]}>
                {employee.payments.map((p) => (
                  <tr key={p.id}>
                    <Td>{formatDate(p.date)}</Td>
                    <Td>{labelize(p.type)}</Td>
                    <Td className="tabular-nums">{formatCurrency(toNumber(p.amount))}</Td>
                    <Td>{p.period || "—"}</Td>
                    <Td>
                      <Badge variant={statusBadgeVariant(p.status)}>{labelize(p.status)}</Badge>
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--muted-fg)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
