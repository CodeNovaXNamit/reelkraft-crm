import { ApplicationError } from "@/lib/errors/application-error";
import { normalizePageQuery, type PageQuery, type PaginatedResult } from "@/types/pagination";
import type { Actor, Role } from "@/types/domain";

export function now() {
  return new Date().toISOString();
}

export function numberOrUndefined(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ApplicationError("INTEGRATION_ERROR", "Numeric sheet value is corrupt.");
  }
  return parsed;
}

export function numberOrDefault(value: unknown, fallback: number) {
  return numberOrUndefined(value) ?? fallback;
}

export function csvToArray(value: unknown) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function filterPage<T>(
  items: T[],
  query: PageQuery,
  searchable: (item: T) => string[],
  filterable: (item: T, key: string, values: string[]) => boolean = () => true,
): PaginatedResult<T> {
  const normalized = normalizePageQuery(query);
  const search = normalized.search?.trim().toLowerCase();
  const filteredBySearch = search
    ? items.filter((item) =>
        searchable(item).some((value) => value.toLowerCase().includes(search)),
      )
    : items;
  const filters = Object.entries(normalized.filters ?? {});
  const filtered = filters.reduce((current, [key, rawValue]) => {
    const values = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];
    if (values.length === 0) {
      return current;
    }
    return current.filter((item) => filterable(item, key, values));
  }, filteredBySearch);
  const start = (normalized.page - 1) * normalized.pageSize;

  return {
    items: filtered.slice(start, start + normalized.pageSize),
    page: normalized.page,
    pageSize: normalized.pageSize,
    total: filtered.length,
  };
}

export function canSeeAllSales(actor: Actor) {
  return actor.role === "FOUNDER_ADMIN" || actor.role === "SALES_FINANCE";
}

export function canSeeAllClients(actor: Actor) {
  return (
    actor.role === "FOUNDER_ADMIN" ||
    actor.role === "SALES_FINANCE" ||
    actor.role === "OPERATIONS_HEAD" ||
    actor.role === "HR_ACCOUNT_MANAGER"
  );
}

export function canSeeAllOperations(actor: Actor) {
  return actor.role === "FOUNDER_ADMIN" || actor.role === "OPERATIONS_HEAD";
}

export function canAssignWork(role: Role) {
  return role === "FOUNDER_ADMIN" || role === "OPERATIONS_HEAD" || role === "VIDEO_DESIGN_HEAD";
}
