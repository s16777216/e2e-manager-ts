import { describe, it, expect } from "vitest";
import { calculateSelector } from "../../src/browser/selector.js";

describe("DOM Selector 定位計算演算法單元測試 (selector.ts)", () => {
  it("1. 優先級測試：若存在 id 應回傳 #id 定位器", () => {
    const el = {
      tagName: "BUTTON",
      id: "submit-btn",
      name: "submit",
      placeholder: "Click me",
      text: "Submit form"
    };
    expect(calculateSelector(el)).toBe("#submit-btn");
  });

  it("2. 優先級測試：若無 id 但有 name，應回傳 tag[name='name'] 定位器", () => {
    const el = {
      tagName: "input",
      name: "email",
      placeholder: "Enter email",
      text: "Email address"
    };
    expect(calculateSelector(el)).toBe('input[name="email"]');
  });

  it("3. 優先級測試：若無 id, name 但有 placeholder，應回傳 tag[placeholder='...'] 定位器", () => {
    const el = {
      tagName: "textarea",
      placeholder: "Write comment"
    };
    expect(calculateSelector(el)).toBe('textarea[placeholder="Write comment"]');
  });

  it("4. 優先級測試：若僅有 text，應回傳 :has-text 定位器", () => {
    const el = {
      tagName: "a",
      text: "Read More"
    };
    expect(calculateSelector(el)).toBe('a:has-text("Read More")');
  });

  it("5. 字串轉義測試：文字中含有雙引號時應正確轉義，防止定位器語法損毀", () => {
    const el = {
      tagName: "div",
      text: 'Hello "World"'
    };
    expect(calculateSelector(el)).toBe('div:has-text("Hello \\"World\\"")');
  });

  it("6. 兜底測試：無任何特徵屬性時應回傳原始標籤名稱", () => {
    const el = {
      tagName: "h1"
    };
    expect(calculateSelector(el)).toBe("h1");
  });
});
