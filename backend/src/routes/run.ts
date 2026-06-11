import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import pg from "pg";
import { AppDataSource } from "../db.js";
import { Testcase } from "../entities/Testcase.js";
import { TestRun } from "../entities/TestRun.js";
import { TestLog } from "../entities/TestLog.js";

export const runRouter = new Hono();

runRouter.post("/testcases/:id/run", async (c) => {
  const testcaseId = c.req.param("id");
  const testcase = await AppDataSource.getRepository(Testcase).findOne({
    where: { id: testcaseId },
  });
  if (!testcase) return c.json({ error: "找不到指定的測試案例" }, 404);

  const run = new TestRun();
  run.testcase = testcase;
  run.status = "pending";

  await AppDataSource.getRepository(TestRun).save(run);

  // 發布異步通知，通知 UI 有新任務加入排隊
  await AppDataSource.query(`SELECT pg_notify('test_run_logs', $1)`, [
    JSON.stringify({
      runId: run.id,
      status: "pending",
      event: "queued",
      timestamp: new Date().toISOString(),
    }),
  ]);

  return c.json({ runId: run.id, status: run.status }, 202);
});

runRouter.get("/runs/:runId", async (c) => {
  const runId = c.req.param("runId");
  const run = await AppDataSource.getRepository(TestRun).findOne({
    where: { id: runId },
    relations: { logs: true, testcase: true },
  });

  if (!run) return c.json({ error: "找不到該任務紀錄" }, 404);

  const logs = run.logs.map((log) => ({
    id: log.id,
    stepIdx: log.stepIdx,
    stepDescription: log.stepDescription,
    action: log.action,
    result: log.result,
    aiResponse: log.aiResponse,
    screenshotUrl: `/api/logs/${log.id}/screenshot`,
  }));

  return c.json({
    runId: run.id,
    testcaseId: run.testcase?.id || null,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    finalResult: run.finalResult,
    finalReason: run.finalReason,
    screenshotFailUrl: run.screenshotFailData
      ? `/api/runs/${run.id}/screenshots/fail`
      : null,
    logs,
  });
});

runRouter.delete("/runs/:runId", async (c) => {
  const runId = c.req.param("runId");
  const runRepo = AppDataSource.getRepository(TestRun);
  const run = await runRepo.findOne({ where: { id: runId } });
  if (!run) return c.json({ error: "找不到該任務紀錄" }, 404);

  if (run.status === "pending") {
    run.status = "failed";
    run.finalResult = "FAIL";
    run.finalReason = "任務已被使用者取消";
    run.finishedAt = new Date();
    await runRepo.save(run);

    await runRepo.query(`SELECT pg_notify('test_run_logs', $1)`, [
      JSON.stringify({
        runId: run.id,
        status: "failed",
        finalResult: "FAIL",
        finalReason: "任務已被使用者取消",
        event: "completed",
        timestamp: new Date().toISOString(),
      }),
    ]);

    return c.json({ message: "任務取消成功", run });
  } else {
    return c.json({ error: "只能取消處於 pending 狀態的任務" }, 400);
  }
});

runRouter.get("/logs/:logId/screenshot", async (c) => {
  const logId = c.req.param("logId");

  const log = await AppDataSource.getRepository(TestLog)
    .createQueryBuilder("log")
    .select(["log.id", "log.screenshotData"])
    .where("log.id = :logId", { logId })
    .getOne();

  if (!log || !log.screenshotData) {
    return c.json({ error: "找不到該步驟的截圖" }, 404);
  }

  c.header("Content-Type", "image/png");
  return c.body(log.screenshotData as any);
});

runRouter.get("/runs/:runId/screenshots/fail", async (c) => {
  const runId = c.req.param("runId");

  const run = await AppDataSource.getRepository(TestRun)
    .createQueryBuilder("run")
    .select(["run.id", "run.screenshotFailData"])
    .where("run.id = :runId", { runId })
    .getOne();

  if (!run || !run.screenshotFailData) {
    return c.json({ error: "找不到該失敗任務的截圖" }, 404);
  }

  c.header("Content-Type", "image/png");
  return c.body(run.screenshotFailData as any);
});

runRouter.get("/runs/:runId/stream", async (c) => {
  const runId = c.req.param("runId");

  const dbConfig = AppDataSource.options as any;
  const client = new pg.Client({
    connectionString:
      dbConfig.url ||
      `postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
  });

  await client.connect();
  await client.query("LISTEN test_run_logs");

  return streamSSE(c, async (stream) => {
    client.on("notification", async (msg) => {
      if (msg.channel === "test_run_logs" && msg.payload) {
        try {
          const payload = JSON.parse(msg.payload);
          if (payload.runId === runId) {
            await stream.writeSSE({
              data: JSON.stringify(payload),
              event: "message",
            });
          }
        } catch (err: any) {
          console.error("[SSE] 解析資料庫通知 Payload 錯誤:", err.message);
        }
      }
    });

    stream.onAbort(async () => {
      console.log(`[SSE] 客戶端中斷任務 ${runId} 的串流訂閱。`);
      try {
        await client.query("UNLISTEN test_run_logs");
        await client.end();
      } catch (e) {}
    });

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      try {
        await stream.write(": heartbeat\n\n");
      } catch (err) {
        break;
      }
    }
  });
});
