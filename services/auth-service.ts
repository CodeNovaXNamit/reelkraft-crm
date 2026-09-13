import { ApplicationError } from "@/lib/errors/application-error";
import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import { TeamService } from "@/services/team-service";
import type { Employee } from "@/types/domain";

export function assertWorkspaceEmail(email: string, verified: boolean) {
  const normalized = email.toLowerCase();
  if (!verified || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ApplicationError(
      "AUTHORIZATION_ERROR",
      "Use a verified Google account.",
    );
  }

  return normalized;
}

export async function resolveGoogleWorkspaceSignIn(input: {
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
}): Promise<Employee> {
  const email = assertWorkspaceEmail(input.email, input.emailVerified);
  const repositories = createRepositoryContext();
  const teamService = new TeamService(
    repositories.employees,
    repositories.invitations,
    new AuditService(repositories.auditLogs),
  );

  return teamService.acceptInvitationForGoogleAccount({
    email,
    name: input.name,
    avatarUrl: input.image,
  });
}

export async function findActiveEmployeeByEmail(email: string) {
  const repositories = createRepositoryContext();
  const employee = await repositories.employees.findByEmail(email);

  if (!employee || employee.status !== "ACTIVE") {
    return null;
  }

  return employee;
}
