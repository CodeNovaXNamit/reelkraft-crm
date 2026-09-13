import { describe, expect, it } from "vitest";
import { requiredSheets, sheetNames } from "@/repositories/google-sheets/schema";

describe("Phase 1 Google Sheets schema", () => {
  it("contains required access-control and audit sheets", () => {
    expect(requiredSheets.map((sheet) => sheet.name)).toEqual(
      expect.arrayContaining([
        sheetNames.employees,
        sheetNames.invitations,
        sheetNames.leads,
        sheetNames.deals,
        sheetNames.pipelineMovements,
        sheetNames.clients,
        sheetNames.clientContacts,
        sheetNames.projects,
        sheetNames.tasks,
        sheetNames.content,
        sheetNames.meetings,
        sheetNames.finance,
        sheetNames.payments,
        sheetNames.auditLogs,
        sheetNames.notifications,
        sheetNames.activity,
        sheetNames.settings,
        sheetNames.rolePermissions,
      ]),
    );
  });

  it("keeps stable ids as the first column for entity sheets", () => {
    for (const sheet of requiredSheets) {
      expect(sheet.columns[0]?.header).toBe("id");
    }
  });
});
