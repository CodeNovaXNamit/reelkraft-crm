import { ApplicationError } from "@/lib/errors/application-error";
import { assertPermission } from "@/lib/permissions/authorize";
import { isTaskOverdue } from "@/lib/dates/business-time";
import type {
  CreateProjectInput,
  CreateTaskInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "@/lib/validation/operations";
import type { ClientRepository } from "@/repositories/interfaces/crm";
import type {
  NotificationRepository,
  ProjectRepository,
  TaskRepository,
} from "@/repositories/interfaces/operations";
import type { EmployeeRepository } from "@/repositories/interfaces/team";
import type { AuditService } from "@/services/audit-service";
import { NotificationService } from "@/services/notification-service";
import type { Actor, Project, Task, TaskStatus } from "@/types/domain";
import type { PageQuery } from "@/types/pagination";

const taskTransitionTargets: Record<TaskStatus, TaskStatus[]> = {
  TO_DO: ["IN_PROGRESS", "BLOCKED"],
  IN_PROGRESS: ["REVIEW", "BLOCKED"],
  REVIEW: ["REVISION", "APPROVED", "BLOCKED"],
  REVISION: ["IN_PROGRESS", "REVIEW", "BLOCKED"],
  APPROVED: ["COMPLETED", "REVISION"],
  COMPLETED: [],
  BLOCKED: ["TO_DO", "IN_PROGRESS"],
};

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

function uniqueMembers(members: string[], ownerId: string) {
  return Array.from(new Set([ownerId, ...members].filter(Boolean)));
}

function canAssignTo(actor: Actor, targetId: string | undefined) {
  if (!targetId || targetId === actor.id) {
    return true;
  }
  return (
    actor.role === "FOUNDER_ADMIN" ||
    actor.role === "OPERATIONS_HEAD" ||
    actor.role === "HR_ACCOUNT_MANAGER" ||
    actor.role === "VIDEO_DESIGN_HEAD"
  );
}

function assertValidTaskTransition(existing: Task, nextStatus?: TaskStatus) {
  if (!nextStatus || existing.status === nextStatus) {
    return;
  }
  if (!taskTransitionTargets[existing.status].includes(nextStatus)) {
    throw new ApplicationError(
      "VALIDATION_ERROR",
      `Task cannot move from ${existing.status} to ${nextStatus}.`,
    );
  }
}

export class ProjectService {
  constructor(
    private readonly clients: ClientRepository,
    private readonly projects: ProjectRepository,
    private readonly audit: AuditService,
  ) {}

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "projects", "view");
    return this.projects.list(query, actor);
  }

  async create(input: CreateProjectInput, actor: Actor) {
    assertPermission(actor, "projects", "create");
    const normalized = compactOptional(input);
    const ownerId = normalized.ownerId || actor.id;
    if (!canAssignTo(actor, ownerId)) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "You cannot assign this project owner.");
    }
    const client = await this.clients.findById(normalized.clientId, actor);
    if (!client) {
      throw new ApplicationError("NOT_FOUND", "Client not found.");
    }
    const project = await this.projects.create(
      {
        ...normalized,
        ownerId,
        teamMemberIds: uniqueMembers(normalized.teamMemberIds ?? [], ownerId),
      },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "project_created",
      entityType: "Project",
      entityId: project.id,
      newValue: project,
    });
    return project;
  }

  async update(id: string, input: UpdateProjectInput, actor: Actor) {
    assertPermission(actor, "projects", "edit");
    const existing = await this.projects.findById(id, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Project not found.");
    }
    const normalized = compactOptional(input);
    if (normalized.ownerId && !canAssignTo(actor, normalized.ownerId)) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "You cannot assign this project owner.");
    }
    const ownerId = normalized.ownerId ?? existing.ownerId;
    const project = await this.projects.update(
      id,
      {
        ...normalized,
        ownerId,
        teamMemberIds: normalized.teamMemberIds
          ? uniqueMembers(normalized.teamMemberIds, ownerId)
          : existing.teamMemberIds,
      },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "project_updated",
      entityType: "Project",
      entityId: project.id,
      oldValue: existing,
      newValue: project,
    });
    return project;
  }
}

