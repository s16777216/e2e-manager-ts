import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { streamSSE } from "hono/streaming";
import pg from "pg";

import { initDB, AppDataSource } from "./db.js";
import { Project } from "./entities/Project.js";
import { TestGroup } from "./entities/TestGroup.js";
import { Testcase } from "./entities/Testcase.js";
import { TestRun } from "./entities/TestRun.js";
import { TestLog } from "./entities/TestLog.js";
import { TaskQueue } from "./queue.js";

const app = new Hono();

// ==========================================
// 1. Project CRUD Endpoints
// ==========================================

app.get("/api/projects", async (c) => {
  const projects = await AppDataSource.getRepository(Project).find();
  return c.json(projects);
});

app.post("/api/projects", async (c) => {
  const { name, description } = await c.req.json();
  if (!name) return c.json({ error: "專案名稱為必填" }, 400);

  const project = new Project();
  project.name = name;
  project.description = description;

  await AppDataSource.getRepository(Project).save(project);
  return c.json(project, 201);
});

app.get("/api/projects/:id", async (c) => {
  const id = c.req.param("id");
  const project = await AppDataSource.getRepository(Project).findOne({
    where: { id },
  });
  if (!project) return c.json({ error: "找不到專案" }, 404);
  return c.json(project);
});

app.patch("/api/projects/:id", async (c) => {
  const id = c.req.param("id");
  const { name, description } = await c.req.json();

  const projectRepo = AppDataSource.getRepository(Project);
  const project = await projectRepo.findOne({ where: { id } });
  if (!project) return c.json({ error: "找不到專案" }, 404);

  if (name) project.name = name;
  if (description !== undefined) project.description = description;

  await projectRepo.save(project);
  return c.json(project);
});

app.delete("/api/projects/:id", async (c) => {
  const id = c.req.param("id");
  const projectRepo = AppDataSource.getRepository(Project);
  const project = await projectRepo.findOne({ where: { id } });
  if (!project) return c.json({ error: "找不到專案" }, 404);

  await projectRepo.remove(project);
  return c.json({ message: "專案刪除成功" });
});

// ==========================================
// 2. Group CRUD Endpoints (樹狀結構且防環)
// ==========================================

app.get("/api/projects/:projectId/groups", async (c) => {
  const projectId = c.req.param("projectId");
  const groupRepo = AppDataSource.getTreeRepository(TestGroup);

  // 找出該專案的所有群組
  const allGroups = await groupRepo.find({
    where: { project: { id: projectId } },
    relations: { parent: true },
  });

  // 轉換成樹狀階層結構
  const groupMap = new Map<string, any>();
  allGroups.forEach((g) => {
    groupMap.set(g.id, { ...g, children: [] });
  });

  const roots: any[] = [];
  groupMap.forEach((g) => {
    if (g.parent) {
      const parentNode = groupMap.get(g.parent.id);
      if (parentNode) {
        parentNode.children.push(g);
      } else {
        roots.push(g);
      }
    } else {
      roots.push(g);
    }
  });

  return c.json(roots);
});

app.post("/api/projects/:projectId/groups", async (c) => {
  const projectId = c.req.param("projectId");
  const { name, parentId } = await c.req.json();
  if (!name) return c.json({ error: "群組名稱為必填" }, 400);

  const project = await AppDataSource.getRepository(Project).findOne({
    where: { id: projectId },
  });
  if (!project) return c.json({ error: "找不到指定的專案" }, 404);

  const group = new TestGroup();
  group.name = name;
  group.project = project;

  const groupRepo = AppDataSource.getTreeRepository(TestGroup);

  if (parentId) {
    const parentGroup = await groupRepo.findOne({ where: { id: parentId } });
    if (!parentGroup) return c.json({ error: "找不到指定的父群組" }, 400);
    group.parent = parentGroup;
  }

  await groupRepo.save(group);
  return c.json(group, 201);
});

