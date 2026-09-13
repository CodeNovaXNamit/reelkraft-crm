import { describe, expect, it } from "vitest";
import {
  calculateWeightedPipelineValue,
  isTaskOverdue,
} from "@/lib/dates/business-time";

describe("business rule foundation", () => {
  it("excludes won and lost deals from weighted active pipeline value", () => {
    expect(
      calculateWeightedPipelineValue([
        { value: 100000, probability: 50, stage: "NEGOTIATION" },
        { value: 50000, probability: 100, stage: "WON" },
        { value: 30000, probability: 0, stage: "LOST" },
      ]),
    ).toBe(50000);
  });

  it("marks incomplete tasks overdue using date comparison", () => {
    expect(
      isTaskOverdue(
        { dueDate: "2026-09-08", status: "IN_PROGRESS" },
        new Date("2026-09-09T09:00:00+05:30"),
      ),
    ).toBe(true);
  });

  it("does not mark completed tasks overdue", () => {
    expect(
      isTaskOverdue(
        { dueDate: "2026-09-08", status: "COMPLETED" },
        new Date("2026-09-09T09:00:00+05:30"),
      ),
    ).toBe(false);
  });
});
