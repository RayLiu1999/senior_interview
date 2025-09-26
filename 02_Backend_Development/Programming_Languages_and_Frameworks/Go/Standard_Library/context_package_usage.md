# 請解釋 Go 語言中的 `context` 套件，它的主要用途和 API 是什麼？

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Context`, `Standard Library`, `Concurrency`

## 問題詳述

本問題考察面試者對 Go 語言中處理請求生命週期、傳遞上下文資訊以及控制併發流程的理解。`context` 套件是現代 Go 服務端編程的基石，熟練掌握它是編寫健壯、可維護的分散式系統的必要條件。

## 核心理論與詳解

`context.Context` 是一個標準庫中的介面，它定義了一種在 API 邊界之間以及在多個 Goroutine 之間傳遞請求範圍內的截止日期（deadlines）、取消信號（cancellation signals）和其他上下文值的方法。

### `context` 的核心用途

1.  **取消 (Cancellation)**: 這是 `context` 最核心的功能。當一個操作不再需要時（例如，用戶關閉了瀏覽器，取消了 HTTP 請求），`context` 可以像一棵樹一樣，將取消信號從父節點傳遞到所有子節點，通知所有為該請求工作的 Goroutine 停止它們的工作，從而釋放資源，避免無效計算。

2.  **超時與截止日期 (Timeout and Deadlines)**: `context` 允許為一組操作設定一個明確的超時時間或截止日期。當時間到達後，`context` 會自動發出取消信號。這對於與外部服務（如資料庫、RPC 服務）互動時設置保護，防止無限等待至關重要。

3.  **傳遞請求範圍的值 (Request-scoped Values)**: `context` 提供了一種在函數調用鏈中傳遞與請求相關的資料（如 request ID, user token）的機制，而無需在每個函數簽名中都顯式地添加這些參數。

### `Context` 介面

`Context` 介面包含四個方法：

-   **`Done() <-chan struct{}`**: 返回一個 Channel。當這個 `context` 被取消或到達截止日期時，這個 Channel 會被關閉。這是一個關鍵的信號機制，併發操作可以通過 `select` 來監聽這個 Channel。
-   **`Err() error`**: 在 `Done()` Channel 被關閉後，`Err()` 會返回一個非 `nil` 的錯誤，解釋 `context` 被取消的原因。如果是被主動取消，返回 `context.Canceled`；如果是因為超時，返回 `context.DeadlineExceeded`。
-   **`Deadline() (deadline time.Time, ok bool)`**: 返回 `context` 被設定的截止時間。`ok` 為 `false` 表示沒有設定截止時間。
-   **`Value(key interface{}) interface{}`**: 從 `context` 中獲取與 `key` 相關聯的值。

### 如何創建和使用 `Context`

`context` 的創建是通過一棵樹狀結構組織的。我們從一個根 `context` 開始，然後派生出帶有新值的子 `context`。

-   **`context.Background()`**: 通常在 `main` 函數、初始化或測試代碼中使用，作為所有 `context` 的根節點。它永遠不會被取消。
-   **`context.TODO()`**: 當不清楚應該使用哪個 `context`，或者當前的函數未來計畫接收 `context` 但現在還沒有時，使用 `TODO()`。它和 `Background()` 本質上是一樣的，但靜態分析工具可以用它來提示開發者這裡有待完善。

#### 派生 Context

-   **`context.WithCancel(parent)`**: 創建一個可被手動取消的 `context`。它返回一個 `cancel` 函數，調用該函數會觸發 `Done()` Channel 的關閉。
-   **`context.WithDeadline(parent, time)`**: 創建一個在指定時間點會自動取消的 `context`。
-   **`context.WithTimeout(parent, duration)`**: `WithDeadline` 的一個便捷包裝，在指定的時間段後自動取消。
-   **`context.WithValue(parent, key, value)`**: 創建一個攜帶鍵值對的 `context`。

### 最佳實踐

1.  `Context` 應該作為函數的第一個參數，通常命名為 `ctx`。
2.  不要將 `Context` 儲存在結構體中，而是顯式地傳遞它。
3.  只使用 `context.Value` 來傳遞那些在處理請求過程中必須的、與請求相關的資料，不要用它來傳遞可選參數。
4.  `Context` 的取消是建議性的。下游函數需要主動檢查 `ctx.Done()` 來響應取消信號，而不是被強制終止。
5.  永遠不要傳遞一個 `nil` 的 `context`。

## 程式碼範例 (可選)

此範例模擬一個 HTTP Server，它使用 `context.WithTimeout` 來控制對一個耗時服務的調用。

```go
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// 模擬一個耗時的外部調用
func slowOperation(ctx context.Context) (string, error) {
	// 使用 select 來同時等待操作完成或 context 被取消
	select {
	case <-time.After(5 * time.Second): // 模擬 5 秒的操作
		return "Operation Completed", nil
	case <-ctx.Done(): // 如果 context 被取消
		return "", ctx.Err() // 返回 context 的錯誤 (Canceled 或 DeadlineExceeded)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	// 創建一個帶有 3 秒超時的 context
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel() // 確保在 handler 退出時釋放 context 相關資源

	fmt.Println("Handler: starting slow operation...")
	result, err := slowOperation(ctx)
	if err != nil {
		fmt.Printf("Handler: operation failed: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Printf("Handler: operation succeeded: %s\n", result)
	w.Write([]byte(result))
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server started at :8080")
	// 由於 slowOperation 需要 5 秒，而我們的超時是 3 秒，所以請求總會超時。
	http.ListenAndServe(":8080", nil)
}
```
