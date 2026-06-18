/**
 * 合併兩組 Playwright 格式的 Cookie 陣列
 * 以 name + domain + path 作為唯一鍵，子層覆蓋父層
 */
export function mergeCookies(parent: any, child: any): any[] {
  const pList = Array.isArray(parent) ? parent : [];
  const cList = Array.isArray(child) ? child : [];
  
  const map = new Map<string, any>();
  
  // 先放入父層
  pList.forEach((c) => {
    if (c && typeof c === "object" && c.name) {
      const key = `${c.name}:${c.domain || ""}:${c.path || ""}`;
      map.set(key, c);
    }
  });

  // 再放入子層，若有重複鍵則覆蓋
  cList.forEach((c) => {
    if (c && typeof c === "object" && c.name) {
      const key = `${c.name}:${c.domain || ""}:${c.path || ""}`;
      map.set(key, c);
    }
  });

  return Array.from(map.values());
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
