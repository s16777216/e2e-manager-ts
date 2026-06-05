export type TaskStatus = "pending" | "running" | "passed" | "failed" | "error";

export interface TaskStateUpdate {
  status: TaskStatus;
  finalResult?: "PASS" | "FAIL" | "ERROR";
  finalReason?: string;
  startedAt?: Date;
  finishedAt?: Date;
}

/**
 * 任務狀態移轉與業務欄位組裝有限狀態機 (FSM) - 純邏輯
 */
export class TaskFSM {
  /**
   * 1. 任務被搶占領取 (pending -> running)
   */
  public static start(now: Date = new Date()): TaskStateUpdate {
    return {
      status: "running",
      startedAt: now
    };
  }

  /**
   * 2. 正常執行結束 (running -> passed/failed)
   */
  public static complete(assertionResult: "PASS" | "FAIL", reason: string, now: Date = new Date()): TaskStateUpdate {
    return {
      status: assertionResult === "PASS" ? "passed" : "failed",
      finalResult: assertionResult,
      finalReason: reason,
      finishedAt: now
    };
  }

  /**
   * 3. 系統崩潰 (running -> error)
   */
  public static crash(errorMessage: string, now: Date = new Date()): TaskStateUpdate {
    return {
      status: "error",
      finalResult: "ERROR",
      finalReason: `任務執行崩潰：${errorMessage}`,
      finishedAt: now
    };
  }

  /**
   * 4. 超時終止 (running -> failed)
   */
  public static timeout(timeoutMinutes: number, now: Date = new Date()): TaskStateUpdate {
    return {
      status: "failed",
      finalResult: "FAIL",
      finalReason: `任務執行超時（超過 ${timeoutMinutes} 分鐘），自動終止。`,
      finishedAt: now
    };
  }
}
