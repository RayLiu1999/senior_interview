# 什麼是命令模式 (Command Pattern)？

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Design Pattern`, `Command`, `Behavioral`

## 問題詳述

命令模式是一種行為型設計模式，它將一個請求（或操作）封裝成一個獨立的物件，從而允許對請求進行參數化、排隊、記錄日誌，以及支援可撤銷的操作。

## 核心理論與詳解

### 核心角色組成

命令模式由四個核心角色構成：

| 角色 | 職責 |
| :--- | :--- |
| **Command（命令介面）** | 宣告執行操作的 `Execute()` 方法（及可選的 `Undo()`） |
| **ConcreteCommand（具體命令）** | 實作 Command 介面，持有 Receiver 的引用，呼叫其對應方法 |
| **Receiver（接收者）** | 真正執行業務邏輯的物件，命令的實際執行者 |
| **Invoker（呼叫者）** | 持有命令物件，負責觸發命令的執行，不直接與 Receiver 交互 |

**核心思想：解耦 Sender（觸發者）與 Receiver（執行者）**，Invoker 只知道如何呼叫命令，不知道命令做了什麼。

### 命令模式的三大核心能力

**1. 參數化請求**

將一個操作封裝成物件後，就可以像傳遞普通物件一樣傳遞命令，實現操作的「一等公民」化。例如，可以將不同命令放入一個列表中，依序執行或隨時呼叫。

**2. 撤銷 (Undo) / 重做 (Redo)**

命令物件可以記錄自身執行前的狀態（或逆向操作），從而實現撤銷。維護一個命令歷史棧（Command History Stack），`Undo` 時從棧頂彈出命令並呼叫其 `Undo()` 方法，`Redo` 時重新 `Execute()` 即可。

```
命令歷史棧: [ Cmd_A | Cmd_B | Cmd_C ] ← 棧頂
撤銷: 執行 Cmd_C.Undo(), 棧頂移除 Cmd_C
重做: 執行 Cmd_C.Execute(), 重新入棧
```

**3. 命令佇列化（宏命令 / Macro Command）**

將多個命令組合成一個宏命令（即命令的命令），按照一定順序執行，可以用於實現「事務」的概念——要麼全部成功，要麼全部撤銷。

### 在 Go 中的慣用實現方式

Go 語言沒有類別繼承，慣用的命令模式實現有兩種方式：

**方式一：函數式命令（Function as Command）**

在 Go 中，函數是一等公民，最簡潔的方式是直接以 `func()` 作為命令介面，這本質上是一種「函數物件」的應用：

```go
// 以函數類型作為命令
type Command func()

// Invoker：任務佇列
type TaskQueue struct {
    queue []Command
    history []Command
}

func (q *TaskQueue) Add(cmd Command) {
    q.queue = append(q.queue, cmd)
}

func (q *TaskQueue) Run() {
    for _, cmd := range q.queue {
        cmd()
        q.history = append(q.history, cmd)
    }
    q.queue = nil
}
```

**方式二：介面式命令（Interface-based Command）**

當需要支援 Undo 時，必須使用介面方式，因為需要攜帶額外狀態：

```go
// Command 介面
type Command interface {
    Execute()
    Undo()
}

// Receiver：文字編輯器
type TextEditor struct {
    content string
}

func (e *TextEditor) InsertText(text string) { e.content += text }
func (e *TextEditor) DeleteText(n int)       { e.content = e.content[:len(e.content)-n] }

// ConcreteCommand：插入文字命令
type InsertCommand struct {
    editor *TextEditor
    text   string
}

func (c *InsertCommand) Execute() { c.editor.InsertText(c.text) }
func (c *InsertCommand) Undo()    { c.editor.DeleteText(len(c.text)) }

// Invoker：支援撤銷的命令管理器
type CommandManager struct {
    history []Command
}

func (m *CommandManager) Execute(cmd Command) {
    cmd.Execute()
    m.history = append(m.history, cmd)
}

func (m *CommandManager) Undo() {
    if len(m.history) == 0 {
        return
    }
    n := len(m.history) - 1
    m.history[n].Undo()
    m.history = m.history[:n]
}
```

### 實際應用場景

- **作業佇列（Job Queue）**：Web Server 將使用者請求封裝成 Command 丟入任務佇列，由 Worker Pool 消費執行。
- **文字編輯器的 Ctrl+Z / Ctrl+Y**：每次操作（插入、刪除、格式化）都是一個 Command，支援多步撤銷。
- **資料庫事務封裝**：將多個 SQL 操作封裝成一個宏命令，失敗時依序呼叫各命令的 `Undo()` 進行回滾。
- **HTTP Middleware Chain**：Gin/Echo 中的 middleware 鏈本質上是責任鏈模式，但每個 handler 也可視為一種命令的組合執行。
- **GUI 按鈕操作**：每個按鈕的點擊事件綁定一個 Command 物件，按鈕不需要知道具體執行了什麼操作。

### 與其他模式的比較

| 模式 | 關鍵差異 |
| :--- | :--- |
| **策略模式 (Strategy)** | 策略側重「選擇演算法」，命令側重「封裝請求 + 記錄歷史」 |
| **責任鏈模式 (Chain of Responsibility)** | 責任鏈將請求沿鏈傳遞直到有人處理；命令總是讓特定接收者執行 |
| **備忘錄模式 (Memento)** | 備忘錄儲存物件的完整狀態快照；命令儲存的是「如何回到前一狀態的操作」 |

### 優缺點分析

**優點：**
- 解耦呼叫者與接收者，方便對操作進行排列、組合
- 天然支援撤銷/重做、操作日誌、事務回滾
- 新增命令不需要修改現有程式碼（符合開閉原則）

**缺點：**
- 每個操作都需要一個具體命令類別，程式碼量增加
- 簡單場景使用此模式可能過度設計
