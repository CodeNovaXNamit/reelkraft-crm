import { ApplicationError } from "@/lib/errors/application-error";
import { getCurrentActor } from "@/lib/auth/current-user";
import { createTeamServices } from "@/features/team/service";
import type { PageQuery } from "@/types/pagination";

export async function getEmployeeAdminData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { team } = createTeamServices();
  return team.listEmployees(query, actor);
}

export async function getInvitationAdminData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { team } = createTeamServices();
  return team.listInvitations(query, actor);
}

export async function getDriveAdminStatus() {
  const actor = await getCurrentActor();
  const { drive } = createTeamServices();
  return drive.getSharedDriveStatus(actor);
}

export async function getRecentAuditLogs() {
  const actor = await getCurrentActor();
  if (actor.role !== "FOUNDER_ADMIN" && actor.role !== "OPERATIONS_HEAD") {
    throw new ApplicationError("AUTHORIZATION_ERROR", "Audit logs are restricted.");
  }
  const { repositories } = createTeamServices();
  return repositories.auditLogs.listRecent(50);
}
