import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { getDriveAdminStatus } from "@/features/team/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import type { DriveFolderMetadata } from "@/repositories/interfaces/drive";

export default async function FilesPage() {
  const result = await getDriveResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Google Drive</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Files</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Phase 1 validates access to the configured Reelkraft Shared Drive and
          reads folder metadata only. Large media files stay in Drive.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Shared Drive Status</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Drive setup required" message={result.message} />
          ) : (
            <DriveStatus drive={result.drive} rootFolders={result.rootFolders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getDriveResult() {
  try {
    const status = await getDriveAdminStatus();
    return { status: "success" as const, ...status };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function DriveStatus({
  drive,
  rootFolders,
}: {
  drive: DriveFolderMetadata;
  rootFolders: DriveFolderMetadata[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">Shared Drive</div>
        <div className="mt-1 font-medium">{drive.name}</div>
        <div className="text-sm text-muted-foreground">{drive.id}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {rootFolders.map((folder) => (
          <Badge key={folder.id} tone="neutral">
            {folder.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
