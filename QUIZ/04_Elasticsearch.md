# Elasticsearch - 重點考題 (Quiz)

> 這份考題是從 Elasticsearch 章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🔍 基礎概念

### Q1: Term Query 和 Match Query 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋這兩種查詢的工作原理差異，並說明何時應該使用哪一個？有什麼常見的陷阱？

<details>
<summary>💡 答案提示</summary>

| 特性 | Term Query | Match Query |
|------|-----------|-------------|
| **分詞處理** | 不分詞，精確匹配 | 對查詢文本進行分詞 |
| **適用欄位** | keyword 類型 | text 類型 |
| **用途** | ID、狀態、枚舉值查詢 | 全文搜尋（標題、內容） |
| **大小寫** | 區分大小寫 | 取決於分析器 |

**關鍵陷阱**：對 text 欄位使用 Term Query 通常無法匹配！因為 text 欄位被分詞儲存，而 Term Query 不分詞查詢。

**正確做法**：
- 對 text 欄位：使用 Match Query
- 對 keyword 欄位：使用 Term Query
- 需要兩種查詢：使用 Multi-fields（同時定義 text 和 keyword）

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_query_dsl.md)

---

### Q2: 請解釋 Elasticsearch 的倒排索引（Inverted Index）原理

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

倒排索引是如何實現快速全文搜尋的？它與傳統正向索引有什麼區別？

<details>
<summary>💡 答案提示</summary>

**倒排索引**是全文搜尋的核心資料結構，將文檔內容「反轉」索引。

**傳統正向索引**：文檔 → 詞語
```
Doc1 → ["quick", "brown", "fox"]
Doc2 → ["quick", "red", "dog"]
```

**倒排索引**：詞語 → 文檔
```
"quick" → [Doc1, Doc2]
"brown" → [Doc1]
"fox"   → [Doc1]
```

**優點**：
1. 快速定位包含特定詞語的所有文檔
2. 支援高效的全文搜尋和布林查詢
3. 可以儲存詞頻、位置等額外資訊

**索引過程**：分析器 → 分詞 → 正規化 → 建立映射

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/what_is_elasticsearch.md)

---

### Q3: text 和 keyword 欄位類型有什麼區別？

**難度**: ⭐⭐⭐⭐⭐ (5) | **重要性**: 🔴 必考

這是 Elasticsearch 最基礎也最重要的概念之一，請解釋兩者的差異和各自的使用場景。

<details>
<summary>💡 答案提示</summary>

| 特性 | text | keyword |
|------|------|---------|
| **分詞** | 會被分詞器處理 | 不分詞，完整儲存 |
| **查詢方式** | Match Query | Term Query |
| **排序/聚合** | 不支援（除非啟用 fielddata） | 支援 |
| **用途** | 全文搜尋 | 精確匹配、過濾、排序、聚合 |

**最佳實踐：Multi-fields**
```json
{
  "title": {
    "type": "text",
    "fields": {
      "keyword": { "type": "keyword" }
    }
  }
}
```

這樣 `title` 用於全文搜尋，`title.keyword` 用於排序、聚合。

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_mapping_and_analyzers.md)

---

## 🔧 查詢與聚合

### Q4: Bool Query 的 must、should、must_not、filter 有什麼區別？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

這四個子句的語義和對評分的影響分別是什麼？在效能優化中應該如何選擇？

<details>
<summary>💡 答案提示</summary>

| 子句 | 語義 | 影響評分 | 快取 |
|------|------|----------|------|
| **must** | 必須匹配 | ✓ 影響 | ✗ |
| **should** | 應該匹配（提升分數） | ✓ 影響 | ✗ |
| **must_not** | 必須不匹配 | ✗ | ✓ |
| **filter** | 必須匹配，但不計算分數 | ✗ | ✓ |

