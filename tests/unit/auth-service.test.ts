import { describe, expect, it } from "vitest";
import { assertWorkspaceEmail } from "@/services/auth-service";

describe("Google auth rules", () => {
  it("accepts any verified Google email", () => {
    expect(assertWorkspaceEmail("User@Example.com", true)).toBe("user@example.com");
  });

  it("rejects unverified Google email", () => {
    expect(() => assertWorkspaceEmail("shivam@reelkraftmedia.online", false)).toThrow(
      "verified Google",
    );
  });

  it("rejects values without an email address", () => {
    expect(() => assertWorkspaceEmail("person", true)).toThrow("verified Google");
  });
});
