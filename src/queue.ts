import { AppDataSource } from "./db.js";
import { TestRun } from "./entities/TestRun.js";
import { BrowserManager } from "./browser.js";
import { E2EGraphBuilder } from "./graph.js";
import { TaskFSM } from "./queue/taskFSM.js";

export class TaskQueue {
  private isRunning = false;
  private workerInterval: NodeJS.Timeout | null = null;

  /**
   * 掃描並清理超過指定分鐘數仍在 running 的超時任務
   */
  public async cleanupTimeoutJobs(timeoutMinutes: number = 5): Promise<number> {
    const threshold = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    try {
      const timeoutPayload = TaskFSM.timeout(timeoutMinutes);
      const result = await AppDataSource.createQueryBuilder()
        .update(TestRun)
        .set(timeoutPayload)
        .where("status = :status", { status: "running" })
        .andWhere("startedAt < :threshold", { threshold })
        .execute();

      const affected = result.affected || 0;
      if (affected > 0) {
        console.log(`[Queue] 成功清理超時卡死任務 ${affected} 筆。`);
      }
      return affected;
    } catch (e: any) {
      console.error("[Queue] 清理超時任務失敗：", e.message);
      return 0;
    }
  }

  /**
   * 利用 FOR UPDATE SKIP LOCKED 在交易中取得並鎖定下一個 pending 任務
   */
  public async fetchNextJob(): Promise<string | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 搜尋最早的一筆 pending 任務，並進行行鎖定（跳過其他已被鎖定的任務）
      const run = await queryRunner.manager.createQueryBuilder(TestRun, "run")
        .setLock("pessimistic_write")
        .setOnLocked("skip_locked")
        .where("run.status = :status", { status: "pending" })
        .orderBy("run.createdAt", "ASC")
        .getOne();

      if (run) {
        const startPayload = TaskFSM.start();
        Object.assign(run, startPayload);
        await queryRunner.manager.save(run);
        await queryRunner.commitTransaction();
        return run.id;
      } else {
        await queryRunner.rollbackTransaction();
        return null;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 執行指定任務，並整合 LangGraph 進行流程驅動
   */
  public async executeJob(runId: string): Promise<void> {
    console.log(`[Worker] 開始執行任務：${runId}`);
    
    // 獲取任務詳情與其關聯的測試案例
    const run = await AppDataSource.getRepository(TestRun).findOne({
      where: { id: runId },
      relations: { testcase: true }
    });

    if (!run || !run.testcase) {
      console.error(`[Worker] 找不到任務或其測試案例：${runId}`);
      return;
    }

    const testcase = run.testcase;
    const browserManager = new BrowserManager();

    try {
      // 初始化 Playwright 瀏覽器 (預設為 headless 模式)
      await browserManager.initBrowser(true);

      const builder = new E2EGraphBuilder(browserManager);
      const graph = builder.buildGraph();

      const initial_state = {
        run_id: run.id,
        test_id: testcase.id,
        test_name: testcase.name,
        steps: testcase.steps,
        expected: testcase.expected,
        current_step_idx: 0,
        step_retry_count: 0,
        reports_dir: "",
        screenshots_paths: [],
        logs: [],
        final_result: "",
        final_reason: ""
      };

      await graph.invoke(initial_state);
      console.log(`[Worker] 任務 ${runId} 執行成功結束。`);
    } catch (error: any) {
      console.error(`[Worker] 任務 ${runId} 執行時發生未預期異常：`, error);
      // 將狀態更新為 error
      try {
        const crashPayload = TaskFSM.crash(error.message);
        await AppDataSource.getRepository(TestRun).update(runId, crashPayload);
        
        // 發布事件
        await AppDataSource.query(
          `SELECT pg_notify('test_run_logs', $1)`,
          [
            JSON.stringify({
              runId: runId,
              status: crashPayload.status,
              finalResult: crashPayload.finalResult,
              finalReason: crashPayload.finalReason,
              event: "completed",
              timestamp: new Date().toISOString()
            })
          ]
        );
      } catch (dbErr: any) {
        console.error("[Worker] 寫入資料庫錯誤狀態失敗：", dbErr.message);
      }
    } finally {
      try {
        await browserManager.closeBrowser();
      } catch (e) {}
    }
  }

  /**
   * 啟動背景 Worker 輪詢
   */
  public startWorker(intervalMs: number = 3000) {
    if (this.workerInterval) {
      console.warn("[Queue] Worker 已經在運行中。");
      return;
    }

    console.log("[Queue] 啟動背景 Worker 輪詢佇列...");
    this.workerInterval = setInterval(async () => {
      if (this.isRunning) return; // 併發限制為 1，如果有任務在執行則跳過
      
      this.isRunning = true;
      try {
        // 先清理超時任務
        await this.cleanupTimeoutJobs();

        // 領取下一個任務
        const runId = await this.fetchNextJob();
        if (runId) {
          await this.executeJob(runId);
        }
      } catch (error: any) {
        console.error("[Queue] Worker 輪詢執行出錯：", error.message);
      } finally {
        this.isRunning = false;
      }
    }, intervalMs);
  }

  /**
   * 停止背景 Worker 輪詢
   */
  public stopWorker() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
      console.log("[Queue] 停止背景 Worker 輪詢。");
    }
  }
}
