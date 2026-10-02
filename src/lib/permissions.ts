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
    items: [{ label: "Πίνακας", href: "/dashboard", icon: "dashboard" }],
  },
  {
    title: "Άνθρωποι",
    items: [
      { label: "Υπάλληλοι", href: "/employees", icon: "employees" },
      { label: "Τμήματα", href: "/departments", icon: "departments" },
      { label: "Θέσεις", href: "/positions", icon: "positions" },
    ],
  },
  {
    title: "HR",
    items: [
      { label: "Άδειες", href: "/leave", icon: "leave" },
      { label: "Έγγραφα", href: "/documents", icon: "documents" },
      { label: "Προσλήψεις", href: "/recruitment", icon: "recruitment" },
    ],
  },
  {
    title: "Εργασία",
    items: [
      { label: "Έργα", href: "/projects", icon: "projects" },
      { label: "Εργασίες", href: "/tasks", icon: "tasks" },
    ],
  },
  {
    title: "Οικονομικά",
    items: [
      { label: "Επισκόπηση", href: "/finance", icon: "finance", ownerOnly: true },
      { label: "Έσοδα", href: "/finance/revenue", icon: "revenue", ownerOnly: true },
      { label: "Έξοδα", href: "/finance/expenses", icon: "expenses", ownerOnly: true },
      { label: "Επαναλαμβανόμενα", href: "/finance/recurring", icon: "recurring", ownerOnly: true },
      { label: "Πληρωμές", href: "/finance/payments", icon: "payments", ownerOnly: true },
      { label: "Αναφορές", href: "/reports", icon: "reports", ownerOnly: true },
    ],
  },
  {
    title: "Σύστημα",
    items: [
      { label: "Ρυθμίσεις", href: "/settings", icon: "settings", ownerOnly: true },
      { label: "Αρχείο ενεργειών", href: "/audit", icon: "audit", ownerOnly: true },
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
