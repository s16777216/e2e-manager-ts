import { Hono } from "hono";
import { AppDataSource } from "../db.js";
import { Testcase } from "../entities/Testcase.js";
import { TestGroup } from "../entities/TestGroup.js";

export const testcaseRouter = new Hono();

testcaseRouter.get("/groups/:groupId/testcases", async (c) => {
  const groupId = c.req.param("groupId");
  const testcases = await AppDataSource.getRepository(Testcase).find({
    where: { group: { id: groupId } },
    relations: { runs: true },
  });
  return c.json(testcases);
});

testcaseRouter.post("/groups/:groupId/testcases", async (c) => {
  const groupId = c.req.param("groupId");
  const { name, steps, expected, initCookies, initLocalStorage } = await c.req.json();

  if (
    !name ||
    !steps ||
    !Array.isArray(steps) ||
    steps.length === 0 ||
    !expected
  ) {
    return c.json(
      { error: "無效的欄位：name, steps (非空陣列), expected 皆為必填" },
      400,
    );
  }

  const group = await AppDataSource.getRepository(TestGroup).findOne({
    where: { id: groupId },
  });
  if (!group) return c.json({ error: "找不到指定的群組" }, 404);

  const testcase = new Testcase();
  testcase.name = name;
  testcase.steps = steps;
  testcase.expected = expected;
  testcase.group = group;
  testcase.initCookies = initCookies;
  testcase.initLocalStorage = initLocalStorage;

  await AppDataSource.getRepository(Testcase).save(testcase);
  return c.json(testcase, 201);
});

testcaseRouter.get("/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const testcase = await AppDataSource.getRepository(Testcase).findOne({
    where: { id },
    relations: { runs: true },
  });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);
  return c.json(testcase);
});

testcaseRouter.patch("/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const { name, steps, expected, initCookies, initLocalStorage } = await c.req.json();

  const testcaseRepo = AppDataSource.getRepository(Testcase);
  const testcase = await testcaseRepo.findOne({ where: { id } });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);

  if (name) testcase.name = name;
  if (steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      return c.json({ error: "steps 必須為非空陣列" }, 400);
    }
    testcase.steps = steps;
  }
  if (expected) testcase.expected = expected;
  if (initCookies !== undefined) testcase.initCookies = initCookies;
  if (initLocalStorage !== undefined) testcase.initLocalStorage = initLocalStorage;

  await testcaseRepo.save(testcase);
  return c.json(testcase);
});

testcaseRouter.delete("/testcases/:id", async (c) => {
  const id = c.req.param("id");
  const testcaseRepo = AppDataSource.getRepository(Testcase);
  const testcase = await testcaseRepo.findOne({ where: { id } });
  if (!testcase) return c.json({ error: "找不到測試案例" }, 404);

  await testcaseRepo.remove(testcase);
  return c.json({ message: "測試案例刪除成功" });
});
