import { z } from "zod";
import { priorityLevels, projectHealthValues, taskStatuses } from "@/types/domain";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));
const optionalDate = z.string().trim().optional().or(z.literal(""));
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const prioritySchema = z.enum(priorityLevels);
export const taskStatusSchema = z.enum(taskStatuses);
export const projectHealthSchema = z.enum(projectHealthValues);

export const createProjectSchema = z.object({
  clientId: z.string().trim().min(1),
  projectName: z.string().trim().min(2).max(160),
  type: optionalText,
  ownerId: z.string().trim().min(1).optional().or(z.literal("")),
  teamMemberIds: z
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
  startDate: optionalDate,
  dueDate: optionalDate,
  status: z.string().trim().min(1).max(80).default("ACTIVE"),
  priority: prioritySchema.default("MEDIUM"),
  budget: optionalNumber,
  health: projectHealthSchema.default("ON_TRACK"),
  description: optionalText,
  driveLink: optionalText,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: optionalText,
  clientId: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().optional().or(z.literal("")),
  assignedToId: z.string().trim().min(1).optional().or(z.literal("")),
  priority: prioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TO_DO"),
  startDate: optionalDate,
  dueDate: optionalDate,
  estimatedTime: optionalNumber,
  actualTime: optionalNumber,
  driveLink: optionalText,
  comments: optionalText,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