**效能優化關鍵**：
- 精確過濾條件（如狀態、日期範圍）放在 `filter`
- `filter` 的結果會被快取，效能遠優於 `must`
- 需要相關性排序的條件放在 `must` 或 `should`

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_query_dsl.md)

---

### Q5: 如何解決 Elasticsearch 深分頁問題？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

當需要獲取第 10000 頁以後的資料時，ES 會遇到什麼問題？有哪些解決方案？

<details>
<summary>💡 答案提示</summary>

**問題**：`from: 10000, size: 10` 需要每個分片返回 10010 個文檔，然後協調節點合併排序，非常耗資源。ES 預設限制 `from + size <= 10000`。

**解決方案**：

| 方案 | 適用場景 | 特點 |
|------|----------|------|
| **Search After** | 即時分頁 | 無狀態，可深分頁 |
| **Scroll API** | 批量匯出 | 保持快照，有過期時間 |
| **PIT (Point in Time)** | 大量資料遍歷 | 結合 Search After 使用 |

**Search After 關鍵**：
- 必須使用唯一的排序組合（如加上 `_id`）
- 使用上一頁最後一筆的 sort 值作為下一頁的起點

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_performance_optimization.md)

---

### Q6: Cardinality 聚合為什麼是近似值？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 Cardinality 聚合的工作原理，以及它使用什麼演算法來實現高效去重計數。

<details>
<summary>💡 答案提示</summary>

**Cardinality 聚合**用於計算去重後的數量（類似 SQL 的 `COUNT(DISTINCT)`）。

**為何是近似值**：精確計算去重需要將所有唯一值存入記憶體，對於高基數欄位（如 user_id）記憶體消耗巨大。

**使用的演算法**：HyperLogLog++

**HyperLogLog++ 特點**：
- 時間複雜度 O(1)
- 空間複雜度極低（固定記憶體）
- 標準誤差約 0.81%

**調整精確度**：`precision_threshold` 參數
- 預設 3000，最大 40000
- 值越大越精確，但記憶體消耗也越大

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_aggregations.md)

---

## 🌐 分散式架構

### Q7: 為什麼 Elasticsearch 的主分片數量在索引建立後不能修改？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

這是理解 ES 分散式架構的關鍵問題，請從文檔路由的角度解釋原因。

<details>
<summary>💡 答案提示</summary>

**根本原因**：文檔路由公式
```
shard = hash(routing) % number_of_primary_shards
```

**問題分析**：
1. 索引文檔時，使用此公式決定文檔存放在哪個分片
2. 如果分片數變更，公式結果改變
3. 已存在的文檔位置與新計算結果不一致
4. 導致無法正確定位文檔

**解決方案**：
- **Reindex**：建立新索引並遷移資料
- **Split Index**：將分片數翻倍（2→4→8）
- **使用別名**：零停機時間切換索引

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_shards_and_replicas.md)

---

### Q8: 請解釋 Elasticsearch 的副本機制及其作用

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

副本在 ES 中扮演什麼角色？它如何提供高可用性和提升性能？

<details>
<summary>💡 答案提示</summary>

**副本 (Replica)** 是主分片的完整拷貝。

**作用**：
1. **高可用性 (HA)**：主分片故障時，副本自動提升為主分片
2. **提升讀取吞吐量**：搜尋請求可在主分片或任一副本上執行

**分配規則**：
- 主分片和其副本**不能**在同一節點上
- 確保節點故障時至少有一個完整拷貝

**動態調整**：副本數量可以隨時調整，但主分片數不行

**寫入優化**：大量寫入時可暫時關閉副本，完成後再開啟

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_shards_and_replicas.md)

---

## ⚡ 效能優化

### Q9: JVM Heap 為什麼建議不超過 32GB？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

這是 ES 效能調優的關鍵知識點，請解釋背後的技術原理。

<details>
<summary>💡 答案提示</summary>

**原因**：Compressed Ordinary Object Pointers (Compressed OOPs)

