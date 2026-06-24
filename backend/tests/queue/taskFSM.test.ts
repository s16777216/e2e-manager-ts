import { describe, it, expect } from "vitest";
import { TaskFSM } from "../../src/queue/taskFSM.js";

describe("任務狀態有限狀態機單元測試 (taskFSM.ts)", () => {
  it("1. TaskFSM.start: 應回傳 running 狀態及開始時間", () => {
    const now = new Date();
    const payload = TaskFSM.start(now);

    expect(payload.status).toBe("running");
    expect(payload.startedAt).toBe(now);
    expect(payload.finishedAt).toBeUndefined();
  });

  it("2. TaskFSM.complete (PASS): 應回傳 passed 狀態與結束時間", () => {
    const now = new Date();
    const payload = TaskFSM.complete("PASS", "測試成功通過", now);

    expect(payload.status).toBe("passed");
    expect(payload.finalReason).toBe("測試成功通過");
    expect(payload.finishedAt).toBe(now);
  });

  it("3. TaskFSM.complete (FAIL): 應回傳 failed 狀態與結束時間", () => {
    const now = new Date();
    const payload = TaskFSM.complete("FAIL", "頁面未呈現預期元素", now);

    expect(payload.status).toBe("failed");
    expect(payload.finalReason).toBe("頁面未呈現預期元素");
    expect(payload.finishedAt).toBe(now);
  });

  it("4. TaskFSM.crash: 應回傳 error 狀態、錯誤說明與結束時間", () => {
    const now = new Date();
    const payload = TaskFSM.crash("Gemini API 連線異常", now);

    expect(payload.status).toBe("error");
    expect(payload.finalReason).toBe("任務執行崩潰：Gemini API 連線異常");
    expect(payload.finishedAt).toBe(now);
  });

  it("5. TaskFSM.timeout: 應回傳 failed 狀態、超時幾分鐘理由與結束時間", () => {
    const now = new Date();
    const payload = TaskFSM.timeout(10, now);

    expect(payload.status).toBe("failed");
    expect(payload.finalReason).toBe("任務執行超時（超過 10 分鐘），自動終止。");
    expect(payload.finishedAt).toBe(now);
  });
});
