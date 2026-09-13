"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/current-user";
import {
  createContentSchema,
  moveContentStatusSchema,
  updateContentSchema,
} from "@/lib/validation/content";
import { createContentServices } from "@/features/content/service";

export async function createContentAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createContentSchema.parse(Object.fromEntries(formData));
  const { content } = createContentServices();
  await content.create(input, actor);
  revalidatePath("/content/items");
  revalidatePath("/content/calendar");
  revalidatePath("/content/approvals");
}

export async function updateContentAction(formData: FormData) {
  const actor = await getCurrentActor();
  const contentId = String(formData.get("contentId") ?? "");
  const input = updateContentSchema.parse(Object.fromEntries(formData));
  const { content } = createContentServices();
  await content.update(contentId, input, actor);
  revalidatePath("/content/items");
  revalidatePath("/content/calendar");
  revalidatePath("/content/approvals");
}

export async function moveContentStatusAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = moveContentStatusSchema.parse(Object.fromEntries(formData));
  const { content } = createContentServices();
  await content.moveStatus(input, actor);
  revalidatePath("/content/items");
  revalidatePath("/content/calendar");
  revalidatePath("/content/approvals");
  revalidatePath("/notifications");
}