**什麼是 Compressed OOPs**：
- 64 位元系統的指標佔用 8 bytes
- Compressed OOPs 將指標壓縮為 4 bytes

**32GB 的邊界**：
- Heap ≤ 32GB：JVM 啟用壓縮指標
- Heap > 32GB：必須使用完整 8 bytes 指標

**影響**：
- 超過 32GB 後，指標佔用翻倍
- 實際可用記憶體反而可能減少

**最佳配置**：
- Heap: 26-31GB
- 剩餘記憶體給 OS 和 Lucene File System Cache
- 兩者各佔約 50%

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_performance_optimization.md)

---

### Q10: 如何將 MySQL 資料同步到 Elasticsearch？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🟡 重要

請比較不同的資料同步方案及其適用場景。

<details>
<summary>💡 答案提示</summary>

| 方案 | 即時性 | 一致性 | 複雜度 | 適用場景 |
|------|--------|--------|--------|----------|
| **雙寫** | 高 | 低 | 低 | 簡單場景 |
| **Outbox Pattern** | 高 | 中 | 中 | 需要保證至少一次 |
| **訊息佇列** | 中 | 中 | 中 | 大多數生產環境 |
| **CDC (Binlog)** | 高 | 高 | 高 | 大規模、高可靠 |

**推薦方案：CDC (Change Data Capture)**
- 工具：Debezium、Canal、Maxwell
- 優點：對應用程式透明，資料一致性最高

**一致性保證**：重試機制、死信佇列、冪等處理

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_data_sync.md)

---

### Q11: 什麼是 Refresh Interval？它如何影響效能？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🟡 重要

請解釋 Refresh 操作的作用，以及如何根據場景調整 refresh_interval。

<details>
<summary>💡 答案提示</summary>

**Refresh** 是將 Buffer 中的資料寫入 Segment 並使其可搜尋的操作。

**預設值**：1 秒

**影響**：
- 頻率越高，資料越快可搜尋
- 但會產生大量小 Segment，影響寫入效能

**優化策略**：
- 大量寫入時：設為 `30s` 或更長
- 批量匯入時：設為 `-1`（禁用），完成後手動 refresh
- 完成後恢復為 `1s`

**注意**：增加 refresh_interval 會增加「寫入 → 可搜尋」的延遲。

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_performance_optimization.md)

---

### Q12: 如何設計 Elasticsearch 的熱溫冷架構？

**難度**: ⭐⭐⭐⭐⭐⭐⭐⭐ (8) | **重要性**: 🟡 重要

請解釋熱溫冷架構的設計理念和實現方式。

<details>
<summary>💡 答案提示</summary>

**熱溫冷架構**用於優化時序資料的儲存成本。

**節點角色**：

| 層級 | 硬體 | 用途 |
|------|------|------|
| **Hot** | SSD、高效能 | 即時寫入、近期資料 |
| **Warm** | 一般 SSD | 歷史資料、較少查詢 |
| **Cold** | HDD | 歸檔資料、極少存取 |

**實現方式**：
1. 節點標籤：`node.attr.box_type: hot`
2. ILM Policy：定義資料生命週期策略
3. 自動遷移：根據時間/大小自動轉移資料

**效益**：降低成本、優化資源、自動化管理

</details>

📖 [查看完整答案](../02_Backend_Development/Search_Engines/Elasticsearch/elasticsearch_performance_optimization.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能區分 Term vs Match Query | ⬜ |
| 理解倒排索引原理 | ⬜ |
| 能區分 text vs keyword 欄位 | ⬜ |
| 理解 Bool Query 四種子句 | ⬜ |
| 知道深分頁解決方案 | ⬜ |
| 理解分片路由公式 | ⬜ |
| 能解釋副本的作用 | ⬜ |
| 知道 JVM Heap 32GB 限制原因 | ⬜ |
| 能比較資料同步方案 | ⬜ |
| 了解熱溫冷架構設計 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。
