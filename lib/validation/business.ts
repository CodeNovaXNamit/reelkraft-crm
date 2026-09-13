import { z } from "zod";
import { clientHealthValues } from "@/types/domain";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));
const optionalDate = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const createFinanceSchema = z.object({
  clientId: z.string().trim().min(1),
  invoiceNumber: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive(),
  dueDate: optionalDate,
  notes: optionalText,
});

export type CreateFinanceInput = z.infer<typeof createFinanceSchema>;

export const recordPaymentSchema = z.object({
  financeId: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  paidAt: optionalDate,
  method: optionalText,
  notes: optionalText,
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(180),
  type: z
    .enum([
      "CLIENT_MEETING",
      "DISCOVERY_CALL",
      "SHOOT",
      "INTERNAL_REVIEW",
      "CONTENT_DEADLINE",
      "APPROVAL_MEETING",
      "OTHER",
    ])
    .default("OTHER"),
  clientId: optionalText,
  projectId: optionalText,
  taskId: optionalText,
  startAt: z.string().trim().min(1),
  endAt: z.string().trim().min(1),
  attendees: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    ),
  googleCalendarEventId: optionalText,
  meetingUrl: optionalText,
  notes: optionalText,
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const updateClientHealthSchema = z.object({
  clientId: z.string().trim().min(1),
  health: z.enum(clientHealthValues),
  renewalDate: optionalDate,
  recurringValue: optionalNumber,
});

export type UpdateClientHealthInput = z.infer<typeof updateClientHealthSchema>;
