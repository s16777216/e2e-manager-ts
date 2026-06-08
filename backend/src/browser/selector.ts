export interface ElementNode {
  tagName: string;
  id?: string;
  name?: string;
  placeholder?: string;
  text?: string;
}

/**
 * 根據 HTML 元素 metadata 計算出最適合 Playwright 定位的 selector
 * 抽離為純函數便於在 Node.js 端進行單元測試（包含對特殊引號的轉義驗證）
 */
export function calculateSelector(el: ElementNode): string {
  const tagName = el.tagName.toLowerCase();
  const id = el.id || "";
  const name = el.name || "";
  const placeholder = el.placeholder || "";
  const text = el.text ? el.text.trim().replace(/\s+/g, ' ').substring(0, 100) : "";

  if (id) {
    return `#${id}`;
  } else if (name) {
    return `${tagName}[name="${name}"]`;
  } else if (placeholder) {
    return `${tagName}[placeholder="${placeholder}"]`;
  } else if (text) {
    // 轉義單引號與雙引號，避免 selector 定位出錯
    const escapedText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
    return `${tagName}:has-text("${escapedText}")`;
  } else {
    return tagName;
  }
}
