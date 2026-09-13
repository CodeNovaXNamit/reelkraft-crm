import Link from "next/link";
import { createLeadAction } from "@/features/crm/actions";
import { getLeadData } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import type { Lead } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

export default async function LeadsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">CRM</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Leads</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Create, search, and manage sales leads. Creating a lead also creates
          the linked deal for the pipeline.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLeadAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input name="company" placeholder="Company" required />
            <Input name="contactName" placeholder="Contact name" required />
            <Input name="email" type="email" placeholder="Email" />
            <Input name="phone" placeholder="Phone" />
            <Input name="website" placeholder="Website" />
            <Input name="industry" placeholder="Industry" />
            <Input name="source" placeholder="Source" />
            <Input name="serviceInterested" placeholder="Service interested" />
            <Input name="dealValue" type="number" min="0" step="1" placeholder="Deal value" />
            <Input name="ownerId" placeholder="Owner employee ID" />
            <Input name="probability" type="number" min="0" max="100" placeholder="Probability" />
            <Input name="expectedCloseDate" type="date" />
            <Input name="nextAction" placeholder="Next action" />
            <Input name="notes" placeholder="Notes" />
            <div className="md:col-span-2 xl:col-span-4">
              <SubmitButton pendingLabel="Creating...">Create lead</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
        </CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Lead repository unavailable" message={result.message} />
          ) : (
            <LeadsTable leads={result.leads} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, leads: await getLeadData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function LeadsTable({ leads }: { leads: PaginatedResult<Lead> }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Company</Th>
          <Th>Contact</Th>
          <Th>Stage</Th>
          <Th>Owner</Th>
          <Th>Value</Th>
          <Th>Next Action</Th>
        </tr>
      </thead>
      <tbody>
        {leads.items.map((lead) => (
          <tr key={lead.id}>
            <Td>
              <Link href={`/crm/leads/${lead.id}`} className="font-medium text-accent">
                {lead.company}
              </Link>
            </Td>
            <Td>{lead.contactName}</Td>
            <Td><Badge tone="info">{lead.stage}</Badge></Td>
            <Td>{lead.ownerId}</Td>
            <Td>{lead.dealValue ? `INR ${lead.dealValue}` : "-"}</Td>
            <Td>{lead.nextAction || "-"}</Td>
          </tr>
        ))}
        {leads.items.length === 0 ? (
          <tr>
            <Td>No leads found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td>
          </tr>
        ) : null}
      </tbody>
    </Table>
  );
}
