import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { SetupState } from "@/components/feedback/setup-state";
import { InvitationForm } from "@/features/team/invitation-form";
import { getInvitationAdminData } from "@/features/team/queries";
import { revokeInvitationAction } from "@/features/team/actions";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import type { Invitation } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

export default async function InvitationsPage() {
  const result = await getInvitationResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Team</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Invitations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Create and manage employee invitations. First Google sign-in for a
          pending invitation activates the employee and writes audit history.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitation Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Google Sheets setup required" message={result.message} />
          ) : (
            <InvitationsTable invitations={result.invitations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getInvitationResult() {
  try {
    return {
      status: "success" as const,
      invitations: await getInvitationAdminData({ pageSize: 50 }),
    };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function InvitationsTable({
  invitations,
}: {
  invitations: PaginatedResult<Invitation>;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Invited</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody>
        {invitations.items.map((invitation) => (
          <tr key={invitation.id}>
            <Td>{invitation.name}</Td>
            <Td>{invitation.email}</Td>
            <Td>{invitation.role}</Td>
            <Td>
              <Badge tone={invitation.status === "PENDING" ? "warning" : "neutral"}>
                {invitation.status}
              </Badge>
            </Td>
            <Td>{new Date(invitation.invitedAt).toLocaleDateString("en-IN")}</Td>
            <Td>
              {invitation.status === "PENDING" ? (
                <form action={revokeInvitationAction}>
                  <input type="hidden" name="invitationId" value={invitation.id} />
                  <button className="text-sm font-medium text-danger" type="submit">
                    Revoke
                  </button>
                </form>
              ) : (
                <span className="text-muted-foreground">No action</span>
              )}
            </Td>
          </tr>
        ))}
        {invitations.items.length === 0 ? (
          <tr>
            <Td>No invitations yet</Td>
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
