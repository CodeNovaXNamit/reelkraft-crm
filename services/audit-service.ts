import type { AuditLogRepository } from "@/repositories/interfaces/crm";
import type { Actor } from "@/types/domain";

const sensitiveKeyPattern = /secret|token|private[_-]?key|password|authorization|cookie/i;

function redactSensitiveValues(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular]";
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValues(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      sensitiveKeyPattern.test(key)
        ? "[REDACTED]"
        : redactSensitiveValues(nestedValue, seen),
    ]),
  );
}

function safeAuditJson(value: unknown) {
  return JSON.stringify(redactSensitiveValues(value));
}

export class AuditService {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  appendAccessEvent(input: {
    actor: Actor;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
    metadata?: Record<string, unknown>;
  }) {
    return this.auditLogs.append({
      userId: input.actor.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue:
        input.oldValue === undefined ? undefined : safeAuditJson(input.oldValue),
      newValue:
        input.newValue === undefined ? undefined : safeAuditJson(input.newValue),
      metadata:
        input.metadata === undefined ? undefined : safeAuditJson(input.metadata),
    });
  }
}
