import { createId } from "@/lib/ids";
import type { ContentRepository } from "@/repositories/interfaces/content";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import { contentColumns, sheetNames } from "@/repositories/google-sheets/schema";
import { filterPage, now } from "@/repositories/google-sheets/record-utils";
import type { Actor, ContentItem, ContentStatus } from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

function contentStatus(value: unknown): ContentStatus {
  const status = String(value || "IDEA");
  if (
    status === "SCRIPT" ||
    status === "SHOOT" ||
    status === "EDITING" ||
    status === "INTERNAL_REVIEW" ||
    status === "CLIENT_REVIEW" ||
    status === "REVISION" ||
    status === "APPROVED" ||
    status === "SCHEDULED" ||
    status === "PUBLISHED" ||
    status === "IDEA"
  ) {
    return status;
  }
  return "IDEA";
}

function asContent(row: ContentItem & Record<string, unknown>): ContentItem {
  return { ...row, status: contentStatus(row.status) };
}

function canSeeAllContent(actor: Actor) {
  return actor.role === "FOUNDER_ADMIN" || actor.role === "OPERATIONS_HEAD" || actor.role === "VIDEO_DESIGN_HEAD";
}

function contentScope(rows: ContentItem[], actor: Actor) {
  if (canSeeAllContent(actor)) return rows;
  return rows.filter((item) =>
    [item.writerId, item.designerId, item.editorId, item.reviewerId, item.createdBy].includes(
      actor.id,
    ),
  );
}

export class GoogleSheetsContentRepository implements ContentRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return contentScope(await this.all(), actor).find((item) => item.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<ContentItem>> {
    const rows = contentScope(await this.all(), actor);
    return filterPage(
      rows,
      query,
      (item) => [
        item.topic ?? "",
        item.clientId,
        item.platform ?? "",
        item.contentType ?? "",
        item.status,
        item.editorId ?? "",
        item.reviewerId ?? "",
      ],
      (item, key, values) => {
        if (key === "status") return values.includes(item.status);
        if (key === "clientId") return values.includes(item.clientId);
        return true;
      },
    );
  }

  async create(input: Partial<ContentItem>, actor: Actor) {
    const timestamp = now();
    const item: ContentItem = {
      id: input.id ?? createId("content"),
      clientId: input.clientId ?? "",
      accountId: input.accountId,
      platform: input.platform,
      contentType: input.contentType,
      topic: input.topic,
      pillar: input.pillar,
      writerId: input.writerId,
      designerId: input.designerId,
      editorId: input.editorId,
      reviewerId: input.reviewerId,
      publishDate: input.publishDate,
      driveFileId: input.driveFileId,
      driveFileUrl: input.driveFileUrl,
      version: input.version ?? "1",
      status: input.status ?? "IDEA",
      revisionNotes: input.revisionNotes,
      approvalNotes: input.approvalNotes,
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.content, contentColumns, item);
    return item;
  }

  async update(id: string, input: Partial<ContentItem>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Content item not found");
    const item: ContentItem = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.content, contentColumns, item);
    return item;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.content, contentColumns)).map(asContent);
  }
}
