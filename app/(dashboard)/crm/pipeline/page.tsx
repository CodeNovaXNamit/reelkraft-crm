import { convertDealAction, moveDealStageAction } from "@/features/crm/actions";
import { getPipelineData } from "@/features/crm/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { pipelineStages, type Deal, type PipelineStage } from "@/types/domain";
import { SetupState } from "@/components/feedback/setup-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function PipelinePage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">CRM</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Sales Pipeline</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Move deals through centrally validated stages. Every movement writes
          immutable pipeline history and audit logs.
        </p>
      </header>

      {result.status === "error" ? (
        <SetupState title="Pipeline unavailable" message={result.message} />
      ) : (
        <PipelineBoard deals={result.deals.items} />
      )}
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, deals: await getPipelineData({ pageSize: 100 }) };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function PipelineBoard({ deals }: { deals: Deal[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {pipelineStages.map((stage) => (
        <Card key={stage}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>{stage}</span>
              <Badge tone="neutral">{deals.filter((deal) => deal.stage === stage).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deals.filter((deal) => deal.stage === stage).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="font-medium">{deal.company}</div>
      <div className="mt-1 text-sm text-muted-foreground">INR {deal.value} | {deal.probability}%</div>
      <form action={moveDealStageAction} className="mt-3 space-y-2">
        <input type="hidden" name="dealId" value={deal.id} />
        <select name="newStage" defaultValue={nextStage(deal.stage)} className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm">
          {pipelineStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
        </select>
        <Input name="reason" placeholder="Reason" required />
        <Input name="nextAction" placeholder="Next action" />
        <SubmitButton pendingLabel="Moving...">Move stage</SubmitButton>
      </form>
      {deal.stage === "WON" && !deal.convertedClientId ? (
        <form action={convertDealAction} className="mt-3 space-y-2 border-t border-border pt-3">
          <input type="hidden" name="dealId" value={deal.id} />
          <Input name="accountManagerId" placeholder="Account manager ID" />
          <Input name="recurringValue" type="number" min="0" placeholder="Recurring value" />
          <Input name="renewalDate" type="date" />
          <SubmitButton pendingLabel="Converting...">Convert to client</SubmitButton>
        </form>
      ) : null}
      {deal.convertedClientId ? (
        <div className="mt-3 text-xs text-muted-foreground">Converted: {deal.convertedClientId}</div>
      ) : null}
    </div>
  );
}

function nextStage(stage: PipelineStage) {
  const index = pipelineStages.indexOf(stage);
  return pipelineStages[Math.min(index + 1, pipelineStages.length - 1)];
}
