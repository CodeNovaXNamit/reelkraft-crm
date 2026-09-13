import { ApplicationError } from "@/lib/errors/application-error";
import { assertPermission } from "@/lib/permissions/authorize";
import type { ConvertDealInput } from "@/lib/validation/crm";
import type { ClientRepository, DealRepository, LeadRepository } from "@/repositories/interfaces/crm";
import type { ProjectRepository, TaskRepository } from "@/repositories/interfaces/operations";
import type { AuditService } from "@/services/audit-service";
import type { NotificationService } from "@/services/notification-service";
import type { Actor, Client, Project } from "@/types/domain";

function compactOptional<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  ) as T;
}

export class ClientConversionService {
  constructor(
    private readonly leads: LeadRepository,
    private readonly deals: DealRepository,
    private readonly clients: ClientRepository,
    private readonly projects: ProjectRepository,
    private readonly tasks: TaskRepository,
    private readonly audit: AuditService,
    private readonly notifications: NotificationService,
  ) {}

  async convertWonDeal(input: ConvertDealInput, actor: Actor) {
    assertPermission(actor, "clients", "create");
    assertPermission(actor, "pipeline", "edit");
    const normalized = compactOptional(input);
    const deal = await this.deals.findById(normalized.dealId, actor);
    if (!deal) {
      throw new ApplicationError("NOT_FOUND", "Deal not found.");
    }
    if (deal.stage !== "WON") {
      throw new ApplicationError("CONFLICT", "Only WON deals can be converted to clients.");
    }

    const existingClient =
      (deal.convertedClientId
        ? await this.clients.findById(deal.convertedClientId, actor)
        : null) ?? (await this.clients.findBySourceDealId(deal.id));
    if (existingClient) {
      await this.ensureOnboarding(existingClient, actor);
      return { client: existingClient, created: false };
    }

    const lead = await this.leads.findById(deal.leadId, actor);
    const client = await this.clients.create(
      {
        companyName: deal.company,
        primaryContactName: deal.contactName ?? lead?.contactName,
        primaryEmail: lead?.email,
        primaryPhone: lead?.phone,
        website: lead?.website,
        industry: lead?.industry,
        service: lead?.serviceInterested,
        accountManagerId: normalized.accountManagerId || deal.ownerId,
        sourceLeadId: deal.leadId,
        sourceDealId: deal.id,
        onboardingStatus: "PENDING",
        health: "HEALTHY",
        recurringValue: normalized.recurringValue,
        renewalDate: normalized.renewalDate,
        status: "ACTIVE",
      },
      actor,
    );

    await this.deals.update(deal.id, { convertedClientId: client.id }, actor);
    await this.ensureOnboarding(client, actor);
    await this.audit.appendAccessEvent({
      actor,
      action: "deal_converted_to_client",
      entityType: "Client",
      entityId: client.id,
      oldValue: deal,
      newValue: client,
    });
    if (client.accountManagerId) {
      await this.notifications.create({
        recipientUserId: client.accountManagerId,
        type: "CLIENT_CONVERTED",
        title: "New client onboarded",
        message: `${client.companyName} was converted from a won deal.`,
        entityType: "Client",
        entityId: client.id,
        link: `/clients/${client.id}`,
      });
    }

    return { client, created: true };
  }

  private async ensureOnboarding(client: Client, actor: Actor) {
    const projects = await this.projects.list(
      { pageSize: 100, filters: { clientId: client.id } },
      actor,
    );
    const existing = projects.items.find((project) => project.type === "ONBOARDING");
    const project =
      existing ??
      (await this.projects.create(
        {
          clientId: client.id,
          projectName: `${client.companyName} Onboarding`,
          type: "ONBOARDING",
          ownerId: client.accountManagerId || actor.id,
          teamMemberIds: client.accountManagerId ? [client.accountManagerId] : [],
          status: "ACTIVE",
          priority: "HIGH",
          health: "ON_TRACK",
          description: "Initial onboarding project created from won-deal conversion.",
        },
        actor,
      ));

    await this.ensureOnboardingTasks(client, project, actor);
    return project;
  }

  private async ensureOnboardingTasks(client: Client, project: Project, actor: Actor) {
    const existingTasks = await this.tasks.list(
      { pageSize: 100, filters: { projectId: project.id } },
      actor,
    );
    const titles = new Set(existingTasks.items.map((task) => task.title));
    const assignee = client.accountManagerId || project.ownerId || actor.id;
    const onboardingTasks = [
      "Confirm onboarding details",
      "Create kickoff plan",
      "Collect brand assets",
      "Schedule kickoff meeting",
    ];

    for (const title of onboardingTasks) {
      if (titles.has(title)) {
        continue;
      }
      await this.tasks.create(
        {
          title,
          clientId: client.id,
          projectId: project.id,
          assignedToId: assignee,
          priority: "HIGH",
          status: "TO_DO",
        },
        actor,
      );
    }
  }
}
