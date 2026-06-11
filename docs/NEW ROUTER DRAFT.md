## 修改整體佈局

### 側邊欄

```
<icon> <title> ---------> goto home page
    <projects> ---------> goto projects page
```

### 專案列表 /project

```
+ <new project>
- project A ---------> goto project detail page
- project B ---------> goto project detail page
...
```

### 專案內容 /project/:projectId

檢視專案內容, 有新增/修改/刪除群組或測試案例的功能.

- 新增群組: 根據使用者選擇的父群組建立, 若沒有選取則為根群組

- 新增測試案例: 根據使用者選擇的父群組建立, 必須要選擇群組

```
<project name>

+ <new test case>
+ <new group>

- group A > (drop down)
    - group AA > (drop down)
        - test case A -------------> goto test case page
        - test case B -------------> goto test case page
    - group AB > (drop down)
- group B > (drop down)
```

### 測試案例內容 /project/:projectId/testCase/:testCaseId

檢視測試案例內容, 可以編輯、檢視、檢視歷史執行紀錄

```step tab
<test case name>

[<step tab>] <history run tab>
- step 1
- step 2
+ <new step>

```

```history tab
<test case name>

<step tab> [<history run tab>]
- history 1 ---------> goto history run page
- history 2 ---------> goto history run page
- history 3 ---------> goto history run page
```

### 歷史執行紀錄 /project/:projectId/run/:runId

檢視歷史執行紀錄

```
<test run name>

- step result 1
- step result 2
- step result 3
```
