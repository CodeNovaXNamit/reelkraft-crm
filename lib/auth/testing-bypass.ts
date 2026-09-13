import { roles, type Actor, type Role } from "@/types/domain";

function isRole(value: string | undefined): value is Role {
  return roles.includes(value as Role);
}

export function isAuthBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.REELKRAFT_AUTH_BYPASS === "true"
  );
}

export function getBypassActor(): Actor {
  const role = process.env.REELKRAFT_AUTH_BYPASS_ROLE;

  return {
    id: process.env.REELKRAFT_AUTH_BYPASS_EMPLOYEE_ID || "emp_testing_admin",
    email:
      process.env.REELKRAFT_AUTH_BYPASS_EMAIL ||
      "testing.admin@reelkraftmedia.online",
    role: isRole(role) ? role : "FOUNDER_ADMIN",
    status: "ACTIVE",
  };
}
