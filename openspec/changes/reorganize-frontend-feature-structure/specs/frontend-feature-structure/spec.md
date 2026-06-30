## ADDED Requirements

### Requirement: Feature-Owned Frontend Modules
The frontend SHALL organize product-area UI code into feature-owned modules under `frontend/src/features/<feature>` when the code belongs primarily to one product area.

#### Scenario: Project feature files are colocated
- **WHEN** a developer works on project list, create, edit, or detail UI
- **THEN** the relevant pages and project-specific components are discoverable under `frontend/src/features/projects`

#### Scenario: New user management UI has a clear home
- **WHEN** user management frontend work is added
- **THEN** user-specific pages, components, hooks, and helpers are placed under a user-owned feature module instead of root-level `views`, `hooks`, or `components/custom`

### Requirement: Shared Code Boundary
The frontend SHALL keep reusable primitives and cross-feature utilities in shared locations instead of placing them inside a single feature module.

#### Scenario: Shared UI primitive remains reusable
- **WHEN** multiple features use the same button, dialog, input, table primitive, or layout-neutral UI wrapper
- **THEN** the code is available from a shared UI or shared component location

#### Scenario: Feature-specific component stays local
- **WHEN** a component depends on project-specific concepts such as project browser state, project variables, or project deletion
- **THEN** the component is owned by the project feature module

### Requirement: Project Feature Migration
The frontend SHALL migrate project-owned views, components, hooks, and table column definitions into a project feature module without changing user-facing behavior.

#### Scenario: Existing project routes still work
- **WHEN** the project feature files are reorganized
- **THEN** existing project route paths continue to render the same project list, create, edit, and detail experiences

#### Scenario: Project table columns are feature-owned
- **WHEN** the project list table uses project-specific column definitions
- **THEN** those column definitions are colocated with the project feature rather than stored in a root-level table column folder

### Requirement: Route Integration Stability
The frontend SHALL update route imports to feature module entry points while preserving route paths, route handles, loaders, and breadcrumb behavior.

#### Scenario: Breadcrumbs remain stable
- **WHEN** routes import project pages from the new feature module
- **THEN** existing breadcrumb labels and icons continue to resolve as before

#### Scenario: Loaders remain stable
- **WHEN** route files are updated for the new structure
- **THEN** existing project, testcase, and task loader behavior remains unchanged

### Requirement: Feature Export Discipline
Feature modules SHALL expose only intentional public entry points through `index.ts` files and MUST NOT barrel-export every internal implementation detail by default.

#### Scenario: Routes import public pages
- **WHEN** `routes.tsx` imports project feature pages
- **THEN** it can import public page exports from the project feature entry point

#### Scenario: Internal components are not globally exposed
- **WHEN** a component is used only inside the project feature
- **THEN** it remains imported through local feature paths rather than being exported as part of the feature public API

### Requirement: Structural Refactor Validation
The frontend SHALL validate the structural refactor with existing TypeScript and build checks.

#### Scenario: Refactor is type-valid
- **WHEN** the feature structure migration is complete
- **THEN** the frontend typecheck/build command succeeds without unresolved imports
