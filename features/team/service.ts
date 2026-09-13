import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import { DriveService } from "@/services/drive-service";
import { SchemaService } from "@/services/schema-service";
import { TeamService } from "@/services/team-service";

export function createTeamServices() {
  const repositories = createRepositoryContext();
  const audit = new AuditService(repositories.auditLogs);

  return {
    repositories,
    audit,
    team: new TeamService(repositories.employees, repositories.invitations, audit),
    drive: new DriveService(repositories.drive),
    schema: new SchemaService(repositories.sheetsClient),
  };
}
