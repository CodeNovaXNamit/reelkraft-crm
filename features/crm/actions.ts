"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/auth/current-user";
import { createLeadSchema, convertDealSchema, moveDealStageSchema, updateLeadSchema } from "@/lib/validation/crm";
import { createCrmServices } from "@/features/crm/service";

export async function createLeadAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = createLeadSchema.parse(Object.fromEntries(formData));
  const { leads } = createCrmServices();
  const { lead } = await leads.create(input, actor);
  revalidatePath("/crm/leads");
  revalidatePath("/crm/pipeline");
  redirect(`/crm/leads/${lead.id}`);
}

export async function updateLeadAction(formData: FormData) {
  const actor = await getCurrentActor();
  const leadId = String(formData.get("leadId") ?? "");
  const input = updateLeadSchema.parse(Object.fromEntries(formData));
  const { leads } = createCrmServices();
  await leads.update(leadId, input, actor);
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${leadId}`);
}

export async function moveDealStageAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = moveDealStageSchema.parse(Object.fromEntries(formData));
  const { pipeline } = createCrmServices();
  await pipeline.moveDeal(input, actor);
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm/audit");
}

export async function convertDealAction(formData: FormData) {
  const actor = await getCurrentActor();
  const input = convertDealSchema.parse(Object.fromEntries(formData));
  const { conversion } = createCrmServices();
  const { client } = await conversion.convertWonDeal(input, actor);
  revalidatePath("/clients");
  revalidatePath("/operations/projects");
  revalidatePath("/operations/tasks");
  redirect(`/clients/${client.id}`);
}
