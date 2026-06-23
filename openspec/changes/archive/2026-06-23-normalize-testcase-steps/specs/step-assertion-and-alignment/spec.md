## ADDED Requirements

### Requirement: Database normalization for testcase steps
The system SHALL store testcase steps in a dedicated `TestcaseStep` entity table, associated with `Testcase` via a one-to-many relationship, replacing the legacy `simple-json` steps array. Each step record SHALL store an operational action, an optional step-level expected result, and an order index.

#### Scenario: Fetching and executing structured steps
- **WHEN** a test run starts
- **THEN** the system retrieves steps from the `TestcaseStep` table ordered by `stepIdx` and runs them in sequence

### Requirement: Step-level AI assertion and execution decision
The system SHALL inject each step's expected result into the AI Agent's execution Prompt. If an expected result is defined, the AI Agent SHALL verify it against the screenshot and DOM before calling the `finish_step` tool. If the expected result specifies "no changes" or "finish immediately", the AI Agent SHALL call `finish_step` immediately after a successful tool execution without waiting or retrying.

#### Scenario: Successful assertion of visual changes
- **WHEN** the AI Agent executes a step with an expected result "Verify dashboard loads"
- **THEN** the AI Agent clicks the login button and waits until the dashboard text appears on screen before calling `finish_step`

#### Scenario: Instant completion for steps without visual feedback
- **WHEN** the AI Agent executes a step with an expected result "no changes, finish immediately"
- **THEN** the AI Agent clicks the submit button and calls `finish_step` immediately without retrying or waiting

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
