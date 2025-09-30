# 微服務容錯與彈性設計：斷路器模式

- **難度**: 8
- **重要性**: 5
- **標籤**: `Microservices`, `Resilience`, `Fault Tolerance`, `Circuit Breaker`

## 問題詳述

在微服務架構中，一個服務通常會依賴多個其他服務。如果其中一個被依賴的服務變慢或無回應，可能會引發連鎖反應，導致整個系統崩潰。請解釋什麼是「級聯失敗」(Cascading Failure)，並詳細闡述「斷路器模式」(Circuit Breaker Pattern) 如何解決這個問題。

## 核心理論與詳解

在複雜的微服務網路中，服務之間的同步調用（例如透過 REST API）非常普遍。想像一個場景：`服務 A` 調用 `服務 B`，而 `服務 B` 又調用 `服務 C`。如果 `服務 C` 因為過載而回應緩慢，`服務 B` 的請求執行緒會被佔用並等待。如果此時有大量請求湧入 `服務 A`，`服務 A` 會繼續向 `服務 B` 發起調用，導致 `服務 B` 的執行緒池被耗盡。最終，`服務 B` 變得無法回應，這種失敗會進一步向上游傳播到 `服務 A`，最終可能導致整個請求鏈路上的所有服務都崩潰。這就是**級聯失敗**。

**級聯失敗 (Cascading Failure)**: 指的是分散式系統中，單一組件的故障透過服務依賴鏈，像雪崩一樣逐級放大，最終導致整個系統不可用的現象。

為了解決這個問題，我們需要一種機制來快速失敗 (Fail Fast)，而不是無休止地等待一個可能永遠不會成功的操作。**斷路器模式**正是為此而生。

---

### 斷路器模式 (Circuit Breaker Pattern)

斷路器模式源於電路中的「斷路器」概念。在電路中，如果電流過大，斷路器會自動「跳閘」，切斷電路以保護電器設備。在軟體中，斷路器模式在服務之間扮演了類似的角色。

它是一個代理，包裹了對遠端服務的調用。這個代理會監控調用的成功與失敗次數，並根據結果在三種狀態之間切換：**關閉 (Closed)**、**開啟 (Open)** 和 **半開 (Half-Open)**。

#### 1. 關閉狀態 (Closed)

-   **行為**: 這是斷路器的**正常工作狀態**。所有請求都會直接通過，到達被調用的遠端服務。
-   **監控**: 斷路器會記錄最近一段時間內（例如，最後 100 次請求）的調用失敗次數。
-   **狀態轉換**: 如果失敗次數在一個時間窗口內超過了預設的**閾值**（例如，失敗率超過 50%），斷路器會從「關閉」切換到「開啟」狀態。

#### 2. 開啟狀態 (Open)

-   **行為**: 斷路器「跳閘」了。在此狀態下，所有對遠端服務的請求都**不會**被發送出去，而是**立即失敗**並返回一個錯誤。這就是所謂的「快速失敗」。
-   **作用**:
    -   **保護調用方**: 阻止調用方因為等待無回應的服務而耗盡自身資源。
    -   **保護被調用方**: 讓已經處於困境的遠端服務有時間進行恢復，避免被更多的請求壓垮。
-   **狀態轉換**: 斷路器會啟動一個計時器（例如，等待 30 秒）。當計時器到期後，斷路-   器會切換到「半開」狀態，進行一次試探性的恢復檢查。

#### 3. 半開狀態 (Half-Open)

-   **行為**: 這是一個**探測狀態**。斷路器會允許**下一個請求**通過，去嘗試調用遠端服務。
-   **狀態轉換**:
    -   **如果這次試探性調用成功**: 斷路器會認為遠端服務已經恢復正常，於是切換回「關閉」狀態，並重置所有計數器。
    -   **如果這次試探性調用失敗**: 斷路器會認為遠端服務仍然不可用，於是立即切換回「開啟」狀態，並重置計時器，等待下一個試探週期。

### 程式碼範例 (概念性 Go 程式碼)

許多現成的函式庫（如 Go 的 `go-resilience`，Java 的 `Hystrix` 或 `Resilience4J`）已經實現了斷路器模式。以下是一個簡化的概念性範例，以展示其核心邏輯。

