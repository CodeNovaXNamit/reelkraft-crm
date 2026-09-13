import type { WriteRepository } from "@/repositories/interfaces/base";
import type { Notification, Project, Task } from "@/types/domain";

export type ProjectRepository = WriteRepository<Project, Partial<Project>, Partial<Project>>;

export type TaskRepository = WriteRepository<Task, Partial<Task>, Partial<Task>>;

export interface NotificationRepository {
  create(input: Omit<Notification, "id" | "createdAt" | "deliveryStatus">): Promise<Notification>;
  listForRecipient(recipientUserId: string): Promise<Notification[]>;
  markRead(id: string, recipientUserId: string): Promise<Notification>;
}
