import { ApplicationError } from "@/lib/errors/application-error";

export type SheetColumn<TEntity> = {
  key: keyof TEntity;
  header: string;
  required?: boolean;
};

export function mapEntityToSheetRow<TEntity extends Record<string, unknown>>(
  entity: TEntity,
  columns: ReadonlyArray<SheetColumn<TEntity>>,
): string[] {
  return columns.map((column) => {
    const value = entity[column.key];
    if (column.required && (value === undefined || value === null || value === "")) {
      throw new Error(`Missing required sheet value: ${String(column.key)}`);
    }

    if (Array.isArray(value)) {
      return value.join(",");
    }

    return value === undefined || value === null ? "" : String(value);
  });
}

export function mapSheetRowToEntity<TEntity extends Record<string, unknown>>(
  row: string[],
  columns: ReadonlyArray<SheetColumn<TEntity>>,
) {
  return Object.fromEntries(
    columns.map((column, index) => [column.key, row[index] ?? ""]),
  ) as TEntity;
}

export function mapSheetRowsToEntities<TEntity extends Record<string, unknown>>(
  rows: string[][],
  columns: ReadonlyArray<SheetColumn<TEntity>>,
  sheetName: string,
) {
  const seenIds = new Set<string>();

  return rows.map((row, index) => {
    try {
      const entity = mapSheetRowToEntity<TEntity>(row, columns);
      const firstColumn = columns[0];

      if (firstColumn?.key === "id") {
        const id = String(entity.id ?? "").trim();
        if (!id) {
          throw new Error("Missing required sheet value: id");
        }
        if (seenIds.has(id)) {
          throw new Error(`Duplicate id "${id}"`);
        }
        seenIds.add(id);
      }

      return entity;
    } catch (error) {
      throw new ApplicationError(
        "INTEGRATION_ERROR",
        `Corrupt row in ${sheetName} at row ${index + 2}: ${
          error instanceof Error ? error.message : "Unknown mapping error"
        }`,
      );
    }
  });
}
