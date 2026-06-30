## 1. Inventory And Classification

- [x] 1.1 List current project-owned frontend files across `views`, `components/custom`, `hooks`, and `table-columns`.
- [x] 1.2 Classify each candidate file as project-owned, shared, or out-of-scope for this change.
- [x] 1.3 Identify active-change conflict risks with `datatable-tree-support` and `user-management`.

## 2. Feature Structure Setup

- [ ] 2.1 Create `frontend/src/features/projects/pages`, `components`, `hooks`, and `columns` folders.
- [ ] 2.2 Create `frontend/src/features/projects/index.ts` for public project feature exports.

## 3. Project Feature Migration

- [ ] 3.1 Move project views into `features/projects/pages`:
  - `views/ProjectsView.tsx` ──▶ `features/projects/pages/ProjectListView.tsx`
  - `views/ProjectCreateView.tsx` ──▶ `features/projects/pages/ProjectCreateView.tsx`
  - `views/ProjectEditView.tsx` ──▶ `features/projects/pages/ProjectEditView.tsx`
  - `views/ProjectDetailView.tsx` ──▶ `features/projects/pages/ProjectDetailView.tsx`
- [ ] 3.2 Move project-owned components into `features/projects/components`:
  - `components/custom/ProjectForm.tsx` ──▶ `features/projects/components/ProjectForm.tsx`
  - `components/custom/NewSubgroupDialog.tsx` ──▶ `features/projects/components/NewSubgroupDialog.tsx`
  - `components/custom/GroupTreeNode.tsx` ──▶ `features/projects/components/GroupTreeNode.tsx`
- [ ] 3.3 Move project-owned hooks into `features/projects/hooks`:
  - `hooks/useProjectData.ts` ──▶ `features/projects/hooks/useProjectData.ts`
  - `hooks/useGroupData.ts` ──▶ `features/projects/hooks/useGroupData.ts`
- [ ] 3.4 Move project-specific table columns into `features/projects/columns`:
  - `table-columns/Project.tsx` ──▶ `features/projects/columns/projectColumns.tsx`
- [ ] 3.5 Add project feature exports for route-facing pages only in `features/projects/index.ts`.

## 4. Import And Route Updates

- [ ] 4.1 Update `frontend/src/routes.tsx` imports to use the new project feature paths while preserving route definitions.
- [ ] 4.2 Update moved project files to import local feature modules through relative feature paths.
- [ ] 4.3 Update references from remaining files (like `TestCaseDetailView.tsx`) to the new project feature locations.
- [ ] 4.4 Remove obsolete project-specific root-level files once imports no longer reference them.

## 5. Validation

- [ ] 5.1 Run the frontend build/typecheck command (`npm run build`) and fix unresolved imports.
- [ ] 5.2 Verify existing project routes still render list, create, edit, and detail views.
- [ ] 5.3 Verify breadcrumbs and route loaders still behave as before.
- [ ] 5.4 Review the resulting tree to confirm shared primitives did not move into project-owned folders accidentally.
