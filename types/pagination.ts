export type PageQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, string | string[] | undefined>;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const maxPageSize = 100;

export function normalizePageQuery(
  query: PageQuery,
): Required<Pick<PageQuery, "page" | "pageSize">> & PageQuery {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, query.pageSize ?? 25));

  return {
    ...query,
    page,
    pageSize,
  };
}
