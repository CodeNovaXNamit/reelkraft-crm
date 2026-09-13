import { ApplicationError } from "@/lib/errors/application-error";
import { createSheetsApi } from "@/lib/google/google-auth";
import { withGoogleRetry } from "@/lib/google/retry";
import {
  mapEntityToSheetRow,
  mapSheetRowsToEntities,
  type SheetColumn,
} from "@/repositories/google-sheets/sheet-mapper";
import { requiredSheets } from "@/repositories/google-sheets/schema";

function columnLetter(index: number) {
  let value = "";
  let current = index;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    value = String.fromCharCode(65 + remainder) + value;
    current = Math.floor((current - 1) / 26);
  }

  return value;
}

function spreadsheetId() {
  const id = process.env.GOOGLE_SHEETS_DATABASE_ID;
  if (!id) {
    throw new ApplicationError(
      "INTEGRATION_ERROR",
      "GOOGLE_SHEETS_DATABASE_ID is required for Google Sheets storage.",
    );
  }

  return id;
}

export class GoogleSheetsClient {
  private readonly sheets = createSheetsApi();
  private readonly spreadsheetId = spreadsheetId();

  async ensureWorkbookSchema() {
    const workbook = await withGoogleRetry(() =>
      this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: "sheets.properties.title",
      }),
    );
    const existing = new Set(
      workbook.data.sheets
        ?.map((sheet) => sheet.properties?.title)
        .filter((title): title is string => Boolean(title)) ?? [],
    );
    const missingSheets = requiredSheets.filter((sheet) => !existing.has(sheet.name));

    if (missingSheets.length > 0) {
      await withGoogleRetry(() =>
        this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: missingSheets.map((sheet) => ({
              addSheet: { properties: { title: sheet.name } },
            })),
          },
        }),
      );
    }

    await Promise.all(
      requiredSheets.map((sheet) =>
        this.writeHeaderRow(
          sheet.name,
          sheet.columns.map((column) => column.header),
        ),
      ),
    );
  }

  async listRows<TEntity extends Record<string, unknown>>(
    sheetName: string,
    columns: ReadonlyArray<SheetColumn<TEntity>>,
  ) {
    const endColumn = columnLetter(columns.length);
    const response = await withGoogleRetry(() =>
      this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:${endColumn}`,
        valueRenderOption: "UNFORMATTED_VALUE",
      }),
    );

    const rows = (response.data.values ?? []) as string[][];
    return mapSheetRowsToEntities<TEntity>(
      rows.filter((row) => row.some((value) => value !== "")),
      columns,
      sheetName,
    );
  }

  async appendEntity<TEntity extends Record<string, unknown>>(
    sheetName: string,
    columns: ReadonlyArray<SheetColumn<TEntity>>,
    entity: TEntity,
  ) {
    const row = mapEntityToSheetRow(entity, columns);

    await withGoogleRetry(() =>
      this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:${columnLetter(columns.length)}`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [row] },
      }),
    );
  }

  async updateEntityById<TEntity extends Record<string, unknown> & { id: string }>(
    sheetName: string,
    columns: ReadonlyArray<SheetColumn<TEntity>>,
    entity: TEntity,
  ) {
    const rowNumber = await this.findRowNumberById(sheetName, entity.id);
    if (!rowNumber) {
      throw new ApplicationError("NOT_FOUND", `${sheetName} row not found.`);
    }

    const endColumn = columnLetter(columns.length);
    await withGoogleRetry(() =>
      this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowNumber}:${endColumn}${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [mapEntityToSheetRow(entity, columns)] },
      }),
    );
  }

  private async findRowNumberById(sheetName: string, id: string) {
    const response = await withGoogleRetry(() =>
      this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
        valueRenderOption: "UNFORMATTED_VALUE",
      }),
    );

    const rows = (response.data.values ?? []) as string[][];
    const index = rows.findIndex((row) => row[0] === id);

    return index >= 0 ? index + 1 : null;
  }

  private async writeHeaderRow(sheetName: string, headers: string[]) {
    await withGoogleRetry(() =>
      this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1:${columnLetter(headers.length)}1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      }),
    );
  }
}
