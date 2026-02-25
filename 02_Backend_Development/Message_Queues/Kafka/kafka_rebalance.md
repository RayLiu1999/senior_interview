# Kafka Consumer Group 重平衡（Rebalance）機制

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Kafka`, `Rebalance`, `Consumer Group`, `Stop-The-World`, `Cooperative`

## 問題詳述

**Rebalance（重平衡）** 是 Consumer Group 中 Partition 與 Consumer 的對應關係發生重新分配的過程。不當的 Rebalance 會導致**整個 Consumer Group 暫停消費**（Stop-The-World），是 Kafka 應用中常見的延遲和事故根源。

## 核心理論與詳解

### Rebalance 的觸發條件

1. **Consumer 加入**：新 Consumer 啟動並加入 Group
2. **Consumer 離開**：Consumer 正常關閉（`close()`）
3. **Consumer 失活**：超過 `session.timeout.ms` 未發送心跳（Broker 判定宕機）
4. **Consumer 處理超時**：兩次 `poll()` 間隔超過 `max.poll.interval.ms`（Group Coordinator 主動踢出）
5. **Topic 分區數變化**：增加 Partition
6. **訂閱 Topic 變化**：Consumer 訂閱的 Topic 列表改變

---

### 傳統 Rebalance 的問題：Stop-The-World

**Eager Rebalance（積極式，傳統默認行為）**：

```
Rebalance 開始
    ↓
所有 Consumer 撤銷（Revoke）當前所有 Partition 的消費權
    ↓ ← 這段時間整個 Consumer Group 停止消費
Group Coordinator 重新計算分配方案
    ↓
所有 Consumer 領取（Assign）新的 Partition
    ↓
Rebalance 結束
```

**危害**：
- Consumer Group 完全停止消費的時間 = Rebalance 協商時間（通常數秒至數十秒）
- 高頻觸發（如 Consumer 不斷加入滾動上線）造成「Rebalance 風暴」
- 已提交的 Offset 之後的訊息被重複消費（因為重新分配後從 last committed offset 開始）

---

### 解決方案：Cooperative Rebalance（增量式）

**Kafka 2.4+ CooperativeStickyAssignor 的增量式 Rebalance**：

```
Rebalance 開始
    ↓
只撤銷需要移動的 Partition，其他 Partition 繼續消費 ← 只有需要移走的暫停
    ↓
重新分配被撤銷的 Partition
    ↓
Consumer 領取新分配的 Partition
    ↓
Rebalance 結束（大多數 Partition 不中斷消費）
```

配置：
```properties
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
```

---

### 減少不必要 Rebalance 的最佳實踐

**1. 合理設置超時參數**：
```properties
session.timeout.ms=45000      # 心跳超時（默認 45s），不要設太小
heartbeat.interval.ms=15000   # 心跳頻率 = session.timeout / 3
max.poll.interval.ms=300000   # 確保業務處理時間在此範圍內
```

**2. 業務處理時間超長的處理**：
```go
// ❌ 錯誤：在 poll 循環內做耗時操作（超過 max.poll.interval.ms 的風險）
for {
    records := consumer.Poll(100 * time.Millisecond)
    for _, r := range records {
        expensiveOperation(r)  // 可能耗時 10 分鐘
    }
}

// ✅ 正確：非同步處理，主線程持續 poll
taskCh := make(chan Record, 1000)
go func() {
    for r := range taskCh {
        expensiveOperation(r)
    }
}()
for {
    records := consumer.Poll(100 * time.Millisecond)
    for _, r := range records {
        taskCh <- r  // 快速投遞，不阻塞 poll
    }
    // 注意：需要在業務完成後再提交 Offset，而非 poll 後立即提交
}
```

**3. 使用靜態成員（Static Membership）**：
```properties
group.instance.id=consumer-pod-1  # 固定群組成員 ID
```
- 有 `group.instance.id` 的 Consumer 宕機後在 `session.timeout.ms` 內重啟，不觸發 Rebalance
- 適合 Kubernetes Pod 的滾動重啟場景
