import { getContentData } from "@/features/content/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";

export default async function ContentCalendarPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Content</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Content Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upcoming publish dates using persisted content records.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Scheduled Content</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Content calendar unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Publish Date</Th><Th>Topic</Th><Th>Platform</Th><Th>Status</Th></tr></thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.publishDate || "-"}</Td>
                    <Td>{item.topic || item.id}</Td>
                    <Td>{item.platform || "-"}</Td>
                    <Td><Badge tone="info">{item.status}</Badge></Td>
                  </tr>
                ))}
                {result.items.length === 0 ? (
                  <tr><Td>No dated content found</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
      items: content.items
        .filter((item) => Boolean(item.publishDate))
        .sort((left, right) => String(left.publishDate).localeCompare(String(right.publishDate))),
    };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
