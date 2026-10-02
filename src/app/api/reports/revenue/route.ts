import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessFinance } from "@/lib/permissions";
import { toNumber } from "@/lib/utils";

async function guard() {
  const user = await getSessionUser();
  if (!user || !canAccessFinance(user)) {
    return null;
  }
  return user;
}

function csv(headers: string[], rows: (string | number)[][]) {
  const body = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=report.csv",
    },
  });
}

export async function GET() {
  if (!(await guard())) {
    return NextResponse.json({ error: "Απαγορεύεται" }, { status: 403 });
  }
  const rows = await prisma.revenue.findMany({ orderBy: { date: "desc" } });
  return csv(
    ["Date", "Client", "Category", "Amount", "Status"],
    rows.map((r) => [
      r.date.toISOString().slice(0, 10),
      r.client,
      r.category,
      toNumber(r.amount),
      r.paymentStatus,
    ])
  );
}
