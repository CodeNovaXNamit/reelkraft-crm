"use server";

import { revalidatePath } from "next/cache";
import { getCurrentActor } from "@/lib/auth/current-user";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import {
  createInvitationSchema,
  updateEmployeeAccessSchema,
} from "@/lib/validation/team";
import { createTeamServices } from "@/features/team/service";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const success = (message: string): ActionState => ({ status: "success", message });
const failure = (error: unknown): ActionState => ({
  status: "error",
  message: toSafeErrorMessage(error),
});

export async function createInvitationAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actor = await getCurrentActor();
    const input = createInvitationSchema.parse(Object.fromEntries(formData));
    const { team } = createTeamServices();
    await team.createInvitation(input, actor);
    revalidatePath("/team/invitations");
    return success("Invitation created and audited.");
  } catch (error) {
    return failure(error);
  }
}

export async function revokeInvitationAction(formData: FormData) {
  const actor = await getCurrentActor();
  const invitationId = String(formData.get("invitationId") ?? "");
  const { team } = createTeamServices();
  await team.revokeInvitation(invitationId, actor);
  revalidatePath("/team/invitations");
}

export async function updateEmployeeAccessAction(formData: FormData) {
  const actor = await getCurrentActor();
  const employeeId = String(formData.get("employeeId") ?? "");
  const input = updateEmployeeAccessSchema.parse(Object.fromEntries(formData));
  const { team } = createTeamServices();
  await team.updateEmployeeAccess(employeeId, input, actor);
  revalidatePath("/team/employees");
}

export async function ensureWorkbookSchemaAction() {
  const actor = await getCurrentActor();
  const { schema } = createTeamServices();
  await schema.ensureOperationalWorkbook(actor);
  revalidatePath("/settings");
}
