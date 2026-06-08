import { describe, it, expect, vi } from "vitest";
import { findAncestors } from "../../src/services/groupService.js";
import { TestGroup } from "../../src/entities/TestGroup.js";

describe("TestGroup 樹狀祖先查詢與防環邏輯單元測試", () => {
  it("場景 A：無環的正常樹狀結構，應能遞迴查出完整的祖先鏈 (B 與 A)", async () => {
    // 建立模擬節點關係
    const nodeA = { id: "uuid-A", name: "Project-A", parent: null } as TestGroup;
    const nodeB = { id: "uuid-B", name: "Group-B", parent: nodeA } as TestGroup;
    const nodeC = { id: "uuid-C", name: "Group-C", parent: nodeB } as TestGroup;

    // Mock Repository.findOne
    const mockFindOne = vi.fn().mockImplementation(async (query: any) => {
      const searchId = query.where.id;
      if (searchId === "uuid-B") return nodeB;
      if (searchId === "uuid-A") return nodeA;
      return null;
    });

    const mockRepo = { findOne: mockFindOne };

    // 執行邏輯：查詢 C 的所有祖先
    const ancestors = await findAncestors(nodeC, mockRepo as any);

    // 驗證
    expect(ancestors).toHaveLength(2);
    expect(ancestors[0].id).toBe("uuid-B");
    expect(ancestors[1].id).toBe("uuid-A");
    expect(mockFindOne).toHaveBeenCalledTimes(2);
  });

  it("場景 B：循環嵌套防環校驗，若新父群組的祖先鏈包含自己，應判定為 loop", async () => {
    // 建立結構：A ◀── B ◀── C
    // 企圖將 A 的 parent 指向 C。此時需要驗證新 parent C 的祖先鏈是否包含 A 自身
    const nodeA = { id: "uuid-A", name: "Group-A" } as TestGroup;
    const nodeB = { id: "uuid-B", name: "Group-B", parent: nodeA } as TestGroup;
    const nodeC = { id: "uuid-C", name: "Group-C", parent: nodeB } as TestGroup;

    const mockFindOne = vi.fn().mockImplementation(async (query: any) => {
      const searchId = query.where.id;
      if (searchId === "uuid-B") return nodeB;
      if (searchId === "uuid-A") return nodeA;
      return null;
    });

    const mockRepo = { findOne: mockFindOne };

    // 查詢 C (新 parent) 的所有祖先
    const ancestorsOfC = await findAncestors(nodeC, mockRepo as any);

    // 模擬防環判定
    const isLoop = ancestorsOfC.some((ancestor) => ancestor.id === nodeA.id);

    expect(isLoop).toBe(true);
  });

  it("邊界場景：若 parent 屬性為 undefined 或屬性缺失，應回傳空祖先鏈", async () => {
    const nodeOrphan = { id: "uuid-orphan", name: "Orphan-Group" } as TestGroup; // parent is undefined
    const mockRepo = { findOne: vi.fn() };

    const ancestors = await findAncestors(nodeOrphan, mockRepo as any);

    expect(ancestors).toHaveLength(0);
    expect(mockRepo.findOne).not.toHaveBeenCalled();
  });
});
