import * as path from "path";
import * as dotenv from "dotenv";
import { parseTestCase } from "./parser.js";
import { BrowserManager } from "./browser.js";
import { E2EGraphBuilder } from "./graph.js";
import { initDB, AppDataSource } from "./db.js";
import { Project } from "./entities/Project.js";
import { TestGroup } from "./entities/TestGroup.js";
import { Testcase } from "./entities/Testcase.js";
import { TestRun } from "./entities/TestRun.js";
import { TestcaseStep } from "./entities/TestcaseStep.js";

// 載入 .env 中的環境變數
dotenv.config();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    console.log("使用方式: npx tsx src/main.ts <測試劇本 JSON 路徑> [--headed] [--reports-dir <報告目錄>]");
    process.exit(1);
  }

  // 取得測試劇本路徑（排除以 -- 開頭的參數）
  const scriptPath = args.find(arg => !arg.startsWith("-"));
  if (!scriptPath) {
    console.error("[E2E Manager] 錯誤：未指定測試劇本路徑。");
    process.exit(1);
  }

  const headed = args.includes("--headed");

  // 取得自訂報告輸出目錄
  let reportsDir = "reports";
  const reportsDirIndex = args.indexOf("--reports-dir");
  if (reportsDirIndex !== -1 && reportsDirIndex + 1 < args.length) {
    reportsDir = args[reportsDirIndex + 1];
  }

  // 1. 檢查 API Key
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error("[E2E Manager] 錯誤：未檢測到 GEMINI_API_KEY 或 GOOGLE_API_KEY 環境變數。請在 .env 中設定此變數。");
    process.exit(1);
  }

  // 2. 解析並驗證測試劇本
  let testCase;
  try {
    testCase = parseTestCase(scriptPath);
    console.log(`[E2E Manager] 成功載入測試劇本：${testCase.name} (ID: ${testCase.id})`);
    console.log(`[E2E Manager] 步驟清單：`);
    testCase.steps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log(`[E2E Manager] 預期結果：${testCase.expected}`);
  } catch (error: any) {
    console.error(`[E2E Manager] 載入劇本失敗：${error.message}`);
    process.exit(1);
  }

  // 3. 建立本次執行的報告目錄
  const pad = (n: number) => n.toString().padStart(2, "0");
  const now = new Date();
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const runDir = path.join(reportsDir, `run_${testCase.id}_${timestamp}`);
  console.log(`[E2E Manager] 測試報告與截圖將會輸出至：${path.resolve(runDir)}`);

  // 3.5 初始化資料庫連線與 TestRun 紀錄
  try {
    await initDB();
  } catch (err: any) {
    console.error(`[E2E Manager] 資料庫連線失敗：${err.message}`);
    process.exit(1);
  }

  const projectRepo = AppDataSource.getRepository(Project);
  const groupRepo = AppDataSource.getRepository(TestGroup);
  const testcaseRepo = AppDataSource.getRepository(Testcase);
  const testRunRepo = AppDataSource.getRepository(TestRun);

  let project = await projectRepo.findOne({ where: { name: "CLI Projects" } });
  if (!project) {
    project = new Project();
    project.name = "CLI Projects";
    project.description = "Project for CLI runs";
    await projectRepo.save(project);
  }

  let group = await groupRepo.findOne({ where: { name: "CLI Group", project: { id: project.id } } });
  if (!group) {
    group = new TestGroup();
    group.name = "CLI Group";
    group.project = project;
    await groupRepo.save(group);
  }

  let testcaseEntity = await testcaseRepo.findOne({ where: { name: testCase.name }, relations: { steps: true } });
  if (testcaseEntity) {
    await AppDataSource.getRepository(TestcaseStep).delete({ testcase: { id: testcaseEntity.id } });
  } else {
    testcaseEntity = new Testcase();
    testcaseEntity.name = testCase.name;
    testcaseEntity.group = group;
  }

  testcaseEntity.expected = testCase.expected;
  testcaseEntity.steps = testCase.steps.map((stepText: string, idx: number) => {
    const step = new TestcaseStep();
    step.stepIdx = idx;
    step.action = stepText;
    return step;
  });
  await testcaseRepo.save(testcaseEntity);

  const run = new TestRun();
  run.testcase = testcaseEntity;
  run.status = "running";
  run.startedAt = new Date();
  await testRunRepo.save(run);

  // 4. 初始化瀏覽器管理器
  const browserManager = new BrowserManager();
  
  // 註冊程序異常與終止監聽器，防止遺留殭屍 Chrome 進程
  const cleanup = async () => {
    console.log("\n[E2E Manager] 偵測到中斷，正在安全關閉瀏覽器...");
    try {
      await browserManager.closeBrowser();
    } catch (e) {}
    process.exit(1);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("unhandledRejection", async (reason) => {
    console.error("[E2E Manager] 未處理的 Promise 拒絕：", reason);
    try {
      await browserManager.closeBrowser();
    } catch (e) {}
    process.exit(1);
  });

  // 若有帶 --headed 則強制開啟 headed (false)，否則依循資料庫全域設定
  await browserManager.initBrowser(headed ? false : undefined);

  // 5. 建立與編譯 LangGraph
  const builder = await E2EGraphBuilder.create(browserManager);
  const graph = builder.buildGraph();

  // 6. 初始化初始 State
  const initial_state = {
    run_id: run.id,
    test_id: testcaseEntity.id,
    test_name: testCase.name,
    steps: testCase.steps,
    step_expecteds: testCase.steps.map(() => ""), // CLI 中無步驟預期結果
    expected: testCase.expected,
    current_step_idx: 0,
    step_retry_count: 0,
    reports_dir: runDir,
    screenshots_paths: [],
    logs: [],
    final_result: "",
    final_reason: ""
  };

  // 7. 啟動測試
  console.log("[E2E Manager] 啟動 AI Agent 測試流轉圖...");
  try {
    await graph.invoke(initial_state, { recursionLimit: Infinity });
  } catch (error: any) {
    console.error(`\n[E2E Manager] 測試圖執行期間發生未預期異常：${error.message}`);
    try {
      await browserManager.closeBrowser();
    } catch (e) {}
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error("[E2E Manager] 主程式執行失敗：", error);
  process.exit(1);
});
