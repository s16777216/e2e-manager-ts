import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseTestCase } from "../src/parser.js";

describe("劇本解析器 (parser.ts) Zod 驗證測試", () => {
  const tempDir = path.resolve("./scratch/temp_tests");

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("1. 解析合法劇本：應成功解析並回傳完整的 JSON 物件", () => {
    const validJson = {
      id: "test-login",
      name: "測試登入",
      steps: ["輸入帳號", "點擊登入"],
      expected: "登入成功，導航至儀表板",
    };

    const filePath = path.join(tempDir, "valid.json");
    fs.writeFileSync(filePath, JSON.stringify(validJson), "utf-8");

    const result = parseTestCase(filePath);

    expect(result.id).toBe("test-login");
    expect(result.name).toBe("測試登入");
    expect(result.steps).toEqual(["輸入帳號", "點擊登入"]);
    expect(result.expected).toBe("登入成功，導航至儀表板");
  });

  it("2. 缺少必填欄位 (例如 id)：應拋出 Zod 錯誤", () => {
    const invalidJson = {
      name: "測試登入",
      steps: ["輸入帳號"],
      expected: "登入成功",
    };

    const filePath = path.join(tempDir, "missing_id.json");
    fs.writeFileSync(filePath, JSON.stringify(invalidJson), "utf-8");

    expect(() => parseTestCase(filePath)).toThrow("測試劇本欄位驗證失敗");
  });

  it("3. steps 為空陣列：應觸發 steps 至少需包含一個步驟之約束並拋錯", () => {
    const invalidJson = {
      id: "test-empty-steps",
      name: "測試空步驟",
      steps: [],
      expected: "無",
    };

    const filePath = path.join(tempDir, "empty_steps.json");
    fs.writeFileSync(filePath, JSON.stringify(invalidJson), "utf-8");

    expect(() => parseTestCase(filePath)).toThrow("步驟清單至少需包含一個步驟");
  });

  it("4. 檔案不存在：應拋出找不到劇本檔案之錯誤", () => {
    expect(() => parseTestCase("not_exist_file.json")).toThrow(
      "找不到測試劇本檔案",
    );
  });
});
