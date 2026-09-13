import { auth } from "@/auth";
import { getBypassActor, isAuthBypassEnabled } from "@/lib/auth/testing-bypass";
import { ApplicationError } from "@/lib/errors/application-error";
import type { Actor } from "@/types/domain";

export async function getCurrentActor(): Promise<Actor> {
  if (isAuthBypassEnabled()) {
    return getBypassActor();
  }

  const session = await auth();

  if (
    !session?.user?.employeeId ||
    !session.user.email ||
    !session.user.role ||
    session.user.status !== "ACTIVE"
  ) {
    throw new ApplicationError(
      "AUTHENTICATION_ERROR",
      "You must be signed in with an active Reelkraft employee account.",
    );
  }

  return {
    id: session.user.employeeId,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
  };
}
