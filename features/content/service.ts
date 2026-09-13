import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import { ContentService } from "@/services/content-service";

export function createContentServices() {
  const repositories = createRepositoryContext();
  const audit = new AuditService(repositories.auditLogs);

  return {
    repositories,
    audit,
    content: new ContentService(
      repositories.clients,
      repositories.content,
      audit,
      repositories.notifications,
    ),
  };
}
