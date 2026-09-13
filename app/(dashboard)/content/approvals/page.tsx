import { moveContentStatusAction } from "@/features/content/actions";
import { getContentData } from "@/features/content/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

export default async function ContentApprovalsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Content</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Approvals Queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Internal review, client review, revision, approval, schedule, and publish actions.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Review Queue</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Approvals unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Topic</Th><Th>Status</Th><Th>Reviewer</Th><Th>Decision</Th></tr></thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.topic || item.id}</Td>
                    <Td><Badge tone="warning">{item.status}</Badge></Td>
                    <Td>{item.reviewerId || "-"}</Td>
                    <Td>
                      <form action={moveContentStatusAction} className="grid gap-2 md:grid-cols-[150px_1fr_96px]">
                        <input type="hidden" name="contentId" value={item.id} />
                        <select name="status" defaultValue="APPROVED" className="h-9 rounded-md border border-border bg-card px-2 text-xs">
                          <option value="REVISION">Revision</option>
                          <option value="CLIENT_REVIEW">Client review</option>
                          <option value="APPROVED">Approve</option>
                          <option value="SCHEDULED">Schedule</option>
                          <option value="PUBLISHED">Publish</option>
                        </select>
                        <Input name="notes" placeholder="Approval or revision notes" className="h-9" />
                        <SubmitButton pendingLabel="Saving...">Save</SubmitButton>
                      </form>
                    </Td>
                  </tr>
                ))}
                {result.items.length === 0 ? (
                  <tr><Td>No approvals pending</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    const content = await getContentData({ pageSize: 100 });
    return {
      status: "success" as const,
      items: content.items.filter((item) =>
        ["INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISION", "APPROVED", "SCHEDULED"].includes(item.status),
      ),
    };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
