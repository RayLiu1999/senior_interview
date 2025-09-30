# 單元測試、模擬 (Mock) 與樁 (Stub)

- **難度**: 6
- **重要性**: 5
- **標籤**: `Testing`, `Unit Testing`, `Mocking`, `Stubbing`

## 問題詳述

請解釋什麼是單元測試 (Unit Testing)。在進行單元測試時，為什麼需要使用測試替身 (Test Doubles)？請詳細說明兩種最常見的測試替身：模擬 (Mock) 和樁 (Stub) 的區別與各自的使用場景。

## 核心理論與詳解

單元測試是測試金字塔的基石，也是軟體開發中最核心的測試類型。它的主要目標是驗證應用程式中最小的可測試單元（通常是函式或方法）的行為是否符合預期。

### 什麼是單元測試？

單元測試的核心原則是**隔離**。一個好的單元測試應該：
1.  **專注於單一功能**：每個測試案例只驗證一個具體的行為或邏輯路徑。
2.  **與外部依賴解耦**：測試的對象（System Under Test, SUT）應該與其依賴的組件（如資料庫、網路 API、檔案系統）完全隔離。
3.  **執行快速**：由於其隔離性，單元測試不應涉及 I/O 操作，因此執行速度非常快。
4.  **結果穩定**：在程式碼不變的情況下，單元測試的結果應該是確定且可重複的。

為了達到**隔離**的目的，我們需要引入**測試替身 (Test Doubles)** 的概念。

### 測試替身 (Test Doubles)

測試替身是一個通用術語，指的是所有在測試中用來替代真實依賴對象的物件。它們的存在是為了讓單元測試能夠在一個受控且可預測的環境中進行。最常見的兩種測試替身是**樁 (Stub)** 和**模擬 (Mock)**。

---

### 樁 (Stub) vs. 模擬 (Mock)

雖然這兩個詞經常被混用，但它們在測試中的角色和目的有著本質的區別。

#### 1. 樁 (Stub) - 狀態驗證 (State Verification)

-   **核心目的**: 為測試提供固定的、可預測的**數據**或**狀態**。Stub 主要用來回答 SUT 的查詢。
-   **行為**: Stub 是一個「啞巴」物件，它只會根據預設的腳本回傳固定的值。它本身不包含任何複雜的邏輯，也不會記錄自己被如何使用。
-   **驗證方式**: 測試的斷言 (Assertion) 是針對**SUT 的狀態**。我們呼叫 SUT 的方法，然後檢查 SUT 的回傳值或其內部狀態是否因為 Stub 提供的數據而變成了我們預期的樣子。
-   **比喻**: 想像一個演員的**替身 (Stunt Double)**。在拍攝危險場景時，我們關心的不是替身演員本身做了什麼，而是主角（SUT）是否因為這個場景（由替身完成）而達到了某個狀態（例如，成功從爆炸中逃脫）。

**使用場景**:
當你的測試需要從依賴項獲取數據，但你不想或不能使用真實的依賴項時。
-   從資料庫讀取一筆使用者資料。
-   從外部 API 獲取一個設定值。
-   從檔案系統讀取一個檔案。

#### 2. 模擬 (Mock) - 行為驗證 (Behavior Verification)

-   **核心目的**: 驗證 SUT 是否以預期的方式**呼叫**了其依賴項。Mock 關心的是**互動**過程。
-   **行為**: Mock 是一個「聰明」的物件。在測試開始前，你會對它設定**期望 (Expectations)**，例如：「我期望你在測試過程中，`send_email` 方法會被呼叫恰好一次，且參數為 'test@example.com'」。在測試結束後，你需要**驗證 (Verify)** 這些期望是否都已滿足。
-   **驗證方式**: 測試的斷言是針對**Mock 物件本身**。我們呼叫 SUT 的方法，然後去問 Mock：「SUT 有沒有按照我們約定的方式跟你互動？」
-   **比喻**: 想像一個語言考試的**口試官 (Mock Examiner)**。考試的重點不是口試官說了什麼，而是要驗證考生（SUT）是否能用正確的語法和詞彙與口試官（Mock）進行**互動**。

