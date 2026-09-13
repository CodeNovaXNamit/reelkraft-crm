import { createId } from "@/lib/ids";
import type {
  ClientRepository,
  DealRepository,
  LeadRepository,
  PipelineMovementRepository,
} from "@/repositories/interfaces/crm";
import { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import {
  clientColumns,
  dealColumns,
  leadColumns,
  pipelineMovementColumns,
  sheetNames,
} from "@/repositories/google-sheets/schema";
import {
  canSeeAllSales,
  canSeeAllClients,
  filterPage,
  now,
  numberOrDefault,
  numberOrUndefined,
} from "@/repositories/google-sheets/record-utils";
import type { Actor, Client, Deal, Lead, PipelineMovement, PipelineStage } from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

function pipelineStage(value: unknown): PipelineStage {
  const stage = String(value || "NEW_LEAD");
  if (
    stage === "NEW_LEAD" ||
    stage === "CONTACTED" ||
    stage === "QUALIFIED" ||
    stage === "DISCOVERY" ||
    stage === "PROPOSAL_SENT" ||
    stage === "NEGOTIATION" ||
    stage === "WON" ||
    stage === "LOST"
  ) {
    return stage;
  }
  return "NEW_LEAD";
}

function asLead(row: Lead & Record<string, unknown>): Lead {
  return {
    ...row,
    stage: pipelineStage(row.stage),
    dealValue: numberOrUndefined(row.dealValue),
    probability: numberOrUndefined(row.probability),
  };
}

function asDeal(row: Deal & Record<string, unknown>): Deal {
  return {
    ...row,
    value: numberOrDefault(row.value, 0),
    probability: numberOrDefault(row.probability, 0),
    stage: pipelineStage(row.stage),
  };
}

function asClient(row: Client & Record<string, unknown>): Client {
  const health = row.health === "ATTENTION" || row.health === "AT_RISK" ? row.health : "HEALTHY";
  const status =
    row.status === "INACTIVE" || row.status === "ARCHIVED" ? row.status : "ACTIVE";
  return {
    ...row,
    health,
    status,
    recurringValue: numberOrUndefined(row.recurringValue),
  };
}

function asMovement(row: PipelineMovement & Record<string, unknown>): PipelineMovement {
  return {
    ...row,
    previousStage: pipelineStage(row.previousStage),
    newStage: pipelineStage(row.newStage),
    dealValue: numberOrDefault(row.dealValue, 0),
  };
}

function salesScope<T extends { ownerId?: string; accountManagerId?: string }>(
  rows: T[],
  actor: Actor,
) {
  if (canSeeAllSales(actor)) {
    return rows;
  }
  return rows.filter(
    (row) => row.ownerId === actor.id || row.accountManagerId === actor.id,
  );
}

function clientScope<T extends { accountManagerId?: string }>(rows: T[], actor: Actor) {
  if (canSeeAllClients(actor)) {
    return rows;
  }
  return rows.filter((row) => row.accountManagerId === actor.id);
}

export class GoogleSheetsLeadRepository implements LeadRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    const leads = await this.all();
    return salesScope(leads, actor).find((lead) => lead.id === id) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Lead>> {
    const leads = salesScope(await this.all(), actor);
    return filterPage(
      leads,
      query,
      (lead) => [
        lead.company,
        lead.contactName,
        lead.email ?? "",
        lead.phone ?? "",
        lead.industry ?? "",
        lead.source ?? "",
        lead.stage,
        lead.ownerId,
      ],
      (lead, key, values) => {
        if (key === "stage") return values.includes(lead.stage);
        if (key === "ownerId") return values.includes(lead.ownerId);
        return true;
      },
    );
  }

  async create(input: Partial<Lead>, actor: Actor) {
    const timestamp = now();
    const lead: Lead = {
      id: input.id ?? createId("lead"),
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
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.leads, leadColumns, lead);
    return lead;
  }

  async update(id: string, input: Partial<Lead>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) {
      throw new Error("Lead not found");
    }
    const lead: Lead = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.leads, leadColumns, lead);
    return lead;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.leads, leadColumns)).map(asLead);
  }
}

