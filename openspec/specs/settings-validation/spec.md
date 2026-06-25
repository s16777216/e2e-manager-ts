# settings-validation Specification

## Purpose
TBD - created by archiving change use-custom-form-in-settings. Update Purpose after archive.
## Requirements
### Requirement: 動作延遲與超時驗證
系統設定中，動作延遲 (slowMo) 屬性 MUST 為介於 0 到 3000ms 之間的數值，且預設等待超時 (defaultTimeout) MUST 為不小於 1000ms 的數值。

#### Scenario: slowMo 數值過大校驗
- **WHEN** 使用者輸入的動作延遲大於 3000
- **THEN** 系統 SHALL 阻擋表單提交，並在畫面上顯示「動作延遲不能超過 3000ms」的提示

#### Scenario: defaultTimeout 數值過小校驗
- **WHEN** 使用者輸入的預設等待超時小於 1000
- **THEN** 系統 SHALL 阻擋表單提交，並在畫面上顯示「超時時間至少需 1000ms」的提示

### Requirement: 視窗尺寸驗證
系統設定中，瀏覽器視窗寬度 (viewportWidth) MUST 為介於 320 到 3840 之間的數值，且視窗高度 (viewportHeight) MUST 為介於 240 到 2160 之間的數值。

#### Scenario: 視窗寬度過小校驗
- **WHEN** 使用者輸入的寬度小於 320
- **THEN** 系統 SHALL 阻擋表單提交，並在畫面上顯示「寬度至少為 320」的提示

#### Scenario: 視窗高度過大校驗
- **WHEN** 使用者輸入的高度大於 2160
- **THEN** 系統 SHALL 阻擋表單提交，並在畫面上顯示「高度最大為 2160」的提示

