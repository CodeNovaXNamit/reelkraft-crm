import { pipelineStages, type PipelineStage, type TaskStatus } from "@/types/domain";

export const businessTimezone = "Asia/Kolkata";

export const activePipelineStages: PipelineStage[] = pipelineStages.filter(
  (stage) => stage !== "WON" && stage !== "LOST",
);

export function calculateWeightedPipelineValue(
  deals: Array<{ value: number; probability: number; stage: PipelineStage }>,
) {
  return deals
    .filter((deal) => activePipelineStages.includes(deal.stage))
    .reduce((total, deal) => total + (deal.value * deal.probability) / 100, 0);
}

export function isTaskOverdue(task: { dueDate?: string; status: TaskStatus }, today: Date) {
  if (!task.dueDate || task.status === "COMPLETED") {
    return false;
  }

  const dueDate = new Date(`${task.dueDate}T00:00:00`);
  const businessToday = new Date(today);
  businessToday.setHours(0, 0, 0, 0);

  return dueDate < businessToday;
}
