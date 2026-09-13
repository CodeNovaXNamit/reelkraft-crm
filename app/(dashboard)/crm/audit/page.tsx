import { getPipelineAuditData } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function PipelineAuditPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">CRM</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Pipeline Audit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Immutable stage movement history for deals.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Stage Movements</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Pipeline audit unavailable" message={result.message} />
          ) : (
            <Table>
              <thead>
                <tr><Th>When</Th><Th>Deal</Th><Th>From</Th><Th>To</Th><Th>Actor</Th><Th>Reason</Th></tr>
              </thead>
              <tbody>
                {result.movements.items.map((movement) => (
                  <tr key={movement.id}>
                    <Td>{new Date(movement.createdAt).toLocaleString("en-IN")}</Td>
                    <Td>{movement.dealId}</Td>
                    <Td>{movement.previousStage}</Td>
                    <Td>{movement.newStage}</Td>
                    <Td>{movement.actorId}</Td>
                    <Td>{movement.reason}</Td>
                  </tr>
                ))}
                {result.movements.items.length === 0 ? (
                  <tr><Td>No movements</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
                ) : null}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, movements: await getPipelineAuditData({ pageSize: 100 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
