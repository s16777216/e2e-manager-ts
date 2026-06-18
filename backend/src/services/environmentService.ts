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
