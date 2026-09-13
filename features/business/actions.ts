"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/current-user";
import {
  createFinanceSchema,
  createMeetingSchema,
  recordPaymentSchema,
  updateClientHealthSchema,
} from "@/lib/validation/business";
import { createBusinessServices } from "@/features/business/service";

export async function createFinanceAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createFinanceSchema.parse(Object.fromEntries(formData));
  const { finance } = createBusinessServices();
  await finance.create(input, actor);
  revalidatePath("/finance");
  revalidatePath("/reports");
}

export async function recordPaymentAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = recordPaymentSchema.parse(Object.fromEntries(formData));
  const { finance } = createBusinessServices();
  await finance.recordPayment(input, actor);
  revalidatePath("/finance");
  revalidatePath("/reports");
}

export async function createMeetingAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createMeetingSchema.parse(Object.fromEntries(formData));
  const { calendar } = createBusinessServices();
  await calendar.create(input, actor);
  revalidatePath("/calendar");
  revalidatePath("/reports");
}

export async function updateClientHealthAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = updateClientHealthSchema.parse(Object.fromEntries(formData));
  const { clientHealth } = createBusinessServices();
  await clientHealth.update(input, actor);
  revalidatePath("/clients");
  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath("/reports");
}
