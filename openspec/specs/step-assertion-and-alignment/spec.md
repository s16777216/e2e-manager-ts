# step-assertion-and-alignment Specification

## Purpose
TBD - created by archiving change normalize-testcase-steps. Update Purpose after archive.
## Requirements
### Requirement: Database normalization for testcase steps
The system SHALL store testcase steps in a dedicated `TestcaseStep` entity table, associated with `Testcase` via a one-to-many relationship, replacing the legacy `simple-json` steps array. Each step record SHALL store an operational action, an optional step-level expected result, and an order index.

#### Scenario: Fetching and executing structured steps
- **WHEN** a test run starts
- **THEN** the system retrieves steps from the `TestcaseStep` table ordered by `stepIdx` and runs them in sequence

### Requirement: Step-level AI assertion and execution decision
The system SHALL evaluate each step's expected result using a dedicated AI Asserter node. If an expected result is defined, the system SHALL require the AI Asserter to verify the webpage state against this expected result before allowing the step to be marked as completed. If the expected result specifies "no changes" or "finish immediately", the AI Asserter SHALL immediately approve step completion upon executor action. If no expected result is defined, the system SHALL bypass validation and complete the step immediately upon the executor calling `done_acting`.

#### Scenario: Successful assertion of visual changes
- **WHEN** the AI Executor completes a step's action and calls `done_acting` under a step with an expected result "Verify dashboard loads"
- **THEN** the AI Asserter checks the screenshot, detects that the dashboard text appears on screen, and marks the step as completed

#### Scenario: Instant completion for steps without visual feedback
- **WHEN** the AI Executor completes a step with an expected result "no changes, finish immediately" and calls `done_acting`
- **THEN** the AI Asserter immediately approves step completion and marks the step as completed without waiting for visual changes

### Requirement: Console static and dynamic step alignment
The frontend console SHALL align the static `TestcaseStep` definitions with the dynamic `TestRunStep` records. Steps that have not yet started or were skipped due to previous failures SHALL be rendered as grey "Pending" or "Skipped" states in the UI.

#### Scenario: Displaying skipped steps on run failure
- **WHEN** a test run fails at step 2 of a 4-step testcase
- **THEN** the frontend console displays steps 1 and 2 with their execution status, and steps 3 and 4 as greyed-out skipped steps

### Requirement: Testcase editor with action and expectation inputs
The testcase editor SHALL support separate inputs for each step's operational description and its optional step-level expected result, with support for dynamic addition, deletion, and ordering.

#### Scenario: Saving a new testcase with step expected results
- **WHEN** the user creates a testcase with multiple steps, defining both action and expected results, and clicks save
- **THEN** the system saves the testcase and writes the steps into the `TestcaseStep` table with correct order indexes

