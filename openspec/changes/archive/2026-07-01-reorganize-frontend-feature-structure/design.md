## Context

The frontend currently uses a mostly type-based source layout:

```text
frontend/src
├─ views/
├─ layouts/
├─ components/
│  ├─ ui/
│  ├─ custom/
│  ├─ icon/
│  └─ shadcn-studio/
├─ hooks/
├─ lib/
├─ table-columns/
├─ types/
└─ config/
```

This worked while the app was smaller, but several files now combine page rendering, feature state, API calls, dialogs, and table configuration. Project-related code is spread across `views`, `components/custom`, `hooks`, and `table-columns`. Upcoming auth, user management, settings, and DataTable tree work will add more feature-specific UI and make the current layout harder to navigate.

The desired change is structural only. Runtime behavior, route paths, API contracts, and user-visible UI should remain unchanged.

## Goals / Non-Goals

**Goals:**

- Introduce a feature-oriented frontend layout that groups ownership by product area.
- Make project-related pages, local components, hooks, and table columns easier to find and evolve together.
- Preserve clearly shared layers for reusable UI primitives, layout shell components, app routing, API utilities, and shared types.
- Provide a repeatable pattern for upcoming `auth`, `users`, `settings`, `testcases`, `runs`, and DataTable work.
- Keep migration incremental and reviewable.

**Non-Goals:**

- No visual redesign.
- No backend API changes.
- No new state management library.
- No route URL changes.
- No broad refactor of business logic beyond import/path updates and light extraction needed for file ownership.
- No immediate migration of every frontend feature if it is unrelated to project structure.

## Decisions

### 1. Use `features/<feature>` For Product Areas (Option A)

Feature-owned code should live under `frontend/src/features/<feature>`. Under **Option A**, we keep `src/components/ui/` in place to maintain compatibility with shadcn CLI configuration (retaining `"ui": "src/components/ui"` in `components.json`) and avoid refactoring imports across 31 existing files.

Here is the resulting directory tree under Option A:

```text
frontend/src/
├─ components/
│  ├─ ui/                     ◄── [Untouched] shadcn primitives (Button, Dialog, Input...)
│  └─ custom/                 ◄── [Shared] Generic custom components and wrappers
│     ├─ form/                │   ├── FormField, FormBlock
│     ├─ table/               │   ├── DataTable, Pagination, filters
│     ├─ BaseDialog.tsx       │   ├── Common dialog wrapper
│     ├─ Typography.tsx       │   ├── Typography styles
│     ├─ StatusBadge.tsx      │   ├── Status badges
│     └─ VariablesEditor.tsx  ◄── [Shared] Variables editor (used by Project and TestCase)
├─ features/                  ◄── [New] Feature-oriented modules directory
│  └─ projects/               ◄── [Project / Group Feature]
│     ├─ pages/               │   ├── Feature pages for routes
│     │  ├─ ProjectListView.tsx   │   │   ├── (Formerly ProjectsView.tsx)
│     │  ├─ ProjectCreateView.tsx │   │   ├── (Formerly ProjectCreateView.tsx)
│     │  ├─ ProjectEditView.tsx   │   │   ├── (Formerly ProjectEditView.tsx)
│     │  └─ ProjectDetailView.tsx │   │   └── (Formerly ProjectDetailView.tsx)
│     ├─ components/          │   ├── Project-specific components
│     │  ├─ ProjectForm.tsx       │   │   ├── Project settings form
│     │  ├─ NewSubgroupDialog.tsx │   │   ├── Subgroup settings dialog
│     │  └─ GroupTreeNode.tsx     │   │   └── Group tree node row renderer
│     ├─ hooks/               │   ├── Project-specific React hooks
│     │  ├─ useProjectData.ts     │   │   └── Project data CRUD operations
│     │  └─ useGroupData.ts       │   │   └── Group tree list loader
│     ├─ columns/             │   ├── Project-specific columns
│     │  └─ projectColumns.tsx    │   │   └── (Formerly Project.tsx under table-columns)
│     └─ index.ts             ◄── [Public Export] Pages exported for routes.tsx
├─ layouts/                   ◄── [Untouched] Shell layouts (Sidebar, Topbar, RootLayout)
├─ views/                     ◄── [Temporary] Remainder views to migrate later
│  ├─ TestCaseDetailView.tsx  │
│  ├─ TaskDetailView.tsx      │
│  ├─ SSEConsoleView.tsx      │
│  ├─ SettingsView.tsx        │
│  └─ WelcomeView.tsx         │
├─ hooks/                     ◄── [Untouched] Shared hooks (e.g., use-mobile.tsx)
├─ lib/                       ◄── [Untouched] Shared client/utilities (api.ts, utils.ts)
├─ types/                     ◄── [Untouched] Shared TS types
└─ routes.tsx                 ◄── [Updated] Imports updated to new project feature pages
```

