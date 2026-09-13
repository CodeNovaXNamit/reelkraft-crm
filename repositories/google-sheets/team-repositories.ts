import { createId } from "@/lib/ids";
import { normalizePageQuery } from "@/types/pagination";
import type { Actor, Employee, Invitation, InvitationStatus } from "@/types/domain";
import type {
  CreateEmployeeInput,
  CreateInvitationRecordInput,
  EmployeeRepository,
  InvitationRepository,
  UpdateEmployeeInput,
  UpdateInvitationInput,
} from "@/repositories/interfaces/team";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import {
  employeeColumns,
  invitationColumns,
  sheetNames,
} from "@/repositories/google-sheets/schema";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

function now() {
  return new Date().toISOString();
}

function asEmployee(row: Employee & Record<string, unknown>): Employee {
  return {
    ...row,
    email: String(row.email).toLowerCase(),
    workloadCapacity: row.workloadCapacity
      ? Number(row.workloadCapacity)
      : undefined,
    status: row.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}

function asInvitation(row: Invitation & Record<string, unknown>): Invitation {
  const status: InvitationStatus =
    row.status === "ACCEPTED" || row.status === "EXPIRED" || row.status === "REVOKED"
      ? row.status
      : "PENDING";

  return {
    ...row,
    email: String(row.email).toLowerCase(),
    status,
  };
}

function filterPage<T>(
  items: T[],
  query: PageQuery,
  searchable: (item: T) => string[],
): PaginatedResult<T> {
  const normalized = normalizePageQuery(query);
  const search = normalized.search?.trim().toLowerCase();
  const filtered = search
    ? items.filter((item) =>
        searchable(item).some((value) => value.toLowerCase().includes(search)),
      )
    : items;
  const start = (normalized.page - 1) * normalized.pageSize;

  return {
    items: filtered.slice(start, start + normalized.pageSize),
    page: normalized.page,
    pageSize: normalized.pageSize,
    total: filtered.length,
  };
}

export class GoogleSheetsEmployeeRepository implements EmployeeRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string) {
    const employees = await this.all();
    return employees.find((employee) => employee.id === id) ?? null;
  }

  async findByEmail(email: string) {
    const employees = await this.all();
    return employees.find((employee) => employee.email === email.toLowerCase()) ?? null;
  }

  async list(query: PageQuery): Promise<PaginatedResult<Employee>> {
    const employees = await this.all();
    return filterPage(employees, query, (employee) => [
      employee.name,
      employee.email,
      employee.role,
      employee.department ?? "",
    ]);
  }

  async create(input: CreateEmployeeInput, actor: Actor) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      return existing;
    }

    const timestamp = now();
    const employee: Employee = {
      ...input,
      id: input.id ?? createId("emp"),
      email: input.email.toLowerCase(),
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };

    await this.client.appendEntity(sheetNames.employees, employeeColumns, employee);
    return employee;
  }

  async update(id: string, input: UpdateEmployeeInput, actor: Actor) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Employee not found");
    }

    const employee: Employee = {
      ...existing,
      ...input,
      updatedAt: now(),
      updatedBy: actor.id,
    };

    await this.client.updateEntityById(sheetNames.employees, employeeColumns, employee);
    return employee;
  }

  private async all() {
    const rows = await this.client.listRows(sheetNames.employees, employeeColumns);
    return rows.map(asEmployee);
  }
}

export class GoogleSheetsInvitationRepository implements InvitationRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string) {
    const invitations = await this.all();
    return invitations.find((invitation) => invitation.id === id) ?? null;
  }

  async findPendingByEmail(email: string) {
    const invitations = await this.all();
    const pending = invitations.find(
      (invitation) =>
        invitation.email === email.toLowerCase() && invitation.status === "PENDING",
    );

    if (!pending) {
      return null;
    }

    if (pending.expiresAt && new Date(pending.expiresAt) < new Date()) {
      return { ...pending, status: "EXPIRED" as const };
    }

    return pending;
  }

  async list(query: PageQuery): Promise<PaginatedResult<Invitation>> {
    const invitations = await this.all();
    return filterPage(invitations, query, (invitation) => [
      invitation.name,
      invitation.email,
      invitation.role,
      invitation.status,
    ]);
  }

  async create(input: CreateInvitationRecordInput, actor: Actor) {
    const timestamp = now();
    const invitation: Invitation = {
      ...input,
      id: createId("inv"),
      email: input.email.toLowerCase(),
      status: "PENDING",
      invitedBy: actor.id,
      invitedAt: timestamp,
    };

    await this.client.appendEntity(sheetNames.invitations, invitationColumns, invitation);
    return invitation;
  }

  async update(id: string, input: UpdateInvitationInput) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Invitation not found");
    }

    const invitation: Invitation = {
      ...existing,
      ...input,
    };

    await this.client.updateEntityById(sheetNames.invitations, invitationColumns, invitation);
    return invitation;
  }

  private async all() {
    const rows = await this.client.listRows(sheetNames.invitations, invitationColumns);
    return rows.map(asInvitation);
  }
}
