import { chromium, Browser, BrowserContext, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { calculateSelector } from "./browser/selector.js";
import { getSettings } from "./services/settingsService.js";

export class BrowserManager {
  public browser: Browser | null = null;
  public context: BrowserContext | null = null;
  public page: Page | null = null;

  constructor(
    private viewportWidth: number = 1280,
    private viewportHeight: number = 800,
  ) {}

  /**
   * 初始化 Playwright 並開啟瀏覽器
   */
  async initBrowser(headlessOverride?: boolean) {
    const settings = await getSettings();

    // 優先度判定：環境變數 > 明確傳入參數 > 資料庫設定值
    let finalHeadless = settings.headless;
    if (process.env.CI || process.env.HEADLESS_FORCE) {
      finalHeadless = true;
    } else if (headlessOverride !== undefined) {
      finalHeadless = headlessOverride;
    }

    const width = settings.viewportWidth;
    const height = settings.viewportHeight;

    this.browser = await chromium.launch({
      headless: finalHeadless,
      slowMo: settings.slowMo,
      channel: "chrome",
      args: ["--disable-web-security", "--no-sandbox"],
    });
    this.context = await this.browser.newContext({
      viewport: { width, height },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ignoreHTTPSErrors: true, // 忽略自簽憑證 SSL 安全警告
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(settings.defaultTimeout);
  }

  /**
   * 關閉瀏覽器與 Playwright 實例
   */
  async closeBrowser() {
    if (this.page) {
      await this.page.close().catch(() => {});
      this.page = null;
    }
    if (this.context) {
      await this.context.close().catch(() => {});
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }

  /**
   * 取得當前網頁畫面截圖，並轉成 Base64 字串以利 Gemini 多模態讀取
   */
  async getPageScreenshotBase64(): Promise<string> {
    if (!this.page) {
      throw new Error("瀏覽器尚未初始化或已被關閉");
    }
    const buffer = await this.page.screenshot({ type: "png" });
    return buffer.toString("base64");
  }

  /**
   * 將當前頁面截圖儲存至指定檔案路徑
   */
  async saveScreenshot(filePath: string) {
    if (!this.page) {
      throw new Error("瀏覽器尚未初始化或已被關閉");
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    await this.page.screenshot({ path: filePath, type: "png" });
  }

  /**
   * 執行瀏覽器內 JS 提取可見互動元素，產出精簡 DOM 文字且整合輸入框當前 value
   */
  async getSimplifiedDOM(): Promise<string> {
    if (!this.page) {
      throw new Error("瀏覽器尚未初始化或已被關閉");
    }

    try {
      const calcSelectorStr = calculateSelector.toString();
      const simplifiedDom = await this.page.evaluate((fnStr) => {
        // 還原為瀏覽器端可執行的 selector 計算函數
        const calculateSelector = new Function("return " + fnStr)();

        const results: any[] = [];
        // 抓取按鈕、連結、輸入欄位與標題
        const elements = document.querySelectorAll(
          'button, a, input, select, textarea, h1, h2, h3, h4, h5, h6, [role="button"], [role="link"], [role="alert"], .p-toast-message, .error, .alert',
        );

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          // 忽略隱藏的元素
          if (
            rect.width === 0 ||
            rect.height === 0 ||
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0"
          ) {
            return;
          }

          const htmlEl = el as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          const text = htmlEl.innerText
            ? htmlEl.innerText.trim().replace(/\s+/g, " ").substring(0, 100)
            : "";
          const id = el.id || "";
          const placeholder = el.getAttribute("placeholder") || "";
          const name = el.getAttribute("name") || "";
          const type = el.getAttribute("type") || "";
          const value = (el as HTMLInputElement).value || ""; // 讀取當前已輸入內容

          // 調用抽離後的定位演算法
          const selector = calculateSelector({
            tagName,
            id,
            name,
            placeholder,
            text,
          });

          results.push({
            tagName,
            text,
            id,
            placeholder,
            name,
            type,
            value,
            selector,
          });
        });

        // 對映為精簡的 HTML 標籤結構文字
        return results
          .map((item) => {
            let desc = `<${item.tagName}`;
            if (item.id) desc += ` id="${item.id}"`;
            if (item.name) desc += ` name="${item.name}"`;
            if (item.placeholder) desc += ` placeholder="${item.placeholder}"`;
            if (item.type) desc += ` type="${item.type}"`;
            if (item.value) desc += ` value="${item.value}"`; // 渲染 value，補足 AI 感知
            desc += ` selector=\`${item.selector}\``;
            desc += `>`;
            if (item.text) desc += ` ${item.text} `;
            desc += `</${item.tagName}>`;
            return desc;
          })
          .join("\n");
      }, calcSelectorStr);

      return simplifiedDom || "<!-- 頁面目前沒有檢測到可見的互動元素 -->";
    } catch (e: any) {
      return `<!-- 無法提取 DOM 資訊：${e.message} -->`;
    }
  }
}
