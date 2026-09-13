import { isTaskOverdue } from "@/lib/dates/business-time";
import { ApplicationError } from "@/lib/errors/application-error";
import { assertPermission } from "@/lib/permissions/authorize";
import type {
  CreateFinanceInput,
  CreateMeetingInput,
  RecordPaymentInput,
  UpdateClientHealthInput,
} from "@/lib/validation/business";
import type { MeetingRepository, PaymentRepository, FinanceRepository } from "@/repositories/interfaces/business";
import type { ContentRepository } from "@/repositories/interfaces/content";
import type { ClientRepository, DealRepository, LeadRepository } from "@/repositories/interfaces/crm";
import type { ProjectRepository, TaskRepository } from "@/repositories/interfaces/operations";
import type { EmployeeRepository } from "@/repositories/interfaces/team";
import type { AuditService } from "@/services/audit-service";
import type { Actor, FinanceRecord } from "@/types/domain";
import type { PageQuery } from "@/types/pagination";

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

function calculateFinanceStatus(invoice: FinanceRecord, paidAmount: number, today = new Date()) {
  if (paidAmount >= invoice.amount) return "PAID" as const;
  if (paidAmount > 0) return "PARTIAL" as const;
  if (invoice.dueDate && new Date(`${invoice.dueDate}T23:59:59`) < today) return "OVERDUE" as const;
  return invoice.status === "DRAFT" ? "DRAFT" : "SENT";
}

export class FinanceService {
  constructor(
    private readonly clients: ClientRepository,
    private readonly finance: FinanceRepository,
    private readonly payments: PaymentRepository,
    private readonly audit: AuditService,
  ) {}

  async list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "finance", "view");
    const invoices = await this.finance.list(query, actor);
    const allPayments = await this.payments.list({ pageSize: 500 }, actor);
    return {
      ...invoices,
      items: invoices.items.map((invoice) => {
        const paidAmount = allPayments.items
          .filter((payment) => payment.financeId === invoice.id)
          .reduce((total, payment) => total + payment.amount, 0);
        return {
          ...invoice,
          paidAmount,
          outstandingBalance: Math.max(invoice.amount - paidAmount, 0),
          computedStatus: calculateFinanceStatus(invoice, paidAmount),
        };
      }),
    };
  }

  async create(input: CreateFinanceInput, actor: Actor) {
    assertPermission(actor, "finance", "create");
    const normalized = compactOptional(input);
    const client = await this.clients.findById(normalized.clientId, actor);
    if (!client) {
      throw new ApplicationError("NOT_FOUND", "Client not found.");
    }
    const invoice = await this.finance.create(
      { ...normalized, currency: "INR", status: "SENT" },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "finance_record_created",
      entityType: "Finance",
      entityId: invoice.id,
      newValue: invoice,
    });
    return invoice;
  }

  async recordPayment(input: RecordPaymentInput, actor: Actor) {
    assertPermission(actor, "finance", "edit");
    const normalized = compactOptional(input);
    const invoice = await this.finance.findById(normalized.financeId, actor);
    if (!invoice) {
      throw new ApplicationError("NOT_FOUND", "Finance record not found.");
    }
    const payment = await this.payments.create(
      {
        ...normalized,
        clientId: invoice.clientId,
        paidAt: normalized.paidAt || new Date().toISOString(),
      },
      actor,
    );
    const allPayments = await this.payments.list({ pageSize: 500 }, actor);
    const paidAmount = allPayments.items
      .filter((row) => row.financeId === invoice.id)
      .reduce((total, row) => total + row.amount, 0);
    const updatedInvoice = await this.finance.update(
      invoice.id,
      { status: calculateFinanceStatus(invoice, paidAmount) },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "finance_payment_recorded",
      entityType: "Finance",
      entityId: invoice.id,
      oldValue: invoice,
      newValue: { invoice: updatedInvoice, payment },
    });
    return { payment, invoice: updatedInvoice };
  }
}

export class CalendarService {
  constructor(
    private readonly meetings: MeetingRepository,
    private readonly audit: AuditService,
  ) {}

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "calendar", "view");
    return this.meetings.list(query, actor);
  }

  async create(input: CreateMeetingInput, actor: Actor) {
    assertPermission(actor, "calendar", "create");
    const normalized = compactOptional(input);
    if (normalized.googleCalendarEventId) {
      const existing = await this.meetings.findByGoogleEventId(normalized.googleCalendarEventId);
      if (existing) return { meeting: existing, created: false };
    }
    const meeting = await this.meetings.create(normalized, actor);
    await this.audit.appendAccessEvent({
      actor,
      action: "calendar_meeting_created",
      entityType: "Meeting",
      entityId: meeting.id,
      newValue: meeting,
    });
    return { meeting, created: true };
  }
}

