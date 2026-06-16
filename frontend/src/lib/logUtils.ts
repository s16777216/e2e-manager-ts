import type { TestLog } from "../types/api";

export interface GroupedStep {
  stepIdx: number;
  stepDescription: string;
  logs: TestLog[];
  screenshotUrl?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * 將扁平的 TestLog[] 依據 stepIdx 分群成 GroupedStep[]，並挑選出附帶截圖的日誌 URL。
 */
export function groupLogsByStep(logs: TestLog[]): GroupedStep[] {
  if (!logs || logs.length === 0) return [];

  const groupsMap = new Map<number, GroupedStep>();

  for (const log of logs) {
    const { stepIdx, stepDescription } = log;
    if (!groupsMap.has(stepIdx)) {
      groupsMap.set(stepIdx, {
        stepIdx,
        stepDescription,
        logs: [],
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });
    }

    const group = groupsMap.get(stepIdx)!;
    group.logs.push(log);

    group.promptTokens += log.promptTokens ?? 0;
    group.completionTokens += log.completionTokens ?? 0;
    group.totalTokens += log.totalTokens ?? 0;

    if (log.screenshotUrl) {
      group.screenshotUrl = log.screenshotUrl;
    }
  }

  return Array.from(groupsMap.values()).sort((a, b) => a.stepIdx - b.stepIdx);
}
