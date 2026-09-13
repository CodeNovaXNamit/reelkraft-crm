import { describe, expect, it } from "vitest";
import { AuditService } from "@/services/audit-service";
import { ClientConversionService } from "@/services/client-conversion-service";
import { LeadService, PipelineService } from "@/services/crm-service";
import { NotificationService } from "@/services/notification-service";
import { ProjectService, TaskService, WorkloadService } from "@/services/operations-service";
import type {
  ClientRepository,
  DealRepository,
  LeadRepository,
  PipelineMovementRepository,
} from "@/repositories/interfaces/crm";
import type {
  NotificationRepository,
  ProjectRepository,
  TaskRepository,
} from "@/repositories/interfaces/operations";
import type { EmployeeRepository } from "@/repositories/interfaces/team";
import type {
  Actor,
  AuditLog,
  Client,
  Deal,
  Employee,
  Lead,
  Notification,
  PipelineMovement,
  Project,
  Task,
} from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

const admin: Actor = {
  id: "emp_admin",
  email: "admin@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

const sales: Actor = {
  id: "emp_sales",
  email: "sales@reelkraftmedia.online",
  role: "SALES_FINANCE",
  status: "ACTIVE",
};

const employee: Actor = {
  id: "emp_worker",
  email: "worker@reelkraftmedia.online",
  role: "EMPLOYEE",
  status: "ACTIVE",
};

function page<T>(items: T[]): PaginatedResult<T> {
  return { items, page: 1, pageSize: 100, total: items.length };
}

class MemoryAuditLogs {
  rows: AuditLog[] = [];
  async append(log: Omit<AuditLog, "id" | "createdAt">) {
    const row = { ...log, id: `aud_${this.rows.length}`, createdAt: "2026-09-10T00:00:00.000Z" };
    this.rows.push(row);
    return row;
  }
  async findByEntity(entityType: string, entityId: string) {
    return this.rows.filter((row) => row.entityType === entityType && row.entityId === entityId);
  }
  async listRecent(limit = 50) {
    return this.rows.slice(0, limit);
  }
}

class MemoryLeads implements LeadRepository {
  rows: Lead[] = [];
  async findById(id: string, actor: Actor) {
    return this.scope(actor).find((row) => row.id === id) ?? null;
  }
  async list(_query: PageQuery, actor: Actor) {
    return page(this.scope(actor));
  }
  async create(input: Partial<Lead>, actor: Actor) {
    const row: Lead = {
      id: input.id ?? `lead_${this.rows.length}`,
      company: input.company ?? "",
      contactName: input.contactName ?? "",
      email: input.email,
      phone: input.phone,
      website: input.website,
      industry: input.industry,
      source: input.source,
      serviceInterested: input.serviceInterested,
      dealValue: input.dealValue,
      ownerId: input.ownerId ?? actor.id,
      stage: input.stage ?? "NEW_LEAD",
      probability: input.probability,
      expectedCloseDate: input.expectedCloseDate,
      lastContact: input.lastContact,
      nextAction: input.nextAction,
      notes: input.notes,
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Lead>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Lead not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
  private scope(actor: Actor) {
    return actor.role === "FOUNDER_ADMIN" || actor.role === "SALES_FINANCE"
      ? this.rows
      : this.rows.filter((row) => row.ownerId === actor.id);
  }
}

class MemoryDeals implements DealRepository {
  rows: Deal[] = [];
  async findById(id: string, actor: Actor) {
    return this.scope(actor).find((row) => row.id === id) ?? null;
  }
  async findByLeadId(leadId: string) {
    return this.rows.find((row) => row.leadId === leadId) ?? null;
  }
  async list(_query: PageQuery, actor: Actor) {
    return page(this.scope(actor));
  }
  async create(input: Partial<Deal>, actor: Actor) {
    const row: Deal = {
      id: input.id ?? `deal_${this.rows.length}`,
      leadId: input.leadId ?? "",
      company: input.company ?? "",
      contactName: input.contactName,
      ownerId: input.ownerId ?? actor.id,
      value: input.value ?? 0,
      stage: input.stage ?? "NEW_LEAD",
      probability: input.probability ?? 10,
      expectedCloseDate: input.expectedCloseDate,
      lastContact: input.lastContact,
      nextAction: input.nextAction,
      wonAt: input.wonAt,
      lostAt: input.lostAt,
      lostReason: input.lostReason,
      convertedClientId: input.convertedClientId,
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Deal>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Deal not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
  private scope(actor: Actor) {
    return actor.role === "FOUNDER_ADMIN" || actor.role === "SALES_FINANCE"
      ? this.rows
      : this.rows.filter((row) => row.ownerId === actor.id);
  }
}

class MemoryClients implements ClientRepository {
  rows: Client[] = [];
  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async findBySourceDealId(dealId: string) {
    return this.rows.find((row) => row.sourceDealId === dealId) ?? null;
  }
  async list() {
    return page(this.rows);
  }
  async create(input: Partial<Client>, actor: Actor) {
    const row: Client = {
      id: input.id ?? `client_${this.rows.length}`,
      companyName: input.companyName ?? "",
      primaryContactName: input.primaryContactName,
      primaryEmail: input.primaryEmail,
      primaryPhone: input.primaryPhone,
      website: input.website,
      industry: input.industry,
      service: input.service,
      accountManagerId: input.accountManagerId,
      sourceLeadId: input.sourceLeadId,
      sourceDealId: input.sourceDealId,
      driveFolderId: input.driveFolderId,
      driveFolderUrl: input.driveFolderUrl,
      onboardingStatus: input.onboardingStatus,
      health: input.health ?? "HEALTHY",
      recurringValue: input.recurringValue,
      renewalDate: input.renewalDate,
      status: input.status ?? "ACTIVE",
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Client>, actor: Actor) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("Client not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryMovements implements PipelineMovementRepository {
  rows: PipelineMovement[] = [];
  async append(input: Omit<PipelineMovement, "id" | "createdAt">) {
    const row = { ...input, id: `pmv_${this.rows.length}`, createdAt: "2026-09-10T00:00:00.000Z" };
    this.rows.push(row);
    return row;
  }
  async listByDeal(dealId: string) {
    return this.rows.filter((row) => row.dealId === dealId);
  }
  async list() {
    return page(this.rows);
  }
}

class MemoryProjects implements ProjectRepository {
  rows: Project[] = [];
  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list(query: PageQuery) {
    const clientId = typeof query.filters?.clientId === "string" ? query.filters.clientId : undefined;
    const items = clientId ? this.rows.filter((row) => row.clientId === clientId) : this.rows;
    return page(items);
  }
  async create(input: Partial<Project>, actor: Actor) {
    const row: Project = {
      id: input.id ?? `project_${this.rows.length}`,
      clientId: input.clientId ?? "",
      projectName: input.projectName ?? "",
      type: input.type,
      ownerId: input.ownerId ?? actor.id,
      teamMemberIds: input.teamMemberIds ?? [],
      startDate: input.startDate,
      dueDate: input.dueDate,
      status: input.status ?? "ACTIVE",
      priority: input.priority ?? "MEDIUM",
      budget: input.budget,
      health: input.health ?? "ON_TRACK",
      description: input.description,
      driveLink: input.driveLink,
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Project>, actor: Actor) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("Project not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryTasks implements TaskRepository {
  rows: Task[] = [];
  async findById(id: string, actor: Actor) {
    return this.scope(actor).find((row) => row.id === id) ?? null;
  }
  async list(query: PageQuery, actor: Actor) {
    const projectId = typeof query.filters?.projectId === "string" ? query.filters.projectId : undefined;
    const clientId = typeof query.filters?.clientId === "string" ? query.filters.clientId : undefined;
    const scoped = this.scope(actor);
    return page(
      scoped.filter(
        (row) =>
          (!projectId || row.projectId === projectId) &&
          (!clientId || row.clientId === clientId),
      ),
    );
  }
  async create(input: Partial<Task>, actor: Actor) {
    const row: Task = {
      id: input.id ?? `task_${this.rows.length}`,
      title: input.title ?? "",
      description: input.description,
      clientId: input.clientId,
      projectId: input.projectId,
      assignedToId: input.assignedToId ?? actor.id,
      createdBy: actor.id,
      priority: input.priority ?? "MEDIUM",
      status: input.status ?? "TO_DO",
      startDate: input.startDate,
      dueDate: input.dueDate,
      estimatedTime: input.estimatedTime,
      actualTime: input.actualTime,
      driveLink: input.driveLink,
      comments: input.comments,
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Task>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Task not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
  private scope(actor: Actor) {
    return actor.role === "FOUNDER_ADMIN" || actor.role === "OPERATIONS_HEAD"
      ? this.rows
      : this.rows.filter((row) => row.assignedToId === actor.id || row.createdBy === actor.id);
  }
}

class MemoryNotifications implements NotificationRepository {
  rows: Notification[] = [];
  async create(input: Omit<Notification, "id" | "createdAt" | "deliveryStatus">) {
    const row = { ...input, id: `ntf_${this.rows.length}`, createdAt: "2026-09-10T00:00:00.000Z", deliveryStatus: "PENDING" as const };
    this.rows.push(row);
    return row;
  }
  async listForRecipient(recipientUserId: string) {
    return this.rows.filter((row) => row.recipientUserId === recipientUserId);
  }
  async markRead(id: string, recipientUserId: string) {
    const row = this.rows.find((item) => item.id === id && item.recipientUserId === recipientUserId);
    if (!row) throw new Error("Notification not found");
    return { ...row, readAt: "2026-09-10T00:00:00.000Z" };
  }
}

class MemoryEmployees implements Pick<EmployeeRepository, "list"> {
  rows: Employee[] = [
    {
      id: "emp_worker",
      name: "Worker",
      email: "worker@reelkraftmedia.online",
      role: "EMPLOYEE",
      status: "ACTIVE",
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: "system",
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: "system",
    },
  ];
  async list() {
    return page(this.rows);
  }
  async findById(id: string) {
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.rows.find((row) => row.email === email.toLowerCase()) ?? null;
  }
  async create(input: Partial<Employee>, actor: Actor) {
    const row: Employee = {
      id: input.id ?? `emp_${this.rows.length}`,
      name: input.name ?? "Employee",
      email: input.email ?? "employee@reelkraftmedia.online",
      role: input.role ?? "EMPLOYEE",
      status: input.status ?? "ACTIVE",
      createdAt: "2026-09-10T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-10T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Employee>, actor: Actor) {
    const existing = await this.findById(id);
    if (!existing) throw new Error("Employee not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

function createHarness() {
  const auditRepository = new MemoryAuditLogs();
  const leads = new MemoryLeads();
  const deals = new MemoryDeals();
  const clients = new MemoryClients();
  const movements = new MemoryMovements();
  const projects = new MemoryProjects();
  const tasks = new MemoryTasks();
  const notifications = new MemoryNotifications();
  const audit = new AuditService(auditRepository);

  return {
    auditRepository,
    leads,
    deals,
    clients,
    movements,
    projects,
    tasks,
    notifications,
    leadService: new LeadService(leads, deals, audit),
    pipelineService: new PipelineService(leads, deals, movements, audit),
    conversionService: new ClientConversionService(
      leads,
      deals,
      clients,
      projects,
      tasks,
      audit,
      new NotificationService(notifications),
    ),
    projectService: new ProjectService(clients, projects, audit),
    taskService: new TaskService(tasks, audit, notifications),
    workloadService: new WorkloadService(
      new MemoryEmployees(),
      projects,
      tasks,
    ),
  };
}

describe("Phase 2 CRM services", () => {
  it("creates a lead with a linked pipeline deal and audit event", async () => {
    const { leadService, deals, auditRepository } = createHarness();
    const { lead, deal } = await leadService.create(
      { company: "Acme", contactName: "Asha", dealValue: 100000 },
      sales,
    );

    expect(lead.stage).toBe("NEW_LEAD");
    expect(deal.leadId).toBe(lead.id);
    expect(deals.rows).toHaveLength(1);
    expect(auditRepository.rows[0]?.action).toBe("lead_created");
  });

  it("rejects unauthorized employee lead creation", async () => {
    const { leadService } = createHarness();
    await expect(
      leadService.create({ company: "Acme", contactName: "Asha" }, employee),
    ).rejects.toThrow("permission");
  });

  it("moves deals through validated stages and records immutable movement", async () => {
    const { leadService, pipelineService, movements, deals } = createHarness();
    const { deal } = await leadService.create(
      { company: "Acme", contactName: "Asha" },
      sales,
    );

    await pipelineService.moveDeal(
      { dealId: deal.id, newStage: "CONTACTED", reason: "Discovery call completed" },
      sales,
    );

    expect(deals.rows[0]?.stage).toBe("CONTACTED");
    expect(movements.rows[0]?.previousStage).toBe("NEW_LEAD");
    expect(movements.rows[0]?.newStage).toBe("CONTACTED");
  });

  it("converts a WON deal once and creates onboarding project/tasks/notification", async () => {
    const { leadService, pipelineService, conversionService, clients, projects, tasks, notifications } = createHarness();
    const { deal } = await leadService.create(
      { company: "Acme", contactName: "Asha" },
      sales,
    );
    await pipelineService.moveDeal(
      { dealId: deal.id, newStage: "WON", reason: "Contract signed" },
      sales,
    );

    const first = await conversionService.convertWonDeal(
      { dealId: deal.id, accountManagerId: "emp_worker" },
      admin,
    );
    const second = await conversionService.convertWonDeal(
      { dealId: deal.id, accountManagerId: "emp_worker" },
      admin,
    );

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(clients.rows).toHaveLength(1);
    expect(projects.rows).toHaveLength(1);
    expect(tasks.rows).toHaveLength(4);
    expect(notifications.rows[0]?.recipientUserId).toBe("emp_worker");
  });
});

describe("Phase 3 operations services", () => {
  it("creates scoped tasks, notifications, and workload counts", async () => {
    const { clients, projectService, taskService, notifications, workloadService } = createHarness();
    await clients.create({ id: "client_1", companyName: "Acme", health: "HEALTHY", status: "ACTIVE" }, admin);
    const project = await projectService.create(
      {
        clientId: "client_1",
        projectName: "Launch",
        ownerId: "emp_worker",
        teamMemberIds: ["emp_worker"],
        status: "ACTIVE",
        priority: "HIGH",
        health: "ON_TRACK",
      },
      admin,
    );
    await taskService.create(
      {
        title: "Edit reel",
        clientId: "client_1",
        projectId: project.id,
        assignedToId: "emp_worker",
        priority: "URGENT",
        status: "TO_DO",
        dueDate: "2026-09-09",
      },
      admin,
    );

    const workload = await workloadService.list(admin, new Date("2026-09-10T00:00:00.000Z"));
    expect(notifications.rows).toHaveLength(1);
    expect(workload[0]?.activeTaskCount).toBe(1);
    expect(workload[0]?.overdueTaskCount).toBe(1);
    expect(workload[0]?.priorityDistribution.URGENT).toBe(1);
  });

  it("rejects invalid task status transitions", async () => {
    const { taskService } = createHarness();
    const task = await taskService.create(
      { title: "Edit reel", assignedToId: employee.id, priority: "MEDIUM", status: "TO_DO" },
      admin,
    );

    await expect(
      taskService.update(task.id, { status: "COMPLETED" }, employee),
    ).rejects.toThrow("cannot move");
  });

  it("prevents employees from reading another employee task by id", async () => {
    const { taskService, tasks } = createHarness();
    const otherTask = await taskService.create(
      {
        title: "Private task",
        assignedToId: "emp_admin",
        priority: "MEDIUM",
        status: "TO_DO",
      },
      admin,
    );

    expect(await tasks.findById(otherTask.id, employee)).toBeNull();
  });
});
