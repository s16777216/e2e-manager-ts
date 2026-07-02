## ADDED Requirements

### Requirement: Interpolation engine supports builtin function syntax
The system SHALL recognize and evaluate `{{$functionName("arg1", "arg2")}}` patterns within template strings during interpolation, distinct from static variable lookup (`{{variableName}}`).

#### Scenario: Builtin function resolved at interpolation time
- **WHEN** a template string contains `{{$random_uuid()}}` and is interpolated during a TestRun
- **THEN** the system replaces it with a freshly generated UUID v4 string

#### Scenario: Static variable alongside builtin function
- **WHEN** a template string contains both `{{api_key}}` and `{{$timestamp()}}` and is interpolated
- **THEN** `{{api_key}}` is replaced with the variable value from the merged variable table, and `{{$timestamp()}}` is replaced with the current Unix timestamp in seconds

#### Scenario: Unknown builtin function name
- **WHEN** a template string contains `{{$unknown_fn()}}` with an unrecognised function name
- **THEN** the placeholder is preserved unchanged (same behaviour as an undefined static variable), and the `onUndefined` callback is invoked with the token `$unknown_fn()`

---

### Requirement: Builtin function arguments use quoted-string format
The system SHALL parse function arguments as comma-separated, double-quoted strings. Unquoted arguments MUST NOT be accepted.

#### Scenario: Quoted arguments parsed correctly
- **WHEN** a template contains `{{$random_int("1", "100")}}`
- **THEN** the function receives `min=1`, `max=100` as numeric boundaries and returns an integer in [1, 100]

#### Scenario: Unquoted arguments treated as parse error
- **WHEN** a template contains `{{$random_int(1, 100)}}` without quotes
- **THEN** the placeholder is left unreplaced and the `onUndefined` callback is invoked

---

### Requirement: Named snapshot caches function result within a TestRun
The system SHALL support a snapshot parameter — the last argument of the form `"@snapshotKey"` — which causes the function result to be computed once and reused for all subsequent calls with the same key within the same TestRun.

#### Scenario: First call computes and caches the value
- **WHEN** a step template contains `{{$random_uuid("@account_id")}}` and no snapshot named `account_id` exists in the current RunContext
- **THEN** the system generates a new UUID, stores it in `RunContext.snapshots` under key `account_id`, and returns it

#### Scenario: Subsequent calls return the cached value
- **WHEN** a later step template also contains `{{$random_uuid("@account_id")}}` within the same TestRun
- **THEN** the system retrieves `account_id` from `RunContext.snapshots` and returns the same UUID without generating a new one

#### Scenario: Different snapshot keys produce independent values
- **WHEN** a TestRun uses `{{$random_uuid("@user_a")}}` and `{{$random_uuid("@user_b")}}`
- **THEN** `user_a` and `user_b` each receive independently generated UUIDs

#### Scenario: Snapshot isolated between TestRuns
- **WHEN** two separate TestRuns both use `{{$random_uuid("@account_id")}}`
- **THEN** each run's `RunContext` is independent and the UUIDs may differ

---

### Requirement: Time builtin functions return current time values
The system SHALL provide the following time-related builtin functions, evaluated at the moment of interpolation:

| Function | Arguments | Return value |
|---|---|---|
| `$timestamp()` | none | Unix timestamp in seconds as a decimal string |
| `$timestamp("ms")` | `"ms"` | Unix timestamp in milliseconds as a decimal string |
| `$now()` | none | ISO 8601 datetime string in server local time |
| `$now("format")` | dayjs format string | Formatted datetime string |
| `$date()` | none | Current date as `YYYY-MM-DD` |
| `$datetime()` | none | Current datetime as `YYYY-MM-DDTHH:mm:ssZ` |

#### Scenario: $timestamp() returns seconds
- **WHEN** a template contains `{{$timestamp()}}` and is interpolated
- **THEN** the result is a string of digits representing the current Unix time in seconds (e.g., `"1751454201"`)

#### Scenario: $timestamp("ms") returns milliseconds
- **WHEN** a template contains `{{$timestamp("ms")}}`
- **THEN** the result is a string of digits representing milliseconds (e.g., `"1751454201000"`)

#### Scenario: $now("YYYY-MM-DD") returns formatted date
- **WHEN** a template contains `{{$now("YYYY-MM-DD")}}`
- **THEN** the result matches the pattern `YYYY-MM-DD` for the current server local date

#### Scenario: $now() with invalid format string returns empty string
- **WHEN** a template contains `{{$now("!!!invalid!!!")}}`
- **THEN** the result is an empty string and the `onUndefined` callback is invoked

---

### Requirement: Random builtin functions generate pseudorandom values
The system SHALL provide the following random-value builtin functions:

| Function | Arguments | Return value |
|---|---|---|
| `$random_int()` | none | Random integer 0–999999 as string |
| `$random_int("min","max")` | min, max (inclusive) | Random integer in [min, max] as string |
| `$random_float()` | none | Random float 0.0–1.0, 6 decimal places |
| `$random_uuid()` | none | UUID v4 string |
| `$random_string()` | none | 8-char alphanumeric string |
| `$random_string("n")` | length | n-char alphanumeric string |

#### Scenario: $random_int() with no arguments
- **WHEN** a template contains `{{$random_int()}}`
- **THEN** the result is a decimal string of a non-negative integer in [0, 999999]

#### Scenario: $random_int with bounds
- **WHEN** a template contains `{{$random_int("10", "20")}}`
- **THEN** the result is a decimal string of an integer in [10, 20] inclusive

#### Scenario: $random_uuid produces valid UUID v4
- **WHEN** a template contains `{{$random_uuid()}}`
- **THEN** the result matches the UUID v4 pattern `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

#### Scenario: $random_string("16") produces correct length
- **WHEN** a template contains `{{$random_string("16")}}`
- **THEN** the result is a string of exactly 16 alphanumeric characters [a-zA-Z0-9]
