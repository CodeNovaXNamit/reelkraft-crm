"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/current-user";
import {
  createProjectSchema,
  createTaskSchema,
  updateProjectSchema,
  updateTaskSchema,
} from "@/lib/validation/operations";
import { createOperationsServices } from "@/features/operations/service";

export async function createProjectAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createProjectSchema.parse(Object.fromEntries(formData));
  const { projects } = createOperationsServices();
  await projects.create(input, actor);
  revalidatePath("/operations/projects");
  revalidatePath("/operations/workload");
}

export async function updateProjectAction(formData: FormData) {
  const actor = await getCurrentActor();
  const projectId = String(formData.get("projectId") ?? "");
  const input = updateProjectSchema.parse(Object.fromEntries(formData));
  const { projects } = createOperationsServices();
  await projects.update(projectId, input, actor);
  revalidatePath("/operations/projects");
  revalidatePath("/operations/workload");
}

export async function createTaskAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createTaskSchema.parse(Object.fromEntries(formData));
  const { tasks } = createOperationsServices();
  await tasks.create(input, actor);
  revalidatePath("/operations/tasks");
  revalidatePath("/operations/workload");
  revalidatePath("/notifications");
}

export async function updateTaskAction(formData: FormData) {
  const actor = await getCurrentActor();
  const taskId = String(formData.get("taskId") ?? "");
  const input = updateTaskSchema.parse(Object.fromEntries(formData));
  const { tasks } = createOperationsServices();
  await tasks.update(taskId, input, actor);
  revalidatePath("/operations/tasks");
  revalidatePath("/operations/workload");
  revalidatePath("/notifications");
}
