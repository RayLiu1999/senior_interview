# Elasticsearch Indexing Strategy (Elasticsearch 索引策略)

- **難度**: 8
- **標籤**: `Elasticsearch`, `ELK`, `Performance`, `Indexing`

## 問題詳述

在日誌量巨大的場景下 (如每天 1TB)，Elasticsearch 經常面臨寫入瓶頸或查詢緩慢的問題。請分享 ES 索引設計的最佳實踐 (Rollover, ILM, Sharding Strategy)。

## 核心理論與詳解

Elasticsearch 的性能高度依賴於索引 (Index) 和分片 (Shard) 的設計。

### 1. 索引生命週期管理 (ILM - Index Lifecycle Management)

日誌數據具有明顯的時間特徵：**越新的數據越熱，越舊的數據越冷**。ILM 允許我們自動管理索引的生命週期：

1. **Hot Phase (熱階段)**:
    - **目標**: 高速寫入和頻繁查詢。
    - **配置**: 使用 SSD，較多的 Primary Shards 以提高寫入並發。
    - **動作**: `Rollover` (當索引太大或太舊時，自動創建新索引)。
2. **Warm Phase (溫階段)**:
    - **目標**: 查詢頻率降低，不再寫入。
    - **配置**: 可以遷移到 HDD，執行 `Force Merge` (將 Segment 合併，減少內存佔用)。
    - **動作**: `Shrink` (減少 Shard 數量)，`ReadOnly`。
3. **Cold Phase (冷階段)**:
    - **目標**: 偶爾查詢，長期歸檔。
    - **配置**: 使用最廉價的存儲，甚至使用 Searchable Snapshots (直接查詢快照)。
4. **Delete Phase (刪除階段)**:
    - **動作**: 自動刪除超過保留期 (Retention Policy) 的索引。

### 2. 分片策略 (Sharding Strategy)

分片數量過多或過少都會影響性能。

- **Shard Size (分片大小)**:
  - 官方建議單個 Shard 大小控制在 **10GB - 50GB** 之間。
  - 太小: 導致 Segment 過多，消耗大量 Heap 內存 (每個 Segment 都需要內存索引)。
  - 太大: 導致恢復 (Recovery) 和再平衡 (Rebalance) 速度極慢。
- **Shard Count (分片數量)**:
  - 寫入瓶頸時：增加 Primary Shard 數量。
  - 查詢瓶頸時：增加 Replica Shard 數量 (提高讀取吞吐量)。

### 3. 寫入優化 (Indexing Optimization)

- **Bulk API**: 永遠使用批量寫入，單次 Bulk 大小建議在 5MB - 15MB。
- **Refresh Interval**: 默認是 1s。對於日誌場景，建議調整為 **30s 或 60s**。這能顯著減少 Segment Merge 的壓力，提升寫入吞吐量 (代價是日誌要在 30s 後才能被搜到)。
- **Disable _source**: 如果不需要存儲原始 JSON (只做聚合分析)，可以禁用 `_source` 字段 (節省磁碟，但無法查看日誌詳情，慎用)。

## 程式碼範例

(ILM Policy 配置範例)

```json
PUT _ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```
