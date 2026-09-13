import { getCurrentActor } from "@/lib/auth/current-user";
import { createOperationsServices } from "@/features/operations/service";
import type { PageQuery } from "@/types/pagination";

export async function getProjectData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { projects } = createOperationsServices();
  return projects.list(query, actor);
}

export async function getTaskData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { tasks } = createOperationsServices();
  return tasks.list(query, actor);
}

export async function getWorkloadData() {
  const actor = await getCurrentActor();
  const { workload } = createOperationsServices();
  return workload.list(actor);
}

export async function getMyNotifications() {
  const actor = await getCurrentActor();
  const { notifications } = createOperationsServices();
  return notifications.listForRecipient(actor.id);
}
