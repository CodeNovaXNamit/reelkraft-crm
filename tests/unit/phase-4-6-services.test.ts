import { describe, expect, it } from "vitest";
import { AuditService } from "@/services/audit-service";
import {
  CalendarService,
  FinanceService,
  ReportService,
} from "@/services/business-service";
import { ContentService } from "@/services/content-service";
import { IntegrationService } from "@/services/integration-service";
import type { FinanceRepository, MeetingRepository, PaymentRepository } from "@/repositories/interfaces/business";
import type { ContentRepository } from "@/repositories/interfaces/content";
import type { ClientRepository, DealRepository, LeadRepository } from "@/repositories/interfaces/crm";
import type { ProjectRepository, TaskRepository } from "@/repositories/interfaces/operations";
import type { AuditLogRepository } from "@/repositories/interfaces/crm";
import type { NotificationRepository } from "@/repositories/interfaces/operations";
import type {
  Actor,
  AuditLog,
  Client,
  ContentItem,
  Deal,
  FinanceRecord,
  Lead,
  Meeting,
  Notification,
  Payment,
  Project,
  Task,
} from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

const admin: Actor = {
  id: "emp_admin",
  email: "admin@reelkraftmedia.online",
  role: "FOUNDER_ADMIN",
  status: "ACTIVE",
};

const editor: Actor = {
  id: "emp_editor",
  email: "editor@reelkraftmedia.online",
  role: "VIDEO_EDITOR",
  status: "ACTIVE",
};

const employee: Actor = {
  id: "emp_employee",
  email: "employee@reelkraftmedia.online",
  role: "EMPLOYEE",
  status: "ACTIVE",
};

function page<T>(items: T[]): PaginatedResult<T> {
  return { items, page: 1, pageSize: 100, total: items.length };
}

