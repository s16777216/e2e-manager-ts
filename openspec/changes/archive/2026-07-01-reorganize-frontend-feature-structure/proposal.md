## Why

The frontend is starting to outgrow its current type-based structure: project pages, reusable business components, hooks, API helpers, and table column definitions are spread across separate root folders. Upcoming work such as user management and DataTable tree support will add more feature-specific UI and state, so now is a good time to define a clearer feature-oriented organization before the structure becomes harder to reshape.

## What Changes

- Introduce a feature-oriented frontend structure that groups pages, local components, hooks, table columns, and feature-specific helpers under the owning feature.
- Keep shared primitives and cross-feature utilities in shared locations instead of feature folders.
- Establish naming and export conventions for feature modules, including when `index.ts` barrel files are appropriate.
- Migrate project-related frontend files as the first application of the convention.
- Prepare a clear home for future frontend features such as authentication, user administration, settings tabs, testcases, runs, and DataTable extensions.
- No user-facing behavior or API contract changes are intended.

## Capabilities

### New Capabilities

- `frontend-feature-structure`: Defines the expected frontend module organization, ownership boundaries, and import/export conventions for feature-oriented UI code.

### Modified Capabilities

None.

## Impact

- Affected frontend areas include `frontend/src/views`, `frontend/src/components/custom`, `frontend/src/hooks`, `frontend/src/table-columns`, `frontend/src/lib`, and `frontend/src/routes.tsx`.
- Existing project-related views and components will be reorganized without changing runtime behavior.
- Shared UI primitives such as shadcn/Radix wrappers remain shared.
- No backend API, database, or dependency changes are expected.
