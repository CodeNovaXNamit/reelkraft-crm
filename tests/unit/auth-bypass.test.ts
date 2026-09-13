import { afterEach, describe, expect, it, vi } from "vitest";
import { getBypassActor, isAuthBypassEnabled } from "@/lib/auth/testing-bypass";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
});

describe("testing auth bypass", () => {
  it("enables bypass only outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("REELKRAFT_AUTH_BYPASS", "true");
    expect(isAuthBypassEnabled()).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    expect(isAuthBypassEnabled()).toBe(false);
  });

  it("uses a founder admin actor by default", () => {
    vi.stubEnv("REELKRAFT_AUTH_BYPASS_EMAIL", "tester@reelkraftmedia.online");
    const actor = getBypassActor();

    expect(actor).toMatchObject({
      email: "tester@reelkraftmedia.online",
      role: "FOUNDER_ADMIN",
      status: "ACTIVE",
    });
  });
});
