import { Hono } from "hono";
import { AppDataSource } from "../db.js";
import { Project } from "../entities/Project.js";

export const projectRouter = new Hono();

projectRouter.get("/", async (c) => {
  const projects = await AppDataSource.getRepository(Project).find();
  return c.json(projects);
});

projectRouter.post("/", async (c) => {
  const { name, description } = await c.req.json();
  if (!name) return c.json({ error: "專案名稱為必填" }, 400);

  const project = new Project();
  project.name = name;
  project.description = description;

  await AppDataSource.getRepository(Project).save(project);
  return c.json(project, 201);
});

projectRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const project = await AppDataSource.getRepository(Project).findOne({
    where: { id },
  });
  if (!project) return c.json({ error: "找不到專案" }, 404);
  return c.json(project);
});

projectRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const { name, description } = await c.req.json();

  const projectRepo = AppDataSource.getRepository(Project);
  const project = await projectRepo.findOne({ where: { id } });
  if (!project) return c.json({ error: "找不到專案" }, 404);

  if (name) project.name = name;
  if (description !== undefined) project.description = description;

  await projectRepo.save(project);
  return c.json(project);
});

projectRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const projectRepo = AppDataSource.getRepository(Project);
  const project = await projectRepo.findOne({ where: { id } });
  if (!project) return c.json({ error: "找不到專案" }, 404);

  await projectRepo.remove(project);
  return c.json({ message: "專案刪除成功" });
});
