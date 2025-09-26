# 什麼是 Goroutine？它與傳統的線程 (Thread) 有什麼區別？

- **難度**: 4
- **重要程度**: 5
- **標籤**: `Concurrency`, `Goroutine`, `Scheduler`

## 問題詳述

本問題旨在考察面試者對 Go 語言併發核心—Goroutine 的理解，以及是否清楚其相較於作業系統線程的優勢與底層差異。

## 核心理論與詳解


Goroutine 是 Go 語言實現併發的最小執行單元。它常被描述為一種「輕量級線程」，因為它在許多方面與傳統的作業系統（OS）線程相似，但資源消耗和管理方式卻有著天壤之別。

### 核心差異比較

| 特性 | Goroutine | OS 線程 (Thread) |
| :--- | :--- | :--- |
| **記憶體消耗** | 非常小，初始僅需約 2KB | 較大，通常為 1MB 或更多 |
| **創建與銷毀** | 成本極低，由 Go Runtime 管理 | 成本較高，需陷入內核態 | 
| **上下文切換** | 成本低，在用戶態完成 | 成本高，需從用戶態切換到內核態 |
| **數量規模** | 可輕易創建數十萬甚至上百萬個 | 受限於作業系統，通常只能創建數千個 |
| **調度方式** | 由 Go Scheduler 在用戶態調度 | 由作業系統內核調度 |

### 1. 記憶體與成本 (Memory and Cost)

- **Goroutine**: 每個 Goroutine 的堆疊空間在創建時僅為 2KB 左右，並且可以根據需要動態增長或縮小。這種設計使得在記憶體中同時存在大量的 Goroutine 成為可能。
- **OS 線程**: 線程由作業系統管理，其堆疊空間通常是固定的（例如 1MB）。這個大小是為了應對各種複雜情況而預留的，但在很多場景下造成了浪費。

由於 Goroutine 的創建、銷毀和切換完全由 Go 的執行時（Runtime）在用戶空間完成，它不需要像線程那樣頻繁地陷入作業系統內核，因此其操作成本遠低於線程。

### 2. 調度模型 (Scheduling Model)

這是兩者最本質的區別。Go 語言實現了獨特的 **M:P:G 調度模型**。

- **M (Machine)**: 代表一個 OS 線程，由作業系統管理。
- **P (Processor)**: 代表一個邏輯處理器，是 Go Scheduler 的調度單元。P 的數量在啟動時決定，通常等於 CPU 核心數 (`GOMAXPROCS`)。
- **G (Goroutine)**: 代表一個 Goroutine，它擁有自己的堆疊、指令指標和其他執行上下文。

Go 的調度器會將 G（Goroutines）分配到 P（邏輯處理器）上執行，而 P 則與 M（OS 線程）綁定。調度器的工作就是在多個 Goroutine 之間進行快速切換，而這些切換發生在用戶態，對作業系統是透明的。如果一個 Goroutine 因為系統調用（如 I/O 操作）而阻塞，調度器會將該 M 和 G 分離，並讓 P 去關聯其他可用的 M，繼續執行別的 G，從而避免了整個線程的阻塞。

這種模型實現了 **多路復用 (Multiplexing)**，即用少量的 OS 線程來運行大量的 Goroutine，極大地提高了併發性能和資源利用率。

## 程式碼範例 (可選)

以下程式碼展示了創建 Goroutine 的簡潔性。只需使用 `go` 關鍵字即可啟動一個新的 Goroutine。

```go
package main

import (
	"fmt"
	"time"
)

func say(s string) {
	for i := 0; i < 3; i++ {
		fmt.Println(s)
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	// 啟動一個新的 Goroutine 來執行 say("World")
	go say("World")

	// 當前 main Goroutine 繼續執行
	say("Hello")

	// 輸出結果會是 "Hello" 和 "World" 的交錯打印
	// Hello
	// World
	// Hello
	// World
	// Hello
	// World
}
```
