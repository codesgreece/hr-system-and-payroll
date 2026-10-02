import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import type { SessionUser } from "./permissions";
import { canAccessFinance, canAccessSalary } from "./permissions";

const SESSION_COOKIE = "nexus_session";
const SESSION_DAYS = 14;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

type SessionClaims = SessionUser & { sid: string };

async function signSession(payload: SessionClaims, expiresAt: Date) {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    employeeId: payload.employeeId,
    sid: payload.sid,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(authSecret());
}

async function readSessionCookie(): Promise<(SessionClaims & { exp?: number }) | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "OWNER" && payload.role !== "HR") ||
      typeof payload.sid !== "string"
    ) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      employeeId:
        typeof payload.employeeId === "string" ? payload.employeeId : null,
      sid: payload.sid,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeId: true,
    },
  });
  if (!user) throw new Error("User not found");

  const sid = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { token: sid, userId, expiresAt },
  });

  const jwt = await signSession({ ...user, sid }, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sid;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const claims = await readSessionCookie();
  if (claims?.sid) {
    await prisma.session.deleteMany({ where: { token: claims.sid } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Fast path: verify signed cookie locally (no DB roundtrip).
 * This keeps sidebar navigation snappy on serverless/Neon.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const claims = await readSessionCookie();
  if (!claims) {
    const cookieStore = await cookies();
    try {
      cookieStore.delete(SESSION_COOKIE);
    } catch {
      /* ignore in RSC */
    }
    return null;
  }

  return {
    id: claims.id,
    email: claims.email,
    name: claims.name,
    role: claims.role,
    employeeId: claims.employeeId,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "OWNER") redirect("/dashboard");
  return user;
}

export async function requireFinanceAccess(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccessFinance(user)) redirect("/dashboard");
  return user;
}

export async function requireSalaryAccess(): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccessSalary(user)) redirect("/dashboard");
  return user;
}

export { SESSION_COOKIE };
