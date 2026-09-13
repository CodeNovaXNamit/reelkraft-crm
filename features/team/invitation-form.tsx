"use client";

import { useActionState } from "react";
import { createInvitationAction, type ActionState } from "@/features/team/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { roles } from "@/types/domain";

const initialState: ActionState = {
  status: "idle",
  message: "",
};

export function InvitationForm() {
  const [state, action] = useActionState(createInvitationAction, initialState);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span className="font-medium">Name</span>
        <Input name="name" required minLength={2} />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Email</span>
        <Input name="email" type="email" required />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Role</span>
        <select
          name="role"
          required
          className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Department</span>
        <Input name="department" />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Manager ID</span>
        <Input name="managerId" />
      </label>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Expires At</span>
        <Input name="expiresAt" type="date" />
      </label>
      <div className="md:col-span-2">
        <SubmitButton>Create invitation</SubmitButton>
      </div>
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-danger"
              : "text-sm text-accent"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