**使用場景**:
當你的測試需要確保 SUT 執行了某個沒有直接回傳值的操作時。
-   確認郵件發送服務被正確呼叫。
-   確認日誌紀錄函式被呼叫以記錄錯誤。
-   確認一個交易被正確地提交到資料庫。

### 核心區別總結

| 特性 | 樁 (Stub) | 模擬 (Mock) |
| :--- | :--- | :--- |
| **驗證目標** | **狀態驗證** (State Verification) | **行為驗證** (Behavior Verification) |
| **斷言對象** | 斷言 SUT 的狀態或回傳值 | 驗證 Mock 物件本身的方法是否被預期呼叫 |
| **核心作用** | 提供測試數據 | 驗證互動過程 |
| **測試失敗原因** | SUT 的狀態不對 | SUT 沒有以預期方式呼叫依賴項 |
| **與 SUT 的關係** | SUT **從** Stub 獲取數據 | SUT **對** Mock 執行操作 |

## 程式碼範例 (Go)

假設我們有一個 `Notifier` 服務，它依賴一個 `MessageSender` 介面來發送訊息。

```go
// MessageSender 是我們的依賴介面
type MessageSender interface {
    Send(recipient string, message string) error
}

// Notifier 是我們的 SUT (System Under Test)
type Notifier struct {
    sender MessageSender
}

func (n *Notifier) Notify(user string, message string) (bool, error) {
    // 業務邏輯：如果訊息為空，則不發送
    if message == "" {
        return false, nil // 狀態改變
    }
    // 呼叫依賴項
    err := n.sender.Send(user, message)
    if err != nil {
        // 處理錯誤
        return false, err // 狀態改變
    }
    return true, nil // 狀態改變
}
```

### Stub 使用範例 (狀態驗證)

我們想測試當 `sender.Send` 方法回傳錯誤時，`Notifier.Notify` 是否也回傳 `false` 和 `error`。

```go
// StubSender 是一個 Stub，它只會回傳一個預設的錯誤
type StubSender struct {
    errToReturn error
}

func (s *StubSender) Send(recipient string, message string) error {
    return s.errToReturn
}

func TestNotifier_Notify_ReturnsErrorOnSendFailure(t *testing.T) {
    // 準備：建立一個總是回傳錯誤的 Stub
    expectedErr := errors.New("network failure")
    stub := &StubSender{errToReturn: expectedErr}
    
    notifier := &Notifier{sender: stub}

    // 執行：呼叫 SUT
    success, err := notifier.Notify("test_user", "hello")

    // 驗證：斷言 SUT 的回傳值（狀態）
    assert.False(t, success)
    assert.Equal(t, expectedErr, err)
}
```
在這個測試中，我們不關心 `Send` 方法是否被呼叫，只關心當它回傳錯誤時，`Notifier` 的狀態是否正確。

### Mock 使用範例 (行為驗證)

我們想測試當 `Notify` 被呼叫時，`sender.Send` 方法是否被以正確的參數呼叫。這裡我們可以使用像 `testify/mock` 這樣的庫。

```go
// MockSender 是一個 Mock 物件
type MockSender struct {
    mock.Mock
}

// 實現介面
func (m *MockSender) Send(recipient string, message string) error {
    args := m.Called(recipient, message)
    return args.Error(0)
}

func TestNotifier_Notify_CallsSenderWithCorrectArguments(t *testing.T) {
    // 準備：建立 Mock 物件並設定期望
    mockSender := new(MockSender)
    
    // 期望 "Send" 方法被以 "test_user" 和 "hello" 為參數呼叫一次
    // 並且這次呼叫應該回傳 nil (無錯誤)
    mockSender.On("Send", "test_user", "hello").Return(nil).Once()

    notifier := &Notifier{sender: mockSender}

    // 執行：呼叫 SUT
    notifier.Notify("test_user", "hello")

    // 驗證：斷言 Mock 的期望是否被滿足
    mockSender.AssertExpectations(t)
}
```
在這個測試中，我們的斷言是針對 `mockSender` 本身，驗證它的 `Send` 方法是否被如期呼叫。這就是行為驗證。