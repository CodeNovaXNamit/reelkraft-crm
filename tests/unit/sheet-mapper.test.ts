import { describe, expect, it } from "vitest";
import {
  mapEntityToSheetRow,
  mapSheetRowToEntity,
  mapSheetRowsToEntities,
} from "@/repositories/google-sheets/sheet-mapper";

describe("Google Sheets mapper foundation", () => {
  it("maps entities through central column definitions", () => {
    const columns = [
      { key: "id", header: "id", required: true },
      { key: "company", header: "company", required: true },
      { key: "teamMemberIds", header: "teamMemberIds" },
    ] as const;

    const row = mapEntityToSheetRow(
      { id: "lead_1", company: "Acme", teamMemberIds: ["emp_1", "emp_2"] },
      columns,
    );

    expect(row).toEqual(["lead_1", "Acme", "emp_1,emp_2"]);
    expect(mapSheetRowToEntity(row, columns)).toEqual({
      id: "lead_1",
      company: "Acme",
      teamMemberIds: "emp_1,emp_2",
    });
  });

  it("rejects duplicate stable ids in mapped sheet rows", () => {
    const columns = [
      { key: "id", header: "id", required: true },
      { key: "company", header: "company" },
    ] as const;

    expect(() =>
      mapSheetRowsToEntities(
        [
          ["lead_1", "Acme"],
          ["lead_1", "Duplicate"],
        ],
        columns,
        "Leads",
      ),
    ).toThrow("Duplicate id");
  });

  it("rejects corrupt rows without a stable id", () => {
    const columns = [
      { key: "id", header: "id", required: true },
      { key: "company", header: "company" },
    ] as const;

    expect(() =>
      mapSheetRowsToEntities([["", "Acme"]], columns, "Leads"),
    ).toThrow("Corrupt row in Leads at row 2");
  });
});
