import { createId } from "@/lib/ids";
import type { AuditLog } from "@/types/domain";
import type { AuditLogRepository } from "@/repositories/interfaces/crm";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import { auditLogColumns, sheetNames } from "@/repositories/google-sheets/schema";

export class GoogleSheetsAuditLogRepository implements AuditLogRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async append(log: Omit<AuditLog, "id" | "createdAt">) {
    const auditLog: AuditLog = {
      ...log,
      id: createId("aud"),
      createdAt: new Date().toISOString(),
    };

    await this.client.appendEntity(sheetNames.auditLogs, auditLogColumns, auditLog);
    return auditLog;
  }

  async findByEntity(entityType: string, entityId: string) {
    const rows = await this.client.listRows(sheetNames.auditLogs, auditLogColumns);
    return rows.filter(
      (row) => row.entityType === entityType && row.entityId === entityId,
    );
  }

  async listRecent(limit = 50) {
    const rows = await this.client.listRows(sheetNames.auditLogs, auditLogColumns);
    return rows
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }
}