export class GoogleSheetsDealRepository implements DealRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    const deals = await this.all();
    return salesScope(deals, actor).find((deal) => deal.id === id) ?? null;
  }

  async findByLeadId(leadId: string) {
    const deals = await this.all();
    return deals.find((deal) => deal.leadId === leadId) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Deal>> {
    const deals = salesScope(await this.all(), actor);
    return filterPage(
      deals,
      query,
      (deal) => [deal.company, deal.contactName ?? "", deal.stage, deal.ownerId],
      (deal, key, values) => {
        if (key === "stage") return values.includes(deal.stage);
        if (key === "ownerId") return values.includes(deal.ownerId);
        return true;
      },
    );
  }

  async create(input: Partial<Deal>, actor: Actor) {
    const timestamp = now();
    const deal: Deal = {
      id: input.id ?? createId("deal"),
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
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.deals, dealColumns, deal);
    return deal;
  }

  async update(id: string, input: Partial<Deal>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) {
      throw new Error("Deal not found");
    }
    const deal: Deal = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.deals, dealColumns, deal);
    return deal;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.deals, dealColumns)).map(asDeal);
  }
}

export class GoogleSheetsClientRepository implements ClientRepository {
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async findById(id: string, actor: Actor) {
    const clients = await this.all();
    return clientScope(clients, actor).find((client) => client.id === id) ?? null;
  }

  async findBySourceDealId(dealId: string) {
    const clients = await this.all();
    return clients.find((client) => client.sourceDealId === dealId) ?? null;
  }

  async list(query: PageQuery, actor: Actor): Promise<PaginatedResult<Client>> {
    const clients = clientScope(await this.all(), actor);
    return filterPage(clients, query, (client) => [
      client.companyName,
      client.primaryContactName ?? "",
      client.primaryEmail ?? "",
      client.industry ?? "",
      client.health,
      client.status,
    ]);
  }

  async create(input: Partial<Client>, actor: Actor) {
    const timestamp = now();
    const client: Client = {
      id: input.id ?? createId("client"),
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
      createdAt: timestamp,
      createdBy: actor.id,
      updatedAt: timestamp,
      updatedBy: actor.id,
    };
    await this.client.appendEntity(sheetNames.clients, clientColumns, client);
    return client;
  }

  async update(id: string, input: Partial<Client>, actor: Actor) {
    const existing = await this.findById(id, actor);
    if (!existing) {
      throw new Error("Client not found");
    }
    const client: Client = { ...existing, ...input, updatedAt: now(), updatedBy: actor.id };
    await this.client.updateEntityById(sheetNames.clients, clientColumns, client);
    return client;
  }

  private async all() {
    return (await this.client.listRows(sheetNames.clients, clientColumns)).map(asClient);
  }
}

export class GoogleSheetsPipelineMovementRepository
  implements PipelineMovementRepository
{
  constructor(private readonly client = new GoogleSheetsClient()) {}

  async append(input: Omit<PipelineMovement, "id" | "createdAt">) {
    const movement: PipelineMovement = {
      ...input,
      id: createId("pmv"),
      createdAt: now(),
    };
    await this.client.appendEntity(
      sheetNames.pipelineMovements,
      pipelineMovementColumns,
      movement,
    );
    return movement;
  }

  async listByDeal(dealId: string) {
    const movements = await this.all();
    return movements
      .filter((movement) => movement.dealId === dealId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async list(query: PageQuery) {
    const movements = await this.all();
    return filterPage(
      movements.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      query,
      (movement) => [
        movement.dealId,
        movement.leadId,
        movement.previousStage,
        movement.newStage,
        movement.actorId,
        movement.reason,
      ],
    );
  }

  private async all() {
    return (await this.client.listRows(
      sheetNames.pipelineMovements,
      pipelineMovementColumns,
    )).map(asMovement);
  }
}
