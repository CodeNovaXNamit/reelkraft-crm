import { createMeetingAction } from "@/features/business/actions";
import { getCalendarData } from "@/features/business/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

export default async function CalendarPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Business</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Client meetings, discovery calls, shoots, reviews, deadlines, and approval meetings linked to CRM records.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Create Meeting</CardTitle></CardHeader>
        <CardContent>
          <form action={createMeetingAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="title" placeholder="Title" required />
            <select name="type" defaultValue="CLIENT_MEETING" className="h-10 rounded-md border border-border bg-card px-3 text-sm">
              <option value="CLIENT_MEETING">Client meeting</option>
              <option value="DISCOVERY_CALL">Discovery call</option>
              <option value="SHOOT">Shoot</option>
              <option value="INTERNAL_REVIEW">Internal review</option>
              <option value="CONTENT_DEADLINE">Content deadline</option>
              <option value="APPROVAL_MEETING">Approval meeting</option>
              <option value="OTHER">Other</option>
            </select>
            <Input name="clientId" placeholder="Client ID" />
            <Input name="projectId" placeholder="Project ID" />
            <Input name="taskId" placeholder="Task ID" />
            <Input name="startAt" type="datetime-local" required />
            <Input name="endAt" type="datetime-local" required />
            <Input name="attendees" placeholder="Attendee emails, comma-separated" />
            <Input name="googleCalendarEventId" placeholder="Google event ID" />
            <Input name="meetingUrl" placeholder="Meeting URL" />
            <Input name="notes" placeholder="Notes" />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton pendingLabel="Creating...">Create meeting</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Upcoming Meetings</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Calendar unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Title</Th><Th>Type</Th><Th>Start</Th><Th>Client</Th><Th>Google Event</Th></tr></thead>
              <tbody>
                {result.meetings.items.map((meeting) => (
                  <tr key={meeting.id}>
                    <Td>{meeting.title}</Td>
                    <Td><Badge tone="info">{meeting.type || "OTHER"}</Badge></Td>
                    <Td>{meeting.startAt}</Td>
                    <Td>{meeting.clientId || "-"}</Td>
                    <Td>{meeting.googleCalendarEventId || "-"}</Td>
                  </tr>
                ))}
                {result.meetings.items.length === 0 ? (
                  <tr><Td>No meetings found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    return { status: "success" as const, meetings: await getCalendarData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
