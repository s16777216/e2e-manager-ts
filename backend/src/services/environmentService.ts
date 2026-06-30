/**
 * 合併兩組 Playwright 格式的 Cookie 陣列
 * 以 name + domain + path 作為唯一鍵，子層覆蓋父層
 */
export function mergeCookies(parent: any, child: any): Record<string, any> {
  const pObj = parent && typeof parent === "object" && !Array.isArray(parent) ? parent : {};
  const cObj = child && typeof child === "object" && !Array.isArray(child) ? child : {};
  
  const merged: Record<string, any> = { ...pObj };
  
  for (const [key, cVal] of Object.entries(cObj)) {
    const pVal = pObj[key];
    if (cVal && typeof cVal === "object" && !Array.isArray(cVal) &&
        pVal && typeof pVal === "object" && !Array.isArray(pVal)) {
      merged[key] = { ...pVal, ...cVal };
    } else {
      merged[key] = cVal;
    }
  }
  
  return merged;
}

/**
 * 合併兩組 LocalStorage 鍵值對 JSON 物件
 * 淺合併 (Shallow Merge)，子層覆蓋父層
 */
export function mergeLocalStorage(parent: any, child: any): Record<string, any> {
  const pObj = parent && typeof parent === "object" && !Array.isArray(parent) ? parent : {};
  const cObj = child && typeof child === "object" && !Array.isArray(child) ? child : {};
  
  return { ...pObj, ...cObj };
}

export interface VariableItem {
  value: string;
  description?: string;
}

/**
 * 合併多個變數來源，由左至右覆蓋合併 (Shallow Merge)
 * 確保子層變數能正確覆蓋父層，支援物件格式 ({ value, description }) 與舊版字串格式的相容性
 */
export function mergeVariables(...sources: any[]): Record<string, VariableItem> {
  const merged: Record<string, VariableItem> = {};
  for (const src of sources) {
    if (src && typeof src === "object" && !Array.isArray(src)) {
      for (const [key, value] of Object.entries(src)) {
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && "value" in value) {
            merged[key] = {
              value: String((value as any).value ?? ""),
              description: (value as any).description ? String((value as any).description) : undefined,
            };
          } else {
            merged[key] = {
              value: String(value),
            };
          }
        }
      }
    }
  }
  return merged;
}

/**
 * 將 {{variableName}} 替換為變數值
 * 若遇到未定義變數，保留原始佔位符，並可呼叫 onUndefined 回呼
 */
export function interpolateString(
  template: string,
  variables: Record<string, string>,
  onUndefined?: (varName: string) => void
): string {
  if (typeof template !== "string") return template;
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmed = varName.trim();
    if (trimmed in variables) {
      return variables[trimmed];
    }
    if (onUndefined) {
      onUndefined(trimmed);
    }
    return match;
  });
}

/**
 * 遞迴替換陣列或巢狀 JSON 物件中的所有字串值
 */
export function interpolateObject(
  obj: any,
  variables: Record<string, string>,
  onUndefined?: (varName: string) => void
): any {
  if (typeof obj === "string") {
    return interpolateString(obj, variables, onUndefined);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => interpolateObject(item, variables, onUndefined));
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, variables, onUndefined);
    }
    return result;
  }
  return obj;
}
