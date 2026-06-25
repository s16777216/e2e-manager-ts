## MODIFIED Requirements

### Requirement: Step-level AI assertion and execution decision
The system SHALL evaluate each step's expected result using a dedicated AI Asserter node. If an expected result is defined, the system SHALL require the AI Asserter to verify the webpage state against this expected result before allowing the step to be marked as completed. If the expected result specifies "no changes" or "finish immediately", the AI Asserter SHALL immediately approve step completion upon executor action. If no expected result is defined, the system SHALL bypass validation and complete the step immediately upon the executor calling `done_acting`.

#### Scenario: Successful assertion of visual changes
- **WHEN** the AI Executor completes a step's action and calls `done_acting` under a step with an expected result "Verify dashboard loads"
- **THEN** the AI Asserter checks the screenshot, detects that the dashboard text appears on screen, and marks the step as completed

#### Scenario: Instant completion for steps without visual feedback
- **WHEN** the AI Executor completes a step with an expected result "no changes, finish immediately" and calls `done_acting`
- **THEN** the AI Asserter immediately approves step completion and marks the step as completed without waiting for visual changes
