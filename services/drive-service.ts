import { assertPermission } from "@/lib/permissions/authorize";
import type { DriveGateway } from "@/repositories/interfaces/drive";
import type { Actor } from "@/types/domain";

export class DriveService {
  constructor(private readonly driveGateway: DriveGateway) {}

  async getSharedDriveStatus(actor: Actor) {
    assertPermission(actor, "files", "view");
    const drive = await this.driveGateway.resolveSharedDrive();
    const rootFolders = await this.driveGateway.listRootFolders();

    return {
      drive,
      rootFolders,
    };
  }
}
