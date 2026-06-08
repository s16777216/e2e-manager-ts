import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BrowserManager } from "./browser.js";

export class BrowserTools {
  constructor(private browserManager: BrowserManager) {}

  /**
   * 取得綁定了 Playwright 實例的 LangChain Tools 列表
   */
  public getTools() {
    const navigate_to = tool(
      async ({ url }) => {
        try {
          const page = this.browserManager.page;
          if (!page) return "錯誤：瀏覽器未初始化。";
          
          await page.goto(url);
          // 等待網頁載入完成，最多等 5 秒
          try {
            await page.waitForLoadState("networkidle", { timeout: 5000 });
          } catch (e) {}
          
          return `已成功導航至網址：${url}`;
        } catch (error: any) {
          return `導航至網址 ${url} 失敗：${error.message}`;
        }
      },
      {
        name: "navigate_to",
        description: "將瀏覽器導航至指定的 URL 網址。參數 url 必須是完整的網址，例如 'https://www.google.com'。",
        schema: z.object({
          url: z.string().url().describe("要導航的完整目標網址")
        })
      }
    );

    const click_element = tool(
      async ({ selector }) => {
        try {
          const page = this.browserManager.page;
          if (!page) return "錯誤：瀏覽器未初始化。";

          // 等待元素出現且可見
          await page.waitForSelector(selector, { state: "visible", timeout: 5000 });
          await page.click(selector);

          // 點擊後稍微等待動態內容載入
          try {
            await page.waitForLoadState("networkidle", { timeout: 2000 });
          } catch (e) {
            await page.waitForTimeout(500);
          }

          return `已成功點擊元素：${selector}`;
        } catch (error: any) {
          return `點擊元素 ${selector} 失敗：${error.message}`;
        }
      },
      {
        name: "click_element",
        description: "點擊網頁上指定的按鈕、連結或可點擊元素。參數 selector 必須是簡化 DOM 中標示的 selector 屬性值。",
        schema: z.object({
          selector: z.string().describe("Playwright 定位 selector")
        })
      }
    );

    const input_text = tool(
      async ({ selector, text }) => {
        try {
          const page = this.browserManager.page;
          if (!page) return "錯誤：瀏覽器未初始化。";

          // 等待輸入框出現並可見
          await page.waitForSelector(selector, { state: "visible", timeout: 5000 });
          // 直接使用 fill 填入文字，確保資料狀態完美綁定
          await page.fill(selector, text);
          return `已成功在元素 ${selector} 中輸入內容：'${text}'`;
        } catch (error: any) {
          return `在元素 ${selector} 中輸入文字失敗：${error.message}`;
        }
      },
      {
        name: "input_text",
        description: "在網頁指定的文字輸入框中填入內容。參數 selector 必須是簡化 DOM 中標示的 selector 屬性值。",
        schema: z.object({
          selector: z.string().describe("Playwright 定位 selector"),
          text: z.string().describe("要輸入的文字內容")
        })
      }
    );

    const wait_for_seconds = tool(
      async ({ seconds }) => {
        try {
          const page = this.browserManager.page;
          if (!page) return "錯誤：瀏覽器未初始化。";
          await page.waitForTimeout(seconds * 1000);
          return `已強制等待了 ${seconds} 秒`;
        } catch (error: any) {
          return `強制等待失敗：${error.message}`;
        }
      },
      {
        name: "wait_for_seconds",
        description: "強制等待指定的秒數，可用於等待動態動畫、網頁跳轉或異步加載完畢。",
        schema: z.object({
          seconds: z.number().int().min(1).describe("要等待的秒數")
        })
      }
    );

    const finish_step = tool(
      async ({ message }) => {
        return `FINISH_STEP: ${message}`;
      },
      {
        name: "finish_step",
        description: "宣告當前的測試步驟已經成功完成。當你確認當前步驟目標已達成，你必須呼叫此工具。",
        schema: z.object({
          message: z.string().describe("完成步驟的總結說明")
        })
      }
    );

    return [navigate_to, click_element, input_text, wait_for_seconds, finish_step];
  }
}