// 遞迴獲取當前群組的所有祖先節點 (用於 adjacency-list 結構防環)
async function findAncestors(group: TestGroup): Promise<TestGroup[]> {
  const ancestors: TestGroup[] = [];
  let current = group;
  const groupRepo = AppDataSource.getRepository(TestGroup);

  while (current.parent) {
    const parent = await groupRepo.findOne({
      where: { id: current.parent.id },
      relations: { parent: true },
    });
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}

app.patch("/api/groups/:id", async (c) => {
  const id = c.req.param("id");
  const { name, parentId } = await c.req.json();

  const groupRepo = AppDataSource.getTreeRepository(TestGroup);
  const group = await groupRepo.findOne({
    where: { id },
    relations: { parent: true },
  });
  if (!group) return c.json({ error: "找不到群組" }, 404);

  if (parentId !== undefined) {
    if (parentId === null) {
      group.parent = null;
    } else {
      if (id === parentId) {
        return c.json({ error: "防環校驗失敗：父群組不能是自己" }, 400);
      }

      const newParent = await groupRepo.findOne({
        where: { id: parentId },
        relations: { parent: true },
      });
      if (!newParent) return c.json({ error: "找不到指定的父群組" }, 400);

      // 防環校驗：檢查新父群組的祖先鏈中是否包含當前群組
      const ancestors = await findAncestors(newParent);
      const isLoop = ancestors.some((ancestor) => ancestor.id === group.id);

      if (isLoop) {
        return c.json(
          {
            error:
              "防環校驗失敗：父群組不能是當前群組的子群組，這會造成循環嵌套",
          },
          400,
        );
      }

      group.parent = newParent;
    }
  }

  if (name) group.name = name;
  await groupRepo.save(group);
  return c.json(group);
});

app.delete("/api/groups/:id", async (c) => {
  const id = c.req.param("id");
  const groupRepo = AppDataSource.getTreeRepository(TestGroup);
  const group = await groupRepo.findOne({ where: { id } });
  if (!group) return c.json({ error: "找不到群組" }, 404);

  await groupRepo.remove(group);
  return c.json({ message: "群組刪除成功" });
});

// ==========================================
// 3. Testcase CRUD Endpoints
// ==========================================

app.get("/api/groups/:groupId/testcases", async (c) => {
  const groupId = c.req.param("groupId");
  const testcases = await AppDataSource.getRepository(Testcase).find({
    where: { group: { id: groupId } },
  });
  return c.json(testcases);
});

app.post("/api/groups/:groupId/testcases", async (c) => {
  const groupId = c.req.param("groupId");
  const { name, steps, expected } = await c.req.json();

  if (
    !name ||
    !steps ||
    !Array.isArray(steps) ||
    steps.length === 0 ||
    !expected
  ) {
    return c.json(
      { error: "無效的欄位：name, steps (非空陣列), expected 皆為必填" },
      400,
    );
  }

  const group = await AppDataSource.getRepository(TestGroup).findOne({
    where: { id: groupId },
  });
  if (!group) return c.json({ error: "找不到指定的群組" }, 404);

  const testcase = new Testcase();
  testcase.name = name;
  testcase.steps = steps;
  testcase.expected = expected;
  testcase.group = group;

  await AppDataSource.getRepository(Testcase).save(testcase);
  return c.json(testcase, 201);
});

app.get("/api/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const testcase = await AppDataSource.getRepository(Testcase).findOne({
    where: { id },
  });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);
  return c.json(testcase);
});

app.patch("/api/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const { name, steps, expected } = await c.req.json();

  const testcaseRepo = AppDataSource.getRepository(Testcase);
  const testcase = await testcaseRepo.findOne({ where: { id } });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);

  if (name) testcase.name = name;
  if (steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      return c.json({ error: "steps 必須為非空陣列" }, 400);
    }
    testcase.steps = steps;
  }
  if (expected) testcase.expected = expected;

  await testcaseRepo.save(testcase);
  return c.json(testcase);
});

app.delete("/api/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const testcaseRepo = AppDataSource.getRepository(Testcase);
  const testcase = await testcaseRepo.findOne({ where: { id } });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);

  await testcaseRepo.remove(testcase);
  return c.json({ message: "測試案例刪除成功" });
});

// ==========================================
// 4. Test Runs & Execution Endpoints
// ==========================================

app.post("/api/testcases/:id/run", async (c) => {
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

app.get("/api/runs/:runId", async (c) => {
  const runId = c.req.param("runId");
  const run = await AppDataSource.getRepository(TestRun).findOne({
    where: { id: runId },
    relations: { logs: true },
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

app.delete("/api/runs/:runId", async (c) => {
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

// ==========================================
// 5. Binary Screenshot Handlers (bytea)
// ==========================================

app.get("/api/logs/:logId/screenshot", async (c) => {
  const logId = c.req.param("logId");

  // 使用 QueryBuilder 強制選取設為 select: false 的 screenshotData 二進位欄位
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

app.get("/api/runs/:runId/screenshots/fail", async (c) => {
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

// ==========================================
// 6. SSE Real-Time Logs Streaming (LISTEN/NOTIFY)
// ==========================================

app.get("/api/runs/:runId/stream", async (c) => {
  const runId = c.req.param("runId");

  // 建立獨立 pg Client 進行資料庫通知監聽，避免阻塞主要 TypeORM 連線池
  const dbConfig = AppDataSource.options as any;
  const client = new pg.Client({
    connectionString:
      dbConfig.url ||
      `postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
  });

  await client.connect();
  await client.query("LISTEN test_run_logs");

  return streamSSE(c, async (stream) => {
    // 當資料庫觸發通知事件時
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

    // 監聽連線關閉事件
    stream.onAbort(async () => {
      console.log(`[SSE] 客戶端中斷任務 ${runId} 的串流訂閱。`);
      try {
        await client.query("UNLISTEN test_run_logs");
        await client.end();
      } catch (e) {}
    });

    // 維持連線的心跳包 (每 15 秒發送一次 comment)
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      try {
        await stream.write(": heartbeat\n\n");
      } catch (err) {
        // SSE 連線中斷
        break;
      }
    }
  });
});

// ==========================================
// 7. Startup Server and Worker Loop
// ==========================================

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const queuePort = process.env.QUEUE_PORT
  ? parseInt(process.env.QUEUE_PORT)
  : 3002;

async function start() {
  // 1. 初始化資料庫連線與修復邏輯
  await initDB();

  // 2. 啟動背景 Worker 佇列
  const queue = new TaskQueue();
  queue.startWorker(queuePort);

  // 3. 啟動 Hono HTTP 伺服器
  console.log(`[Hono] 伺服器正在啟動，監聽 Port：${port}`);
  serve({
    fetch: app.fetch,
    port: port,
  });
}

start().catch((err) => {
  console.error("[Hono] 伺服器啟動失敗：", err);
  process.exit(1);
});
