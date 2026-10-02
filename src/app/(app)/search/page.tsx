import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { fullName, labelize } from "@/lib/utils";

export const metadata = { title: "Αναζήτηση" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const owner = canAccessFinance(user);
  const params = await searchParams;
  const q = params.q?.trim() || "";

  if (!q) {
    return (
      <div>
        <PageHeader title="Αναζήτηση" description="Βρείτε υπαλλήλους, έργα, εργασίες και υποψηφίους." />
        <form className="mb-6">
          <input
            name="q"
            placeholder="Πληκτρολογήστε όνομα, πελάτη ή εργασία…"
            autoFocus
            className="h-11 w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </form>
        <EmptyState title="Ξεκινήστε να πληκτρολογείτε" />
      </div>
    );
  }

  const [employees, projects, tasks, candidates, revenues] = await Promise.all([
    prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: { position: true },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { client: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.task.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 10,
      include: { project: true },
    }),
    prisma.candidate.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    owner
      ? prisma.revenue.findMany({
          where: {
            OR: [
              { client: { contains: q, mode: "insensitive" } },
              { projectLabel: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  const empty =
    employees.length +
      projects.length +
      tasks.length +
      candidates.length +
      revenues.length ===
    0;

  return (
    <div>
      <PageHeader title="Αναζήτηση" description={`Αποτελέσματα για “${q}”`} />
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Αναζήτηση…"
          className="h-11 w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
      </form>

      {empty ? (
        <EmptyState title="Δεν βρέθηκαν αποτελέσματα" description="Δοκιμάστε άλλη λέξη-κλειδί." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ResultGroup title="Υπάλληλοι">
            {employees.map((e) => (
              <Link key={e.id} href={`/employees/${e.id}`} className="block text-sm hover:text-[var(--accent)]">
                {fullName(e.firstName, e.lastName)}
                <span className="text-[var(--muted-fg)]"> · {e.position?.name || "Χωρίς θέση"}</span>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title="Έργα">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between text-sm">
                <span className="hover:text-[var(--accent)]">{p.name}</span>
                <Badge variant={statusBadgeVariant(p.status)}>{labelize(p.status)}</Badge>
              </Link>
            ))}
          </ResultGroup>
          <ResultGroup title="Εργασίες">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span>
                  {t.title}
                  {t.project ? (
                    <span className="text-[var(--muted-fg)]"> · {t.project.name}</span>
                  ) : null}
                </span>
                <Badge variant={statusBadgeVariant(t.status)}>{labelize(t.status)}</Badge>
              </div>
            ))}
          </ResultGroup>
          <ResultGroup title="Υποψήφιοι">
            {candidates.map((c) => (
              <Link key={c.id} href="/recruitment" className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <Badge variant={statusBadgeVariant(c.status)}>{labelize(c.status)}</Badge>
              </Link>
            ))}
          </ResultGroup>
          {owner ? (
            <ResultGroup title="Πελάτες / Έσοδα">
              {revenues.map((r) => (
                <Link key={r.id} href="/finance/revenue" className="block text-sm hover:text-[var(--accent)]">
                  {r.client}
                  {r.projectLabel ? (
                    <span className="text-[var(--muted-fg)]"> · {r.projectLabel}</span>
                  ) : null}
                </Link>
              ))}
            </ResultGroup>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  if (items.filter(Boolean).length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}
