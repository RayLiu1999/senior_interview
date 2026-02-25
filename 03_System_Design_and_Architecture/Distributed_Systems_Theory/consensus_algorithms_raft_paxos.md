# 共識演算法 (Consensus Algorithms): Raft 與 Paxos

- **難度**: 10
- **標籤**: `Distributed Systems`, `Consensus`, `Raft`, `Paxos`, `Leader Election`

## 問題詳述

在分散式系統中，如何讓多個不可靠的節點對某個值（或日誌序列）達成一致？這是共識演算法要解決的核心問題。請解釋 Paxos 與 Raft 的基本原理，並比較它們的異同與應用場景。

## 核心理論與詳解

共識演算法是 CP 系統（如 Zookeeper, Etcd, Consul）的基石，確保在部分節點故障的情況下，系統仍能對資料狀態達成一致。

### 1. Paxos 演算法

Paxos 是由 Leslie Lamport 提出的，是第一個被證明完備的共識演算法。

- **地位**: 共識演算法的鼻祖，學術界的標準。
- **核心角色**:
  - **Proposer**: 提出提案（Value）。
  - **Acceptor**: 接受或拒絕提案。
  - **Learner**: 學習達成的提案。
- **流程 (Basic Paxos)**:
  1. **Prepare 階段**: Proposer 提出一個編號 N，詢問 Acceptors 是否承諾不再接受編號小於 N 的提案。
  2. **Accept 階段**: 如果多數 Acceptors 回應承諾，Proposer 發送帶有值 V 的 Accept 請求。
- **問題**: Paxos 極其難以理解，且實作複雜（Multi-Paxos 才是實務上用的，但細節未被詳細定義）。

### 2. Raft 演算法

Raft 的設計目標就是**可理解性 (Understandability)**。它將共識問題分解為三個子問題，使其更易於實作。

#### Raft 的三個核心子問題：

1. **Leader Election (領袖選舉)**:
   - Raft 強制所有寫入請求必須由 Leader 處理。
   - 節點狀態：Follower, Candidate, Leader。
   - **心跳機制**: Leader 定期發送 Heartbeat。若 Follower 收不到，則超時轉為 Candidate 發起選舉。
   - **投票規則**: 獲得多數票 (Majority) 者成為 Leader。

2. **Log Replication (日誌複製)**:
   - Leader 接收客戶端指令，寫入本地 Log。
   - Leader 透過 `AppendEntries` RPC 將 Log 複製給 Followers。
   - 當多數節點都寫入該 Log 後，Leader 執行 Commit 並應用到狀態機 (State Machine)，然後通知 Followers 也 Commit。

3. **Safety (安全性)**:
   - 確保任何節點應用的 Log 順序都是一致的。
   - 選舉限制：只有擁有最新 Log 的 Candidate 才能當選 Leader。

#### Raft 的運作流程圖解

```
Client -> Leader: SET X=5
       |
       +-> Leader 寫入 Log (Term 1, Index 1, X=5)
       |
       +-> Leader 發送 AppendEntries 給 Followers
           |
           +-> Follower A 寫入 Log -> 回覆 OK
           +-> Follower B 寫入 Log -> 回覆 OK
       |
       (收到多數 OK)
       |
       +-> Leader Commit (X=5 生效)
       +-> Leader 回覆 Client "Success"
       +-> Leader 通知 Followers Commit
```

### Paxos vs Raft

| 特性 | Paxos | Raft |
| :--- | :--- | :--- |
| **設計目標** | 理論完備性 | 可理解性、工程實作 |
| **架構** | 對等節點 (Basic Paxos)，Leader 可有可無 | 強依賴 Leader (Strong Leader) |
| **日誌連續性** | 允許日誌有空洞 (Holes) | 強制日誌連續，不允許空洞 |
| **實作難度** | 極高 (Google Chubby 團隊曾表示極難除錯) | 中等 (有詳細的論文與規範) |
| **應用** | Google Spanner, Chubby (變體) | Etcd (K8s 核心), Consul, TiKV |

## 程式碼範例 (Go)

實作一個完整的 Raft 太複雜，這裡我們模擬 Raft 的 **Leader Election** 狀態轉換邏輯。

```go
package main

import (
    "fmt"
    "math/rand"
    "time"
)

type State int

const (
    Follower State = iota
    Candidate
    Leader
)

type Node struct {
    ID    int
    State State
    Term  int
    // 模擬接收心跳的通道
    HeartbeatCh chan bool
}

func (n *Node) Run() {
    for {
        switch n.State {
        case Follower:
            select {
            case <-n.HeartbeatCh:
                fmt.Printf("Node %d: Received heartbeat, staying Follower\n", n.ID)
            case <-time.After(time.Duration(rand.Intn(300)+150) * time.Millisecond):
                fmt.Printf("Node %d: Election timeout! Becoming Candidate\n", n.ID)
                n.State = Candidate
            }
        case Candidate:
            n.Term++
            fmt.Printf("Node %d: Starting election for Term %d\n", n.ID, n.Term)
            // 簡化：假設直接贏得選舉
            // 實務上需要發送 RequestVote RPC 並獲得多數票
            time.Sleep(50 * time.Millisecond) 
            fmt.Printf("Node %d: Won election! Becoming Leader\n", n.ID)
            n.State = Leader
        case Leader:
            fmt.Printf("Node %d: Sending heartbeats...\n", n.ID)
            // 模擬發送心跳
            time.Sleep(100 * time.Millisecond)
            // 簡化：Leader 這裡不會自動變回 Follower，除非收到更高 Term
        }
    }
}

func main() {
    rand.Seed(time.Now().UnixNano())
    
    node := &Node{
        ID:          1,
        State:       Follower,
        Term:        0,
        HeartbeatCh: make(chan bool),
    }

    go node.Run()

    // 模擬正常運作：外部發送心跳
    go func() {
        for i := 0; i < 3; i++ {
            time.Sleep(100 * time.Millisecond)
            node.HeartbeatCh <- true
        }
        // 之後停止發送心跳，觸發選舉
    }()

    time.Sleep(2 * time.Second)
}
```
