import { prisma } from "./db";

export async function audit(
  userId: string | null | undefined,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: string | null
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
