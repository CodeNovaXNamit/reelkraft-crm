import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { SetupState } from "@/components/feedback/setup-state";
import { getEmployeeAdminData } from "@/features/team/queries";
import { updateEmployeeAccessAction } from "@/features/team/actions";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { roles, type Employee } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

export default async function EmployeesPage() {
  const result = await getEmployeeResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Team</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Employees</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Manage active CRM employee access. Changes are enforced server-side
          and written to audit history.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Employee Access</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Employee repository unavailable" message={result.message} />
          ) : (
            <EmployeesTable employees={result.employees} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getEmployeeResult() {
  try {
    return {
      status: "success" as const,
      employees: await getEmployeeAdminData({ pageSize: 50 }),
    };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function EmployeesTable({ employees }: { employees: PaginatedResult<Employee> }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Department</Th>
          <Th>Access</Th>
        </tr>
      </thead>
      <tbody>
        {employees.items.map((employee) => (
          <tr key={employee.id}>
            <Td>{employee.name}</Td>
            <Td>{employee.email}</Td>
            <Td>
              <form action={updateEmployeeAccessAction} className="flex gap-2">
                <input type="hidden" name="employeeId" value={employee.id} />
                <select
                  name="role"
                  defaultValue={employee.role}
                  className="h-9 rounded-md border border-border bg-card px-2 text-xs"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button className="text-sm font-medium text-accent" type="submit">
                  Save
                </button>
              </form>
            </Td>
            <Td>
              <Badge tone={employee.status === "ACTIVE" ? "success" : "danger"}>
                {employee.status}
              </Badge>
            </Td>
            <Td>{employee.department || "-"}</Td>
            <Td>
              <form action={updateEmployeeAccessAction}>
                <input type="hidden" name="employeeId" value={employee.id} />
                <input
                  type="hidden"
                  name="status"
                  value={employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                />
                <button className="text-sm font-medium text-danger" type="submit">
                  {employee.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
              </form>
            </Td>
          </tr>
        ))}
        {employees.items.length === 0 ? (
          <tr>
            <Td>No employee rows found</Td>
            <Td>-</Td>
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
