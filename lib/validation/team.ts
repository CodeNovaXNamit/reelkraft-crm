import { z } from "zod";
import { roles } from "@/types/domain";

export const roleSchema = z.enum(roles);

export const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((email) => email.toLowerCase());

export const createInvitationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema.refine((email) => email.endsWith("@reelkraftmedia.online"), {
    message: "Only Reelkraft Workspace accounts can be invited.",
  }),
  role: roleSchema,
  department: z.string().trim().max(80).optional().or(z.literal("")),
  managerId: z.string().trim().max(80).optional().or(z.literal("")),
  accessLevel: z.string().trim().max(80).optional().or(z.literal("")),
  expiresAt: z.string().trim().optional().or(z.literal("")),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const updateEmployeeAccessSchema = z.object({
  role: roleSchema.optional(),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  managerId: z.string().trim().max(80).optional().or(z.literal("")),
  accessLevel: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type UpdateEmployeeAccessInput = z.infer<typeof updateEmployeeAccessSchema>;
