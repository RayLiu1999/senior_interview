# 什麼是 `sync.Mutex` 和 `sync.RWMutex`？它們之間有什麼區別和適用場景？

- **難度**: 5
- **重要程度**: 4
- **標籤**: `Concurrency`, `Mutex`, `Synchronization`

## 問題詳述

本問題考察面試者對 Go 語言中傳統鎖機制的理解。雖然 Go 推崇使用 Channel 來進行通訊以共享記憶體，但在許多場景下，使用鎖來保護共享資源（共享記憶體）仍然是更簡單直接的選擇。理解不同鎖的特性和適用場景是併發編程的基本功。

## 核心理論與詳解

`sync.Mutex` 和 `sync.RWMutex` 都是 Go `sync` 套件提供的鎖原語，用於在併發環境中保護對共享資源的存取。

### `sync.Mutex` (互斥鎖)

`Mutex` 是 `mutual exclusion` 的縮寫，意為「互斥」。它提供了最簡單的鎖定機制：一次只允許一個 Goroutine 進入由它保護的臨界區（critical section）。

- **核心行為**: 當一個 Goroutine 調用 `Lock()` 方法獲得鎖後，其他任何試圖獲得該鎖的 Goroutine 都會被阻塞，直到第一個 Goroutine 調用 `Unlock()` 方法釋放鎖。
- **公平性**: Go 的 `Mutex` 在 1.9 版本後引入了飢餓模式（starvation mode），以確保鎖的分配在高併發下是相對公平的，避免某些 Goroutine 長時間無法獲得鎖。
- **特性**: 簡單、粗暴、有效。無論是讀操作還是寫操作，都必須獲得唯一的鎖。

### `sync.RWMutex` (讀寫鎖)

`RWMutex` (Read-Write Mutex) 是對 `Mutex` 的一種優化，它將存取權限分為「讀」和「寫」兩種模式。

- **核心行為**: `RWMutex` 遵循「讀寫互斥，讀讀不互斥」的原則。
    1.  **多個讀者可以共存**: 多個 Goroutine 可以同時持有讀鎖（通過 `RLock()` 獲取）。
    2.  **寫者是排他的**: 一旦有 Goroutine 持有寫鎖（通過 `Lock()` 獲取），其他任何 Goroutine（無論是讀者還是寫者）都必須等待其釋放。
    3.  **寫者優先**: 當一個寫者正在等待獲取鎖時，後續的讀者將無法獲取讀鎖，以防止寫者飢餓。

### 主要區別與適用場景

| 鎖類型 | `sync.Mutex` | `sync.RWMutex` |
| :--- | :--- | :--- |
| **鎖定粒度** | 完全排他，不區分讀寫 | 區分讀鎖和寫鎖 |
| **併發性能** | 讀寫都會互斥，性能較低 | 讀操作可併發，性能較高 |
| **適用場景** | 讀寫操作頻率相近，或寫操作較多 | **讀多寫少**的場景 |

**選擇的關鍵在於「讀寫比」**：

-   當你的應用場景中，對共享資源的讀取次數遠遠大於寫入次數時，使用 `RWMutex` 可以顯著提高併發性能。因為多個讀者可以同時進行，不會像 `Mutex` 那樣串行化所有操作。一個典型的例子是：一個不常更新但會被頻繁讀取的全局配置。

-   反之，如果讀寫操作的比例差不多，或者寫操作更頻繁，那麼 `RWMutex` 帶來的額外複雜度和內部協調成本可能會使其性能劣於簡單的 `Mutex`。在這種情況下，或者當你不確定時，直接使用 `Mutex` 是更安全、更簡單的選擇。

### 注意事項

- **鎖的複製**: `sync.Mutex` 和 `sync.RWMutex` 在使用後都不應該被複製。將它們作為結構體的一部分時，應該傳遞指向該結構體的指標。
- **死鎖**: 濫用鎖（如重複鎖定、忘記解鎖）是造成死鎖的常見原因，需要特別小心。

## 程式碼範例 (可選)

以下範例模擬一個計數器，展示了 `Mutex` 和 `RWMutex` 的 API 使用。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// 使用 Mutex 的計數器
type CounterMutex struct {
	mu    sync.Mutex
	value int
}

func (c *CounterMutex) Increment() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value++
}

func (c *CounterMutex) Value() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

// 使用 RWMutex 的計-數器
type CounterRWMutex struct {
	rwmu  sync.RWMutex
	value int
}

func (c *CounterRWMutex) Increment() {
	c.rwmu.Lock() // 獲取寫鎖
	defer c.rwmu.Unlock()
	c.value++
}

func (c *CounterRWMutex) Value() int {
	c.rwmu.RLock() // 獲取讀鎖
	defer c.rwmu.RUnlock()
	return c.value
}

func main() {
	// 在一個讀多寫少的場景中，RWMutex 性能會更好
	// 這裡僅為 API 展示
	counter := CounterRWMutex{}

	var wg sync.WaitGroup
	// 啟動多個 Goroutine 進行讀取
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			fmt.Println("Read value:", counter.Value())
		}()
	}

	// 啟動少量 Goroutine 進行寫入
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			counter.Increment()
		}()
	}

	wg.Wait()
	fmt.Println("Final value:", counter.Value())
}
```
