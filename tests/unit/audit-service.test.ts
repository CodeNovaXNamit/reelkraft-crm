import { describe, expect, it } from "vitest";
import { AuditService } from "@/services/audit-service";
import type { AuditLogRepository } from "@/repositories/interfaces/crm";
import type { Actor, AuditLog } from "@/types/domain";

const actor: Actor = {
  id: "emp_admin",
  email: "admin@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

class MemoryAuditLogs implements AuditLogRepository {
  rows: AuditLog[] = [];

  async append(log: Omit<AuditLog, "id" | "createdAt">) {
    const auditLog = {
      ...log,
      id: "aud_1",
      createdAt: "2026-09-10T00:00:00.000Z",
    };
    this.rows.push(auditLog);
    return auditLog;
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.rows.filter(
      (row) => row.entityType === entityType && row.entityId === entityId,
    );
  }

  async listRecent(limit = 50) {
    return this.rows.slice(0, limit);
  }
}

describe("AuditService", () => {
  it("redacts secrets and tokens from stored audit payloads", async () => {
    const repository = new MemoryAuditLogs();
    const service = new AuditService(repository);

    await service.appendAccessEvent({
      actor,
      action: "settings_updated",
      entityType: "Settings",
      entityId: "integrations",
      newValue: {
        googlePrivateKey: "real-private-key",
        nested: { slackToken: "xoxb-secret-token", name: "Slack" },
      },
      metadata: {
        authorization: "Bearer token",
        requestId: "req_1",
      },
    });

    expect(repository.rows[0]?.newValue).not.toContain("real-private-key");
    expect(repository.rows[0]?.newValue).not.toContain("xoxb-secret-token");
    expect(repository.rows[0]?.newValue).toContain("[REDACTED]");
    expect(repository.rows[0]?.metadata).not.toContain("Bearer token");
    expect(repository.rows[0]?.metadata).toContain("req_1");
  });
});
