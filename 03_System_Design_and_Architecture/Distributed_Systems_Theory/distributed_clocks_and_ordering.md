# 分散式時鐘與事件順序 (Distributed Clocks)

- **難度**: 9
- **標籤**: `Distributed Systems`, `Time`, `Lamport Clock`, `Vector Clock`

## 問題詳述

在分散式系統中，由於每個節點的物理時鐘 (Physical Clock) 都有誤差，我們無法單純依賴時間戳來判斷事件的先後順序。請解釋為什麼物理時鐘不可靠，並介紹邏輯時鐘 (Logical Clocks) 如 Lamport Clock 和 Vector Clock 如何解決事件排序問題。

## 核心理論與詳解

### 1. 物理時鐘的問題

在單機系統中，我們依賴 OS 的時間 (Wall Clock) 來記錄事件順序。但在分散式系統中：
*   **Clock Skew (時鐘偏差)**: 不同機器的石英震盪器頻率不同，時間會逐漸偏離。
*   **NTP 限制**: 即使使用 NTP 校時，仍可能有毫秒級的誤差。
*   **後果**: 如果 Node A 在 `t=100` 寫入資料，Node B 在 `t=99` (B 的時間較慢) 讀取並修改，系統可能誤判 B 的操作發生在 A 之前，導致資料覆蓋錯誤。

### 2. 邏輯時鐘 (Logical Clocks)

為了解決順序問題，Leslie Lamport 提出了邏輯時鐘的概念：**我們不關心具體的時間點，只關心事件的因果關係 (Happened-before relation, ->)**。

#### Lamport Clock (蘭伯特時鐘)

*   **原理**: 每個節點維護一個計數器 `C`。
    1.  本地發生事件時，`C = C + 1`。
    2.  發送訊息時，附帶目前的 `C`。
    3.  接收訊息時，更新本地 `C = max(本地C, 訊息C) + 1`。
*   **功能**: 如果事件 a -> b (a 發生在 b 之前)，則 `C(a) < C(b)`。
*   **限制**: 反之不成立。如果 `C(a) < C(b)`，我們**不能**確定 a 一定發生在 b 之前（可能是並發事件）。Lamport Clock 無法偵測並發 (Concurrency)。

#### Vector Clock (向量時鐘)

Vector Clock 改進了 Lamport Clock，可以精確偵測並發衝突。

*   **原理**: 每個節點維護一個向量 `V`，長度為系統中節點的數量。`V[i]` 代表節點 i 的邏輯時間。
    1.  節點 i 本地發生事件：`V[i] = V[i] + 1`。
    2.  發送訊息時，附帶整個向量 `V`。
    3.  接收訊息 (附帶向量 `V_msg`) 時：`V_local[j] = max(V_local[j], V_msg[j])` for all j，然後 `V_local[i] = V_local[i] + 1`。
*   **比較規則**:
    *   `V1 < V2` 當且僅當 V1 所有元素都小於等於 V2，且至少有一個元素嚴格小於 V2。
    *   如果 `!(V1 < V2)` 且 `!(V2 < V1)`，則兩個事件是**並發 (Concurrent)** 的，發生了衝突。
*   **應用**: DynamoDB 的版本控制，用於偵測資料衝突。

### 3. TrueTime API (Google Spanner)

Google Spanner 採用了一種結合物理時鐘與邏輯時鐘的霸道解法。
*   利用 GPS 和原子鐘，將時間誤差壓縮在極小範圍 (如 < 7ms)。
*   表示時間為一個區間 `[earliest, latest]`。
*   透過 `Commit Wait` 機制，強制等待誤差時間過去，確保外部一致性 (External Consistency)。

## 程式碼範例 (Go)

模擬 Lamport Clock 的運作機制。

```go
package main

import (
	"fmt"
	"sync"
)

// LamportClock 模擬邏輯時鐘
type LamportClock struct {
	time int
	mu   sync.Mutex
	id   string
}

func (c *LamportClock) Tick() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.time++
	fmt.Printf("[%s] Event occurred. Time: %d\n", c.id, c.time)
}

func (c *LamportClock) SendMessage() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.time++
	fmt.Printf("[%s] Sending message. Time: %d\n", c.id, c.time)
	return c.time
}

func (c *LamportClock) ReceiveMessage(msgTime int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	// 核心邏輯：取最大值 + 1
	if msgTime > c.time {
		c.time = msgTime
	}
	c.time++
	fmt.Printf("[%s] Received message (Time: %d). Updated Time: %d\n", c.id, msgTime, c.time)
}

func main() {
	nodeA := &LamportClock{id: "NodeA", time: 0}
	nodeB := &LamportClock{id: "NodeB", time: 0}

	// 1. Node A 發生本地事件
	nodeA.Tick() // A: 1

	// 2. Node A 發送訊息給 Node B
	msgTime := nodeA.SendMessage() // A: 2

	// 3. Node B 在收到訊息前發生了一些本地事件
	nodeB.Tick() // B: 1
	nodeB.Tick() // B: 2

	// 4. Node B 收到 Node A 的訊息
	// B 的時間會從 2 跳到 max(2, 2) + 1 = 3
	nodeB.ReceiveMessage(msgTime) 
	
	// 5. Node B 再發送訊息回 Node A
	msgTimeB := nodeB.SendMessage() // B: 4
	
	// 6. Node A 收到
	nodeA.ReceiveMessage(msgTimeB) // A: max(2, 4) + 1 = 5
}
```
