"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/lib/permissions";
import { Button } from "../ui/button";

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
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/finance") return pathname === "/finance";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/dashboard" className="group" onClick={() => setOpen(false)}>
          <span className="text-sm font-bold tracking-[0.2em] text-[var(--accent)] transition-opacity group-hover:opacity-80">
            NEXUS
          </span>
        </Link>
        <button
          className="lg:hidden rounded-md p-1 text-[var(--muted-fg)]"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section, i) => (
          <div key={section.title || i} className={cn(i > 0 && "mt-5")}>
            {section.title ? (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-fg)]">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150",
                      isActive(item.href)
                        ? "bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                        : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <p className="truncate text-sm font-medium">{userName}</p>
        <p className="text-xs text-[var(--muted-fg)]">{userRole}</p>
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

      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-[var(--muted-fg)] hover:bg-[var(--muted)]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold tracking-[0.2em] text-[var(--accent)]">NEXUS</span>
      </div>
    </>
  );
}

export function TopBar({ showHrReports }: { showHrReports?: boolean }) {
  return (
    <div className="hidden h-14 items-center justify-between border-b border-[var(--border)] px-6 lg:flex">
      <Link
        href="/search"
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-3 text-sm text-[var(--muted-fg)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
      >
        <Search className="h-4 w-4" />
        <span>Search employees, projects, tasks…</span>
      </Link>
      <div className="flex items-center gap-1">
        {showHrReports ? (
          <Link
            href="/reports"
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
