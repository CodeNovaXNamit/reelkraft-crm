import { ApplicationError } from "@/lib/errors/application-error";
import { createId } from "@/lib/ids";
import { assertPermission } from "@/lib/permissions/authorize";
import type { CreateInvitationInput, UpdateEmployeeAccessInput } from "@/lib/validation/team";
import type { AuditService } from "@/services/audit-service";
import type {
  EmployeeRepository,
  InvitationRepository,
} from "@/repositories/interfaces/team";
import type { Actor, Employee, Invitation } from "@/types/domain";
import type { PageQuery } from "@/types/pagination";

const systemActor: Actor = {
  id: "system",
  email: "system@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

export class TeamService {
  constructor(
    private readonly employees: EmployeeRepository,
    private readonly invitations: InvitationRepository,
    private readonly audit: AuditService,
  ) {}

  listEmployees(query: PageQuery, actor: Actor) {
    assertPermission(actor, "employees", "view");
    return this.employees.list(query, actor);
  }

  listInvitations(query: PageQuery, actor: Actor) {
    assertPermission(actor, "invitations", "view");
    return this.invitations.list(query, actor);
  }

  async createInvitation(input: CreateInvitationInput, actor: Actor) {
    assertPermission(actor, "invitations", "create");
    const normalized = compactOptional(input);
    const existingEmployee = await this.employees.findByEmail(normalized.email);
    if (existingEmployee?.status === "ACTIVE") {
      throw new ApplicationError("CONFLICT", "An active employee already exists for this email.");
    }

    const existingInvitation = await this.invitations.findPendingByEmail(normalized.email);
    if (existingInvitation) {
      throw new ApplicationError("CONFLICT", "A pending invitation already exists for this email.");
    }

    const invitation = await this.invitations.create(normalized, actor);
    await this.audit.appendAccessEvent({
      actor,
      action: "employee_invited",
      entityType: "Invitation",
      entityId: invitation.id,
      newValue: invitation,
    });

    return invitation;
  }

  async revokeInvitation(invitationId: string, actor: Actor) {
    assertPermission(actor, "invitations", "edit");
    const existing = await this.invitations.findById(invitationId, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Invitation not found.");
    }
    if (existing.status !== "PENDING") {
      throw new ApplicationError("CONFLICT", "Only pending invitations can be revoked.");
    }

    const revoked = await this.invitations.update(
      invitationId,
      {
        status: "REVOKED",
        revokedAt: new Date().toISOString(),
      },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "employee_invitation_revoked",
      entityType: "Invitation",
      entityId: revoked.id,
      oldValue: existing,
      newValue: revoked,
    });

    return revoked;
  }

  async updateEmployeeAccess(
    employeeId: string,
    input: UpdateEmployeeAccessInput,
    actor: Actor,
  ) {
    assertPermission(actor, "employees", "edit");
    const existing = await this.employees.findById(employeeId, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Employee not found.");
    }
    if (existing.id === actor.id && input.status === "INACTIVE") {
      throw new ApplicationError("CONFLICT", "You cannot deactivate your own account.");
    }

    const updated = await this.employees.update(
      employeeId,
      compactOptional(input),
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "employee_access_updated",
      entityType: "Employee",
      entityId: updated.id,
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }

  async deactivateEmployee(employeeId: string, actor: Actor) {
    return this.updateEmployeeAccess(employeeId, { status: "INACTIVE" }, actor);
  }

  async acceptInvitationForGoogleAccount(input: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<Employee> {
    const email = input.email.toLowerCase();
    const existing = await this.employees.findByEmail(email);
    if (existing?.status === "ACTIVE") {
      return existing;
    }
    if (existing?.status === "INACTIVE") {
      throw new ApplicationError("AUTHORIZATION_ERROR", "This employee account is deactivated.");
    }

    const invitation = await this.invitations.findPendingByEmail(email);
    if (!invitation) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "No active invitation was found for this Google account.");
    }
    this.assertInvitationUsable(invitation);

    const employee = await this.employees.create(
      {
        id: createId("emp"),
        name: invitation.name || input.name,
        email,
        role: invitation.role,
        department: invitation.department,
        managerId: invitation.managerId,
        accessLevel: invitation.accessLevel,
        avatarUrl: input.avatarUrl,
        status: "ACTIVE",
      },
      systemActor,
    );

    const acceptedAt = new Date().toISOString();
    await this.invitations.update(
      invitation.id,
      { status: "ACCEPTED", acceptedAt },
      systemActor,
    );
    await this.audit.appendAccessEvent({
      actor: employee,
      action: "employee_invitation_accepted",
      entityType: "Invitation",
      entityId: invitation.id,
      oldValue: invitation,
      newValue: { ...invitation, status: "ACCEPTED", acceptedAt },
    });

    return employee;
  }

  private assertInvitationUsable(invitation: Invitation) {
    if (invitation.status !== "PENDING") {
      throw new ApplicationError("AUTHORIZATION_ERROR", "Invitation is not pending.");
    }
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      throw new ApplicationError("AUTHORIZATION_ERROR", "Invitation has expired.");
    }
  }
}