Rationale: Colocating pages, components, hooks, and columns makes feature development much faster by reducing file switching. Sticking to Option A minimizes the refactoring blast radius by not changing the shadcn/ui installation paths and preventing wide-ranging import diff noise.

Alternative considered: Place all primitives under a new `src/shared/ui` directory. This would require rewriting imports in 31 files and changing `components.json` paths, causing excessive code churn and merge conflicts for no functional benefit.

### 2. Use Barrel Files Sparingly

Feature `index.ts` files should export public feature entry points such as pages and route-facing helpers. They should not export every internal component by default.

Rationale: Barrels are convenient for route imports, but broad barrels can blur feature internals and make dependencies harder to trace.

Alternative considered: No barrels at all. This is explicit but can make route and feature integration imports noisy.

### 3. Preserve Route URLs And Loader Behavior

`routes.tsx` should update imports to the new feature paths while preserving existing paths, loaders, route handles, and breadcrumb behavior.

Rationale: This change is structural. Existing navigation and loader behavior should remain stable.

Alternative considered: Move routing into each feature immediately. That may be valuable later, but it adds routing architecture decisions beyond the current goal.

## Risks / Trade-offs

- **Import churn can create noisy diffs** → Grounded by Option A which leaves `components/ui/` untouched, keeping the first migration scoped to project files.
- **Barrel files can hide dependency direction** → Export only route-facing/public feature modules (pages).
- **Some components may be shared accidentally** → Classify each moved file as feature-owned or shared before moving. VariablesEditor remains in `components/custom` because it is shared.

## Migration Plan

1. Create the target folders under `frontend/src/features/projects/pages`, `components`, `hooks`, and `columns`.
2. Move project-owned pages from `views` into `features/projects/pages` and rename them according to the target names.
3. Move project-owned components (`ProjectForm`, `NewSubgroupDialog`, `GroupTreeNode`) into `features/projects/components`.
4. Move project-owned hooks (`useProjectData`, `useGroupData`) into `features/projects/hooks`.
5. Move project-specific table columns (`Project.tsx`) into `features/projects/columns` and rename it to `projectColumns.tsx`.
6. Create `features/projects/index.ts` to export public pages.
7. Update `frontend/src/routes.tsx` to import pages from the new feature directory.
8. Update imports inside the moved files to use relative paths for local feature modules.
9. Run `npm run build` and `npm run test` to verify everything compiles and functions correctly.

## Open Questions (Resolved)

- **Should `shared/ui` replace `components/ui` immediately, or should the existing shadcn path remain stable for now?**
  - *Resolution*: The shadcn path `components/ui` remains stable to prevent unnecessary import churn in 31 files and maintain full compatibility with the shadcn CLI.
- **Should route definitions stay centralized in `routes.tsx`, or should future features own route fragments?**
  - *Resolution*: Centralized in `routes.tsx` initially to keep the scope of this migration limited to folder layout.
- **Should `api.ts` remain a single shared client initially, or should feature-specific API wrappers be introduced as features migrate?**
  - *Resolution*: `api.ts` remains a single shared client initially.
