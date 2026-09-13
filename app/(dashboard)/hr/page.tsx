import { getHrData } from "@/features/business/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function HrPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Business</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">HR</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Employee profile data and leave/workload fields. Payroll is intentionally not part of V1.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Employees</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="HR unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Department</Th><Th>Manager</Th><Th>Status</Th><Th>Leave</Th></tr></thead>
              <tbody>
                {result.employees.items.map((employee) => (
                  <tr key={employee.id}>
                    <Td>{employee.name}</Td>
                    <Td>{employee.email}</Td>
                    <Td>{employee.role}</Td>
                    <Td>{employee.department || "-"}</Td>
                    <Td>{employee.managerId || "-"}</Td>
                    <Td><Badge tone={employee.status === "ACTIVE" ? "success" : "danger"}>{employee.status}</Badge></Td>
                    <Td>{employee.leaveStatus || "-"}</Td>
                  </tr>
                ))}
                {result.employees.items.length === 0 ? (
                  <tr><Td>No employees found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    return { status: "success" as const, employees: await getHrData({ pageSize: 100 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
