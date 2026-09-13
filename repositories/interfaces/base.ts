import type { Actor } from "@/types/domain";
import type { PageQuery, PaginatedResult } from "@/types/pagination";

export type RepositoryCommand<TInput, TResult> = (
  input: TInput,
  actor: Actor,
) => Promise<TResult>;

export interface ReadRepository<TEntity> {
  findById(id: string, actor: Actor): Promise<TEntity | null>;
  list(query: PageQuery, actor: Actor): Promise<PaginatedResult<TEntity>>;
}

export interface WriteRepository<TEntity, TCreate, TUpdate>
  extends ReadRepository<TEntity> {
  create(input: TCreate, actor: Actor): Promise<TEntity>;
  update(id: string, input: TUpdate, actor: Actor): Promise<TEntity>;
}
