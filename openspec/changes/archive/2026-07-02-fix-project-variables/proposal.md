## Why

In the project settings view, saving project environment variables fails to persist or display correctly. When users navigate away and return to the project edit view, the environment variables appear empty. Saving other blocks (e.g., general info) while they appear empty subsequently overwrites and wipes the environment variables in the database. This critical data integrity issue prevents environment variables from being effectively saved and used.

## What Changes

- **Fix Environment Variable Display**: Correct the React state initialization in `VariablesEditor.tsx` so that variables loaded from the backend are properly mapped to internal state on component mount.
- **Fix Variable Overwriting**: Refactor the frontend update logic in `ProjectEditView.tsx` to perform partial updates (patching only changed fields) rather than submitting the full state including stale fields.
- **Update Zod Schema**: Correct the Zod schema for projects in `schema.ts` to properly allow a record type for variables rather than strict empty object `{}`.

## Capabilities

### New Capabilities
*None*

### Modified Capabilities
*None*

## Impact

- Frontend:
  - `frontend/src/components/custom/VariablesEditor.tsx` (state initialization fixed)
  - `frontend/src/features/projects/schema.ts` (schema validation types updated)
  - `frontend/src/features/projects/pages/ProjectEditView.tsx` (handle block-level updates without sending stale form values)
  - `frontend/src/features/projects/hooks/useProjectData.ts` (support partial updates)
  - `frontend/src/lib/api.ts` (update signature for partial updates)
- Backend:
  - No database migration is needed, as the backend already correctly supports nullable jsonb fields for variables, but API validation and parsing will be aligns.
