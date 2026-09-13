import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";
import { ensureWorkbookSchemaAction } from "@/features/team/actions";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Administration</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Phase 1 setup controls for the operational workbook. Secrets remain in
          environment variables and are never edited in browser UI.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets Schema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Creates required tabs and writes header rows for Employees,
            Invitations, AuditLogs, Notifications, and Settings in the
            configured workbook.
          </p>
          <form action={ensureWorkbookSchemaAction}>
            <SubmitButton pendingLabel="Validating...">Ensure workbook schema</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
