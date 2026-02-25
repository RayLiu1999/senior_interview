# 一致性模型 (Consistency Models)

- **難度**: 9
- **標籤**: `Distributed Systems`, `Consistency`, `Linearizability`, `Eventual Consistency`

## 問題詳述

在分散式系統中，「一致性」並非只有「是」或「否」兩種狀態，而是一個連續的光譜。請解釋常見的一致性模型（如強一致性、順序一致性、因果一致性、最終一致性），並比較它們的強弱程度與效能影響。

## 核心理論與詳解

一致性模型定義了系統在並發讀寫操作下的行為承諾。模型越「強」，應用程式開發越簡單，但系統的延遲通常越高，可用性越低。

### 1. 強一致性 (Strong Consistency)

#### 線性一致性 (Linearizability)

- **定義**: 最強的一致性模型。所有操作看起來都是瞬間完成的，且所有節點看到的順序完全一致，就像只有一個全域的副本一樣。
- **特點**:
  - 一旦寫入成功，隨後的讀取一定能讀到該值。
  - 依賴全域時鐘或同步機制。
- **代價**: 極高的延遲，且在網路分區時不可用 (CP 系統)。
- **範例**: Google Spanner (TrueTime), Etcd/Zookeeper (針對單一 key 的操作)。

#### 順序一致性 (Sequential Consistency)

- **定義**: 比線性一致性稍弱。不要求操作是「瞬間」的，但要求所有節點看到的**操作順序**必須一致。
- **特點**: 如果 Process A 先寫 X，再寫 Y，那麼所有節點看到的一定是先 X 後 Y。但不同 Process 的操作順序可以交錯，只要大家看到的交錯順序一樣即可。
- **範例**: Java `volatile` 變數 (在某些層面上), Zookeeper (ZAB 協議保證順序)。

### 2. 弱一致性 (Weak Consistency)

#### 因果一致性 (Causal Consistency)

- **定義**: 僅保證有「因果關係」的操作順序一致。沒有因果關係的並發操作，順序可以不同。
- **特點**:
  - 如果 A 回覆了 B 的貼文 (B -> A)，那麼所有人看到 B 的貼文後，才能看到 A 的回覆。
  - 如果 C 和 D 同時發新貼文 (無因果關係)，有些人可能先看到 C，有些人先看到 D。
- **優勢**: 在保證邏輯正確性的前提下，提供了比強一致性更好的效能和可用性。
- **範例**: 社交網路動態牆。

#### 最終一致性 (Eventual Consistency)

- **定義**: 最弱的模型。不保證立即讀到最新值，但保證在沒有新的寫入發生後，經過一段時間，所有副本最終會達到一致。
- **特點**:
  - 讀取可能讀到舊資料 (Stale Read)。
  - 寫入衝突通常需要解決 (Last-Write-Wins, Vector Clocks)。
- **優勢**: 極高的可用性和低延遲 (AP 系統)。
- **範例**: DNS, Cassandra, DynamoDB (預設)。

### 3. 用戶端一致性 (Client-centric Consistency)

這是從單個用戶的角度出發的模型：

- **Read-your-writes**: 保證用戶自己寫入的資料，自己一定能馬上讀到。
- **Monotonic Read**: 如果用戶讀到了某個版本的資料，後續的讀取不會讀到更舊的版本。

## 程式碼範例 (Go)

我們用 Go 模擬「最終一致性」與「強一致性」的讀取差異。

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

// Store 模擬一個分散式存儲
type Store struct {
    data string
    mu   sync.RWMutex
}

// StrongRead 強一致性讀取：直接讀取最新數據（加鎖）
func (s *Store) StrongRead() string {
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.data
}

// EventualRead 最終一致性讀取：模擬讀取到舊副本
// 這裡簡單用一個機率或延遲來模擬
func (s *Store) EventualRead() string {
    // 模擬網路延遲或副本同步延遲
    // 在真實場景中，這裡可能會讀到還沒被更新的 Replica
    time.Sleep(10 * time.Millisecond)
    
    // 為了演示，我們這裡還是讀取了 data，但在真實分散式系統中
    // 這裡可能讀到的是舊值。
    // 我們用一個簡單的 trick 模擬：如果鎖被佔用（正在寫），我們不等待鎖，直接返回舊值(假設有緩存)
    // 但 Go 的 RWMutex 不支持 TryLock，所以我們僅用 Sleep 模擬 "讀取過程中的不確定性"
    
    s.mu.RLock()
    defer s.mu.RUnlock()
    return s.data
}

func (s *Store) Write(val string) {
    s.mu.Lock()
    defer s.mu.Unlock()
    time.Sleep(50 * time.Millisecond) // 模擬寫入耗時
    s.data = val
}

func main() {
    store := &Store{data: "Initial"}

    // 啟動寫入
    go func() {
        time.Sleep(20 * time.Millisecond)
        fmt.Println("Writing 'Updated'...")
        store.Write("Updated")
        fmt.Println("Write completed.")
    }()

    // 模擬強一致性讀取 (會被寫鎖阻塞，直到寫完)
    go func() {
        time.Sleep(30 * time.Millisecond)
        val := store.StrongRead()
        fmt.Printf("Strong Read: %s (Blocked until write finishes)\n", val)
    }()

    // 模擬最終一致性讀取 (在真實系統中，它可能讀另一個副本，不會被主節點寫鎖阻塞)
    // 這裡僅為示意，Go 單機無法完美模擬多副本延遲
    go func() {
        time.Sleep(30 * time.Millisecond)
        fmt.Println("Eventual Read: (In real system, might return 'Initial' or 'Updated' depending on replica)")
    }()

    time.Sleep(1 * time.Second)
}
```
