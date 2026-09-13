import { getWorkloadData } from "@/features/operations/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function WorkloadPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Operations</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Workload</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Workload is calculated from active task and project records. No fake
          utilization metric is displayed.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Employee Load</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Workload unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Employee</Th><Th>Role</Th><Th>Active Tasks</Th><Th>Overdue</Th><Th>Due This Week</Th><Th>Projects</Th><Th>Priority</Th></tr></thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.employee.id}>
                    <Td>{row.employee.name}</Td>
                    <Td>{row.employee.role}</Td>
                    <Td>{row.activeTaskCount}</Td>
                    <Td><Badge tone={row.overdueTaskCount > 0 ? "danger" : "success"}>{row.overdueTaskCount}</Badge></Td>
                    <Td>{row.dueThisWeekTaskCount}</Td>
                    <Td>{row.activeProjectCount}</Td>
                    <Td>
                      LOW {row.priorityDistribution.LOW} / MED {row.priorityDistribution.MEDIUM} / HIGH {row.priorityDistribution.HIGH} / URG {row.priorityDistribution.URGENT}
                    </Td>
                  </tr>
                ))}
                {result.rows.length === 0 ? (
                  <tr><Td>No workload rows</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    return { status: "success" as const, rows: await getWorkloadData() };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