```go
package main

import (
    "errors"
    "fmt"
    "sync"
    "time"
)

// 斷路器的三種狀態
const (
    StateClosed   = "Closed"
    StateOpen     = "Open"
    StateHalfOpen = "Half-Open"
)

// CircuitBreaker 結構
type CircuitBreaker struct {
    mu                sync.Mutex
    state             string
    failureThreshold  int // 失敗次數閾值
    successThreshold  int // 半開狀態下，成功多少次才算恢復
    timeout           time.Duration // 開啟狀態的持續時間

    failures          int
    successes         int
    lastErrorTime     time.Time
}

func NewCircuitBreaker(failureThreshold, successThreshold int, timeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        state:            StateClosed,
        failureThreshold: failureThreshold,
        successThreshold: successThreshold,
        timeout:          timeout,
    }
}

// 執行被斷路器保護的函數
func (cb *CircuitBreaker) Execute(fn func() (interface{}, error)) (interface{}, error) {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    switch cb.state {
    case StateOpen:
        // 如果斷路器開啟，檢查是否過了超時時間
        if time.Since(cb.lastErrorTime) > cb.timeout {
            cb.state = StateHalfOpen
            cb.successes = 0
        } else {
            return nil, errors.New("circuit breaker is open")
        }
    case StateClosed:
        // 正常狀態，如果失敗次數超過閾值，則開啟斷路器
        if cb.failures >= cb.failureThreshold {
            cb.state = StateOpen
            cb.lastErrorTime = time.Now()
            return nil, errors.New("circuit breaker is open")
        }
    }

    // 在 Closed 或 Half-Open 狀態下，執行函數
    result, err := fn()

    if err != nil {
        // 執行失敗
        cb.failures++
        if cb.state == StateHalfOpen {
            // 半開狀態下失敗，立即回到開啟狀態
            cb.state = StateOpen
            cb.lastErrorTime = time.Now()
        }
        return nil, err
    }

    // 執行成功
    if cb.state == StateHalfOpen {
        cb.successes++
        if cb.successes >= cb.successThreshold {
            // 半開狀態下成功次數達到閾值，回到關閉狀態
            cb.state = StateClosed
            cb.failures = 0
        }
    } else {
        // 關閉狀態下成功，重置失敗計數
        cb.failures = 0
    }

    return result, nil
}

// 模擬一個可能失敗的遠端調用
func remoteCall(shouldFail bool) (interface{}, error) {
    if shouldFail {
        return nil, errors.New("remote service failed")
    }
    return "Success", nil
}

func main() {
    cb := NewCircuitBreaker(3, 1, 5*time.Second)

    // 模擬連續失敗
    for i := 0; i < 5; i++ {
        _, err := cb.Execute(func() (interface{}, error) {
            return remoteCall(true)
        })
        fmt.Printf("Attempt %d: Error: %v, State: %s\n", i+1, err, cb.state)
    }

    // 斷路器已開啟，請求會立即失敗
    _, err := cb.Execute(func() (interface{}, error) {
        return remoteCall(false)
    })
    fmt.Printf("Attempt after opening: Error: %v, State: %s\n", err, cb.state)

    // 等待斷路器超時
    fmt.Println("\nWaiting for timeout...")
    time.Sleep(6 * time.Second)

    // 進入半開狀態，進行試探
    _, err = cb.Execute(func() (interface{}, error) {
        return remoteCall(false)
    })
    fmt.Printf("\nHalf-open attempt: Error: %v, State: %s\n", err, cb.state)

    // 斷路器已關閉，恢復正常
    _, err = cb.Execute(func() (interface{}, error) {
        return remoteCall(false)
    })
    fmt.Printf("Final attempt: Error: %v, State: %s\n", err, cb.state)
}
```

### 結論

斷路器模式是構建**彈性 (Resilient)** 和**容錯 (Fault-Tolerant)** 微服務系統的關鍵設計模式。它通過「快速失敗」機制，有效地防止了局部故障演變成系統性的級聯失敗，從而提高了整個系統的穩定性和可用性。在進行服務間同步調用時，結合**重試 (Retry)** 和**超時 (Timeout)** 機制，並用斷路器進行包裹，是業界公認的最佳實踐。
