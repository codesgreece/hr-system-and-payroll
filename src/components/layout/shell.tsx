"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  Search,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarDays,
  FileText,
  UserPlus,
  FolderKanban,
  CheckSquare,
  Wallet,
  TrendingUp,
  Receipt,
  RefreshCw,
  Banknote,
  BarChart3,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavIcon, NavSection } from "@/lib/permissions";
import { Button } from "../ui/button";

const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  employees: Users,
  departments: Building2,
  positions: Briefcase,
  leave: CalendarDays,
  documents: FileText,
  recruitment: UserPlus,
  projects: FolderKanban,
  tasks: CheckSquare,
  finance: Wallet,
  revenue: TrendingUp,
  expenses: Receipt,
  recurring: RefreshCw,
  payments: Banknote,
  reports: BarChart3,
  settings: Settings,
  audit: ScrollText,
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("nexus-theme", next ? "dark" : "light");
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function Sidebar({
  sections,
  userName,
  userRole,
}: {
  sections: NavSection[];
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/finance") return pathname === "/finance";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function navigate(href: string) {
    if (href === pathname) {
      setOpen(false);
      return;
    }
    setPendingHref(href);
    setOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button type="button" className="group" onClick={() => navigate("/dashboard")}>
          <span className="text-[13px] font-bold tracking-[0.22em] text-[var(--accent)] transition-opacity group-hover:opacity-80">
            NEXUS
          </span>
        </button>
        <button
          className="lg:hidden rounded-md p-1 text-[var(--muted-fg)]"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-3">
        {sections.map((section, i) => (
          <div key={section.title || i} className={cn(i > 0 && "mt-3.5")}>
            {section.title ? (
              <p className="mb-1 px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted-fg)]/80">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const loading = pending && pendingHref === item.href;
                const Icon = NAV_ICONS[item.icon];
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-100",
                        active
                          ? "bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                          : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                        loading && "opacity-70"
                      )}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                      ) : null}
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {loading ? (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[11px] font-semibold tracking-wide text-[var(--accent)]">
            {initials(userName) || "N"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium leading-tight">{userName}</p>
            <p className="text-[11px] uppercase tracking-wide text-[var(--muted-fg)]">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-[var(--border)] bg-[var(--sidebar)] lg:block">
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-[var(--border)] bg-[var(--sidebar)] shadow-xl">
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-[13px] font-bold tracking-[0.22em] text-[var(--accent)]">NEXUS</span>
        {pending ? (
          <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
        ) : null}
      </div>
    </>
  );
}

export function TopBar({ showHrReports }: { showHrReports?: boolean }) {
  return (
    <div className="hidden h-12 items-center justify-between border-b border-[var(--border)] px-6 lg:flex">
      <Link
        href="/search"
        prefetch
        className="flex h-8 w-full max-w-md items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 text-sm text-[var(--muted-fg)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search employees, projects, tasks…</span>
      </Link>
      <div className="flex items-center gap-1">
        {showHrReports ? (
          <Link
            href="/reports"
            prefetch
            className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Reports
          </Link>
        ) : null}
        <ThemeToggle />
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" size="sm" type="submit" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
