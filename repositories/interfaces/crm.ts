import type { WriteRepository } from "@/repositories/interfaces/base";
import type { AuditLog, Client, Deal, Lead, PipelineMovement } from "@/types/domain";

export type LeadRepository = WriteRepository<Lead, Partial<Lead>, Partial<Lead>>;

export interface DealRepository
  extends WriteRepository<Deal, Partial<Deal>, Partial<Deal>> {
  findByLeadId(leadId: string): Promise<Deal | null>;
}

export interface ClientRepository
  extends WriteRepository<Client, Partial<Client>, Partial<Client>> {
  findBySourceDealId(dealId: string): Promise<Client | null>;
}

export interface PipelineMovementRepository {
  append(input: Omit<PipelineMovement, "id" | "createdAt">): Promise<PipelineMovement>;
  listByDeal(dealId: string): Promise<PipelineMovement[]>;
  list(query: import("@/types/pagination").PageQuery): Promise<
    import("@/types/pagination").PaginatedResult<PipelineMovement>
  >;
}

export interface AuditLogRepository {
  append(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  listRecent(limit?: number): Promise<AuditLog[]>;
}
