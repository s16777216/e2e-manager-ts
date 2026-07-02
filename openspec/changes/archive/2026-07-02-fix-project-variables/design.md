## Context

In `ProjectEditView.tsx`, the project settings are split into three blocks:
1. **General Settings** (Name, Description)
2. **Storage Settings** (initCookies, initLocalStorage)
3. **Environment Variables** (variables)

Each block triggers its own update flow, but the common update hook `handleUpdateProject` from `useProjectData.ts` and `api.updateProject` in `api.ts` submit the *entire* set of project settings. 

Furthermore, `useRouteLoaderData("project-root")` caches the project data. When users navigate away and return to the project edit page, the cached `activeProject` contains outdated (empty) variables. In addition, `VariablesEditor.tsx` has a React state synchronization bug:
```typescript
const [prevVariables, setPrevVariables] = useState(variables);
```
On initial render, `variables === prevVariables`, which skips the synchronization check and leaves the internal `pairs` state as `[]`. Because the UI shows no variables, if a user updates and saves the General Settings, the form state sends the empty variables array back to the backend, overwriting the valid database entries.

## Goals / Non-Goals

**Goals:**
1. Fix the initialization bug in `VariablesEditor.tsx` to properly load and display environment variables from the database upon component mount.
2. Refactor the frontend update logic to support **Partial Updates** (PATCH behavior). Each edit block will only transmit the fields it manages, preventing unchanged or stale fields (like empty variables) from overwriting database entries.
3. Correct the Zod schema in `schema.ts` to support variables as a Record type rather than an empty object `z.object({})`.
4. Trigger route revalidation using React Router's `useRevalidator` after updates to keep the cached project data synchronized.

**Non-Goals:**
1. Rewriting the backend routing structure. The backend patch route `/projects/:id` already selectively updates fields if they are not `undefined`.
2. Redesigning the project edit view UI. We will maintain the existing multi-block layout.

## Decisions

### 1. Frontend Partial Update on PATCH API
- **Rationale**: The REST PATCH endpoint `/projects/:id` natively handles partial updates (updating database columns only when the properties are defined in the JSON payload). We will change the typescript signature of `api.updateProject` and `handleUpdateProject` to take a partial object of updates.
- **Alternatives Considered**: Fetching the latest project data before saving. This introduces additional latency and does not address the core issue of a form sending stale values.

### 2. State Initialization in VariablesEditor
- **Rationale**: We will use a state initializer function in `useState(() => parseVariablesToPairs(variables))` to map `variables` props to `pairs` on first mount. We will retain the `variables !== prevVariables` conditional update to sync any subsequent external updates.
- **Alternatives Considered**: Using `useEffect` to sync props. This can cause one-frame UI flickering where the variables list appears empty before the effect runs.

### 3. Triggering React Router Revalidation
- **Rationale**: React Router caches loader results. After a successful PATCH request, we will invoke `revalidate()` from `useRevalidator` to refresh the cached `activeProject` instance across all pages.
- **Alternatives Considered**: Directly mutating the router context or forcing a page refresh. This is anti-pattern in React Router v6 and degrades user experience.

## Risks / Trade-offs

- **[Risk]** Revalidation may cause a minor layout shift or loading state if the network request is slow.
  - *Mitigation*: We update the local `formState` immediately before calling the API. The user sees instant UI updates, and the background revalidation runs silently.
- **[Risk]** Partial parameters in TypeScript might hide missing properties if we accidentally omit required ones.
  - *Mitigation*: We will keep `projectId` as a required parameter and make the change properties a separate optional object type to enforce type safety.
