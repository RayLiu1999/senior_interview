# Sampling Strategies (採樣策略)

- **難度**: 7
- **標籤**: `Jaeger`, `Tracing`, `Sampling`, `Performance`

## 問題詳述

在分散式追蹤中，全量採集 (100% Sampling) 會帶來巨大的儲存成本和性能開銷。請詳細解釋 Jaeger 支持的採樣策略 (Head-based vs Tail-based)，以及如何選擇合適的採樣率。

## 核心理論與詳解

採樣是分散式追蹤中最重要的權衡 (Trade-off) 之一：**成本 vs 數據完整性**。

### 1. Head-based Sampling (頭部採樣)

這是最常見、最簡單的採樣方式。

- **原理**: 在請求**剛進入系統** (Root Span 開始) 時，就決定這條 Trace 是否要被採樣。這個決定會隨著 Context 傳播到後續的所有服務。
- **優點**:
  - **性能好**: 如果決定不採樣，後續服務都不需要生成 Span，開銷極低。
  - **實現簡單**: 不需要複雜的後端協調。
- **缺點**:
  - **隨機性**: 可能會漏掉那些「雖然很少發生，但非常重要」的錯誤請求 (例如 1% 的採樣率可能剛好錯過了那個 500 Error)。
- **Jaeger 支持的 Head-based 策略**:
  1. **Constant**: 固定採樣。 `param=1` (全採), `param=0` (不採)。
  2. **Probabilistic**: 概率採樣。 `param=0.001` (0.1% 的請求)。
  3. **Rate Limiting**: 限流採樣。 `param=5` (每秒最多 5 條 Trace)。
  4. **Remote**: **(推薦)** 由 Jaeger Collector 動態下發策略。可以在不重啟服務的情況下調整採樣率。

### 2. Tail-based Sampling (尾部採樣)

這是更高級的採樣方式，旨在解決 Head-based 的缺點。

- **原理**: 所有的 Span 都先被採集並發送到一個緩衝區 (通常是 Jaeger Collector 或 OpenTelemetry Collector)。等到整條 Trace 結束後，根據 Trace 的特徵 (是否有 Error，耗時是否超過 2s) 來決定是否保留。
- **優點**:
  - **精準**: 可以保證 100% 保留錯誤請求和慢請求。
  - **數據價值高**: 留下的都是有問題的 Trace，而不是一堆正常的 `200 OK`。
- **缺點**:
  - **資源消耗大**: 需要大量的記憶體來緩存正在進行中的 Trace。
  - **架構複雜**: 需要專門的組件 (如 OpenTelemetry Collector 的 Tail Sampling Processor) 來進行負載均衡和決策。

### 3. 選擇建議

| 場景 | 推薦策略 | 理由 |
| :--- | :--- | :--- |
| **開發/測試環境** | Constant (100%) | 流量小，需要看到所有細節以便調試。 |
| **生產環境 (一般)** | Remote (Probabilistic 0.1% - 1%) | 平衡成本與可觀測性，且可動態調整。 |
| **生產環境 (核心交易)** | Tail-based | 必須捕獲所有失敗交易，成本是次要的。 |
| **資源受限環境** | Rate Limiting | 防止突發流量導致監控系統本身崩潰。 |

## 程式碼範例

(無程式碼，僅為策略說明)
