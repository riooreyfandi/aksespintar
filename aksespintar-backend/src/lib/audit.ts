import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type AuditEvent = {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

// Jejak aktivitas untuk halaman admin. Kegagalan mencatat audit tidak boleh
// menggagalkan permintaan pengguna, jadi error hanya dilaporkan ke log server.
export async function recordAudit(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: event.actorId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        metadata: event.metadata,
      },
    });
  } catch (err) {
    console.error("Gagal mencatat audit:", err);
  }
}
