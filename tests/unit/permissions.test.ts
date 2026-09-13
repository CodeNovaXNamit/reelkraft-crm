import { describe, expect, it } from "vitest";
import { assertPermission } from "@/lib/permissions/authorize";
import { hasPermission } from "@/lib/permissions/roles";
import type { Actor } from "@/types/domain";

const activeEmployee: Actor = {
  id: "emp_test",
  email: "employee@reelkraftmedia.online",
  role: "EMPLOYEE",
  status: "ACTIVE",
};

describe("RBAC foundation", () => {
  it("grants founder admin every finance action", () => {
    expect(hasPermission("FOUNDER_ADMIN", "finance", "delete")).toBe(true);
  });

  it("prevents base employees from viewing restricted finance records", () => {
    expect(hasPermission("EMPLOYEE", "finance", "view")).toBe(false);
  });

  it("rejects deactivated actors before permission checks", () => {
    expect(() =>
      assertPermission({ ...activeEmployee, status: "INACTIVE" }, "tasks", "view"),
    ).toThrow("deactivated");
  });
});