export class HrService {
  constructor(private readonly employees: EmployeeRepository) {}

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "hr", "view");
    return this.employees.list(query, actor);
  }
}

export class ClientHealthService {
  constructor(
    private readonly clients: ClientRepository,
    private readonly audit: AuditService,
  ) {}

  async update(input: UpdateClientHealthInput, actor: Actor) {
    assertPermission(actor, "clients", "edit");
    const existing = await this.clients.findById(input.clientId, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Client not found.");
    }
    const client = await this.clients.update(
      input.clientId,
      {
        health: input.health,
        renewalDate: input.renewalDate || existing.renewalDate,
        recurringValue: input.recurringValue ?? existing.recurringValue,
      },
      actor,
    );
    await this.audit.appendAccessEvent({
      actor,
      action: "client_health_updated",
      entityType: "Client",
      entityId: client.id,
      oldValue: existing,
      newValue: client,
    });
    return client;
  }
}

export class ReportService {
  constructor(
    private readonly leads: LeadRepository,
    private readonly deals: DealRepository,
    private readonly clients: ClientRepository,
    private readonly projects: ProjectRepository,
    private readonly tasks: TaskRepository,
    private readonly content: ContentRepository,
    private readonly finance: FinanceRepository,
  ) {}

  async getSummary(actor: Actor, today = new Date()) {
    assertPermission(actor, "reports", "view");
    const [leads, deals, clients, projects, tasks, content, finance] = await Promise.all([
      this.leads.list({ pageSize: 500 }, actor),
      this.deals.list({ pageSize: 500 }, actor),
      this.clients.list({ pageSize: 500 }, actor),
      this.projects.list({ pageSize: 500 }, actor),
      this.tasks.list({ pageSize: 500 }, actor),
      this.content.list({ pageSize: 500 }, actor),
      this.finance.list({ pageSize: 500 }, actor).catch(() => ({
        items: [],
        page: 1,
        pageSize: 500,
        total: 0,
      })),
    ]);

    const wonDeals = deals.items.filter((deal) => deal.stage === "WON");
    const lostDeals = deals.items.filter((deal) => deal.stage === "LOST");
    const pipelineDeals = deals.items.filter((deal) => deal.stage !== "WON" && deal.stage !== "LOST");
    const leadCount = leads.items.length;
    const contentApproved = content.items.filter((item) => item.status === "APPROVED").length;
    const contentPublished = content.items.filter((item) => item.status === "PUBLISHED").length;

    return {
      sales: {
        leadCount,
        qualifiedCount: leads.items.filter((lead) => lead.stage === "QUALIFIED").length,
        proposalCount: leads.items.filter((lead) => lead.stage === "PROPOSAL_SENT").length,
        wonCount: wonDeals.length,
        lostCount: lostDeals.length,
        conversionRate: leadCount === 0 ? 0 : wonDeals.length / leadCount,
        pipelineValue: pipelineDeals.reduce((total, deal) => total + deal.value, 0),
        weightedPipeline: pipelineDeals.reduce(
          (total, deal) => total + deal.value * (deal.probability / 100),
          0,
        ),
        revenue: wonDeals.reduce((total, deal) => total + deal.value, 0),
      },
      operations: {
        taskCount: tasks.items.length,
        overdueCount: tasks.items.filter((task) => isTaskOverdue(task, today)).length,
        activeProjectCount: projects.items.filter((project) => project.status !== "COMPLETED").length,
      },
      content: {
        producedCount: content.items.length,
        approvedCount: contentApproved,
        revisionRate: content.items.length === 0
          ? 0
          : content.items.filter((item) => item.status === "REVISION").length / content.items.length,
        publishedCount: contentPublished,
      },
      clients: {
        healthyCount: clients.items.filter((client) => client.health === "HEALTHY").length,
        attentionCount: clients.items.filter((client) => client.health === "ATTENTION").length,
        atRiskCount: clients.items.filter((client) => client.health === "AT_RISK").length,
        recurringValue: clients.items.reduce((total, client) => total + (client.recurringValue ?? 0), 0),
      },
      finance: {
        outstandingPayments: finance.items
          .filter((invoice) => invoice.status !== "PAID")
          .reduce((total, invoice) => total + invoice.amount, 0),
      },
    };
  }
}
