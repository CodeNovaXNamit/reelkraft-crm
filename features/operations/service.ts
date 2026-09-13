import { createRepositoryContext } from "@/repositories/factory";
import { AuditService } from "@/services/audit-service";
import { NotificationService } from "@/services/notification-service";
import { ProjectService, TaskService, WorkloadService } from "@/services/operations-service";

export function createOperationsServices() {
  const repositories = createRepositoryContext();
  const audit = new AuditService(repositories.auditLogs);

  return {
    repositories,
    audit,
    projects: new ProjectService(repositories.clients, repositories.projects, audit),
    tasks: new TaskService(repositories.tasks, audit, repositories.notifications),
    workload: new WorkloadService(
      repositories.employees,
      repositories.projects,
      repositories.tasks,
    ),
    notifications: new NotificationService(repositories.notifications),
  };
}
