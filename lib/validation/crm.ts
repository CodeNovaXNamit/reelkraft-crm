import { z } from "zod";
import { pipelineStages } from "@/types/domain";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalDate = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const pipelineStageSchema = z.enum(pipelineStages);

export const createLeadSchema = z.object({
  company: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: optionalText,
  website: optionalText,
  industry: optionalText,
  source: optionalText,
  serviceInterested: optionalText,
  dealValue: optionalNumber,
  ownerId: z.string().trim().min(1).optional().or(z.literal("")),
  probability: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().min(0).max(100).optional(),
  ),
  expectedCloseDate: optionalDate,
  lastContact: optionalDate,
  nextAction: optionalText,
  notes: optionalText,
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial().extend({
  stage: pipelineStageSchema.optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const moveDealStageSchema = z.object({
  dealId: z.string().trim().min(1),
  newStage: pipelineStageSchema,
  reason: z.string().trim().min(2).max(500),
  notes: optionalText,
  nextAction: optionalText,
  lostReason: optionalText,
});

export type MoveDealStageInput = z.infer<typeof moveDealStageSchema>;

export const convertDealSchema = z.object({
  dealId: z.string().trim().min(1),
  accountManagerId: z.string().trim().min(1).optional().or(z.literal("")),
  recurringValue: optionalNumber,
  renewalDate: optionalDate,
});

export type ConvertDealInput = z.infer<typeof convertDealSchema>;
