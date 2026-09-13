import { assertPermission } from "@/lib/permissions/authorize";
import type { Actor, PermissionAction, PermissionResource } from "@/types/domain";

export type ServiceContext = {
  actor: Actor;
  requestId: string;
};

export function requireServicePermission(
  context: ServiceContext,
  resource: PermissionResource,
  action: PermissionAction,
) {
  assertPermission(context.actor, resource, action);
}
