# 什麼是 `sync.WaitGroup`？請舉例說明其使用方法。

- **難度**: 4
- **重要程度**: 4
- **標籤**: `Concurrency`, `WaitGroup`, `Synchronization`

## 問題詳述

本問題考察面試者對 Go 中基礎同步原語的掌握程度。`sync.WaitGroup` 是在併發編程中一個極其常見的工具，用於協調多個 Goroutine 的完成時機。理解其用法是編寫清晰、正確併發代碼的基礎。

## 核心理論與詳解

`sync.WaitGroup` 是一個計數信號量，可以用來等待一組 Goroutine 的集合完成它們的工作。它內部維護著一個計數器，當計數器歸零時，等待的 Goroutine 將被喚醒。

可以把它想像成一個「任務計數器」：主 Goroutine 分配了 N 個任務，然後它需要等待這 N 個任務全部完成後才能繼續下一步。`WaitGroup` 就是用來實現這個「等待所有任務完成」的機制。

### 核心 API

`WaitGroup` 提供了三個非常簡單的方法：

1.  **`Add(delta int)`**: 將內部計數器的值增加 `delta`。通常在啟動一個新的 Goroutine 之前調用，`delta` 值為要啟動的 Goroutine 數量。

2.  **`Done()`**: 將內部計數器的值減 1。這個方法應該由被等待的 Goroutine 在其工作完成時調用。為了確保 Goroutine 無論如何（即使發生 `panic`）都能通知 `WaitGroup` 它已完成，通常會將 `Done()` 的調用放在 `defer` 語句中。

3.  **`Wait()`**: 阻塞調用此方法的 Goroutine，直到內部計數器變為 0。一旦計數器為 0，等待的 Goroutine 將被釋放並可以繼續執行。

### 標準使用模式

一個典型的 `WaitGroup` 使用流程如下：

1.  創建一個 `sync.WaitGroup` 實例。
2.  主 Goroutine調用 `wg.Add(n)` 來設定需要等待的 Goroutine 數量 `n`。
3.  主 Goroutine 創建並啟動 `n` 個子 Goroutine。
4.  在每個子 Goroutine 中，將 `defer wg.Done()` 作為第一行，以確保在 Goroutine 退出前計數器會被減 1。
5.  主 Goroutine調用 `wg.Wait()`，此時它會阻塞，直到所有子 Goroutine 都調用了 `Done()`，使計數器歸零。

### 注意事項

-   **禁止負數計數器**: 如果 `Done()` 的調用次數多於 `Add()` 增加的數量，會導致計數器變為負數，從而引發 `panic`。
-   **`Add` 的調用時機**: `Add()` 必須在工作 Goroutine 啟動**之前**調用，或者至少在 `Wait()` 被調用之前完成。如果在 Goroutine 內部調用 `Add()`，可能會存在競爭條件（race condition），即 `Wait()` 可能在 `Add()` 被調用之前就執行了，導致程序提前退出。
-   **禁止複製**: `WaitGroup` 在首次使用後不應被複製。

## 程式碼範例 (可選)

以下範例展示了一個主 Goroutine 如何等待 3 個 worker Goroutine 完成它們的模擬任務。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// worker 函數模擬一個需要一些時間來完成的任務
// 它接收一個 WaitGroup 指標和一個 ID
func worker(id int, wg *sync.WaitGroup) {
	// 在函數退出時，通知 WaitGroup 該 Goroutine 已完成
	defer wg.Done()

	fmt.Printf("Worker %d starting\n", id)

	// 模擬工作負載
	time.Sleep(time.Second)
	fmt.Printf("Worker %d done\n", id)
}

func main() {
	// 創建一個 WaitGroup
	var wg sync.WaitGroup

	// 啟動 3 個 worker Goroutine
	for i := 1; i <= 3; i++ {
		// 在啟動 Goroutine 之前，增加計數器
		wg.Add(1)
		go worker(i, &wg)
	}

	fmt.Println("Main: Waiting for workers to finish...")
	// 阻塞 main Goroutine，直到所有 worker 都調用了 Done()
	wg.Wait()

	fmt.Println("Main: All workers have finished.")
}

// 可能的輸出 (順序不固定):
// Main: Waiting for workers to finish...
// Worker 1 starting
// Worker 3 starting
// Worker 2 starting
// Worker 2 done
// Worker 1 done
// Worker 3 done
// Main: All workers have finished.
```
