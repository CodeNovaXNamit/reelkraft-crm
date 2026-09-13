import { getReportSummary } from "@/features/business/queries";
import { toSafeErrorMessage } from "@/lib/errors/application-error";
import { SetupState } from "@/components/feedback/setup-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  const result = await getResult();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <div className="text-sm font-medium text-muted-foreground">Business</div>
        <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sales, operations, content, client health, and finance totals reconciled from repository data.
        </p>
      </header>
      {result.status === "error" ? (
        <SetupState title="Reports unavailable" message={result.message} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Pipeline Value" value={`INR ${Math.round(result.summary.sales.pipelineValue)}`} />
          <MetricCard title="Weighted Pipeline" value={`INR ${Math.round(result.summary.sales.weightedPipeline)}`} />
          <MetricCard title="Won Revenue" value={`INR ${Math.round(result.summary.sales.revenue)}`} />
          <MetricCard title="Outstanding" value={`INR ${Math.round(result.summary.finance.outstandingPayments)}`} />
          <MetricCard title="Leads" value={String(result.summary.sales.leadCount)} />
          <MetricCard title="Won / Lost" value={`${result.summary.sales.wonCount} / ${result.summary.sales.lostCount}`} />
          <MetricCard title="Overdue Tasks" value={String(result.summary.operations.overdueCount)} />
          <MetricCard title="Active Projects" value={String(result.summary.operations.activeProjectCount)} />
          <MetricCard title="Produced Content" value={String(result.summary.content.producedCount)} />
          <MetricCard title="Approved Content" value={String(result.summary.content.approvedCount)} />
          <MetricCard title="Published Content" value={String(result.summary.content.publishedCount)} />
          <MetricCard title="At-risk Clients" value={String(result.summary.clients.atRiskCount)} />
        </div>
      )}
    </div>
  );
}

async function getResult() {
  try {
    return { status: "success" as const, summary: await getReportSummary() };
  } catch (error) {
    return { status: "error" as const, message: toSafeErrorMessage(error) };
  }
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
