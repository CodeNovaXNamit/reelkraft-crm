import { createContentAction, moveContentStatusAction } from "@/features/content/actions";
import { getContentData } from "@/features/content/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { contentStatuses, type ContentItem } from "@/types/domain";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import type { PaginatedResult } from "@/types/pagination";

export default async function ContentItemsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Content</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Content Items</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Production workflow from idea through published, with Drive links,
          assignees, approval notes, and audited status movement.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Create Content</CardTitle></CardHeader>
        <CardContent>
          <form action={createContentAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="clientId" placeholder="Client ID" required />
            <Input name="topic" placeholder="Topic" required />
            <Input name="platform" placeholder="Platform" />
            <Input name="contentType" placeholder="Content type" />
            <Input name="pillar" placeholder="Pillar" />
            <Input name="writerId" placeholder="Writer employee ID" />
            <Input name="designerId" placeholder="Designer employee ID" />
            <Input name="editorId" placeholder="Editor employee ID" />
            <Input name="reviewerId" placeholder="Reviewer employee ID" />
            <Input name="publishDate" type="date" />
            <Input name="driveFileId" placeholder="Drive file ID" />
            <Input name="driveFileUrl" placeholder="Drive file URL" />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton pendingLabel="Creating...">Create content</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Content Table</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Content repository unavailable" message={result.message} />
          ) : (
            <ContentTable content={result.content} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, content: await getContentData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function ContentTable({ content }: { content: PaginatedResult<ContentItem> }) {
  return (
    <Table>
      <thead>
        <tr><Th>Topic</Th><Th>Client</Th><Th>Status</Th><Th>Owner</Th><Th>Publish</Th><Th>Move</Th></tr>
      </thead>
      <tbody>
        {content.items.map((item) => (
          <tr key={item.id}>
            <Td>{item.topic || item.id}</Td>
            <Td>{item.clientId}</Td>
            <Td><Badge tone={item.status === "REVISION" ? "warning" : "info"}>{item.status}</Badge></Td>
            <Td>{item.editorId || item.writerId || "-"}</Td>
            <Td>{item.publishDate || "-"}</Td>
            <Td>
              <form action={moveContentStatusAction} className="flex gap-2">
                <input type="hidden" name="contentId" value={item.id} />
                <select name="status" defaultValue={item.status} className="h-9 rounded-md border border-border bg-card px-2 text-xs">
                  {contentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <Input name="notes" placeholder="Notes" className="h-9 w-28" />
                <button type="submit" className="text-sm font-medium text-accent">Save</button>
              </form>
            </Td>
          </tr>
        ))}
        {content.items.length === 0 ? (
          <tr><Td>No content found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
        ) : null}
      </tbody>
    </Table>
  );
}
