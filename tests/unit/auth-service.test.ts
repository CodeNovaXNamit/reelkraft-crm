import { describe, expect, it } from "vitest";
import { assertWorkspaceEmail } from "@/services/auth-service";

describe("Google Workspace auth rules", () => {
  it("accepts verified Reelkraft Workspace email", () => {
    expect(assertWorkspaceEmail("Shivam@ReelkraftMedia.Online", true)).toBe(
      "shivam@reelkraftmedia.online",
    );
  });

  it("rejects unverified Google email", () => {
    expect(() => assertWorkspaceEmail("shivam@reelkraftmedia.online", false)).toThrow(
      "verified Reelkraft",
    );
  });

  it("rejects non-Reelkraft domains", () => {
    expect(() => assertWorkspaceEmail("person@example.com", true)).toThrow(
      "verified Reelkraft",
    );
  });
});
