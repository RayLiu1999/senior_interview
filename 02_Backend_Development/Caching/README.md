# 快取 (Caching)

快取是提升系統效能和降低資料庫負載的關鍵技術。作為資深後端工程師,您需要深入理解各種快取策略、淘汰演算法以及如何在分散式系統中正確使用快取。本章節涵蓋了面試中最常被考察的**通用快取概念和策略**。

> **注意**: Redis/Memcached 等具體快取技術的深入內容,請參考 [Databases/NoSQL](../Databases/NoSQL/) 章節。

## 📋 主題列表

### 快取策略與模式

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [快取策略與模式](./cache_strategies_and_patterns.md) | 8 | 5 | `Cache-Aside`, `Write-Through`, `Read-Through` |
| [快取穿透、擊穿與雪崩](./cache_penetration_breakdown_avalanche.md) | 7 | 5 | `穿透`, `擊穿`, `雪崩`, `布隆過濾器` |
| [分散式快取一致性](./distributed_cache_consistency.md) | 8 | 5 | `一致性`, `分散式`, `最終一致性` |

### 快取更新與淘汰

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [快取淘汰演算法詳解](./cache_eviction_algorithms.md) | 6 | 5 | `LRU`, `LFU`, `FIFO`, `LRU-K` |
| [快取預熱與更新策略](./cache_warming_and_update_strategies.md) | 7 | 4 | `預熱`, `更新`, `雙寫`, `延遲雙刪` |

### 多層快取架構

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [多層快取架構設計](./multi_tier_cache_architecture.md) | 7 | 4 | `L1/L2快取`, `本地快取`, `分散式快取` |
| [CDN 與邊緣快取](./cdn_and_edge_caching.md) | 6 | 4 | `CDN`, `邊緣計算`, `回源` |

---

## 🔗 相關技術

### 快取實現技術 (詳見 Databases 章節)

- **[Redis](../Databases/NoSQL/Redis/README.md)** - 記憶體資料庫,支援豐富資料結構
  - 資料結構、持久化、單執行緒模型
  - 分散式鎖、Sentinel、Cluster
  - 記憶體淘汰策略、事務機制
  
- **[Memcached](../Databases/NoSQL/Redis/redis_vs_memcached.md)** - 高效能分散式記憶體快取
  - 與 Redis 的對比
  - 一致性哈希
  - 適用場景

---

## 🎯 學習路徑建議

### 初級 (1-2 個月)

**目標**: 掌握基本快取策略和常見問題

1. **快取基礎概念**
   - 什麼是快取?為什麼需要快取?
   - Cache Hit/Miss、Hit Rate
   - 快取命中率計算

2. **基本快取策略**
   - Cache-Aside (旁路快取)
   - Read-Through / Write-Through
   - Write-Behind (Write-Back)

3. **常見快取問題**
   - 快取穿透、擊穿、雪崩
   - 布隆過濾器原理
   - 熱點 key 處理

**時間分配**: 理論學習 40% + 實作練習 40% + 案例分析 20%

### 中級 (2-4 個月)

**目標**: 深入理解淘汰算法和一致性問題

1. **淘汰演算法**
   - LRU (Least Recently Used)
   - LFU (Least Frequently Used)
   - LRU-K、2Q 等進階算法
   - 手動實現 LRU Cache

2. **快取一致性**
   - 強一致性 vs 最終一致性
   - Cache-Aside 的一致性問題
   - 雙寫一致性
   - 延遲雙刪策略

3. **實戰項目**
   - 使用 Redis 實現快取層
   - 實現快取預熱機制
   - 處理快取失效場景

**時間分配**: 演算法實現 30% + 一致性方案 40% + 實戰項目 30%

### 高級 (4-6 個月)

**目標**: 設計高可用分散式快取架構

1. **多層快取架構**
   - L1 (本地快取) + L2 (分散式快取)
   - 快取分片策略
   - 一致性哈希

2. **高級主題**
   - CDN 快取策略
   - 瀏覽器快取 (HTTP Cache-Control)
   - 邊緣計算與快取

3. **效能優化**
   - 快取監控指標
   - 快取雪崩演練
   - 容量規劃與成本優化

**時間分配**: 架構設計 40% + 高級特性 30% + 效能優化 30%

---

## 💡 核心知識點

### 1. 快取策略模式

- **Cache-Aside (旁路快取)**: 應用程式直接管理快取和資料庫
- **Read-Through**: 快取層自動從資料庫載入數據
- **Write-Through**: 寫入時同步更新快取和資料庫
- **Write-Behind**: 先寫快取,異步寫資料庫

### 2. 快取三大問題

