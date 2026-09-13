import { createProjectAction } from "@/features/operations/actions";
import { getProjectData } from "@/features/operations/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import type { Project } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

export default async function ProjectsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Operations</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Projects</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Client-linked delivery projects with owner, team, schedule, budget,
          health, and Drive linkage.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Create Project</CardTitle></CardHeader>
        <CardContent>
          <form action={createProjectAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="clientId" placeholder="Client ID" required />
            <Input name="projectName" placeholder="Project name" required />
            <Input name="type" placeholder="Type" />
            <Input name="ownerId" placeholder="Owner employee ID" />
            <Input name="teamMemberIds" placeholder="Team IDs, comma separated" />
            <Input name="startDate" type="date" />
            <Input name="dueDate" type="date" />
            <select name="status" defaultValue="ACTIVE" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <select name="priority" defaultValue="MEDIUM" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
            <Input name="budget" type="number" min="0" placeholder="Budget" />
            <select name="health" defaultValue="ON_TRACK" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              <option value="ON_TRACK">ON_TRACK</option>
              <option value="AT_RISK">AT_RISK</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
            <Input name="driveLink" placeholder="Drive link" />
            <Input name="description" placeholder="Description" />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton pendingLabel="Creating...">Create project</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project List</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Project repository unavailable" message={result.message} />
          ) : (
            <ProjectsTable projects={result.projects} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, projects: await getProjectData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function ProjectsTable({ projects }: { projects: PaginatedResult<Project> }) {
  return (
    <Table>
      <thead><tr><Th>Name</Th><Th>Client</Th><Th>Owner</Th><Th>Priority</Th><Th>Health</Th><Th>Due</Th></tr></thead>
      <tbody>
        {projects.items.map((project) => (
          <tr key={project.id}>
            <Td>{project.projectName}</Td>
            <Td>{project.clientId}</Td>
            <Td>{project.ownerId}</Td>
            <Td>{project.priority}</Td>
            <Td><Badge tone={project.health === "ON_TRACK" ? "success" : project.health === "AT_RISK" ? "warning" : "danger"}>{project.health}</Badge></Td>
            <Td>{project.dueDate || "-"}</Td>
          </tr>
        ))}
        {projects.items.length === 0 ? (
          <tr><Td>No projects found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
        ) : null}
      </tbody>
    </Table>
  );
}