class MemoryAuditLogs implements AuditLogRepository {
  rows: AuditLog[] = [];
  async append(log: Omit<AuditLog, "id" | "createdAt">) {
    const row = {
      ...log,
      id: `audit_${this.rows.length}`,
      createdAt: "2026-09-13T00:00:00.000Z",
    };
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

class MemoryNotifications implements NotificationRepository {
  rows: Notification[] = [];
  async create(input: Omit<Notification, "id" | "createdAt" | "deliveryStatus">) {
    const row = {
      ...input,
      id: `notification_${this.rows.length}`,
      createdAt: "2026-09-13T00:00:00.000Z",
      deliveryStatus: "PENDING" as const,
    };
    this.rows.push(row);
    return row;
  }
  async listForRecipient(recipientUserId: string) {
    return this.rows.filter((row) => row.recipientUserId === recipientUserId);
  }
  async markRead(id: string, recipientUserId: string) {
    const row = this.rows.find((item) => item.id === id && item.recipientUserId === recipientUserId);
    if (!row) throw new Error("Notification not found");
    return { ...row, readAt: "2026-09-13T00:00:00.000Z" };
  }
}

class MemoryClients implements ClientRepository {
  rows: Client[] = [];
  async findById(id: string, _actor: Actor) {
    void _actor;
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
      companyName: input.companyName ?? "Client",
      health: input.health ?? "HEALTHY",
      recurringValue: input.recurringValue,
      renewalDate: input.renewalDate,
      status: input.status ?? "ACTIVE",
      createdAt: "2026-09-13T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-13T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Client>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Client not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryContent implements ContentRepository {
  rows: ContentItem[] = [];
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() {
    return page(this.rows);
  }
  async create(input: Partial<ContentItem>, actor: Actor) {
    const row: ContentItem = {
      id: input.id ?? `content_${this.rows.length}`,
      clientId: input.clientId ?? "",
      topic: input.topic,
      editorId: input.editorId,
      reviewerId: input.reviewerId,
      status: input.status ?? "IDEA",
      createdAt: "2026-09-13T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-13T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<ContentItem>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Content not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryFinance implements FinanceRepository {
  rows: FinanceRecord[] = [];
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() {
    return page(this.rows);
  }
  async create(input: Partial<FinanceRecord>, actor: Actor) {
    const row: FinanceRecord = {
      id: input.id ?? `finance_${this.rows.length}`,
      clientId: input.clientId ?? "",
      invoiceNumber: input.invoiceNumber ?? "",
      amount: input.amount ?? 0,
      currency: "INR",
      status: input.status ?? "SENT",
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: "2026-09-13T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-13T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<FinanceRecord>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Finance not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryPayments implements PaymentRepository {
  rows: Payment[] = [];
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() {
    return page(this.rows);
  }
  async create(input: Partial<Payment>, actor: Actor) {
    const row: Payment = {
      id: input.id ?? `payment_${this.rows.length}`,
      financeId: input.financeId ?? "",
      clientId: input.clientId ?? "",
      amount: input.amount ?? 0,
      paidAt: input.paidAt ?? "2026-09-13T00:00:00.000Z",
      createdAt: "2026-09-13T00:00:00.000Z",
      createdBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Payment>) {
    const existing = await this.findById(id, admin);
    if (!existing) throw new Error("Payment not found");
    const row = { ...existing, ...input };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class MemoryMeetings implements MeetingRepository {
  rows: Meeting[] = [];
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async findByGoogleEventId(googleCalendarEventId: string) {
    return this.rows.find((row) => row.googleCalendarEventId === googleCalendarEventId) ?? null;
  }
  async list() {
    return page(this.rows);
  }
  async create(input: Partial<Meeting>, actor: Actor) {
    const row: Meeting = {
      id: input.id ?? `meeting_${this.rows.length}`,
      title: input.title ?? "Meeting",
      type: input.type ?? "OTHER",
      clientId: input.clientId,
      projectId: input.projectId,
      taskId: input.taskId,
      startAt: input.startAt ?? "2026-09-13T10:00:00.000Z",
      endAt: input.endAt ?? "2026-09-13T11:00:00.000Z",
      attendees: input.attendees,
      googleCalendarEventId: input.googleCalendarEventId,
      createdAt: "2026-09-13T00:00:00.000Z",
      createdBy: actor.id,
      updatedAt: "2026-09-13T00:00:00.000Z",
      updatedBy: actor.id,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: string, input: Partial<Meeting>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Meeting not found");
    const row = { ...existing, ...input, updatedBy: actor.id };
    this.rows = this.rows.map((item) => (item.id === id ? row : item));
    return row;
  }
}

class StaticLeads implements LeadRepository {
  constructor(private readonly rows: Lead[]) {}
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() { return page(this.rows); }
  async create(): Promise<Lead> { throw new Error("Not implemented"); }
  async update(): Promise<Lead> { throw new Error("Not implemented"); }
}

class StaticDeals implements DealRepository {
  constructor(private readonly rows: Deal[]) {}
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async findByLeadId(leadId: string) { return this.rows.find((row) => row.leadId === leadId) ?? null; }
  async list() { return page(this.rows); }
  async create(): Promise<Deal> { throw new Error("Not implemented"); }
  async update(): Promise<Deal> { throw new Error("Not implemented"); }
}

class StaticProjects implements ProjectRepository {
  constructor(private readonly rows: Project[]) {}
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() { return page(this.rows); }
  async create(): Promise<Project> { throw new Error("Not implemented"); }
  async update(): Promise<Project> { throw new Error("Not implemented"); }
}

class StaticTasks implements TaskRepository {
  constructor(private readonly rows: Task[]) {}
  async findById(id: string, _actor: Actor) {
    void _actor;
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async list() { return page(this.rows); }
  async create(): Promise<Task> { throw new Error("Not implemented"); }
  async update(): Promise<Task> { throw new Error("Not implemented"); }
}

function createAudit() {
  const repository = new MemoryAuditLogs();
  return { repository, service: new AuditService(repository) };
}

describe("Phase 4 content production", () => {
  it("validates content transitions and approval permissions", async () => {
    const { service: audit } = createAudit();
    const clients = new MemoryClients();
    const content = new MemoryContent();
    const notifications = new MemoryNotifications();
    await clients.create({ id: "client_1", companyName: "Acme" }, admin);
    const contentService = new ContentService(clients, content, audit, notifications);
    const item = await contentService.create(
      { clientId: "client_1", topic: "Launch reel", reviewerId: editor.id, status: "IDEA" },
      admin,
    );

    await expect(
      contentService.moveStatus({ contentId: item.id, status: "PUBLISHED" }, admin),
    ).rejects.toThrow("cannot move");

    await content.update(item.id, { status: "CLIENT_REVIEW" }, admin);
    await expect(
      contentService.moveStatus({ contentId: item.id, status: "APPROVED" }, editor),
    ).rejects.toThrow("permission");
  });
});

describe("Phase 5 business modules", () => {
  it("records partial and full payments with numeric outstanding balances", async () => {
    const { service: audit } = createAudit();
    const clients = new MemoryClients();
    const finance = new MemoryFinance();
    const payments = new MemoryPayments();
    await clients.create({ id: "client_1", companyName: "Acme" }, admin);
    const service = new FinanceService(clients, finance, payments, audit);
    const invoice = await service.create(
      { clientId: "client_1", invoiceNumber: "RK-001", amount: 10000 },
      admin,
    );

    await service.recordPayment({ financeId: invoice.id, amount: 4000 }, admin);
    expect(finance.rows[0]?.status).toBe("PARTIAL");
    expect((await service.list({}, admin)).items[0]?.outstandingBalance).toBe(6000);

    await service.recordPayment({ financeId: invoice.id, amount: 6000 }, admin);
    expect(finance.rows[0]?.status).toBe("PAID");
    expect((await service.list({}, admin)).items[0]?.outstandingBalance).toBe(0);
  });

  it("rejects unauthorized finance access", async () => {
    const { service: audit } = createAudit();
    const service = new FinanceService(new MemoryClients(), new MemoryFinance(), new MemoryPayments(), audit);
    await expect(
      service.create({ clientId: "client_1", invoiceNumber: "RK-002", amount: 1 }, employee),
    ).rejects.toThrow("permission");
  });

  it("prevents duplicate calendar records for the same Google event ID", async () => {
    const { service: audit } = createAudit();
    const meetings = new MemoryMeetings();
    const service = new CalendarService(meetings, audit);

    const first = await service.create(
      {
        title: "Discovery",
        type: "DISCOVERY_CALL",
        startAt: "2026-09-13T10:00",
        endAt: "2026-09-13T11:00",
        attendees: [],
        googleCalendarEventId: "google_1",
      },
      admin,
    );
    const second = await service.create(
      {
        title: "Discovery retry",
        type: "DISCOVERY_CALL",
        startAt: "2026-09-13T10:00",
        endAt: "2026-09-13T11:00",
        attendees: [],
        googleCalendarEventId: "google_1",
      },
      admin,
    );

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(meetings.rows).toHaveLength(1);
  });

  it("calculates report totals from source repositories", async () => {
    const service = new ReportService(
      new StaticLeads([
        lead("lead_1", "QUALIFIED"),
        lead("lead_2", "WON"),
      ]),
      new StaticDeals([
        deal("deal_1", "QUALIFIED", 1000, 50),
        deal("deal_2", "WON", 2000, 100),
      ]),
      new MemoryClients(),
      new StaticProjects([project("project_1", "ACTIVE")]),
      new StaticTasks([task("task_1", "2026-09-12")]),
      new MemoryContent(),
      new MemoryFinance(),
    );

    const summary = await service.getSummary(admin, new Date("2026-09-13T00:00:00.000Z"));
    expect(summary.sales.pipelineValue).toBe(1000);
    expect(summary.sales.weightedPipeline).toBe(500);
    expect(summary.sales.revenue).toBe(2000);
    expect(summary.operations.overdueCount).toBe(1);
  });
});

describe("Phase 6 external integrations", () => {
  it("records Slack failure without corrupting the successful CRM write", async () => {
    const { repository, service: audit } = createAudit();
    const clients = new MemoryClients();
    const finance = new MemoryFinance();
    const financeService = new FinanceService(clients, finance, new MemoryPayments(), audit);
    await clients.create({ id: "client_1", companyName: "Acme" }, admin);
    await financeService.create(
      { clientId: "client_1", invoiceNumber: "RK-003", amount: 5000 },
      admin,
    );

    const previousToken = process.env.SLACK_BOT_TOKEN;
    delete process.env.SLACK_BOT_TOKEN;
    const integration = new IntegrationService(audit);
    const result = await integration.notify(
      "slack",
      {
        title: "Invoice created",
        message: "Invoice RK-003 created",
        entityType: "Finance",
        entityId: finance.rows[0]?.id ?? "",
      },
      admin,
    );
    process.env.SLACK_BOT_TOKEN = previousToken;

    expect(result.status).toBe("FAILED");
    expect(finance.rows).toHaveLength(1);
    expect(repository.rows.some((row) => row.action === "slack_delivery_failed")).toBe(true);
  });
});

function lead(id: string, stage: Lead["stage"]): Lead {
  return {
    id,
    company: "Acme",
    contactName: "Asha",
    ownerId: admin.id,
    stage,
    createdAt: "2026-09-13T00:00:00.000Z",
    createdBy: admin.id,
    updatedAt: "2026-09-13T00:00:00.000Z",
    updatedBy: admin.id,
  };
}

function deal(id: string, stage: Deal["stage"], value: number, probability: number): Deal {
  return {
    id,
    leadId: `lead_${id}`,
    company: "Acme",
    ownerId: admin.id,
    value,
    stage,
    probability,
    createdAt: "2026-09-13T00:00:00.000Z",
    createdBy: admin.id,
    updatedAt: "2026-09-13T00:00:00.000Z",
    updatedBy: admin.id,
  };
}

function project(id: string, status: string): Project {
  return {
    id,
    clientId: "client_1",
    projectName: "Launch",
    ownerId: admin.id,
    teamMemberIds: [admin.id],
    status,
    priority: "HIGH",
    health: "ON_TRACK",
    createdAt: "2026-09-13T00:00:00.000Z",
    createdBy: admin.id,
    updatedAt: "2026-09-13T00:00:00.000Z",
    updatedBy: admin.id,
  };
}

function task(id: string, dueDate: string): Task {
  return {
    id,
    title: "Edit",
    assignedToId: employee.id,
    createdBy: admin.id,
    priority: "HIGH",
    status: "TO_DO",
    dueDate,
    createdAt: "2026-09-13T00:00:00.000Z",
    updatedAt: "2026-09-13T00:00:00.000Z",
    updatedBy: admin.id,
  };
}
