## 1. Tooling and Prompts Update

- [ ] 1.1 Modify `backend/src/tools.ts` to replace the `finish_step` tool with `done_acting`
- [ ] 1.2 Refactor `backend/src/graph/prompt.ts` to simplify `buildExecutorSystemPrompt` (removing self-validation constraints and rules)
- [ ] 1.3 Implement `buildStepAsserterSystemPrompt` in `backend/src/graph/prompt.ts` for step-level outcome verification

## 2. Graph and Router Restructuring

- [ ] 2.1 Update `backend/src/graph/router.ts`'s `routeAfterExecution` to intercept `done_acting` and split routing logic based on the presence of step expected results
- [ ] 2.2 Add the `step_asserter` node implementation to `backend/src/graph.ts` to call the AI Asserter on the current screenshot and step expected outcome
- [ ] 2.3 Modify the `StateGraph` definition and conditional edges in `backend/src/graph.ts` to integrate the `step_asserter` node and route correct paths (Executor -> Asserter/Tracker)
- [ ] 2.4 Implement error feedback routing: push Asserter failure messages back to `logs` to guide the Executor's next retry

## 3. Verification and Compilation

- [ ] 3.1 Run TypeScript compilation check `npm run build` to verify there are no type or syntax errors
- [ ] 3.2 Start the backend server and execute a testcase containing steps without expected results to verify they auto-complete instantly on `done_acting`
- [ ] 3.3 Execute a testcase containing steps with expected results to verify that the Asserter node correctly validates screens, feeds back failures on mismatch, and passes steps on success
