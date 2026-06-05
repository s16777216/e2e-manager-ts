import { Repository } from "typeorm";
import { TestGroup } from "../entities/TestGroup.js";

/**
 * 遞迴獲取當前群組的所有祖先節點 (用於 adjacency-list 結構防環)
 * 藉由傳入 groupRepo，使該純邏輯與資料庫 DataSource 連線解耦，便於單元測試 Mock
 */
export async function findAncestors(
  group: TestGroup,
  groupRepo: Pick<Repository<TestGroup>, "findOne">
): Promise<TestGroup[]> {
  const ancestors: TestGroup[] = [];
  let current = group;

  while (current.parent) {
    const parent = await groupRepo.findOne({
      where: { id: current.parent.id },
      relations: { parent: true },
    });
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}
