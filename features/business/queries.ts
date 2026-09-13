import { getCurrentActor } from "@/lib/auth/current-user";
import { createBusinessServices } from "@/features/business/service";
import type { PageQuery } from "@/types/pagination";

export async function getFinanceData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { finance } = createBusinessServices();
  return finance.list(query, actor);
}

export async function getHrData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { hr } = createBusinessServices();
  return hr.list(query, actor);
}

export async function getCalendarData(query: PageQuery = {}) {
  const actor = await getCurrentActor();
  const { calendar } = createBusinessServices();
  return calendar.list(query, actor);
}

export async function getReportSummary() {
  const actor = await getCurrentActor();
  const { reports } = createBusinessServices();
  return reports.getSummary(actor);
}
