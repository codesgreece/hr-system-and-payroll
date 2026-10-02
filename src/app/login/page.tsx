import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent-muted),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-sm animate-in slide-in">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-[var(--accent)]">NEXUS</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foreground)]">
            Control Center
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-fg)]">
            Sign in to manage people, work, and operations.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-fg)]">
          Private internal dashboard · Authorized users only
        </p>
      </div>
    </div>
  );
}
