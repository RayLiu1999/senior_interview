# Redis 熱點 Key 與大 Key 問題 (Hotkey & Bigkey)

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Redis`, `Hot Key`, `Big Key`, `效能調優`, `Cluster`

## 問題詳述

**Hot Key（熱點 Key）** 和 **Big Key（大 Key）** 是 Redis 線上環境最常見的兩類效能問題，在 Redis Cluster 架構下危害尤其嚴重。前者導致**單個 Slot/節點的 CPU 過載**，後者導致**記憶體不均衡、網路阻塞和操作延遲**。

## 核心理論與詳解

### Hot Key（熱點 Key）

**定義**：某個 Key 的讀寫 QPS 遠超其他 Key，在 Redis Cluster 中該 Key 固定映射到某個 Slot/節點，該節點承受遠超其他節點的請求量。

**典型場景**：
- 電商秒殺：商品庫存 Key
- 明星微博：熱門帖子的點讚數/留言數
- App 首頁推薦：固定的配置 Key 被全體用戶讀取

**危害**：
- 單節點 CPU 飆高（Redis 單線程模型，一個節點的 CPU 就是瓶頸）
- 其他 Key 的請求被排隊，整體延遲上升
- 極端情況下節點 OOM 或宕機，觸發 failover 雪崩

**解決方案**：

| 方案 | 原理 | 適用場景 |
|------|------|---------|
| **本地緩存（Local Cache）** | 在應用層（JVM Heap / Go sync.Map）緩存熱點 Key，Redis 請求降至 0 | 讀多寫少、允許短暫陳舊 |
| **Key 複製分散（Key Replication）** | 將 Key 複製為 `key:0` ~ `key:N`，讀取時隨機選擇一個 | Cluster 場景，讀多寫極少 |
| **讀寫分離** | 主寫副讀，將讀流量分散到多個 Replica | Sentinel/Cluster，讀壓力大 |
| **TTL + 布隆過濾器** | 對請求來源做漏斗限速 | 突發流量 |

**本地緩存 + 定期刷新（推薦模式）**：

```go
// 使用 Ristretto (Dgraph) 或 Caffeine-like 本地緩存
// 示意：應用側緩存熱點 Key
var localCache sync.Map

func getHotValue(ctx context.Context, key string) (string, error) {
    // 1. 查本地緩存（無 Redis 請求）
    if v, ok := localCache.Load(key); ok {
        return v.(string), nil
    }
    // 2. 本地 Miss，查 Redis
    val, err := rdb.Get(ctx, key).Result()
    if err != nil {
        return "", err
    }
    // 3. 回填本地緩存，設置短 TTL（5s）防止陳舊
    localCache.Store(key, val)
    time.AfterFunc(5*time.Second, func() { localCache.Delete(key) })
    return val, nil
}
```

---

### Big Key（大 Key）

**定義**：
- **String**：value 的大小超過 **10 KB**（警惕），超過 **1 MB**（危險）
- **Collection（Hash/List/Set/ZSet）**：元素數量超過 **1 萬**（警惕），超過 **10 萬**（危險）

**危害**：
- **網路阻塞**：單次讀取大 Key 佔用大量帶寬（Redis 默認網路瓶頸約 1Gbps）
- **記憶體碎片**：Redis 分配/釋放大塊記憶體後產生碎片，`jemalloc` 難以回收
- **操作阻塞**：`DEL bigkey` 等操作是 O(N) 複雜度，阻塞單線程處理器（Redis < 4.0 無後台刪除）
- **Cluster 不均衡**：Big Key 所在節點記憶體遠大於其他節點，影響 Cluster 均衡

**發現 Big Key**：
```bash
# 使用 redis-cli --bigkeys 掃描（使用 SCAN 命令，對生產友好）
redis-cli -h 127.0.0.1 -p 6379 --bigkeys

# 查看單個 Key 的大小（字節數）
MEMORY USAGE mykey

# 查看集合元素數量
HLEN myhash
LLEN mylist
SCARD myset
ZCARD myzset
```

**解決方案**：

| 方案 | 適用 Key 類型 | 操作方式 |
|------|--------------|---------|
| **拆分（Sharding）** | Hash/ZSet | 將 Big Key 按 ID 哈希拆為 `key:N` 多個小 Key |
| **壓縮存儲** | String | 存儲前 gzip 壓縮，讀取後解壓（需業務配合） |
| **異步刪除（UNLINK）** | 所有類型 | 用 `UNLINK` 替代 `DEL`，後台異步刪除（Redis 4.0+） |
| **漸進式刪除** | Collection | 用 `HSCAN + HDEL` 分批刪除小集合 |

**Big Hash 拆分示例**：
```go
// 將用戶屬性 Hash 按 user_id 哈希拆為 N 個桶
const buckets = 64

func userHashKey(userID int64) string {
    bucketIndex := userID % buckets
    return fmt.Sprintf("user_attrs:%d", bucketIndex)
}

func getUserAttr(ctx context.Context, userID int64, field string) (string, error) {
    key := userHashKey(userID)
    return rdb.HGet(ctx, key, fmt.Sprintf("%d:%s", userID, field)).Result()
}
```

---

### 監控與預防

**監控指標**：
- `redis-cli monitor`（生產慎用，會降低吞吐量）
- 慢查詢日誌：`SLOWLOG GET 10`（默認記錄 > 10ms 的操作）
- Cloud Redis 通常提供 Key 粒度的訪問頻率統計（如 AWS ElastiCache）

**預防原則**：
1. **設計期**：避免將大量資料直接塞入單個 Key；Collection 類型設計上限元素數
2. **開發期**：代碼審查時關注 Redis 操作的複雜度（`SMEMBERS` 對大 Set 是危險操作）
3. **上線前**：使用 SCAN + MEMORY USAGE 建立 Key 大小基線報告
