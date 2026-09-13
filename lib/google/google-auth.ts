import { google } from "googleapis";
import { ApplicationError } from "@/lib/errors/application-error";

const scopes = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new ApplicationError(
      "INTEGRATION_ERROR",
      `${name} is required for Google Workspace integration.`,
    );
  }

  return value;
}

export function createGoogleAuthClient() {
  const key = requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key,
    scopes,
    subject: process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL || undefined,
  });
}

export function createSheetsApi() {
  return google.sheets({ version: "v4", auth: createGoogleAuthClient() });
}

export function createDriveApi() {
  return google.drive({ version: "v3", auth: createGoogleAuthClient() });
}
