import { requireUser } from "@/lib/auth";
import { getNavigationForRole } from "@/lib/permissions";
import { Sidebar, TopBar } from "@/components/layout/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const sections = getNavigationForRole(user.role);

  return (
    <div className="min-h-screen">
      <Sidebar sections={sections} userName={user.name} userRole={user.role} />
      <div className="lg:pl-56">
        <TopBar showHrReports={user.role === "HR"} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
