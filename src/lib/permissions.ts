import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  employeeId: string | null;
};

export function isOwner(user: SessionUser | null | undefined): boolean {
  return user?.role === "OWNER";
}

export function isHr(user: SessionUser | null | undefined): boolean {
  return user?.role === "HR";
}

export function canAccessFinance(user: SessionUser | null | undefined): boolean {
  return isOwner(user);
}

export function canAccessSalary(user: SessionUser | null | undefined): boolean {
  return isOwner(user);
}

export function canAccessAuditLog(user: SessionUser | null | undefined): boolean {
  return isOwner(user);
}

export function canAccessSettings(user: SessionUser | null | undefined): boolean {
  return isOwner(user);
}

export type NavItem = {
  label: string;
  href: string;
  ownerOnly?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    title: "People",
    items: [
      { label: "Employees", href: "/employees" },
      { label: "Departments", href: "/departments" },
      { label: "Positions", href: "/positions" },
    ],
  },
  {
    title: "HR",
    items: [
      { label: "Leave", href: "/leave" },
      { label: "Documents", href: "/documents" },
      { label: "Recruitment", href: "/recruitment" },
    ],
  },
  {
    title: "Work",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Tasks", href: "/tasks" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Overview", href: "/finance", ownerOnly: true },
      { label: "Revenue", href: "/finance/revenue", ownerOnly: true },
      { label: "Expenses", href: "/finance/expenses", ownerOnly: true },
      { label: "Recurring", href: "/finance/recurring", ownerOnly: true },
      { label: "Payments", href: "/finance/payments", ownerOnly: true },
      { label: "Reports", href: "/reports", ownerOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", ownerOnly: true },
      { label: "Audit Log", href: "/audit", ownerOnly: true },
    ],
  },
];

export function getNavigationForRole(role: Role): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.ownerOnly || role === "OWNER"),
    }))
    .filter((section) => section.items.length > 0);
}

/** HR also gets non-finance reports */
export const hrReportHrefs = [
  "/reports/employees",
  "/reports/leave",
  "/reports/recruitment",
  "/reports/departments",
];
