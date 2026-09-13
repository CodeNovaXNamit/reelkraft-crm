import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { SetupState } from "@/components/feedback/setup-state";
import { getRecentAuditLogs } from "@/features/team/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import type { AuditLog } from "@/types/domain";

export default async function AuditLogsPage() {
  const result = await getAuditResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Governance</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Audit Logs</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Immutable access and operational audit events. Normal employees cannot
          edit or delete this history.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Audit log repository unavailable" message={result.message} />
          ) : (
            <AuditTable logs={result.logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getAuditResult() {
  try {
    return { status: "success" as const, logs: await getRecentAuditLogs() };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function AuditTable({ logs }: { logs: AuditLog[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>When</Th>
          <Th>User</Th>
          <Th>Action</Th>
          <Th>Entity</Th>
          <Th>Entity ID</Th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <Td>{new Date(log.createdAt).toLocaleString("en-IN")}</Td>
            <Td>{log.userId}</Td>
            <Td>{log.action}</Td>
            <Td>{log.entityType}</Td>
            <Td>{log.entityId}</Td>
          </tr>
        ))}
        {logs.length === 0 ? (
          <tr>
            <Td>No audit events found</Td>
            <Td>-</Td>
            <Td>-</Td>
            <Td>-</Td>
            <Td>-</Td>
          </tr>
        ) : null}
      </tbody>
    </Table>
  );
}
