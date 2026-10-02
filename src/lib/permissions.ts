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

export type NavIcon =
  | "dashboard"
  | "employees"
  | "departments"
  | "positions"
  | "leave"
  | "documents"
  | "recruitment"
  | "projects"
  | "tasks"
  | "finance"
  | "revenue"
  | "expenses"
  | "recurring"
  | "payments"
  | "reports"
  | "settings"
  | "audit";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  ownerOnly?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }],
  },
  {
    title: "People",
    items: [
      { label: "Employees", href: "/employees", icon: "employees" },
      { label: "Departments", href: "/departments", icon: "departments" },
      { label: "Positions", href: "/positions", icon: "positions" },
    ],
  },
  {
    title: "HR",
    items: [
      { label: "Leave", href: "/leave", icon: "leave" },
      { label: "Documents", href: "/documents", icon: "documents" },
      { label: "Recruitment", href: "/recruitment", icon: "recruitment" },
    ],
  },
  {
    title: "Work",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Tasks", href: "/tasks", icon: "tasks" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Overview", href: "/finance", icon: "finance", ownerOnly: true },
      { label: "Revenue", href: "/finance/revenue", icon: "revenue", ownerOnly: true },
      { label: "Expenses", href: "/finance/expenses", icon: "expenses", ownerOnly: true },
      { label: "Recurring", href: "/finance/recurring", icon: "recurring", ownerOnly: true },
      { label: "Payments", href: "/finance/payments", icon: "payments", ownerOnly: true },
      { label: "Reports", href: "/reports", icon: "reports", ownerOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: "settings", ownerOnly: true },
      { label: "Audit Log", href: "/audit", icon: "audit", ownerOnly: true },
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
