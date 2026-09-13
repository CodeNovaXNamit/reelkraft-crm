import { ApplicationError } from "@/lib/errors/application-error";
import { assertPermission } from "@/lib/permissions/authorize";
import type {
  CreateContentInput,
  MoveContentStatusInput,
  UpdateContentInput,
} from "@/lib/validation/content";
import type { ContentRepository } from "@/repositories/interfaces/content";
import type { ClientRepository } from "@/repositories/interfaces/crm";
import type { NotificationRepository } from "@/repositories/interfaces/operations";
import type { AuditService } from "@/services/audit-service";
import { NotificationService } from "@/services/notification-service";
import type { Actor, ContentItem, ContentStatus } from "@/types/domain";
import type { PageQuery } from "@/types/pagination";

const contentTransitionTargets: Record<ContentStatus, ContentStatus[]> = {
  IDEA: ["SCRIPT"],
  SCRIPT: ["SHOOT", "EDITING"],
  SHOOT: ["EDITING"],
  EDITING: ["INTERNAL_REVIEW"],
  INTERNAL_REVIEW: ["REVISION", "CLIENT_REVIEW"],
  CLIENT_REVIEW: ["REVISION", "APPROVED"],
  REVISION: ["EDITING", "INTERNAL_REVIEW", "CLIENT_REVIEW"],
  APPROVED: ["SCHEDULED"],
  SCHEDULED: ["PUBLISHED"],
  PUBLISHED: [],
};

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

function assertValidContentTransition(existing: ContentItem, nextStatus?: ContentStatus) {
  if (!nextStatus || existing.status === nextStatus) return;
  if (!contentTransitionTargets[existing.status].includes(nextStatus)) {
    throw new ApplicationError(
      "VALIDATION_ERROR",
      `Content cannot move from ${existing.status} to ${nextStatus}.`,
    );
  }
}

function assertApprovalPermission(actor: Actor, status: ContentStatus) {
  if (status === "APPROVED" || status === "SCHEDULED" || status === "PUBLISHED") {
    assertPermission(actor, "content", "approve");
  }
}

export class ContentService {
  private readonly notificationService: NotificationService;

  constructor(
    private readonly clients: ClientRepository,
    private readonly content: ContentRepository,
    private readonly audit: AuditService,
    notifications: NotificationRepository,
  ) {
    this.notificationService = new NotificationService(notifications);
  }

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "content", "view");
    return this.content.list(query, actor);
  }

  async create(input: CreateContentInput, actor: Actor) {
    assertPermission(actor, "content", "create");
    const normalized = compactOptional(input);
    const client = await this.clients.findById(normalized.clientId, actor);
    if (!client) {
      throw new ApplicationError("NOT_FOUND", "Client not found.");
    }
    assertApprovalPermission(actor, normalized.status ?? "IDEA");
    const item = await this.content.create(
      { ...normalized, status: normalized.status ?? "IDEA" },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "content_created",
      entityType: "Content",
      entityId: item.id,
      newValue: item,
    });
    return item;
  }

  async update(id: string, input: UpdateContentInput, actor: Actor) {
    assertPermission(actor, "content", "edit");
    const existing = await this.content.findById(id, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Content item not found.");
    }
    const normalized = compactOptional(input);
    assertValidContentTransition(existing, normalized.status);
    if (normalized.status) assertApprovalPermission(actor, normalized.status);
    const item = await this.content.update(id, normalized, actor);
    await this.audit.appendAccessEvent({
      actor,
      action: existing.status !== item.status ? "content_status_changed" : "content_updated",
      entityType: "Content",
      entityId: item.id,
      oldValue: existing,
      newValue: item,
    });
    await this.notifyOnStatus(item, existing.status);
    return item;
  }

  async moveStatus(input: MoveContentStatusInput, actor: Actor) {
    return this.update(
      input.contentId,
      {
        status: input.status,
        revisionNotes: input.status === "REVISION" ? input.notes : undefined,
        approvalNotes:
          input.status === "APPROVED" || input.status === "SCHEDULED" || input.status === "PUBLISHED"
            ? input.notes
            : undefined,
      },
      actor,
    );
  }

  private async notifyOnStatus(item: ContentItem, previousStatus: ContentStatus) {
    if (item.status === previousStatus) return;
    const recipientUserId = item.reviewerId ?? item.editorId ?? item.writerId;
    if (!recipientUserId) return;
    await this.notificationService.create({
      recipientUserId,
      type: "CONTENT_STATUS_CHANGED",
      title: "Content status changed",
      message: `${item.topic ?? item.id} moved to ${item.status}`,
      entityType: "Content",
      entityId: item.id,
      link: "/content/items",
    });
  }
}