- **穿透 (Penetration)**: 查詢不存在的數據,解決方案:布隆過濾器、快取空值
- **擊穿 (Breakdown)**: 熱點 key 失效,解決方案:互斥鎖、永不過期
- **雪崩 (Avalanche)**: 大量 key 同時失效,解決方案:過期時間加隨機值、多級快取

### 3. 淘汰演算法

- **LRU**: 淘汰最久未使用的數據,適合一般場景
- **LFU**: 淘汰訪問頻率最低的數據,適合熱點穩定的場景
- **TTL**: 基於過期時間,適合時效性數據
- **隨機淘汰**: 簡單但不智能

### 4. 快取一致性

- **強一致性**: 寫入後立即可見,效能開銷大
- **最終一致性**: 允許短暫不一致,效能較好
- **讀寫分離**: 主庫寫,從庫讀,需處理延遲
- **延遲雙刪**: 先刪快取 → 更新資料庫 → 延遲後再刪快取

---

## 📚 推薦資源

### 書籍

- 《Redis 設計與實現》- Redis 內部實現詳解
- 《大規模分散式儲存系統》- 分散式快取架構
- 《高效能網站架構設計》- Web 快取策略

### 線上資源

- [Redis 官方文檔](https://redis.io/documentation) - Redis 權威文檔
- [Memcached Wiki](https://github.com/memcached/memcached/wiki) - Memcached 文檔
- [Cache Patterns](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html) - AWS 快取模式

### 工具

- **Redis CLI** - Redis 命令列工具
- **redis-benchmark** - Redis 效能測試
- **Grafana + Prometheus** - 快取監控
- **Apache JMeter** - 壓力測試

---

## 🔧 實戰建議

### 快取監控指標

```bash
# Redis 監控關鍵指標
1. 命中率 (Hit Rate)
   keyspace_hits / (keyspace_hits + keyspace_misses)
   
2. 記憶體使用率
   used_memory / maxmemory
   
3. 連接數
   connected_clients
   
4. 操作延遲
   slowlog get 10  # 慢查詢日誌
   
5. 淘汰統計
   evicted_keys    # 被淘汰的 key 數量
```

### 常見快取模式實現

```go
// Go 語言示例

// 1. Cache-Aside 模式
func GetUser(id int) (*User, error) {
    // 1. 嘗試從快取讀取
    if user, found := cache.Get(fmt.Sprintf("user:%d", id)); found {
        return user.(*User), nil
    }
    
    // 2. 快取未命中,從資料庫讀取
    user, err := db.GetUser(id)
    if err != nil {
        return nil, err
    }
    
    // 3. 寫入快取
    cache.Set(fmt.Sprintf("user:%d", id), user, 1*time.Hour)
    
    return user, nil
}

// 2. 雙寫一致性 (延遲雙刪)
func UpdateUser(user *User) error {
    key := fmt.Sprintf("user:%d", user.ID)
    
    // 1. 刪除快取
    cache.Delete(key)
    
    // 2. 更新資料庫
    if err := db.UpdateUser(user); err != nil {
        return err
    }
    
    // 3. 延遲後再次刪除快取 (處理讀寫並發)
    time.AfterFunc(500*time.Millisecond, func() {
        cache.Delete(key)
    })
    
    return nil
}

// 3. 互斥鎖防止快取擊穿
var mutex sync.Mutex

func GetHotKey(key string) (interface{}, error) {
    // 1. 嘗試從快取讀取
    if value, found := cache.Get(key); found {
        return value, nil
    }
    
    // 2. 快取未命中,加鎖
    mutex.Lock()
    defer mutex.Unlock()
    
    // 3. 雙重檢查
    if value, found := cache.Get(key); found {
        return value, nil
    }
    
    // 4. 從資料庫載入
    value, err := db.Load(key)
    if err != nil {
        return nil, err
    }
    
    // 5. 寫入快取
    cache.Set(key, value, 10*time.Minute)
    
    return value, nil
}
```

---

## 🔗 相關章節

- [資料庫 - NoSQL](../Databases/NoSQL/) - Redis、Memcached 深入內容
- [系統設計](../../03_System_Design_and_Architecture/) - 分散式系統快取設計
- [計算機網路](../../01_Computer_Science_Fundamentals/Networking/) - CDN 與 HTTP 快取

---

> **學習提示**: 快取是提升系統效能的利器,但也會帶來一致性、複雜度等挑戰。學習時建議從簡單的 Cache-Aside 模式開始,逐步理解快取穿透、擊穿、雪崩等實際問題,最後深入分散式快取架構設計。實作時多使用 Redis 進行練習,理解理論與實踐的結合。