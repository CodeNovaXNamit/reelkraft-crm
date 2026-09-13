import { createId } from "@/lib/ids";
import type {
  NotificationRepository,
  ProjectRepository,
  TaskRepository,
} from "@/repositories/interfaces/operations";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import {
  notificationColumns,
  projectColumns,
  sheetNames,
  taskColumns,
} from "@/repositories/google-sheets/schema";
import {
  canSeeAllOperations,
  csvToArray,
  filterPage,
  now,
  numberOrUndefined,
} from "@/repositories/google-sheets/record-utils";
import type { Actor, Notification, Priority, Project, ProjectHealth, Task, TaskStatus } from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

function priority(value: unknown): Priority {
  const normalized = String(value || "MEDIUM");
  return normalized === "LOW" ||
    normalized === "HIGH" ||
    normalized === "URGENT" ||
    normalized === "MEDIUM"
    ? normalized
    : "MEDIUM";
}

function taskStatus(value: unknown): TaskStatus {
  const normalized = String(value || "TO_DO");
  return normalized === "IN_PROGRESS" ||
    normalized === "REVIEW" ||
    normalized === "REVISION" ||
    normalized === "APPROVED" ||
    normalized === "COMPLETED" ||
    normalized === "BLOCKED" ||
    normalized === "TO_DO"
    ? normalized
    : "TO_DO";
}

function projectHealth(value: unknown): ProjectHealth {
  const normalized = String(value || "ON_TRACK");
  return normalized === "AT_RISK" || normalized === "BLOCKED"
    ? normalized
    : "ON_TRACK";
}

function asProject(row: Project & Record<string, unknown>): Project {
  return {
    ...row,
    teamMemberIds: Array.isArray(row.teamMemberIds)
      ? row.teamMemberIds
      : csvToArray(row.teamMemberIds),
    priority: priority(row.priority),
    budget: numberOrUndefined(row.budget),
    health: projectHealth(row.health),
  };
}

function asTask(row: Task & Record<string, unknown>): Task {
  return {
    ...row,
    priority: priority(row.priority),
    status: taskStatus(row.status),
    estimatedTime: numberOrUndefined(row.estimatedTime),
    actualTime: numberOrUndefined(row.actualTime),
  };
}

function asNotification(row: Notification & Record<string, unknown>): Notification {
  const deliveryStatus =
    row.deliveryStatus === "SENT" || row.deliveryStatus === "FAILED"
      ? row.deliveryStatus
      : "PENDING";
  return { ...row, deliveryStatus };
}

function projectScope(rows: Project[], actor: Actor) {
  if (canSeeAllOperations(actor)) {
    return rows;
  }
  return rows.filter(
    (project) =>
      project.ownerId === actor.id ||
      project.teamMemberIds.includes(actor.id) ||
      project.createdBy === actor.id,
  );
}

function taskScope(rows: Task[], actor: Actor) {
  if (canSeeAllOperations(actor)) {
    return rows;
  }
  return rows.filter(
    (task) => task.assignedToId === actor.id || task.createdBy === actor.id,
  );
}

export class GoogleSheetsProjectRepository implements ProjectRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return projectScope(await this.all(), actor).find((project) => project.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Project>> {
    const projects = projectScope(await this.all(), actor);
    return filterPage(
      projects,
      query,
      (project) => [
        project.projectName,
        project.clientId,
        project.ownerId,
        project.status,
        project.priority,
        project.health,
      ],
      (project, key, values) => {
        if (key === "ownerId") return values.includes(project.ownerId);
        if (key === "clientId") return values.includes(project.clientId);
        if (key === "status") return values.includes(project.status);
        if (key === "health") return values.includes(project.health);
        return true;
      },
    );
  }

  async create(input: Partial<Project>, actor: Actor) {
    const timestamp = now();
    const project: Project = {
      id: input.id ?? createId("project"),
      clientId: input.clientId ?? "",
      projectName: input.projectName ?? "",
      type: input.type,
      ownerId: input.ownerId ?? actor.id,
      teamMemberIds: input.teamMemberIds ?? [],
      startDate: input.startDate,
      dueDate: input.dueDate,
      status: input.status ?? "ACTIVE",
      priority: input.priority ?? "MEDIUM",
      budget: input.budget,
      health: input.health ?? "ON_TRACK",
      description: input.description,
      driveLink: input.driveLink,
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.projects, projectColumns, project);
    return project;
  }

  async update(id: string, input: Partial<Project>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) {
      throw new Error("Project not found");
    }
    const project: Project = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.projects, projectColumns, project);
    return project;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.projects, projectColumns)).map(asProject);
  }
}

export class GoogleSheetsTaskRepository implements TaskRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return taskScope(await this.all(), actor).find((task) => task.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Task>> {
    const tasks = taskScope(await this.all(), actor);
    return filterPage(
      tasks,
      query,
      (task) => [
        task.title,
        task.assignedToId,
        task.clientId ?? "",
        task.projectId ?? "",
        task.status,
        task.priority,
      ],
      (task, key, values) => {
        if (key === "assignedToId") return values.includes(task.assignedToId);
        if (key === "clientId") return task.clientId ? values.includes(task.clientId) : false;
        if (key === "projectId") return task.projectId ? values.includes(task.projectId) : false;
        if (key === "status") return values.includes(task.status);
        return true;
      },
    );
  }

  async create(input: Partial<Task>, actor: Actor) {
    const timestamp = now();
    const task: Task = {
      id: input.id ?? createId("task"),
      title: input.title ?? "",
      description: input.description,
      clientId: input.clientId,
      projectId: input.projectId,
      assignedToId: input.assignedToId ?? actor.id,
      createdBy: actor.id,
      priority: input.priority ?? "MEDIUM",
      status: input.status ?? "TO_DO",
      startDate: input.startDate,
      dueDate: input.dueDate,
      estimatedTime: input.estimatedTime,
      actualTime: input.actualTime,
      driveLink: input.driveLink,
      comments: input.comments,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.tasks, taskColumns, task);
    return task;
  }

  async update(id: string, input: Partial<Task>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) {
      throw new Error("Task not found");
    }
    const task: Task = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.tasks, taskColumns, task);
    return task;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.tasks, taskColumns)).map(asTask);
  }
}

export class GoogleSheetsNotificationRepository implements NotificationRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async create(input: Omit<Notification, "id" | "createdAt" | "deliveryStatus">) {
    const notification: Notification = {
      ...input,
      id: createId("ntf"),
      createdAt: now(),
      deliveryStatus: "PENDING",
    };
    await this.client.appendEntity(
      sheetNames.notifications,
      notificationColumns,
      notification,
    );
    return notification;
  }

  async listForRecipient(recipientUserId: string) {
    const rows = await this.all();
    return rows
      .filter((notification) => notification.recipientUserId === recipientUserId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async markRead(id: string, recipientUserId: string) {
    const notification = (await this.all()).find(
      (row) => row.id === id && row.recipientUserId === recipientUserId,
    );
    if (!notification) {
      throw new Error("Notification not found");
    }
    const updated: Notification = { ...notification, readAt: now() };
    await this.client.updateEntityById(
      sheetNames.notifications,
      notificationColumns,
      updated,
    );
    return updated;
  }

  private async all() {
    return (await this.client.listRows(
      sheetNames.notifications,
      notificationColumns,
    )).map(asNotification);
  }
}
