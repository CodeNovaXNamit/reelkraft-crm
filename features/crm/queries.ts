import { ApplicationError } from "@/lib/errors/application-error";
import { getCurrentActor } from "@/lib/auth/current-user";
import { createCrmServices } from "@/features/crm/service";
import type { PageQuery } from "@/types/pagination";

export async function getLeadData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { leads } = createCrmServices();
  return leads.list(query, actor);
}

export async function getLeadDetail(id: string) {
  const actor = await getCurrentActor();
  const { leads, repositories } = createCrmServices();
  const lead = await leads.findById(id, actor);
  if (!lead) {
    throw new ApplicationError("NOT_FOUND", "Lead not found.");
  }
  const deal = await repositories.deals.findByLeadId(id);
  const movements = deal
    ? await repositories.pipelineMovements.listByDeal(deal.id)
    : [];
  return { lead, deal, movements };
}

export async function getPipelineData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { pipeline } = createCrmServices();
  return pipeline.listDeals(query, actor);
}

export async function getPipelineAuditData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { pipeline } = createCrmServices();
  return pipeline.listMovements(query, actor);
}

export async function getClientData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { clients } = createCrmServices();
  return clients.list(query, actor);
}

export async function getClientDetail(id: string) {
  const actor = await getCurrentActor();
  const { clients, repositories } = createCrmServices();
  const client = await clients.findById(id, actor);
  if (!client) {
    throw new ApplicationError("NOT_FOUND", "Client not found.");
  }
  const projects = await repositories.projects.list(
    { pageSize: 50, filters: { clientId: client.id } },
    actor,
  );
  const tasks = await repositories.tasks.list(
    { pageSize: 50, filters: { clientId: client.id } },
    actor,
  );
  return { client, projects, tasks };
}
