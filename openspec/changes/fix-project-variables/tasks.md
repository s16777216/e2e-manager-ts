## 1. Schema and Variable Editor Bug Fixes

- [ ] 1.1 Update Zod schema in `frontend/src/features/projects/schema.ts` to allow correct Record types for variables rather than strict `z.object({})`.
- [ ] 1.2 Fix React state initialization in `frontend/src/components/custom/VariablesEditor.tsx` by using a lazy state initializer in `useState` to correctly map initial variable props on mount.

## 2. API and Page Updates for Partial Saves

- [ ] 2.1 Update the signature of `api.updateProject` in `frontend/src/lib/api.ts` to support optional parameters (partial update properties).
- [ ] 2.2 Refactor the frontend hook `handleUpdateProject` in `frontend/src/features/projects/hooks/useProjectData.ts` to take a partial updates object and pass it to the API.
- [ ] 2.3 Update `ProjectEditView.tsx` so that each configuration block (General, Storage, Variables) only sends its relevant modified fields to `handleUpdateProject`.
- [ ] 2.4 Add `useRevalidator` to `ProjectEditView.tsx` and trigger `revalidate()` after successful project updates to ensure cached loaders are refreshed.

## 3. Verification

- [ ] 3.1 Verify environment variables display properly on initial page load and after refreshing.
- [ ] 3.2 Verify that modifying and saving General settings does not clear or reset already saved environment variables.
