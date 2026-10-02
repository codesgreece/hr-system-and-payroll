import { NextRequest, NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user) await audit(user.id, "signed out", "User", user.id);
  await destroySession();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
