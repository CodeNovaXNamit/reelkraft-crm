import { ApplicationError } from "@/lib/errors/application-error";
import { createDriveApi } from "@/lib/google/google-auth";
import { withGoogleRetry } from "@/lib/google/retry";
import type { DriveFolderMetadata, DriveGateway } from "@/repositories/interfaces/drive";

function sharedDriveId() {
  const id = process.env.GOOGLE_SHARED_DRIVE_ID;
  if (!id) {
    throw new ApplicationError(
      "INTEGRATION_ERROR",
      "GOOGLE_SHARED_DRIVE_ID is required for Drive integration.",
    );
  }

  return id;
}

export class GoogleDriveGateway implements DriveGateway {
  private readonly drive = createDriveApi();
  private readonly driveId = sharedDriveId();

  async resolveSharedDrive(): Promise<DriveFolderMetadata> {
    const response = await withGoogleRetry(() =>
      this.drive.drives.get({
        driveId: this.driveId,
      }),
    );

    if (!response.data.id || !response.data.name) {
      throw new ApplicationError("INTEGRATION_ERROR", "Shared Drive could not be resolved.");
    }

    return {
      id: response.data.id,
      name: response.data.name,
    };
  }

  async listRootFolders(): Promise<DriveFolderMetadata[]> {
    const response = await withGoogleRetry(() =>
      this.drive.files.list({
        corpora: "drive",
        driveId: this.driveId,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: "files(id,name,webViewLink)",
        pageSize: 100,
      }),
    );

    return (
      response.data.files?.flatMap((file) =>
        file.id && file.name
          ? [{ id: file.id, name: file.name, webViewLink: file.webViewLink ?? undefined }]
          : [],
      ) ?? []
    );
  }
}
