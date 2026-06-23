## 1. Database and Data Migration

- [x] 1.1 Create `backend/src/entities/TestcaseStep.ts` entity representing testcase steps
- [x] 1.2 Modify `backend/src/entities/Testcase.ts` to replace `steps: string[]` with a one-to-many relationship with `TestcaseStep`
- [x] 1.3 Register `TestcaseStep` in `backend/src/db.ts`
- [x] 1.4 Implement automatic data migration in backend bootstrap code to convert legacy `simple-json` steps to `TestcaseStep` table rows and drop the legacy column safely
- [x] 1.5 Add `hasExpected` column to `TestcaseStep` entity with default `false` for finer validation control

## 2. Backend APIs and LangGraph Execution Engine

- [x] 2.1 Update `backend/src/routes/testcases.ts` to support saving, updating, and fetching testcases with associated `TestcaseStep` entity rows ordered by `stepIdx`
- [x] 2.2 Adjust `backend/src/routes/run.ts` to extract step expected results and actions from `Testcase` and pass them to the execution state
- [x] 2.3 Update `TestState` in `backend/src/state.ts` to include `step_expecteds` array
- [x] 2.4 Update `executorNode` in `backend/src/graph.ts` to retrieve both action and expected result for the current step and pass them to the prompt builder
- [x] 2.5 Update `buildExecutorSystemPrompt` in `backend/src/graph/prompt.ts` to guide AI on using step-level expected results for `finish_step` decisions (especially for no-visible-change actions)
- [x] 2.6 Update `testcase.ts` and `run.ts` routers to persist and return the `hasExpected` field

## 3. Frontend UI and Console Step Alignment

- [x] 3.1 Update frontend client API interfaces in `frontend/src/api.ts` to support the new structured `TestcaseStep` model
- [x] 3.2 Update the testcase creation/edition view in the frontend to support dual inputs (action and expected result) for steps, with dynamic add/remove buttons
- [x] 3.3 Refactor `SSEConsoleView.tsx` and `StepAccordion.tsx` to align the static `testcase.steps` definition with the dynamic `TestRunStep` list, rendering unexecuted/skipped steps as greyed-out pending cards
- [x] 3.4 Integrate `Switch` toggle for `hasExpected` in all testcase creation/edition entry points (TestCaseDetailView, GroupDashboardView, ProjectDetailView) with local input buffering (expected input is only sent if hasExpected is true)

## 4. Verification and Compilation

- [x] 4.1 Run local build `npm run build` to verify there are no TypeScript compilation errors across backend and frontend
- [x] 4.2 Start the backend server to trigger migration and verify that existing testcases are migrated to `TestcaseStep` correctly
- [x] 4.3 Execute a testcase with a mixture of standard steps and "no-feedback" steps to verify AI decision correctness and UI alignment
- [x] 4.4 Verify that `hasExpected` Switch works correctly on UI, showing/hiding the expected input field while preserving buffered input and persisting correctly to database on save
