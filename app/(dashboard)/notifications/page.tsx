import { getMyNotifications } from "@/features/operations/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function NotificationsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Coordination</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recipient-scoped in-app notifications created by operational workflows.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>My Notifications</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Notifications unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>When</Th><Th>Type</Th><Th>Message</Th><Th>Status</Th><Th>Link</Th></tr></thead>
              <tbody>
                {result.notifications.map((notification) => (
                  <tr key={notification.id}>
                    <Td>{new Date(notification.createdAt).toLocaleString("en-IN")}</Td>
                    <Td>{notification.type}</Td>
                    <Td>{notification.message}</Td>
                    <Td><Badge tone={notification.readAt ? "neutral" : "info"}>{notification.readAt ? "READ" : "UNREAD"}</Badge></Td>
                    <Td>{notification.link || "-"}</Td>
                  </tr>
                ))}
                {result.notifications.length === 0 ? (
                  <tr><Td>No notifications</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    return { status: "success" as const, notifications: await getMyNotifications() };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
