import { z } from "zod";
import { contentStatuses } from "@/types/domain";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));
const optionalDate = z.string().trim().optional().or(z.literal(""));

export const contentStatusSchema = z.enum(contentStatuses);

export const createContentSchema = z.object({
  clientId: z.string().trim().min(1),
  accountId: optionalText,
  platform: optionalText,
  contentType: optionalText,
  topic: z.string().trim().min(2).max(180),
  pillar: optionalText,
  writerId: optionalText,
  designerId: optionalText,
  editorId: optionalText,
  reviewerId: optionalText,
  publishDate: optionalDate,
  driveFileId: optionalText,
  driveFileUrl: optionalText,
  version: z.string().trim().max(40).optional().or(z.literal("")),
  revisionNotes: optionalText,
  approvalNotes: optionalText,
  status: contentStatusSchema.default("IDEA"),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = createContentSchema.partial();

export type UpdateContentInput = z.infer<typeof updateContentSchema>;

export const moveContentStatusSchema = z.object({
  contentId: z.string().trim().min(1),
  status: contentStatusSchema,
  notes: optionalText,
});

export type MoveContentStatusInput = z.infer<typeof moveContentStatusSchema>;
