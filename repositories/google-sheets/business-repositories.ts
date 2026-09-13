import { createId } from "@/lib/ids";
import type { FinanceRepository, MeetingRepository, PaymentRepository } from "@/repositories/interfaces/business";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import {
  financeColumns,
  meetingColumns,
  paymentColumns,
  sheetNames,
} from "@/repositories/google-sheets/schema";
import { csvToArray, filterPage, now, numberOrDefault } from "@/repositories/google-sheets/record-utils";
import type { Actor, FinanceRecord, Meeting, Payment } from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

function asFinance(row: FinanceRecord & Record<string, unknown>): FinanceRecord {
  const status =
    row.status === "SENT" ||
    row.status === "PARTIAL" ||
    row.status === "PAID" ||
    row.status === "OVERDUE"
      ? row.status
      : "DRAFT";
  return { ...row, amount: numberOrDefault(row.amount, 0), currency: "INR", status };
}

function asPayment(row: Payment & Record<string, unknown>): Payment {
  return { ...row, amount: numberOrDefault(row.amount, 0) };
}

function asMeeting(row: Meeting & Record<string, unknown>): Meeting {
  return {
    ...row,
    attendees: Array.isArray(row.attendees) ? row.attendees : csvToArray(row.attendees),
  };
}

export class GoogleSheetsFinanceRepository implements FinanceRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return (await this.list({ pageSize: 100 }, actor)).items.find((row) => row.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<FinanceRecord>> {
    if (actor.role !== "FOUNDER_ADMIN" && actor.role !== "SALES_FINANCE") {
      return filterPage([], query, () => []);
    }
    const rows = await this.all();
    return filterPage(rows, query, (row) => [row.invoiceNumber, row.clientId, row.status]);
  }

  async create(input: Partial<FinanceRecord>, actor: Actor) {
    const timestamp = now();
    const row: FinanceRecord = {
      id: input.id ?? createId("fin"),
      clientId: input.clientId ?? "",
      invoiceNumber: input.invoiceNumber ?? "",
      amount: input.amount ?? 0,
      currency: "INR",
      status: input.status ?? "DRAFT",
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.finance, financeColumns, row);
    return row;
  }

  async update(id: string, input: Partial<FinanceRecord>, actor: Actor) {
    const existing = (await this.all()).find((row) => row.id === id);
    if (!existing) throw new Error("Finance record not found");
    const row: FinanceRecord = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.finance, financeColumns, row);
    return row;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.finance, financeColumns)).map(asFinance);
  }
}

export class GoogleSheetsPaymentRepository implements PaymentRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return (await this.list({ pageSize: 100 }, actor)).items.find((row) => row.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Payment>> {
    if (actor.role !== "FOUNDER_ADMIN" && actor.role !== "SALES_FINANCE") {
      return filterPage([], query, () => []);
    }
    return filterPage(await this.all(), query, (row) => [row.financeId, row.clientId]);
  }

  async create(input: Partial<Payment>, actor: Actor) {
    const row: Payment = {
      id: input.id ?? createId("pay"),
      financeId: input.financeId ?? "",
      clientId: input.clientId ?? "",
      amount: input.amount ?? 0,
      paidAt: input.paidAt ?? now(),
      method: input.method,
      notes: input.notes,
      createdAt: now(),
      createdBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.payments, paymentColumns, row);
    return row;
  }

  async update(id: string, input: Partial<Payment>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Payment not found");
    const row: Payment = { ...existing, ...input };
    await this.client.updateEntityById(sheetNames.payments, paymentColumns, row);
    return row;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.payments, paymentColumns)).map(asPayment);
  }
}

export class GoogleSheetsMeetingRepository implements MeetingRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    return (await this.list({ pageSize: 100 }, actor)).items.find((row) => row.id === id) ?? null;
  }

  async findByGoogleEventId(googleCalendarEventId: string) {
    return (await this.all()).find((row) => row.googleCalendarEventId === googleCalendarEventId) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Meeting>> {
    const rows = (await this.all()).sort((left, right) => left.startAt.localeCompare(right.startAt));
    const scoped =
      actor.role === "FOUNDER_ADMIN" ||
      actor.role === "OPERATIONS_HEAD" ||
      actor.role === "SALES_FINANCE" ||
      actor.role === "HR_ACCOUNT_MANAGER"
        ? rows
        : rows.filter((row) => row.attendees?.includes(actor.email) || row.createdBy === actor.id);
    return filterPage(scoped, query, (row) => [row.title, row.clientId ?? "", row.type ?? ""]);
  }

  async create(input: Partial<Meeting>, actor: Actor) {
    const timestamp = now();
    const row: Meeting = {
      id: input.id ?? createId("meet"),
      title: input.title ?? "",
      type: input.type ?? "OTHER",
      clientId: input.clientId,
      projectId: input.projectId,
      taskId: input.taskId,
      startAt: input.startAt ?? timestamp,
      endAt: input.endAt ?? timestamp,
      attendees: input.attendees ?? [],
      googleCalendarEventId: input.googleCalendarEventId,
      meetingUrl: input.meetingUrl,
      notes: input.notes,
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.meetings, meetingColumns, row);
    return row;
  }

  async update(id: string, input: Partial<Meeting>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) throw new Error("Meeting not found");
    const row: Meeting = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.meetings, meetingColumns, row);
    return row;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.meetings, meetingColumns)).map(asMeeting);
  }
}
