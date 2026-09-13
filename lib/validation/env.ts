import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

export const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  AUTH_URL: optionalUrl,
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional().or(z.literal("")),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_DATABASE_ID: z.string().optional(),
  GOOGLE_SHARED_DRIVE_ID: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_SIGNING_SECRET: z.string().optional(),
  REELKRAFT_AUTH_BYPASS: z.enum(["true", "false"]).optional(),
  REELKRAFT_AUTH_BYPASS_EMAIL: z.string().email().optional(),
  REELKRAFT_AUTH_BYPASS_EMPLOYEE_ID: z.string().optional(),
  REELKRAFT_AUTH_BYPASS_ROLE: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateServerEnv(env: NodeJS.ProcessEnv) {
  return serverEnvSchema.safeParse(env);
}

export const phaseOneEnvSchema = serverEnvSchema.extend({
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SHEETS_DATABASE_ID: z.string().min(1),
  GOOGLE_SHARED_DRIVE_ID: z.string().min(1),
});

export function validatePhaseOneEnv(env: NodeJS.ProcessEnv) {
  return phaseOneEnvSchema.safeParse(env);
}
