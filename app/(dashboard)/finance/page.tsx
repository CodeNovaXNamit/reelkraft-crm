import { createFinanceAction, recordPaymentAction } from "@/features/business/actions";
import { getFinanceData } from "@/features/business/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";

export default async function FinancePage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Business</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Finance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Invoice records, numeric INR amounts, partial payments, outstanding balances, and audited changes.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Create Invoice</CardTitle></CardHeader>
        <CardContent>
          <form action={createFinanceAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input name="clientId" placeholder="Client ID" required />
            <Input name="invoiceNumber" placeholder="Invoice number" required />
            <Input name="amount" type="number" min="1" step="1" placeholder="Amount" required />
            <Input name="dueDate" type="date" />
            <Input name="notes" placeholder="Notes" />
            <div className="md:col-span-2 xl:col-span-5">
              <SubmitButton pendingLabel="Creating...">Create invoice</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent>
          {result.status === "error" ? (
            <SetupState title="Finance unavailable" message={result.message} />
          ) : (
            <Table>
              <thead><tr><Th>Invoice</Th><Th>Client</Th><Th>Status</Th><Th>Amount</Th><Th>Outstanding</Th><Th>Payment</Th></tr></thead>
              <tbody>
                {result.invoices.items.map((invoice) => (
                  <tr key={invoice.id}>
                    <Td>{invoice.invoiceNumber}</Td>
                    <Td>{invoice.clientId}</Td>
                    <Td><Badge tone={invoice.computedStatus === "OVERDUE" ? "danger" : "info"}>{invoice.computedStatus}</Badge></Td>
                    <Td>INR {invoice.amount}</Td>
                    <Td>INR {invoice.outstandingBalance}</Td>
                    <Td>
                      <form action={recordPaymentAction} className="flex gap-2">
                        <input type="hidden" name="financeId" value={invoice.id} />
                        <Input name="amount" type="number" min="1" step="1" placeholder="Amount" className="h-9 w-28" />
                        <Input name="method" placeholder="Method" className="h-9 w-28" />
                        <button type="submit" className="text-sm font-medium text-accent">Record</button>
                      </form>
                    </Td>
                  </tr>
                ))}
                {result.invoices.items.length === 0 ? (
                  <tr><Td>No invoices found</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr>
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
    return { status: "success" as const, invoices: await getFinanceData({ pageSize: 50 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}
