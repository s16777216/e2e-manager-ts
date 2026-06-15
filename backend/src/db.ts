import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { Project } from "./entities/Project.js";
import { TestGroup } from "./entities/TestGroup.js";
import { Testcase } from "./entities/Testcase.js";
import { TestRun } from "./entities/TestRun.js";
import { TestLog } from "./entities/TestLog.js";
import { Task } from "./entities/Task.js";

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl || "postgres://postgres:postgres@localhost:5432/e2e_manager",
  synchronize: true, // 自動同步 Schema 到資料庫
  logging: false,
  entities: [Project, TestGroup, Testcase, TestRun, TestLog, Task],
  extra: {
    max: 1, // 限制連線池大小為 1，防範 WSL2 Mirrored 網路的 TCP 重複連線 bug
  },
  subscribers: [],
  migrations: [],
});

/**
 * 初始化資料庫連線並執行啟動修復邏輯
 */
export async function initDB() {
  console.log("[DB] 正在初始化資料庫連線... URL 為:", (AppDataSource.options as any).url || (AppDataSource.options as any).host);
  
  let retries = 5;
  while (retries > 0) {
    try {
      await AppDataSource.initialize();
      break;
    } catch (err: any) {
      retries--;
      console.error(`[DB] 連線失敗：${err.message}，剩餘重試次數：${retries}`);
      if (retries === 0) throw err;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("[DB] 資料庫連線初始化成功。");

  // 執行啟動修復邏輯：將狀態處於 running 或 pending 的任務重置為 error
  console.log("[DB] 正在檢查並清理異常遺留的任務...");
  try {
    const result = await AppDataSource.createQueryBuilder()
      .update(TestRun)
      .set({
        status: "error",
        finalResult: "ERROR",
        finalReason: "伺服器重啟，未完成之任務強制終止",
        finishedAt: new Date(),
      })
      .where("status IN (:...statuses)", { statuses: ["running", "pending"] })
      .execute();

    if (result.affected && result.affected > 0) {
      console.log(`[DB] 成功清理重置了 ${result.affected} 筆未完成的遺留 TestRun。`);
    }

    // 同步重置未完成的 Task
    const taskResult = await AppDataSource.createQueryBuilder()
      .update(Task)
      .set({
        status: "done",
        finalResult: "FAIL",
        finishedAt: new Date(),
      })
      .where("status IN (:...statuses)", { statuses: ["running", "pending"] })
      .execute();

    if (taskResult.affected && taskResult.affected > 0) {
      console.log(`[DB] 成功清理重置了 ${taskResult.affected} 筆未完成的遺留 Task。`);
    } else {
      console.log("[DB] 無遺留卡死任務，清理完成。");
    }
  } catch (error: any) {
    console.error("[DB] 清理遺留任務時發生錯誤：", error.message);
  }
}
