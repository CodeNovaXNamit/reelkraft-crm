import { describe, expect, it } from "vitest";
import { AuditService } from "@/services/audit-service";
import { TeamService } from "@/services/team-service";
import type { AuditLogRepository } from "@/repositories/interfaces/crm";
import type {
  CreateEmployeeInput,
  CreateInvitationRecordInput,
  EmployeeRepository,
  InvitationRepository,
  UpdateEmployeeInput,
  UpdateInvitationInput,
} from "@/repositories/interfaces/team";
import type { Actor, AuditLog, Employee, Invitation } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

const admin: Actor = {
  id: "emp_admin",
  email: "shivam@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

const employeeActor: Actor = {
  id: "emp_editor",
  email: "editor@reelkraftmedia.online",
  role: "EMPLOYEE",
  status: "ACTIVE",
};

function page<T>(items: T[]): PaginatedResult<T> {
  return { items, page: 1, pageSize: 25, total: items.length };
}

class MemoryEmployees implements EmployeeRepository {
  rows: Employee[] = [];

  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async findByEmail(email: string) {
    return this.rows.find((row) => row.email === email.toLowerCase()) ?? null;
  }

  async list() {
    return page(this.rows);
  }

  async create(input: CreateEmployeeInput, actor: Actor) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      return existing;
    }
    const employee: Employee = {
      id: input.id ?? `emp_${this.rows.length}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      status: input.status,
      department: input.department,
      managerId: input.managerId,
      accessLevel: input.accessLevel,
      avatarUrl: input.avatarUrl,
      createdAt: "2026-09-09T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-09T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(employee);
    return employee;
  }

  async update(id: string, input: UpdateEmployeeInput, actor: Actor) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Employee not found");
    }
    const updated: Employee = {
      ...existing,
      ...input,
      updatedBy: actor.id,
    };
    this.rows = this.rows.map((row) => (row.id === id ? updated : row));
    return updated;
  }
}

class MemoryInvitations implements InvitationRepository {
  rows: Invitation[] = [];

  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async findPendingByEmail(email: string) {
    return (
      this.rows.find(
        (row) => row.email === email.toLowerCase() && row.status === "PENDING",
      ) ?? null
    );
  }

  async list() {
    return page(this.rows);
  }

  async create(input: CreateInvitationRecordInput, actor: Actor) {
    const invitation: Invitation = {
      id: `inv_${this.rows.length}`,
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      status: "PENDING",
      department: input.department,
      managerId: input.managerId,
      accessLevel: input.accessLevel,
      expiresAt: input.expiresAt,
      invitedBy: actor.id,
      invitedAt: "2026-09-09T00:00:00.000Z",
    };
    this.rows.push(invitation);
    return invitation;
  }

  async update(id: string, input: UpdateInvitationInput) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Invitation not found");
    }
    const updated = { ...existing, ...input };
    this.rows = this.rows.map((row) => (row.id === id ? updated : row));
    return updated;
  }
}

class MemoryAudit implements AuditLogRepository {
  rows: AuditLog[] = [];

  async append(log: Omit<AuditLog, "id" | "createdAt">) {
    const auditLog: AuditLog = {
      ...log,
      id: `aud_${this.rows.length}`,
      createdAt: "2026-09-09T00:00:00.000Z",
    };
    this.rows.push(auditLog);
    return auditLog;
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.rows.filter(
      (row) => row.entityType === entityType && row.entityId === entityId,
    );
  }

  async listRecent(limit = 50) {
    return this.rows.slice(0, limit);
  }
}

function createService() {
  const employees = new MemoryEmployees();
  const invitations = new MemoryInvitations();
  const audit = new MemoryAudit();
  const service = new TeamService(
    employees,
    invitations,
    new AuditService(audit),
  );
  return { service, employees, invitations, audit };
}

describe("TeamService Phase 1 lifecycle", () => {
  it("creates invitations only for authorized admins and audits them", async () => {
    const { service, audit } = createService();
    const invitation = await service.createInvitation(
      {
        name: "Editor",
        email: "editor@reelkraftmedia.online",
        role: "VIDEO_EDITOR",
        department: "Content",
      },
      admin,
    );

    expect(invitation.status).toBe("PENDING");
    expect(audit.rows[0]?.action).toBe("employee_invited");
  });

  it("rejects invitation creation from base employees", async () => {
    const { service } = createService();
    await expect(
      service.createInvitation(
        {
          name: "Editor",
          email: "editor@reelkraftmedia.online",
          role: "VIDEO_EDITOR",
        },
        employeeActor,
      ),
    ).rejects.toThrow("permission");
  });

  it("accepts a pending invitation exactly once by email", async () => {
    const { service, invitations } = createService();
    await service.createInvitation(
      {
        name: "Editor",
        email: "editor@reelkraftmedia.online",
        role: "VIDEO_EDITOR",
      },
      admin,
    );

    const employee = await service.acceptInvitationForGoogleAccount({
      email: "editor@reelkraftmedia.online",
      name: "Editor",
    });
    const secondAttempt = await service.acceptInvitationForGoogleAccount({
      email: "editor@reelkraftmedia.online",
      name: "Editor",
    });

    expect(employee.id).toBe(secondAttempt.id);
    expect(invitations.rows[0]?.status).toBe("ACCEPTED");
  });

  it("prevents admins from deactivating themselves", async () => {
    const { service, employees } = createService();
    await employees.create(
      {
        id: admin.id,
        name: "Shivam",
        email: admin.email,
        role: "FOUNDER_ADMIN",
        status: "ACTIVE",
      },
      admin,
    );

    await expect(service.deactivateEmployee(admin.id, admin)).rejects.toThrow(
      "your own account",
    );
  });
});
