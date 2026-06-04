import { Annotation } from "@langchain/langgraph";

export interface LogEntry {
  step_idx: number;
  step_description: string;
  action: string;
  result: string;
  ai_response?: string;
  timestamp: string;
}

export const TestState = Annotation.Root({
  // 測試案例基本資訊
  test_id: Annotation<string>(),
  test_name: Annotation<string>(),
  steps: Annotation<string[]>(),
  expected: Annotation<string>(),
  
  // 執行過程狀態
  current_step_idx: Annotation<number>(),
  step_retry_count: Annotation<number>(),
  last_screenshot: Annotation<string | null>(),   // base64 字串，用以傳給 Gemini 多模態
  simplified_dom: Annotation<string>(),          // 簡化過濾後的 DOM 文字
  
  // 紀錄與產出
  reports_dir: Annotation<string>(),              // 報告輸出目錄
  screenshots_paths: Annotation<string[]>(),      // 存檔截圖檔案路徑清單 (相對路徑)
  logs: Annotation<LogEntry[]>(),                 // 測試日誌記錄
  final_result: Annotation<string>(),             // "PASS" | "FAIL" | "ERROR"
  final_reason: Annotation<string>()              // 結果判定理由
});

// 導出 State 型別，以便在 Node 函數中進行型別標記
export type TestStateType = typeof TestState.State;
