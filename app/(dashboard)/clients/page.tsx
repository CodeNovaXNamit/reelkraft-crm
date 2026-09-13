import Link from "next/link";
import { getClientData } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import type { Client } from "@/types/domain";
import type { PaginatedResult } from "@/types/pagination";

export default async function ClientsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Client Workspace</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Clients</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Clients converted from won deals with account manager, health,
          onboarding, projects, tasks, and source links.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Client List</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Client repository unavailable" message={result.message} />
          ) : (
            <ClientsTable clients={result.clients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, clients: await getClientData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function ClientsTable({ clients }: { clients: PaginatedResult<Client> }) {
  return (
    <Table>
      <thead>
        <tr><Th>Company</Th><Th>Contact</Th><Th>Health</Th><Th>Status</Th><Th>Manager</Th><Th>Source Deal</Th></tr>
      </thead>
      <tbody>
        {clients.items.map((client) => (
          <tr key={client.id}>
            <Td>
              <Link href={`/clients/${client.id}`} className="font-medium text-accent">
                {client.companyName}
              </Link>
            </Td>
            <Td>{client.primaryContactName || "-"}</Td>
            <Td><Badge tone={client.health === "HEALTHY" ? "success" : client.health === "ATTENTION" ? "warning" : "danger"}>{client.health}</Badge></Td>
            <Td>{client.status}</Td>
            <Td>{client.accountManagerId || "-"}</Td>
            <Td>{client.sourceDealId || "-"}</Td>
          </tr>
        ))}
        {clients.items.length === 0 ? (
          <tr><Td>No clients found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
        ) : null}
      </tbody>
    </Table>
  );
}
