import { notFound } from "next/navigation";
import { getClientDetail } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { isTaskOverdue } from "@/lib/dates/business-time";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);

  if (result.status === "not-found") {
    notFound();
  }
  if (result.status === "error") {
    return <SetupState title="Client unavailable" message={result.message} />;
  }

  const { client, projects, tasks } = result.data;
  const openTasks = tasks.items.filter((task) => task.status !== "COMPLETED");
  const overdueTasks = openTasks.filter((task) => isTaskOverdue(task, new Date()));

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Client Workspace</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{client.companyName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account manager: {client.accountManagerId || "Unassigned"}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active projects" value={projects.total} />
        <Metric label="Open tasks" value={openTasks.length} />
        <Metric label="Overdue tasks" value={overdueTasks.length} />
        <Metric label="Health" value={client.health} />
      </div>

      <Card>
        <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>Primary contact: {client.primaryContactName || "-"}</div>
          <div>Email: {client.primaryEmail || "-"}</div>
          <div>Phone: {client.primaryPhone || "-"}</div>
          <div>Service: {client.service || "-"}</div>
          <div>Renewal date: {client.renewalDate || "-"}</div>
          <div>Recurring value: {client.recurringValue ? `INR ${client.recurringValue}` : "-"}</div>
          <div>Drive folder: {client.driveFolderUrl || client.driveFolderId || "Not linked"}</div>
          <div>Source deal: {client.sourceDealId || "-"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead><tr><Th>Name</Th><Th>Status</Th><Th>Owner</Th><Th>Health</Th></tr></thead>
            <tbody>
              {projects.items.map((project) => (
                <tr key={project.id}>
                  <Td>{project.projectName}</Td>
                  <Td>{project.status}</Td>
                  <Td>{project.ownerId}</Td>
                  <Td><Badge tone={project.health === "ON_TRACK" ? "success" : project.health === "AT_RISK" ? "warning" : "danger"}>{project.health}</Badge></Td>
                </tr>
              ))}
              {projects.items.length === 0 ? <tr><Td>No projects</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr> : null}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}

async function getResult(id: string) {
  try {
    return { status: "success" as const, data: await getClientDetail(id) };
  } catch (error) {
    const message = toSafeErrorMessage(error);
    return message.includes("not found") ? { status: "not-found" as const } : { status: "error" as const, message };
  }
}
