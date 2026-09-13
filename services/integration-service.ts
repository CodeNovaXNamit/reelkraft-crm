import { logger } from "@/lib/logging/logger";
import type { AuditService } from "@/services/audit-service";
import type { Actor } from "@/types/domain";

export type IntegrationChannel = "slack" | "gmail" | "calendar";

export type IntegrationResult = {
  channel: IntegrationChannel;
  status: "SENT" | "FAILED";
  message: string;
};

export class IntegrationService {
  constructor(private readonly audit: AuditService) {}

  async notify(
    channel: IntegrationChannel,
    input: { title: string; message: string; entityType: string; entityId: string },
    actor: Actor,
  ): Promise<IntegrationResult> {
    const requiredEnv = {
      slack: "SLACK_BOT_TOKEN",
      gmail: "GOOGLE_WORKSPACE_DELEGATED_USER",
      calendar: "GOOGLE_CALENDAR_ID",
    }[channel];

    if (!process.env[requiredEnv]) {
      const result = {
        channel,
        status: "FAILED" as const,
        message: `${requiredEnv} is not configured.`,
      };
      logger.warn("External integration delivery skipped", {
        channel,
        entityType: input.entityType,
        entityId: input.entityId,
      });
      await this.audit.appendAccessEvent({
        actor,
        action: `${channel}_delivery_failed`,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: result,
      });
      return result;
    }

    const result = {
      channel,
      status: "FAILED" as const,
      message: "Live delivery is not executed by local verification without owner credentials.",
    };
    logger.warn("External integration credentials are present but live delivery was not attempted locally", {
      channel,
      entityType: input.entityType,
      entityId: input.entityId,
    });
    await this.audit.appendAccessEvent({
      actor,
      action: `${channel}_delivery_not_verified`,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: result,
    });
    return result;
  }
}
