import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { TestState } from "./state.js";
import { BrowserManager } from "./browser.js";
import { BrowserTools } from "./tools.js";
import { AppDataSource } from "./db.js";
import { TestRun } from "./entities/TestRun.js";
import { TestLog } from "./entities/TestLog.js";
import { buildExecutorSystemPrompt, buildAsserterSystemPrompt } from "./graph/prompt.js";
import { routeAfterExecution, routeNextStep } from "./graph/router.js";

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
    }).withStructuredOutput(AssertionResultSchema, { includeRaw: true });
  }

  /**
   * 初始化節點：將索引與狀態歸零
   */
  async initNode(state: typeof TestState.State) {
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
    const system_prompt = buildExecutorSystemPrompt({
      testName: state.test_name,
      stepIdx: idx,
      stepContent: step_content,
      currentUrl: current_url
    });

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

    const prompt_tokens = response.usage_metadata?.input_tokens ?? 0;
    const completion_tokens = response.usage_metadata?.output_tokens ?? 0;
    const total_tokens = response.usage_metadata?.total_tokens ?? 0;

    // 4. 如果 AI 沒有呼叫工具，則記錄錯誤並增加重試次數
    if (tool_calls.length === 0) {
      logs.push({
        step_idx: idx,
        step_description: step_content,
        action: "none",
        result: "AI Agent 未呼召 any 工具，直接回覆文字說明",
        ai_response: typeof response.content === "string" ? response.content : JSON.stringify(response.content),
        timestamp: new Date().toISOString(),
        prompt_tokens,
        completion_tokens,
        total_tokens
      });
      return {
        logs,
        step_retry_count: state.step_retry_count + 1,
        last_screenshot: screenshot_base64,
        simplified_dom
      };
    }

    // 5. 依序執行工具呼叫
    for (let i = 0; i < tool_calls.length; i++) {
      const tc = tool_calls[i];
      const tool_name = tc.name;
      const tool_args = tc.args;

      // 尋找對應的工具並執行
      const selected_tool = this.tools.find((t) => t.name === tool_name);
      const pTokens = i === 0 ? prompt_tokens : 0;
      const cTokens = i === 0 ? completion_tokens : 0;
      const tTokens = i === 0 ? total_tokens : 0;

      if (selected_tool) {
        const tool_result = await selected_tool.invoke(tool_args);
        logs.push({
          step_idx: idx,
          step_description: step_content,
          action: `${tool_name}(${JSON.stringify(tool_args)})`,
          result: typeof tool_result === "string" ? tool_result : JSON.stringify(tool_result),
          timestamp: new Date().toISOString(),
          prompt_tokens: pTokens,
          completion_tokens: cTokens,
          total_tokens: tTokens
        });
      } else {
        logs.push({
          step_idx: idx,
          step_description: step_content,
          action: `unknown_tool: ${tool_name}`,
          result: "無法辨識的工具",
          timestamp: new Date().toISOString(),
          prompt_tokens: pTokens,
          completion_tokens: cTokens,
          total_tokens: tTokens
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
   * 記錄追蹤節點：當步驟完成時，將截圖存入資料庫並推進步驟索引
   */
  async stepTrackerNode(state: typeof TestState.State) {
    const idx = state.current_step_idx;
    
    // 取得與目前步驟相關的 logs
    const stepLogs = (state.logs || []).filter(l => l.step_idx === idx);

    let stepPromptTokens = 0;
    let stepCompletionTokens = 0;
    let stepTotalTokens = 0;

    for (const log of stepLogs) {
      stepPromptTokens += log.prompt_tokens ?? 0;
      stepCompletionTokens += log.completion_tokens ?? 0;
      stepTotalTokens += log.total_tokens ?? 0;
    }

    // 擷取目前步驟完成時的截圖 Buffer
    let screenshotBuffer: Buffer | undefined;
    try {
      const base64 = await this.browserManager.getPageScreenshotBase64();
      screenshotBuffer = Buffer.from(base64, "base64");
    } catch (e: any) {
      console.error(`[E2E Manager] 擷取步驟完成畫面失敗: ${e.message}`);
    }

    // 將日誌與二進位截圖寫入資料庫
    const testRunRepo = AppDataSource.getRepository(TestRun);
    const testLogRepo = AppDataSource.getRepository(TestLog);
    
    const run = await testRunRepo.findOne({ where: { id: state.run_id } });
    if (run) {
      // 累加這一步的 Token 至 TestRun 最上層的總累計欄位
      run.totalPromptTokens = (run.totalPromptTokens || 0) + stepPromptTokens;
      run.totalCompletionTokens = (run.totalCompletionTokens || 0) + stepCompletionTokens;
      run.totalTokens = (run.totalTokens || 0) + stepTotalTokens;
      await testRunRepo.save(run);

      for (let i = 0; i < stepLogs.length; i++) {
        const log = stepLogs[i];
        const entity = new TestLog();
        entity.run = run;
        entity.stepIdx = log.step_idx;
        entity.stepDescription = log.step_description;
        entity.action = log.action;
        entity.result = log.result;
        entity.aiResponse = log.ai_response;
        entity.promptTokens = log.prompt_tokens ?? 0;
        entity.completionTokens = log.completion_tokens ?? 0;
        entity.totalTokens = log.total_tokens ?? 0;
        
        // 僅在最後一筆 log 附帶截圖，代表該步完成時的畫面 (bytea 二進位)
        if (i === stepLogs.length - 1 && screenshotBuffer) {
          entity.screenshotData = screenshotBuffer;
        }
        
        await testLogRepo.save(entity);
        
        // 每寫入一筆日誌，就調用 NOTIFY 通知監聽者
        await testLogRepo.query(
          `SELECT pg_notify('test_run_logs', $1)`,
          [
            JSON.stringify({
              runId: run.id,
              stepIdx: log.step_idx,
              stepDescription: log.step_description,
              action: log.action,
              result: log.result,
              aiResponse: log.ai_response,
              logId: entity.id,
              event: "log",
              timestamp: new Date().toISOString(),
              promptTokens: entity.promptTokens,
              completionTokens: entity.completionTokens,
              totalTokens: entity.totalTokens
            })
          ]
        );
      }
    }

    return {
      current_step_idx: idx + 1,
      step_retry_count: 0
    };
  }

  /**
   * 驗證節點：在所有步驟完成後，進行視覺預期結果的最終 Pass/Fail 判定，並持久化至資料庫
   */
  async asserterNode(state: typeof TestState.State) {
    const screenshot_base64 = await this.browserManager.getPageScreenshotBase64();

    const system_prompt = buildAsserterSystemPrompt({
      testName: state.test_name,
      expected: state.expected
    });

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
    let asserterPromptTokens = 0;
    let asserterCompletionTokens = 0;
    let asserterTotalTokens = 0;

    try {
      // 呼叫結構化輸出模型
      const structuredResponse = await this.asserter_model.invoke(messages) as any;
      if (structuredResponse && structuredResponse.parsed) {
        final_result = structuredResponse.parsed.result;
        final_reason = structuredResponse.parsed.reason;
      }
      if (structuredResponse && structuredResponse.raw) {
        const usage = structuredResponse.raw.usage_metadata;
        if (usage) {
          asserterPromptTokens = usage.input_tokens ?? 0;
          asserterCompletionTokens = usage.output_tokens ?? 0;
          asserterTotalTokens = usage.total_tokens ?? 0;
        }
      }
    } catch (e: any) {
      final_result = "FAIL";
      final_reason = `視覺斷言解析發生異常：${e.message}`;
    }

    // 關閉瀏覽器，因為測試已結束
    await this.browserManager.closeBrowser();

    // 更新 TestRun 狀態
    const testRunRepo = AppDataSource.getRepository(TestRun);
    const run = await testRunRepo.findOne({ where: { id: state.run_id } });
    if (run) {
      run.status = final_result === "PASS" ? "passed" : "failed";
      run.finalResult = final_result;
      run.finalReason = final_reason;
      run.finishedAt = new Date();
      run.asserterPromptTokens = asserterPromptTokens;
      run.asserterCompletionTokens = asserterCompletionTokens;
      run.asserterTotalTokens = asserterTotalTokens;
      run.totalPromptTokens = (run.totalPromptTokens || 0) + asserterPromptTokens;
      run.totalCompletionTokens = (run.totalCompletionTokens || 0) + asserterCompletionTokens;
      run.totalTokens = (run.totalTokens || 0) + asserterTotalTokens;
      await testRunRepo.save(run);

      // 發送任務結束通知
      await testRunRepo.query(
        `SELECT pg_notify('test_run_logs', $1)`,
        [
          JSON.stringify({
            runId: state.run_id,
            status: run.status,
            finalResult: final_result,
            finalReason: final_reason,
            event: "completed",
            timestamp: new Date().toISOString(),
            asserterPromptTokens: run.asserterPromptTokens,
            asserterCompletionTokens: run.asserterCompletionTokens,
            asserterTotalTokens: run.asserterTotalTokens,
            totalPromptTokens: run.totalPromptTokens,
            totalCompletionTokens: run.totalCompletionTokens,
            totalTokens: run.totalTokens
          })
        ]
      );
    }

    return {
      final_result,
      final_reason
    };
  }

  /**
   * 報告節點：處理失敗中斷時的安全寫入
   */
  async reporterNode(state: typeof TestState.State) {
    const update_data: any = {};
    const currentStepIdx = state.current_step_idx ?? 0;
    const steps = state.steps || [];

    // 如果測試尚未執行完所有步驟就被迫中斷 (例如重試超限)
    if (currentStepIdx < steps.length) {
      update_data.final_result = "FAIL";
      update_data.final_reason = `步驟 ${currentStepIdx + 1} (『${steps[currentStepIdx]}』) 執行次數達到上限但仍未完成，強制終止測試。`;
    }

    const merged_result = update_data.final_result || state.final_result;
    let screenshotFailBuffer: Buffer | undefined;

    if (["FAIL", "ERROR"].includes(merged_result) && this.browserManager.page) {
      try {
        const base64 = await this.browserManager.getPageScreenshotBase64();
        screenshotFailBuffer = Buffer.from(base64, "base64");
      } catch (e: any) {
        console.error(`[E2E Manager] 無法擷取最終失敗畫面：${e.message}`);
      }
    }

    // 確保關閉瀏覽器
    try {
      await this.browserManager.closeBrowser();
    } catch (e) {}

    // 更新資料庫中的 TestRun 紀錄，將最終失敗結果與失敗當刻截圖二進位 (bytea) 寫入
    const testRunRepo = AppDataSource.getRepository(TestRun);
    const updatePayload: any = {
      status: merged_result === "PASS" ? "passed" : (merged_result === "ERROR" ? "error" : "failed"),
      finalResult: merged_result,
      finalReason: update_data.final_reason || state.final_reason,
      finishedAt: new Date()
    };
    if (screenshotFailBuffer) {
      updatePayload.screenshotFailData = screenshotFailBuffer;
    }
    await testRunRepo.update(state.run_id, updatePayload);

    // 取得最新總 tokens 以便廣播
    const run = await testRunRepo.findOne({ where: { id: state.run_id } });
    const totalPromptTokens = run ? run.totalPromptTokens : 0;
    const totalCompletionTokens = run ? run.totalCompletionTokens : 0;
    const totalTokens = run ? run.totalTokens : 0;

    // 發送任務結束通知
    await testRunRepo.query(
      `SELECT pg_notify('test_run_logs', $1)`,
      [
        JSON.stringify({
          runId: state.run_id,
          status: updatePayload.status,
          finalResult: merged_result,
          finalReason: updatePayload.finalReason,
          event: "completed",
          timestamp: new Date().toISOString(),
          totalPromptTokens,
          totalCompletionTokens,
          totalTokens
        })
      ]
    );

    return update_data;
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
        routeAfterExecution as any,
        {
          executor: "executor",
          step_tracker: "step_tracker",
          reporter: "reporter"
        }
      )

      // 步驟追蹤後的條件邊
      .addConditionalEdges(
        "step_tracker",
        routeNextStep as any,
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
