import type { WriteRepository } from "@/repositories/interfaces/base";
import type { Employee, Invitation, InvitationStatus, Role } from "@/types/domain";

export type CreateEmployeeInput = Omit<
  Employee,
  "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"
> & {
  id?: string;
};

export type UpdateEmployeeInput = Partial<
  Pick<
    Employee,
    | "name"
    | "phone"
    | "role"
    | "department"
    | "managerId"
    | "joiningDate"
    | "status"
    | "accessLevel"
    | "leaveStatus"
    | "workloadCapacity"
    | "avatarUrl"
  >
>;

export type CreateInvitationRecordInput = {
  email: string;
  name: string;
  role: Role;
  department?: string;
  managerId?: string;
  accessLevel?: string;
  expiresAt?: string;
};

export type UpdateInvitationInput = Partial<{
  status: InvitationStatus;
  acceptedAt: string;
  revokedAt: string;
}>;

export interface EmployeeRepository
  extends WriteRepository<Employee, CreateEmployeeInput, UpdateEmployeeInput> {
  findByEmail(email: string): Promise<Employee | null>;
}

export interface InvitationRepository
  extends WriteRepository<
    Invitation,
    CreateInvitationRecordInput,
    UpdateInvitationInput
  > {
  findPendingByEmail(email: string): Promise<Invitation | null>;
}
