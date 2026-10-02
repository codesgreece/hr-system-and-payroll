import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { toNumber } from "@/lib/utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !canAccessFinance(user)) {
    return NextResponse.json({ error: "Απαγορεύεται" }, { status: 403 });
  }
  const rows = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  const body = [
    ["Date", "Provider", "Category", "Amount", "Recurring"],
    ...rows.map((r) => [
      r.date.toISOString().slice(0, 10),
      r.provider,
      r.category,
      String(toNumber(r.amount)),
      r.recurring ? "yes" : "no",
    ]),
  ]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=expenses.csv",
    },
  });
}
