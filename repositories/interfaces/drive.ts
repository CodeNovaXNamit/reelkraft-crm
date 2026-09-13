export type DriveFolderMetadata = {
  id: string;
  name: string;
  webViewLink?: string;
};

export interface DriveGateway {
  resolveSharedDrive(): Promise<DriveFolderMetadata>;
  listRootFolders(): Promise<DriveFolderMetadata[]>;
}
