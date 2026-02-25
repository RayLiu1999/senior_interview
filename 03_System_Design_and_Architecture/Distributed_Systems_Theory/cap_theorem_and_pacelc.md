# CAP 定理與 PACELC 理論

- **難度**: 8
- **標籤**: `Distributed Systems`, `CAP`, `PACELC`, `System Design`

## 問題詳述

在分散式系統設計中，CAP 定理是最著名的基礎理論，但它常被誤解。而 PACELC 則是對 CAP 的補充與延伸，更貼近實際的工程決策。請解釋這兩個理論的核心內容，並說明它們如何指導系統設計。

## 核心理論與詳解

### CAP 定理 (CAP Theorem)

CAP 定理指出，在一個分散式資料存儲系統中，不可能同時滿足以下三個屬性，最多只能同時滿足其中兩個：

1. **Consistency (一致性)**:
    - **定義**: 每次讀取都能讀到最新的寫入結果，或者讀取失敗（即 Linearizability，線性一致性）。
    - **意義**: 所有節點在同一時間看到的資料是完全相同的。
2. **Availability (可用性)**:
    - **定義**: 每個請求都能收到一個（非錯誤的）回應，但不保證回應包含最新的寫入結果。
    - **意義**: 系統隨時可用，不會因為部分節點故障而拒絕服務。
3. **Partition Tolerance (分區容錯性)**:
    - **定義**: 儘管系統內部的節點之間發生網路分區（訊息丟失或延遲），系統仍能繼續運作。
    - **意義**: 網路是不穩定的，分區是必然會發生的。

#### CAP 的誤區與真相

- **誤區**: 「我可以選擇 CA 系統，放棄 P」。
- **真相**: 在分散式系統中，**P (網路分區) 是不可避免的客觀事實**。你無法選擇「不要網路故障」。因此，真正的選擇只有在發生分區 (P) 時，你要選擇 **CP** 還是 **AP**。

| 選擇 | 描述 | 範例 |
| :--- | :--- | :--- |
| **CP (一致性 + 分區容錯)** | 當發生分區時，為了保證資料一致，拒絕部分請求或停止服務。 | Zookeeper, HBase, MongoDB (預設) |
| **AP (可用性 + 分區容錯)** | 當發生分區時，為了保證服務可用，允許返回舊的資料。 | Cassandra, DynamoDB, Couchbase |

---

### PACELC 理論

CAP 僅描述了「發生網路分區」時的取捨。但在絕大多數時間，網路是正常的（沒有分區）。PACELC 理論補足了這一點：

> **If there is a Partition (P), how does the system trade off Availability (A) and Consistency (C)?**
> **Else (E), when the system is running normally in the absence of partitions, how does the system trade off Latency (L) and Consistency (C)?**

簡而言之：**PACELC = (P ? A : C) + (E ? L : C)**

#### 1. P 部分 (Partitioned)

這就是 CAP 定理的範疇。

- **PA**: 分區時優先保證可用性 (Availability)。
- **PC**: 分區時優先保證一致性 (Consistency)。

#### 2. E 部分 (Else / Normal Operation)

這是系統正常運作時的取捨。

- **EL (Latency)**: 為了降低延遲，放棄強一致性。例如：使用非同步複製 (Asynchronous Replication)，寫入主節點後立即返回，不等待從節點確認。
- **EC (Consistency)**: 為了保證一致性，願意犧牲延遲。例如：使用同步複製 (Synchronous Replication)，必須等待所有（或多數）節點確認寫入後才返回。

### 綜合範例分析

#### MongoDB (預設配置)

- **分類**: **PC/EC**
- **P**: 發生分區時，如果連不上 Primary，系統會進行選舉，期間可能無法寫入 (犧牲 A 保 C)。
- **E**: 預設寫入 Primary 確認即返回，但若設定 `WriteConcern: Majority`，則需等待多數節點確認，增加延遲以換取一致性 (犧牲 L 保 C)。

#### DynamoDB / Cassandra

- **分類**: **PA/EL**
- **P**: 發生分區時，仍允許讀寫，節點間資料可能暫時不一致 (犧牲 C 保 A)。
- **E**: 通常採用最終一致性，寫入後快速返回，背景進行資料同步 (犧牲 C 保 L)。

## 程式碼範例 (Go)

雖然這是理論題，但我們可以用 Go 模擬一個簡單的「同步 vs 非同步」寫入，展示 Latency 與 Consistency 的權衡 (PACELC 中的 E 部分)。

```go
package main

import (
    "fmt"
    "time"
)

// 模擬資料庫節點
type Node struct {
    ID   string
    Data string
}

// 模擬寫入操作
func (n *Node) Write(data string) {
    // 模擬網路延遲
    time.Sleep(100 * time.Millisecond)
    n.Data = data
    fmt.Printf("Node %s updated to %s\n", n.ID, data)
}

func main() {
    primary := &Node{ID: "Primary"}
    replica := &Node{ID: "Replica"}

    // 1. EC (Else Consistency): 同步複製
    // 優點: 強一致性
    // 缺點: 高延遲 (Latency = Primary寫入 + Replica寫入)
    fmt.Println("--- EC: Synchronous Replication ---")
    start := time.Now()
    primary.Write("Value 1")
    replica.Write("Value 1") // 必須等待 Replica 也寫完
    fmt.Printf("EC Write finished in %v\n\n", time.Since(start))

    // 2. EL (Else Latency): 非同步複製
    // 優點: 低延遲 (Latency = Primary寫入)
    // 缺點: 弱一致性 (Replica 可能還沒更新)
    fmt.Println("--- EL: Asynchronous Replication ---")
    start = time.Now()
    primary.Write("Value 2")
    go replica.Write("Value 2") // 背景執行，不阻塞主流程
    fmt.Printf("EL Write finished in %v (Replica update pending)\n", time.Since(start))

    // 等待背景 goroutine 完成以便觀察輸出
    time.Sleep(200 * time.Millisecond)
}
```
