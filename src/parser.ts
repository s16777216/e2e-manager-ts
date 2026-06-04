import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

// 定義測試劇本的 Zod 驗證 Schema
export const TestCaseSchema = z.object({
  id: z.string().min(1, "測試案例 ID 不能為空"),
  name: z.string().min(1, "測試案例名稱不能為空"),
  steps: z.array(z.string().min(1)).min(1, "步驟清單至少需包含一個步驟"),
  expected: z.string().min(1, "預期結果描述不能為空")
});

export type TestCase = z.infer<typeof TestCaseSchema>;

/**
 * 讀取並以 Zod 驗證 JSON 格式的測試劇本檔案
 */
export function parseTestCase(filePath: string): TestCase {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`找不到測試劇本檔案：${filePath}`);
  }
  
  try {
    const rawData = fs.readFileSync(absolutePath, "utf-8");
    const jsonData = JSON.parse(rawData);
    
    // Zod 進行 schema 強制約束驗證
    return TestCaseSchema.parse(jsonData);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors
        .map((err) => `- [${err.path.join(".")}] ${err.message}`)
        .join("\n");
      throw new Error(`測試劇本欄位驗證失敗：\n${formattedErrors}`);
    }
    throw new Error(`讀取測試劇本時發生錯誤：${error.message}`);
  }
}
