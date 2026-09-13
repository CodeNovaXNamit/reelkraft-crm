import { ApplicationError } from "@/lib/errors/application-error";
import { hasPermission } from "@/lib/permissions/roles";
import type { Actor, PermissionAction, PermissionResource } from "@/types/domain";

export function assertActiveActor(actor: Actor) {
  if (actor.status !== "ACTIVE") {
    throw new ApplicationError(
      "AUTHORIZATION_ERROR",
      "This employee account is deactivated.",
    );
  }
}

export function assertPermission(
  actor: Actor,
  resource: PermissionResource,
  action: PermissionAction,
) {
  assertActiveActor(actor);

  if (!hasPermission(actor.role, resource, action)) {
    throw new ApplicationError(
      "AUTHORIZATION_ERROR",
      "You do not have permission to perform this action.",
      { actorId: actor.id, resource, action },
    );
  }
}
