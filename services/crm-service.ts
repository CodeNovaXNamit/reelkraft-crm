import { ApplicationError } from "@/lib/errors/application-error";
import { assertPermission } from "@/lib/permissions/authorize";
import type { CreateLeadInput, MoveDealStageInput, UpdateLeadInput } from "@/lib/validation/crm";
import type {
  ClientRepository,
  DealRepository,
  LeadRepository,
  PipelineMovementRepository,
} from "@/repositories/interfaces/crm";
import type { AuditService } from "@/services/audit-service";
import type { Actor, Deal, PipelineStage } from "@/types/domain";
import type { PageQuery } from "@/types/pagination";

const stageOrder: PipelineStage[] = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "DISCOVERY",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const defaultProbability: Record<PipelineStage, number> = {
  NEW_LEAD: 10,
  CONTACTED: 20,
  QUALIFIED: 35,
  DISCOVERY: 45,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 75,
  WON: 100,
  LOST: 0,
};

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

function canAssignOwner(inputOwnerId: string | undefined, actor: Actor, resource: "leads" | "deals") {
  if (!inputOwnerId || inputOwnerId === actor.id) {
    return;
  }
  assertPermission(actor, resource, "assign");
}

function assertStageChangeAllowed(
  previousStage: PipelineStage,
  newStage: PipelineStage,
  reason: string,
) {
  if (previousStage === newStage) {
    throw new ApplicationError("CONFLICT", "Deal is already in that pipeline stage.");
  }
  if (previousStage === "WON" || previousStage === "LOST") {
    throw new ApplicationError(
      "CONFLICT",
      "Won and lost deals are terminal. Create a new deal if work reopens.",
    );
  }
  const previousIndex = stageOrder.indexOf(previousStage);
  const nextIndex = stageOrder.indexOf(newStage);
  if (nextIndex < previousIndex && reason.trim().length < 8) {
    throw new ApplicationError(
      "VALIDATION_ERROR",
      "Backward pipeline moves require a clear reason.",
    );
  }
}

export class LeadService {
  constructor(
    private readonly leads: LeadRepository,
    private readonly deals: DealRepository,
    private readonly audit: AuditService,
  ) {}

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "leads", "view");
    return this.leads.list(query, actor);
  }

  findById(id: string, actor: Actor) {
    assertPermission(actor, "leads", "view");
    return this.leads.findById(id, actor);
  }

  async create(input: CreateLeadInput, actor: Actor) {
    assertPermission(actor, "leads", "create");
    const normalized = compactOptional(input);
    canAssignOwner(normalized.ownerId, actor, "leads");
    const ownerId = normalized.ownerId || actor.id;
    const stage = "NEW_LEAD" as const;
    const probability = normalized.probability ?? defaultProbability[stage];

    const lead = await this.leads.create(
      {
        ...normalized,
        ownerId,
        stage,
        probability,
      },
      actor,
    );
    const deal = await this.deals.create(
      {
        leadId: lead.id,
        company: lead.company,
        contactName: lead.contactName,
        ownerId,
        value: lead.dealValue ?? 0,
        stage,
        probability,
        expectedCloseDate: lead.expectedCloseDate,
        lastContact: lead.lastContact,
        nextAction: lead.nextAction,
      },
      actor,
    );

    await this.audit.appendAccessEvent({
      actor,
      action: "lead_created",
      entityType: "Lead",
      entityId: lead.id,
      newValue: { lead, dealId: deal.id },
    });

    return { lead, deal };
  }

  async update(id: string, input: UpdateLeadInput, actor: Actor) {
    assertPermission(actor, "leads", "edit");
    const existing = await this.leads.findById(id, actor);
    if (!existing) {
      throw new ApplicationError("NOT_FOUND", "Lead not found.");
    }
    const normalized = compactOptional(input);
    canAssignOwner(normalized.ownerId, actor, "leads");
    const lead = await this.leads.update(id, normalized, actor);
    const deal = await this.deals.findByLeadId(id);
    if (deal) {
      await this.deals.update(
        deal.id,
        {
          company: lead.company,
          contactName: lead.contactName,
          ownerId: lead.ownerId,
          value: lead.dealValue ?? deal.value,
          expectedCloseDate: lead.expectedCloseDate,
          lastContact: lead.lastContact,
          nextAction: lead.nextAction,
        },
        actor,
      );
    }
    await this.audit.appendAccessEvent({
      actor,
      action: "lead_updated",
      entityType: "Lead",
      entityId: lead.id,
      oldValue: existing,
      newValue: lead,
    });
    return lead;
  }
}

export class PipelineService {
  constructor(
    private readonly leads: LeadRepository,
    private readonly deals: DealRepository,
    private readonly movements: PipelineMovementRepository,
    private readonly audit: AuditService,
  ) {}

  listDeals(query: PageQuery, actor: Actor) {
    assertPermission(actor, "pipeline", "view");
    return this.deals.list(query, actor);
  }

  listMovements(query: PageQuery, actor: Actor) {
    assertPermission(actor, "audit_logs", "view");
    return this.movements.list(query);
  }

  async moveDeal(input: MoveDealStageInput, actor: Actor) {
    assertPermission(actor, "pipeline", "edit");
    const deal = await this.deals.findById(input.dealId, actor);
    if (!deal) {
      throw new ApplicationError("NOT_FOUND", "Deal not found.");
    }
    assertStageChangeAllowed(deal.stage, input.newStage, input.reason);

    const timestamp = new Date().toISOString();
    const update: Partial<Deal> = {
      stage: input.newStage,
      probability: defaultProbability[input.newStage],
      nextAction: input.nextAction || deal.nextAction,
      wonAt: input.newStage === "WON" ? timestamp : deal.wonAt,
      lostAt: input.newStage === "LOST" ? timestamp : deal.lostAt,
      lostReason: input.newStage === "LOST" ? input.lostReason || input.reason : deal.lostReason,
    };
    const updatedDeal = await this.deals.update(deal.id, update, actor);
    const existingLead = await this.leads.findById(deal.leadId, actor);
    if (existingLead) {
      await this.leads.update(
        existingLead.id,
        {
          stage: input.newStage,
          probability: update.probability,
          nextAction: update.nextAction,
        },
        actor,
      );
    }
    const movement = await this.movements.append({
      dealId: deal.id,
      leadId: deal.leadId,
      previousStage: deal.stage,
      newStage: input.newStage,
      actorId: actor.id,
      reason: input.reason,
      notes: input.notes,
      dealValue: updatedDeal.value,
      nextAction: updatedDeal.nextAction,
    });

    await this.audit.appendAccessEvent({
      actor,
      action: "deal_stage_changed",
      entityType: "Deal",
      entityId: deal.id,
      oldValue: deal,
      newValue: updatedDeal,
      metadata: { movementId: movement.id },
    });

    return { deal: updatedDeal, movement };
  }
}

export class ClientService {
  constructor(private readonly clients: ClientRepository) {}

  list(query: PageQuery, actor: Actor) {
    assertPermission(actor, "clients", "view");
    return this.clients.list(query, actor);
  }

  findById(id: string, actor: Actor) {
    assertPermission(actor, "clients", "view");
    return this.clients.findById(id, actor);
  }
}
