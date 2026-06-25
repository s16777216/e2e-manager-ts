# action-assertion-separation Specification

## Purpose
TBD - created by archiving change refactor-action-assertion-separation. Update Purpose after archive.

## Requirements
### Requirement: Execution and verification separation (Dual-Agent logic)
The system SHALL separate action execution from step validation. The AI Executor SHALL focus exclusively on performing the step's actions and calling the `done_acting` tool upon completion. The system SHALL invoke an independent AI Asserter node to verify the step's expected outcome against the current screenshot when a step expected result is defined.

#### Scenario: Successful execution and step verification
- **WHEN** the AI Executor finishes clicking a button and calls `done_acting`, and the AI Asserter verifies that the screen matches the step's expected outcome
- **THEN** the system marks the step as passed and advances to the next step

#### Scenario: Step verification fails triggering executor retry
- **WHEN** the AI Executor calls `done_acting` but the AI Asserter determines the screen does not yet match the expected outcome
- **THEN** the system routes the execution back to the AI Executor with the failure reason to retry, incrementing the retry counter

### Requirement: Framework auto-finish for steps without expected results
The system SHALL support automatic step completion at the framework level. When a step has no expected result defined, the system SHALL automatically mark the step as completed and advance to the next step immediately after the AI Executor calls `done_acting`, without invoking the AI Asserter or returning execution control to the AI Executor for that step.

#### Scenario: Auto finish on done_acting tool call
- **WHEN** the AI Executor completes the action for a step without any expected result and calls `done_acting`
- **THEN** the system automatically records the step as passed and proceeds to the next step without further validation
