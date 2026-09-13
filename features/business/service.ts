import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import {
  CalendarService,
  ClientHealthService,
  FinanceService,
  HrService,
  ReportService,
} from "@/services/business-service";
import { IntegrationService } from "@/services/integration-service";

export function createBusinessServices() {
  const repositories = createRepositoryContext();
  const audit = new AuditService(repositories.auditLogs);

  return {
    repositories,
    audit,
    calendar: new CalendarService(repositories.meetings, audit),
    clientHealth: new ClientHealthService(repositories.clients, audit),
    finance: new FinanceService(
      repositories.clients,
      repositories.finance,
      repositories.payments,
      audit,
    ),
    hr: new HrService(repositories.employees),
    reports: new ReportService(
      repositories.leads,
      repositories.deals,
      repositories.clients,
      repositories.projects,
      repositories.tasks,
      repositories.content,
      repositories.finance,
    ),
    integrations: new IntegrationService(audit),
  };
}
