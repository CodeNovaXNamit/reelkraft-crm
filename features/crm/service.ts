import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import { ClientConversionService } from "@/services/client-conversion-service";
import { ClientService, LeadService, PipelineService } from "@/services/crm-service";
import { NotificationService } from "@/services/notification-service";

export function createCrmServices() {
  const repositories = createRepositoryContext();
  const audit = new AuditService(repositories.auditLogs);
  const notifications = new NotificationService(repositories.notifications);

  return {
    repositories,
    audit,
    leads: new LeadService(repositories.leads, repositories.deals, audit),
    pipeline: new PipelineService(
      repositories.leads,
      repositories.deals,
      repositories.pipelineMovements,
      audit,
    ),
    clients: new ClientService(repositories.clients),
    conversion: new ClientConversionService(
      repositories.leads,
      repositories.deals,
      repositories.clients,
      repositories.projects,
      repositories.tasks,
      audit,
      notifications,
    ),
  };
}
