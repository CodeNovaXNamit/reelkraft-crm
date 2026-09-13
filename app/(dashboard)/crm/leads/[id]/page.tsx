import { notFound } from "next/navigation";
import { updateLeadAction } from "@/features/crm/actions";
import { getLeadDetail } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

export default async function LeadDetailPage({
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
    return <SetupState title="Lead unavailable" message={result.message} />;
  }

  const { lead, deal, movements } = result.data;

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Lead Detail</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{lead.company}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{lead.contactName}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateLeadAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input type="hidden" name="leadId" value={lead.id} />
            <Input name="company" defaultValue={lead.company} required />
            <Input name="contactName" defaultValue={lead.contactName} required />
            <Input name="email" type="email" defaultValue={lead.email} />
            <Input name="phone" defaultValue={lead.phone} />
            <Input name="website" defaultValue={lead.website} />
            <Input name="industry" defaultValue={lead.industry} />
            <Input name="source" defaultValue={lead.source} />
            <Input name="serviceInterested" defaultValue={lead.serviceInterested} />
            <Input name="dealValue" type="number" min="0" defaultValue={lead.dealValue} />
            <Input name="ownerId" defaultValue={lead.ownerId} />
            <Input name="expectedCloseDate" type="date" defaultValue={lead.expectedCloseDate} />
            <Input name="nextAction" defaultValue={lead.nextAction} />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton>Save lead</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Linked Deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {deal ? (
              <>
                <div><Badge tone="info">{deal.stage}</Badge></div>
                <div>Deal ID: {deal.id}</div>
                <div>Value: INR {deal.value}</div>
                <div>Probability: {deal.probability}%</div>
              </>
            ) : (
              <p className="text-muted-foreground">No linked deal found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr><Th>When</Th><Th>From</Th><Th>To</Th><Th>Reason</Th></tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <Td>{new Date(movement.createdAt).toLocaleString("en-IN")}</Td>
                    <Td>{movement.previousStage}</Td>
                    <Td>{movement.newStage}</Td>
                    <Td>{movement.reason}</Td>
                  </tr>
                ))}
                {movements.length === 0 ? (
                  <tr><Td>No movement yet</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
                ) : null}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function getResult(id: string) {
  try {
    return { status: "success" as const, data: await getLeadDetail(id) };
  } catch (error) {
    const message = toSafeErrorMessage(error);
    return message.includes("not found") ? { status: "not-found" as const } : { status: "error" as const, message };
  }
}
