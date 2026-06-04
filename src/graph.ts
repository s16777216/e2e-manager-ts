import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { TestState, LogEntry } from "./state.js";
import { BrowserManager } from "./browser.js";
import { BrowserTools } from "./tools.js";
import { TestReporter } from "./reporter.js";

// 定義結構化視覺斷言 Zod Schema
const AssertionResultSchema = z.object({
  result: z.enum(["PASS", "FAIL"]).describe("判定結果，必須為 'PASS' 或 'FAIL'"),
  reason: z.string().describe("詳細的判斷理由與分析說明")
});

type AssertionResult = z.infer<typeof AssertionResultSchema>;

export class E2EGraphBuilder {
  private tools: any[];
  private model: any;
  private asserter_model: any;

  constructor(private browserManager: BrowserManager) {
    this.tools = new BrowserTools(browserManager).getTools();

    // 使用 gemini-3.1-flash-lite 作為逐步執行決策的 Agent，並處理 API 金鑰對應
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      temperature: 0.0,
      apiKey: apiKey
    }).bindTools(this.tools);

    // 使用 gemini-3.1-flash-lite 搭配結構化輸出，作為預期結果的視覺 Asserter
    this.asserter_model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      temperature: 0.0,
      apiKey: apiKey
    }).withStructuredOutput(AssertionResultSchema);
  }

  /**
   * 初始化節點：啟動瀏覽器並將索引歸零
   */
  async initNode(state: typeof TestState.State) {
    // 確保報告資料夾存在
    fs.mkdirSync(state.reports_dir, { recursive: true });
    fs.mkdirSync(path.join(state.reports_dir, "screenshots"), { recursive: true });

    return {
      current_step_idx: 0,
      step_retry_count: 0,
      screenshots_paths: [],
      logs: []
    };
  }

  /**
   * 執行節點：負責擷取目前畫面、呼叫 Gemini 進行推理，並執行對應的 Playwright Tool Call
   */
  async executorNode(state: typeof TestState.State) {
    const idx = state.current_step_idx;
    const step_content = state.steps[idx];

    // 1. 取得當前畫面截圖 (Base64) 與簡化 DOM 及當前網址
    const screenshot_base64 = await this.browserManager.getPageScreenshotBase64();
    const simplified_dom = await this.browserManager.getSimplifiedDOM();
    const current_url = this.browserManager.page ? this.browserManager.page.url() : "";

    // 2. 建構系統 Prompt
    const system_prompt = 
      "你是一個專業的 Web E2E 自動化測試 AI 代理人。\n" +
      `你目前正在執行的測試案例為：${state.test_name}。\n` +
      `你當前的目標是完成第 ${idx + 1} 步：『${step_content}』。\n\n` +
      `當前瀏覽器的網址 (URL) 為：${current_url}\n\n` +
      "請檢查下方的網頁畫面截圖與簡化的 DOM 結構。決定你下一步要呼叫的工具 (Tool Call)。\n" +
      "重要規則：\n" +
      "1. 每次你的決策都必須呼叫至少一個工具。禁止直接回覆純文字。\n" +
      "2. 當你確認當前步驟描述的目標已經達成（例如：已經點擊了登入按鈕、網址已成功跳轉、輸入框已輸入完成，或已成功進入目標網頁），你必須呼叫 `finish_step` 工具以結束此步驟。不要擅自執行超出此步驟描述以外的額外操作。\n" +
      "   特別是：若目前的步驟目標是「進入某頁面/網址」，且當前瀏覽器的網址已經與目標網址相同（或已成功載入該網頁），請立即呼叫 `finish_step`，切勿重複進行 navigate_to 導航操作。\n" +
      "3. 如果找不到合適的元素，或者頁面仍在加載，可以使用 `wait_for_seconds` 工具等待。\n" +
      "4. 在進行點擊或輸入時，優先使用簡化 DOM 中標示的 `selector` 屬性值。";

    // 3. 呼叫模型
    const messages = [
      new SystemMessage(system_prompt),
      new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${screenshot_base64}` }
          },
          {
            type: "text",
            text: `當前瀏覽器網址 (URL) 為：${current_url}\n\n當前網頁簡化後的 DOM 結構如下：\n${simplified_dom}\n\n請根據網址、畫面與 DOM，決定下一步要執行的工具。`
          }
        ]
      })
    ];

    const response = await this.model.invoke(messages);
    const tool_calls = response.tool_calls || [];
    const logs = [...(state.logs || [])];

    // 4. 如果 AI 沒有呼叫工具，則記錄錯誤並增加重試次數
    if (tool_calls.length === 0) {
      logs.push({
        step_idx: idx,
        step_description: step_content,
        action: "none",
        result: "AI Agent 未呼召任何工具，直接回覆文字說明",
        ai_response: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
        timestamp: new Date().toISOString()
      });
      return {
        logs,
        step_retry_count: state.step_retry_count + 1,
        last_screenshot: screenshot_base64,
        simplified_dom
      };
    }

    // 5. 依序執行工具呼叫
    for (const tc of tool_calls) {
      const tool_name = tc.name;
      const tool_args = tc.args;

      // 尋找對應的工具並執行
      const selected_tool = this.tools.find((t) => t.name === tool_name);
      if (selected_tool) {
        const tool_result = await selected_tool.invoke(tool_args);
        logs.push({
          step_idx: idx,
          step_description: step_content,
          action: `${tool_name}(${JSON.stringify(tool_args)})`,
          result: typeof tool_result === "string" ? tool_result : JSON.stringify(tool_result),
          timestamp: new Date().toISOString()
        });
      } else {
        logs.push({
          step_idx: idx,
          step_description: step_content,
          action: `unknown_tool: ${tool_name}`,
          result: "無法辨識的工具",
          timestamp: new Date().toISOString()
        });
      }
    }

    return {
      logs,
      step_retry_count: state.step_retry_count + 1,
      last_screenshot: screenshot_base64,
      simplified_dom
    };
  }

  /**
   * 記錄追蹤節點：當步驟完成時，將當前畫面截圖存檔並推進步驟索引
   */
  async stepTrackerNode(state: typeof TestState.State) {
    const idx = state.current_step_idx;
    const step_content = state.steps[idx];

    // 產生安全的檔名
    const safeStepName = step_content
      .replace(/[^a-zA-Z0-9_\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const filename = `step_${idx + 1}_${safeStepName}.png`;
    const filepath = path.join(state.reports_dir, "screenshots", filename);

    // 存檔截圖
    await this.browserManager.saveScreenshot(filepath);

    const screenshots_paths = [...state.screenshots_paths];
    screenshots_paths.push(`screenshots/${filename}`);

    return {
      current_step_idx: idx + 1,
      step_retry_count: 0,
      screenshots_paths
    };
  }

  /**
   * 驗證節點：在所有步驟完成後，進行視覺預期結果的最終 Pass/Fail 判定
   */
  async asserterNode(state: typeof TestState.State) {
    const screenshot_base64 = await this.browserManager.getPageScreenshotBase64();

    const system_prompt = 
      "你是一個專業的 Web E2E 測試驗證 AI 審計員。\n" +
      "我們剛剛執行完了一套測試流程，請看著最後的網頁截圖，判斷是否成功達成了預期的測試結果。\n\n" +
      `測試案例名稱：${state.test_name}\n` +
      `預期結果：${state.expected}\n\n` +
      "請將結果以結構化的格式回覆，判定是否通過 (PASS 或 FAIL) 並說明理由。";

    const messages = [
      new SystemMessage(system_prompt),
      new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${screenshot_base64}` }
          },
          {
            type: "text",
            text: "這是測試流程結束後的當前網頁畫面，請對照預期結果進行審查判定。"
          }
        ]
      })
    ];

    let final_result = "FAIL";
    let final_reason = "視覺斷言未返回結果";

    try {
      // 呼叫結構化輸出模型
      const assertion_result = await this.asserter_model.invoke(messages) as AssertionResult;
      if (assertion_result) {
        final_result = assertion_result.result;
        final_reason = assertion_result.reason;
      }
    } catch (e: any) {
      final_result = "FAIL";
      final_reason = `視覺斷言解析發生異常：${e.message}`;
    }

    // 關閉瀏覽器，因為測試已結束
    await this.browserManager.closeBrowser();

    return {
      final_result,
      final_reason
    };
  }

  /**
   * 報告節點：生成測試報告
   */
  async reporterNode(state: typeof TestState.State) {
    const update_data: any = {};
    const currentStepIdx = state.current_step_idx ?? 0;
    const steps = state.steps || [];

    // 如果測試尚未執行完所有步驟就被迫中斷 (例如重試超限)，則在此節點進行失敗狀態標記
    if (currentStepIdx < steps.length) {
      update_data.final_result = "FAIL";
      update_data.final_reason = `步驟 ${currentStepIdx + 1} (『${steps[currentStepIdx]}』) 執行次數達到上限但仍未完成，強制終止測試。`;
    }

    // 合併最新狀態，以便讓截圖判斷與報告生成讀取到最新資料
    const merged_result = update_data.final_result || state.final_result;

    // 如果測試為失敗狀態且瀏覽器尚未關閉，先存檔最後一張失敗畫面截圖
    if (["FAIL", "ERROR"].includes(merged_result) && this.browserManager.page) {
      try {
        const filepath = path.join(state.reports_dir, "screenshot_fail.png");
        await this.browserManager.saveScreenshot(filepath);
      } catch (e: any) {
        console.error(`[E2E Manager] 無法擷取最終失敗畫面：${e.message}`);
      }
    }

    // 確保關閉瀏覽器 (如果是因錯誤中斷跳到此節點)
    try {
      await this.browserManager.closeBrowser();
    } catch (e) {}

    const temp_state = { ...state, ...update_data };
    const report_path = TestReporter.generateReport(temp_state);
    console.log(`\n[E2E Manager] 測試結束。測試報告已成功生成至：${report_path}`);

    return update_data;
  }

  /**
   * 執行後的條件路由：判斷是否完成該步、繼續執行工具、或是重試超次失敗
   */
  routeAfterExecution(state: typeof TestState.State): string {
    const logs = state.logs || [];
    if (logs.length === 0) {
      return "executor";
    }

    // 讀取最後一筆日誌，判斷是否呼叫了 finish_step
    const last_log = logs[logs.length - 1];
    const action = last_log.action || "";

    if (action.includes("finish_step")) {
      return "step_tracker";
    }

    // 檢查單步重試次數是否超限 (例如單步最多重試 5 次)
    if ((state.step_retry_count ?? 0) >= 5) {
      return "reporter";
    }

    return "executor";
  }

  /**
   * 步驟推進後的路由：判斷是否還有下一步，或是進入最終驗證
   */
  routeNextStep(state: typeof TestState.State): string {
    if ((state.current_step_idx ?? 0) < state.steps.length) {
      return "executor";
    }
    return "asserter";
  }

  /**
   * 串接並編譯 LangGraph
   */
  buildGraph() {
    const workflow = new StateGraph(TestState)
      // 加入節點
      .addNode("init", this.initNode.bind(this))
      .addNode("executor", this.executorNode.bind(this))
      .addNode("step_tracker", this.stepTrackerNode.bind(this))
      .addNode("asserter", this.asserterNode.bind(this))
      .addNode("reporter", this.reporterNode.bind(this))

      // 設定起始點
      .addEdge(START, "init")
      .addEdge("init", "executor")

      // 執行後的條件邊
      .addConditionalEdges(
        "executor",
        this.routeAfterExecution.bind(this),
        {
          executor: "executor",
          step_tracker: "step_tracker",
          reporter: "reporter"
        }
      )

      // 步驟追蹤後的條件邊
      .addConditionalEdges(
        "step_tracker",
        this.routeNextStep.bind(this),
        {
          executor: "executor",
          asserter: "asserter"
        }
      )

      // 最終邊
      .addEdge("asserter", "reporter")
      .addEdge("reporter", END);

    return workflow.compile();
  }
}
