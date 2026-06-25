import { LogEntry } from "../state.js";

/**
 * 執行後的條件路由：決定下一步是繼續執行、完成步驟、還是失敗中斷
 */
export function routeAfterExecution(state: {
  logs: LogEntry[];
  step_retry_count: number;
  current_step_idx: number;
  step_expecteds: string[];
}): "executor" | "step_asserter" | "step_tracker" | "reporter" {
  const logs = state.logs || [];
  if (logs.length === 0) {
    return "executor";
  }

  // 讀取最後一筆日誌，判斷是否呼叫了 done_acting
  const last_log = logs[logs.length - 1];
  const action = last_log.action || "";

  if (action.includes("done_acting")) {
    const idx = state.current_step_idx;
    const hasExpected = !!(state.step_expecteds && state.step_expecteds[idx] && state.step_expecteds[idx].trim());
    if (hasExpected) {
      return "step_asserter";
    } else {
      return "step_tracker";
    }
  }

  // 檢查單步重試次數是否超限 (上限 5 次)
  if (state.step_retry_count >= 5) {
    return "reporter";
  }

  return "executor";
}

/**
 * 步驟驗證後的條件路由：決定是推進步驟，還是返回執行器重試，或是超限失敗
 */
export function routeAfterStepAssertion(state: {
  logs: LogEntry[];
  step_retry_count: number;
}): "step_tracker" | "executor" | "reporter" {
  const logs = state.logs || [];
  if (logs.length === 0) {
    return "executor";
  }

  const last_log = logs[logs.length - 1];
  if (last_log.action === "step_assertion") {
    if (last_log.result === "PASS") {
      return "step_tracker";
    }
  }

  // 檢查單步重試次數是否超限 (上限 5 次)
  if (state.step_retry_count >= 5) {
    return "reporter";
  }

  return "executor";
}

/**
 * 步驟推進後的路由：判斷是否還有下一步，或是進入最終視覺斷言
 */
export function routeNextStep(state: {
  current_step_idx: number;
  steps: string[];
}): "executor" | "asserter" {
  if (state.current_step_idx < state.steps.length) {
    return "executor";
  }
  return "asserter";
}
