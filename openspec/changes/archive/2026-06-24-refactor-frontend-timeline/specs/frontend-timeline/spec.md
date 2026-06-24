## ADDED Requirements

### Requirement: Compact Layout Support
The frontend timeline component MUST support a compact layout mode to prevent UI clipping and content crowding when nested inside narrow containers.

#### Scenario: Rendering compact timeline
- **WHEN** the `compact` property is set to true on `TimelineItem`
- **THEN** the component SHALL hide the left version and date labels, and align the vertical line and dots to the left.

### Requirement: Custom Dot Customization
The timeline component MUST allow custom React node inputs for dots to visually represent different operational statuses (e.g., pending, running, error, normal).

#### Scenario: Rendering custom dot element
- **WHEN** a ReactNode is passed to the `dot` property of `TimelineItem`
- **THEN** the component SHALL render the passed ReactNode in place of the default primary colored dot.

### Requirement: Last Item Line Removal
The timeline component MUST support removing the trailing vertical line for the last item in a list to prevent visual overflow.

#### Scenario: Render last timeline item
- **WHEN** the `isLast` property is set to true on `TimelineItem`
- **THEN** the component SHALL omit the vertical connector line beneath the dot.