export class TaskService {
  private readonly notificationService: NotificationService;

  constructor(
    private readonly tasks: TaskRepository,
    private readonly audit: AuditService,
    notifications: NotificationRepository,
  ) {
    this.notificationService = new NotificationService(notifications);
  }

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "tasks", "view");
    return this.tasks.list(query, actor);
  }

  async create(input: CreateTaskInput, actor: Actor) {
    assertPermission(actor, "tasks", "create");
    const normalized = compactOptional(input);
    const assignedToId = normalized.assignedToId || actor.id;
    if (!canAssignTo(actor, assignedToId)) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "You cannot assign tasks to that employee.");
    }
    const task = await this.tasks.create(
      {
        ...normalized,
        assignedToId,
        status: normalized.status ?? "TO_DO",
      },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "task_created",
      entityType: "Task",
      entityId: task.id,
      newValue: task,
    });
    await this.createTaskNotification(task, "TASK_ASSIGNED", "Task assigned");
    return task;
  }

  async update(id: string, input: UpdateTaskInput, actor: Actor) {
    assertPermission(actor, "tasks", "edit");
    const existing = await this.tasks.findById(id, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Task not found.");
    }
    const normalized = compactOptional(input);
    if (normalized.assignedToId && !canAssignTo(actor, normalized.assignedToId)) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "You cannot reassign this task.");
    }
    assertValidTaskTransition(existing, normalized.status);
    const task = await this.tasks.update(id, normalized, actor);
    await this.audit.appendAccessEvent({
      actor,
      action: existing.status !== task.status ? "task_status_changed" : "task_updated",
      entityType: "Task",
      entityId: task.id,
      oldValue: existing,
      newValue: task,
    });
    if (normalized.assignedToId && normalized.assignedToId !== existing.assignedToId) {
      await this.createTaskNotification(task, "TASK_REASSIGNED", "Task reassigned");
    }
    return task;
  }

  private createTaskNotification(task: Task, type: string, title: string) {
    return this.notificationService.create({
      recipientUserId: task.assignedToId,
      type,
      title,
      message: task.title,
      entityType: "Task",
      entityId: task.id,
      link: `/operations/tasks?search=${encodeURIComponent(task.id)}`,
    });
  }
}

export class WorkloadService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly projects: ProjectRepository,
    private readonly tasks: TaskRepository,
  ) {}

  async list(actor: Actor, today = new Date()) {
    assertPermission(actor, "tasks", "view");
    const employees = await this.employees.list({ pageSize: 100 }, actor);
    const projects = await this.projects.list({ pageSize: 100 }, actor);
    const tasks = await this.tasks.list({ pageSize: 100 }, actor);

    return employees.items
      .filter((employee) => employee.status === "ACTIVE")
      .filter((employee) => actor.role === "FOUNDER_ADMIN" || actor.role === "OPERATIONS_HEAD" || employee.id === actor.id)
      .map((employee) => {
        const employeeTasks = tasks.items.filter(
          (task) => task.assignedToId === employee.id && task.status !== "COMPLETED",
        );
        const activeProjects = projects.items.filter(
          (project: Project) =>
            project.ownerId === employee.id ||
            project.teamMemberIds.includes(employee.id),
        );
        const overdueTasks = employeeTasks.filter((task) => isTaskOverdue(task, today));
        const dueThisWeek = employeeTasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(`${task.dueDate}T00:00:00`);
          const end = new Date(today);
          end.setDate(end.getDate() + 7);
          return dueDate >= today && dueDate <= end;
        });

        return {
          employee,
          activeTaskCount: employeeTasks.length,
          overdueTaskCount: overdueTasks.length,
          dueThisWeekTaskCount: dueThisWeek.length,
          activeProjectCount: activeProjects.length,
          priorityDistribution: employeeTasks.reduce(
            (totals, task) => ({
              ...totals,
              [task.priority]: totals[task.priority] + 1,
            }),
            { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 },
          ),
        };
      });
  }
}
