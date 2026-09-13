import { assertPermission } from "@/lib/permissions/authorize";
import type { GoogleSheetsClient } from "@/repositories/google-sheets/client";
import type { Actor } from "@/types/domain";

export class SchemaService {
  constructor(private readonly sheetsClient: GoogleSheetsClient) {}

  async ensureOperationalWorkbook(actor: Actor) {
    assertPermission(actor, "settings", "edit");
    await this.sheetsClient.ensureWorkbookSchema();
    return { ok: true };
  }
}
