# Kafka 的副本機制和 ISR

- **難度**: 8
- **重要程度**: 4
- **標籤**: `Kafka`, `Replication`, `ISR`, `HWM`, `LEO`, `高可用`

## 問題詳述

Kafka 透過**多副本機制（Replication）**實現高可用：每個 Partition 有一個 Leader 和若干 Follower 副本，Leader 宕機後從 Follower 中選出新 Leader。**ISR（In-Sync Replicas）** 是 Kafka 可靠性的核心概念，決定了哪些 Follower 有資格參與 Leader 選舉。

## 核心理論與詳解

### 副本角色

- **Leader Replica**：所有 Producer 寫入和 Consumer 讀取都只和 Leader 交互
- **Follower Replica**：被動從 Leader 複製資料，不直接對外服務
- **副本因子（Replication Factor）**：建議設為 3（1 Leader + 2 Follower），可以容忍 1 個 Broker 故障

---

### ISR（In-Sync Replicas）

ISR 是一個動態集合，包含「與 Leader 保持同步」的所有副本（包含 Leader 自身）。

**進入/離開 ISR 的條件**：
- **加入 ISR**：Follower 的 LEO 追上 Leader 的 HW（或延遲在 `replica.lag.time.max.ms` 內）
- **移出 ISR**：Follower 在 `replica.lag.time.max.ms`（默認 30s）內沒有向 Leader 發送 Fetch 請求，或 Fetch 到的 Offset 落後太多

---

### 兩個關鍵水位線

**LEO（Log End Offset）**：
- 每個副本各自的日誌末端 Offset（下一條要寫入的 Offset）
- 每個副本獨立維護自己的 LEO

**HW（High Watermark，高水位）**：
- ISR 中**所有副本**的 LEO 的**最小值**
- Consumer 只能讀取 HW 以下的訊息（HW 以上的訊息尚未被所有 ISR 確認，可能在 Leader 故障後丟失）

```
Leader LEO:     [0][1][2][3][4] ← 最新寫入
Follower1 LEO:  [0][1][2][3]    ← 已複製到 3
Follower2 LEO:  [0][1][2]       ← 已複製到 2

ISR = {Leader, Follower1, Follower2}
HW = min(4, 3, 2) = 2 （注：HW 是下一個能讀的最大 Offset，即 Consumer 可讀到 Offset 1）
Consumer 可見：Offset 0, 1
```

---

### `acks=all` 與 `min.insync.replicas` 的配合

```
Broker 配置：
min.insync.replicas = 2  （含 Leader 在內，至少 2 個副本確認）

場景：Replication Factor = 3
- 3 副本全都在 ISR → 寫入成功（3 >= 2）
- 1 個 Follower 落後被移出 ISR，ISR = 2 → 寫入成功（2 >= 2）
- 2 個 Follower 都落後，ISR = 1（只剩 Leader） → 寫入失敗！拋出 NotEnoughReplicas
```

> 這是刻意的設計：當可用副本不足時，Kafka 拒絕接受寫入，而不是降低可靠性保證。

---

### Unclean Leader Election

**正常選舉**：只從 ISR 中選出新 Leader，確保新 Leader 有最新的資料。

**Unclean Leader Election**（`unclean.leader.election.enable=true`）：
- 允許從非 ISR 的副本（落後的 Follower）選出 Leader
- **後果**：可能丟失部分訊息（落後副本的 LEO < 舊 Leader 的 HW）
- **適用**：寧可丟失訊息也要保持可用（如日誌收集），不適合金融業務
- **預設**：`false`（Kafka 0.11+），不建議開啟

---

### 副本機制帶來的高可用保障

| 場景 | 結果（RF=3, min.insync.replicas=2） |
|------|-------------------------------------|
| 1 個 Broker 宕機 | Leader 切換，服務正常，ISR = 2（仍滿足） |
| 2 個 Broker 宕機 | ISR = 1，`acks=all` 的寫入失敗；`acks=1` 仍可寫 |
| 3 個 Broker 全宕機 | 服務不可用 |
