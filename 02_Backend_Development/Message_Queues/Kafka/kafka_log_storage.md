# Kafka 的日誌儲存機制

- **難度**: 7
- **重要程度**: 3
- **標籤**: `Kafka`, `Log Storage`, `Segment`, `Index`, `Zero-Copy`, `Page Cache`

## 問題詳述

Kafka 的高吞吐能力很大程度上來自其獨特的**日誌儲存設計**：順序 I/O、OS Page Cache 利用、零拷貝（Zero-Copy）傳輸。理解這些設計是理解 Kafka 效能優勢的底層基礎。

## 核心理論與詳解

### 日誌分段（Log Segments）

每個 Partition 在磁碟上對應一個目錄，目錄內由多個**Segment（分段）**組成：

```
/data/kafka/my-topic-0/
├── 00000000000000000000.log      ← Segment 1：訊息資料（二進制）
├── 00000000000000000000.index    ← Offset 稀疏索引（offset → 文件內字節位置）
├── 00000000000000000000.timeindex ← 時間戳索引（timestamp → offset）
├── 00000000000012345678.log      ← Segment 2（文件名 = 本段第一條訊息的 Offset）
├── 00000000000012345678.index
└── 00000000000012345678.timeindex
```

**Segment 滾動觸發條件**（滿足任一即觸發）：
- 段文件大小超過 `log.segment.bytes`（默認 1GB）
- 段文件存在時間超過 `log.roll.ms`（默認 7 天）

**Active Segment**：當前正在寫入的 Segment，只有 Active Segment 可以追加。

---

### 稀疏索引（Sparse Index）

Kafka 的 `.index` 文件**不索引每一條訊息**，而是每 `log.index.interval.bytes`（默認 4096 字節）建立一條索引：

```
二分查找 .index 文件 → 找到最近的索引點
    ↓
在 .log 文件中從索引點順序掃描 → 找到目標 Offset 的訊息
```

好處：索引文件極小（可完全載入記憶體），查詢效率高（接近 O(log N)）。

---

### 高效能的三大技術支柱

#### 1. 順序 I/O（Sequential I/O）

Kafka 所有寫入都是**追加到 Active Segment 的末尾**（Append-Only），完全是順序磁碟寫入。

- 機械硬碟（HDD）：順序寫比隨機寫快 **100-1000 倍**（避免了磁頭尋道）
- SSD：差距小但仍顯著（減少寫放大）

#### 2. OS Page Cache 利用

Kafka **不維護自己的應用層緩存**，完全依賴 OS 的 Page Cache（虛擬記憶體文件緩存）：

- 寫入：訊息先寫入 Page Cache（如記憶體操作，快），OS 異步刷盤
- 讀取：Consumer 讀取時，OS 從 Page Cache 返回（若已緩存），無磁碟 I/O
- 好處：Kafka 進程重啟後，Page Cache 依然存在（OS 管理），緩存不失效

#### 3. 零拷貝（Zero-Copy / sendfile）

傳統文件傳輸涉及 4 次拷貝：
```
磁碟 → 內核 Page Cache → 應用緩衝區（read） → 內核 Socket 緩衝區（write） → 網路
```

Kafka 使用 `sendfile()` 系統調用，**跳過應用層**：
```
磁碟 → 內核 Page Cache → 網路（DMA 直接傳輸）
```
拷貝次數從 4 次降至 2 次（非 SSL 時），大幅降低 CPU 使用率和延遲。

> 注意：若開啟 SSL/TLS，`sendfile()` 無法使用，退回傳統拷貝路徑，CPU 開銷增加。

---

### 資料保留（Retention）策略

| 策略 | 配置 | 說明 |
|------|------|------|
| 按時間 | `log.retention.hours=168`（7天） | 超過時間的 Segment 整個刪除（非逐條） |
| 按大小 | `log.retention.bytes=-1`（不限） | Partition 總大小超過閾值時，刪除最早的 Segment |
| 壓縮（Log Compaction） | `log.cleanup.policy=compact` | 保留每個 Key 的最新 Value，用於 Changelog 場景 |
