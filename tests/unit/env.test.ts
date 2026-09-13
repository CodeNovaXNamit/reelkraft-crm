import { describe, expect, it } from "vitest";
import { validatePhaseOneEnv } from "@/lib/validation/env";

describe("Phase 1 environment validation", () => {
  it("reports missing Google/Auth configuration", () => {
    const result = validatePhaseOneEnv({ NODE_ENV: "test" });
    expect(result.success).toBe(false);
  });

  it("accepts complete Phase 1 configuration shape", () => {
    const result = validatePhaseOneEnv({
      AUTH_SECRET: "12345678901234567890123456789012",
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-client-secret",
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "service@project.iam.gserviceaccount.com",
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "private-key",
      GOOGLE_SHEETS_DATABASE_ID: "sheet-id",
      GOOGLE_SHARED_DRIVE_ID: "drive-id",
      NODE_ENV: "test",
    });

    expect(result.success).toBe(true);
  });
});
