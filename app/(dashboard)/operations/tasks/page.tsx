import { createTaskAction, updateTaskAction } from "@/features/operations/actions";
import { getTaskData } from "@/features/operations/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { isTaskOverdue } from "@/lib/dates/business-time";
import { taskStatuses, type Task } from "@/types/domain";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import type { PaginatedResult } from "@/types/pagination";

export default async function TasksPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Operations</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Tasks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Assigned task workflow from To Do through Completed, with blocked
          recovery and notification records.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Create Task</CardTitle></CardHeader>
        <CardContent>
          <form action={createTaskAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="title" placeholder="Task title" required />
            <Input name="assignedToId" placeholder="Assignee employee ID" />
            <Input name="clientId" placeholder="Client ID" />
            <Input name="projectId" placeholder="Project ID" />
            <select name="priority" defaultValue="MEDIUM" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
            <select name="status" defaultValue="TO_DO" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <Input name="startDate" type="date" />
            <Input name="dueDate" type="date" />
            <Input name="estimatedTime" type="number" min="0" step="0.25" placeholder="Estimated hours" />
            <Input name="actualTime" type="number" min="0" step="0.25" placeholder="Actual hours" />
            <Input name="driveLink" placeholder="Drive link" />
            <Input name="comments" placeholder="Comments" />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton pendingLabel="Creating...">Create task</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Task List</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Task repository unavailable" message={result.message} />
          ) : (
            <TasksTable tasks={result.tasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, tasks: await getTaskData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function TasksTable({ tasks }: { tasks: PaginatedResult<Task> }) {
  return (
    <Table>
      <thead><tr><Th>Title</Th><Th>Assignee</Th><Th>Status</Th><Th>Priority</Th><Th>Due</Th><Th>Move</Th></tr></thead>
      <tbody>
        {tasks.items.map((task) => (
          <tr key={task.id}>
            <Td>{task.title}</Td>
            <Td>{task.assignedToId}</Td>
            <Td><Badge tone={isTaskOverdue(task, new Date()) ? "danger" : "info"}>{task.status}</Badge></Td>
            <Td>{task.priority}</Td>
            <Td>{task.dueDate || "-"}</Td>
            <Td>
              <form action={updateTaskAction} className="flex gap-2">
                <input type="hidden" name="taskId" value={task.id} />
                <select name="status" defaultValue={task.status} className="h-9 rounded-md border border-border bg-card px-2 text-xs">
                  {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <button type="submit" className="text-sm font-medium text-accent">Save</button>
              </form>
            </Td>
          </tr>
        ))}
        {tasks.items.length === 0 ? (
          <tr><Td>No tasks found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
        ) : null}
      </tbody>
    </Table>
  );
}
