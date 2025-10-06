# 多層快取架構設計

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Multi-Tier Cache`, `L1/L2 Cache`, `Local Cache`, `Distributed Cache`, `Architecture`

## 問題詳述

在高效能系統中,通常會採用多層快取架構來平衡效能、成本和資料一致性。請詳細解釋多層快取的設計原則、常見的分層策略 (如本地快取 + 分散式快取)、各層的職責劃分,以及如何處理多層快取之間的同步和一致性問題。

## 核心理論與詳解

多層快取架構 (Multi-Tier Cache Architecture) 透過在應用層和資料庫之間建立多個快取層級,利用**空間局部性**和**時間局部性**原理,在不同層級使用不同的快取策略,實現效能、成本和一致性的最佳平衡。

### 為什麼需要多層快取

#### 單層快取的局限性

僅使用單層快取 (如 Redis) 存在以下問題:

1. **網路延遲**: 每次請求都需要經過網路到 Redis,延遲通常在 1~5ms
2. **網路頻寬**: 高流量下可能成為瓶頸
3. **Redis 壓力**: 所有請求集中在 Redis,可能達到效能上限
4. **單點風險**: Redis 故障會直接影響整個系統
5. **成本高**: Redis 叢集的擴展成本較高

#### 多層快取的優勢

```text
請求流程:
使用者 → L1 本地快取 (進程內) → L2 分散式快取 (Redis) → 資料庫

優勢:
- 極低延遲: L1 訪問 < 1μs (微秒級)
- 減輕 Redis 壓力: L1 攔截大部分請求
- 高可用性: 某層失效不會完全癱瘓系統
- 成本優化: 本地記憶體便宜,減少 Redis 依賴
```

### 常見的多層快取架構

#### 架構一: 兩層快取 (L1 + L2)

**結構**:

```text
┌─────────────┐
│  應用伺服器  │
│  ┌───────┐  │
│  │L1 本地 │  │ ← 進程內快取 (Caffeine, Guava Cache)
│  │快取    │  │
│  └───┬───┘  │
│      │      │
└──────┼──────┘
       │
       ▼
┌─────────────┐
│ L2 分散式   │ ← Redis / Memcached
│ 快取 (Redis)│
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   資料庫    │ ← MySQL / PostgreSQL
└─────────────┘
```

**各層特性**:

| 層級 | 技術選型 | 訪問延遲 | 容量 | 適用資料 |
|------|---------|---------|------|---------|
| **L1** | Caffeine, Guava | < 1μs | 幾十MB~幾GB | 極熱資料 |
| **L2** | Redis, Memcached | 1~5ms | 幾GB~幾TB | 熱資料 |
| **DB** | MySQL, PostgreSQL | 10~100ms | TB級 | 全量資料 |

**讀取流程**:

```go
// Go 語言示例: 兩層快取讀取

type MultiTierCache struct {
    l1Cache  *LocalCache   // 本地快取
    l2Cache  *RedisClient  // 分散式快取
    database *DBClient     // 資料庫
}

func (c *MultiTierCache) Get(key string) (interface{}, error) {
    // 1. 嘗試從 L1 本地快取讀取
    if value, found := c.l1Cache.Get(key); found {
        metrics.RecordCacheHit("L1")
        return value, nil
    }
    
    // 2. L1 未命中,嘗試從 L2 分散式快取讀取
    value, err := c.l2Cache.Get(key)
    if err == nil && value != nil {
        metrics.RecordCacheHit("L2")
        
        // 將資料回填到 L1
        c.l1Cache.Set(key, value, 5*time.Minute)
        
        return value, nil
    }
    
    // 3. L2 也未命中,從資料庫讀取
    metrics.RecordCacheMiss()
    value, err = c.database.Query(key)
    if err != nil {
        return nil, err
    }
    
    // 4. 回填到 L2 和 L1
    go func() {
        c.l2Cache.Set(key, value, 1*time.Hour)
        c.l1Cache.Set(key, value, 5*time.Minute)
    }()
    
    return value, nil
}
```

**寫入流程**:

```go
func (c *MultiTierCache) Update(key string, value interface{}) error {
    // 1. 更新資料庫
    if err := c.database.Update(key, value); err != nil {
        return err
    }
    
    // 2. 刪除 L2 快取 (保證一致性)
    c.l2Cache.Delete(key)
    
    // 3. 刪除 L1 快取
    c.l1Cache.Delete(key)
    
    // 或者直接更新快取 (適用於即時性要求高的場景)
    // c.l2Cache.Set(key, value, 1*time.Hour)
    // c.l1Cache.Set(key, value, 5*time.Minute)
    
    return nil
}
```

#### 架構二: 三層快取 (L1 + L2 + L3)

**結構**:

```text
L1: 進程內快取 (本地記憶體)
    ↓
L2: 本地 Redis (同機房)
    ↓
L3: 遠程 Redis 叢集 (跨機房)
    ↓
資料庫
```

**適用場景**:
- 多機房部署的大型分散式系統
- 需要跨地域資料同步
- 對延遲極度敏感

#### 架構三: 按業務分層

**結構**:

```text
┌────────────────────────────────────┐
│         應用伺服器                   │
│  ┌──────────┐  ┌──────────┐        │
│  │ 使用者快取 │  │ 商品快取  │        │
│  └──────────┘  └──────────┘        │
└────────┬──────────────┬────────────┘
         │              │
    ┌────▼────┐    ┌────▼────┐
    │ Redis 1 │    │ Redis 2 │
    └────┬────┘    └────┬────┘
         │              │
    ┌────▼──────────────▼────┐
    │      資料庫             │
    └─────────────────────────┘
```

**優點**:
- 業務隔離,互不影響
- 可針對不同業務特性優化策略
- 故障隔離性好

### 多層快取的設計原則

#### 1. 金字塔原則

快取容量遵循金字塔分佈:

```text
        L1 (小容量,極快)
       /  \
      /    \
     /  L2  \  (中容量,較快)
    /        \
   /          \
  /     DB     \  (大容量,較慢)
 /______________\
```

- **L1**: 只快取最熱的 1%~5% 資料
- **L2**: 快取熱門的 20%~30% 資料
- **DB**: 儲存 100% 資料

#### 2. 過期時間遞增原則

越靠近使用者的快取,過期時間越短:

```text
L1: 5 分鐘
L2: 1 小時
DB: 永久
```

**原因**:
- 避免 L1 長時間持有陳舊資料
- L1 過期後可從 L2 快速恢復
- 減少多層快取間的不一致時間

#### 3. 更新時反向傳播原則

資料更新時,從最上層開始依次刪除或更新:

```text
更新 DB → 刪除 L2 → 刪除 L1
```

**避免**: 先刪除 L1,後刪除 L2,可能導致 L1 從 L2 讀到舊資料。

### 多層快取的一致性挑戰

#### 問題一: 快取穿透 (Cache Penetration)

**場景**: 查詢不存在的資料,L1 和 L2 都未命中,直接打到資料庫。

**解決方案**:

1. **布隆過濾器**: 在 L2 層前放置布隆過濾器

```go
func (c *MultiTierCache) GetWithBloomFilter(key string) (interface{}, error) {
    // 1. 檢查布隆過濾器
    if !c.bloomFilter.MightContain(key) {
        return nil, ErrKeyNotExist
    }
    
    // 2. 繼續正常的多層查詢流程
    return c.Get(key)
}
```

2. **快取空值**: 在 L2 快取空值,避免重複查詢

```go
// 資料庫查詢為空時
if value == nil {
    c.l2Cache.Set(key, "__NULL__", 5*time.Minute) // 短 TTL
}
```

#### 問題二: 快取不一致

**場景**: L1 和 L2 的資料不同步。

**原因**:
- 更新時只刪除了 L2,忘記刪除 L1
- 網路分區導致刪除指令未到達
- 刪除順序錯誤

**解決方案**:

1. **統一刪除介面**:

```go
func (c *MultiTierCache) Delete(key string) error {
    // 同時刪除所有層級
    c.l1Cache.Delete(key)
    c.l2Cache.Delete(key)
    return nil
}

// 更新時必須調用
func (c *MultiTierCache) Update(key string, value interface{}) error {
    if err := c.database.Update(key, value); err != nil {
        return err
    }
    return c.Delete(key) // 統一刪除
}
```

2. **版本號機制**:

```go
type CacheValue struct {
    Data    interface{}
    Version int64
}

func (c *MultiTierCache) GetWithVersion(key string) (interface{}, error) {
    // L1 讀取
    if v1, found := c.l1Cache.Get(key); found {
        l1Value := v1.(*CacheValue)
        
        // 檢查 L2 的版本號
        if v2, _ := c.l2Cache.Get(key); v2 != nil {
            l2Value := v2.(*CacheValue)
            
            // 如果 L2 版本更新,刪除 L1 並使用 L2 資料
            if l2Value.Version > l1Value.Version {
                c.l1Cache.Delete(key)
                c.l1Cache.Set(key, l2Value, 5*time.Minute)
                return l2Value.Data, nil
            }
        }
        
        return l1Value.Data, nil
    }
    
    // 繼續 L2 查詢...
    return c.Get(key)
}
```

3. **發布/訂閱通知**:

```go
// 當某個節點更新資料後,發布訊息通知其他節點刪除 L1
func (c *MultiTierCache) UpdateWithNotify(key string, value interface{}) error {
    // 1. 更新資料庫
    if err := c.database.Update(key, value); err != nil {
        return err
    }
    
    // 2. 刪除本地 L2
    c.l2Cache.Delete(key)
    
    // 3. 發布訊息,通知所有節點刪除 L1
    message := fmt.Sprintf("invalidate:%s", key)
    c.pubsub.Publish("cache:invalidate", message)
    
    // 4. 刪除本地 L1
    c.l1Cache.Delete(key)
    
    return nil
}

// 訂閱失效訊息
func (c *MultiTierCache) SubscribeInvalidation() {
    c.pubsub.Subscribe("cache:invalidate", func(msg string) {
        key := strings.TrimPrefix(msg, "invalidate:")
        c.l1Cache.Delete(key)
    })
}
```

#### 問題三: 雪崩放大效應

**場景**: L1 大量失效時,瞬間壓力全部轉移到 L2,可能導致 L2 也崩潰。

**解決方案**:

1. **分散過期時間**:

```go
// L1 設定隨機過期時間
baseExpiration := 5 * time.Minute
randomSeconds := rand.Intn(60) // 0~60 秒隨機
expiration := baseExpiration + time.Duration(randomSeconds)*time.Second

c.l1Cache.Set(key, value, expiration)
```

2. **熔斷機制**:

```go
func (c *MultiTierCache) GetWithCircuitBreaker(key string) (interface{}, error) {
    // L1 查詢
    if value, found := c.l1Cache.Get(key); found {
        return value, nil
    }
    
    // 檢查 L2 熔斷狀態
    if c.circuitBreaker.IsOpen("L2") {
        // L2 熔斷,直接從資料庫讀取
        return c.database.Query(key)
    }
    
    // 嘗試 L2 查詢
    value, err := c.l2Cache.Get(key)
    if err != nil {
        // L2 失敗,記錄錯誤
        c.circuitBreaker.RecordFailure("L2")
        return c.database.Query(key)
    }
    
    c.circuitBreaker.RecordSuccess("L2")
    return value, nil
}
```

### 多層快取的實務案例

#### 案例一: 電商商品詳情頁

**資料特性**:
- 極高的讀取量 (QPS 幾萬~幾十萬)
- 更新不頻繁 (商品資訊偶爾修改)
- 存在明顯的熱點商品

**快取策略**:

```text
L1 (本地): 
  - 容量: 1000 個商品
  - 過期時間: 5 分鐘
  - 淘汰策略: LRU
  
L2 (Redis):
  - 容量: 10 萬個商品
  - 過期時間: 1 小時
  - 淘汰策略: allkeys-lru
```

**效果**:
- L1 命中率: 70%~80% (極熱商品)
- L2 命中率: 95%+ (熱門商品)
- 資料庫 QPS 降低 95%+

#### 案例二: 使用者資訊

**資料特性**:
- 讀多寫少
- 使用者活躍度差異大
- 需要較高的一致性

**快取策略**:

```text
L1 (本地):
  - 容量: 500 個使用者
  - 過期時間: 3 分鐘 (較短,保證即時性)
  - 更新策略: 主動刪除

L2 (Redis):
  - 容量: 100 萬使用者
  - 過期時間: 30 分鐘
  - 更新策略: 主動刪除 + 延遲雙刪
```

#### 案例三: 配置資訊

**資料特性**:
- 全域共享
- 極少更新 (一天幾次)
- 必須保證一致性

**快取策略**:

```text
L1 (本地):
  - 容量: 所有配置 (通常很小)
  - 過期時間: 10 分鐘
  - 更新策略: 發布/訂閱通知

L2 (Redis):
  - 容量: 所有配置
  - 過期時間: 1 天
  - 更新策略: 主動更新 + 廣播通知
```

### 多層快取的監控指標

#### 關鍵指標

```go
type CacheMetrics struct {
    // 命中率指標
    L1HitCount   int64  // L1 命中次數
    L2HitCount   int64  // L2 命中次數
    MissCount    int64  // 未命中次數
    TotalRequest int64  // 總請求數
    
    // 延遲指標
    L1AvgLatency time.Duration
    L2AvgLatency time.Duration
    DBAvgLatency time.Duration
    
    // 容量指標
    L1Size       int64
    L1MaxSize    int64
    L2Size       int64
    L2MaxSize    int64
}

func (m *CacheMetrics) L1HitRate() float64 {
    return float64(m.L1HitCount) / float64(m.TotalRequest)
}

func (m *CacheMetrics) L2HitRate() float64 {
    return float64(m.L2HitCount) / float64(m.TotalRequest)
}

func (m *CacheMetrics) TotalHitRate() float64 {
    hits := m.L1HitCount + m.L2HitCount
    return float64(hits) / float64(m.TotalRequest)
}
```

#### 告警閾值建議

| 指標 | 健康值 | 警告閾值 | 嚴重閾值 |
|------|--------|---------|---------|
| L1 命中率 | > 60% | < 50% | < 30% |
| 總命中率 | > 95% | < 90% | < 80% |
| L2 延遲 | < 5ms | > 10ms | > 50ms |
| L1 記憶體使用率 | < 80% | > 85% | > 95% |

### 常見面試考點

#### Q1: 為什麼要使用多層快取而不是單層?

**答案**: 
1. **降低延遲**: L1 本地快取訪問 < 1μs,遠快於 Redis 的 1~5ms
2. **減輕壓力**: L1 攔截大部分請求,減輕 Redis 壓力
3. **提高可用性**: 某層失效時,其他層仍可工作
4. **成本優化**: 本地記憶體成本低,減少 Redis 依賴

#### Q2: 多層快取如何保證一致性?

**答案**:
1. **統一刪除**: 更新時同時刪除所有層級的快取
2. **過期時間遞增**: L1 過期時間短於 L2,減少不一致窗口
3. **發布/訂閱**: 使用 Redis Pub/Sub 通知所有節點刪除 L1
4. **版本號機制**: 在資料中攜帶版本號,讀取時比對版本

#### Q3: L1 本地快取的容量應該設定多大?

**答案**: 根據**二八原則**,設定為能容納**最熱的 1%~5% 資料**即可:
- 計算方式: `L1 容量 = 總資料量 × 1%~5%`
- 例如: 100 萬商品,L1 只需快取 1000~5000 個最熱商品
- 過大浪費記憶體,過小命中率低

#### Q4: 什麼情況下不適合使用多層快取?

**答案**:
1. **強一致性要求**: 金融交易等場景,多層快取增加不一致風險
2. **資料更新頻繁**: 頻繁更新會導致快取不斷失效,意義不大
3. **冷門資料**: 訪問量很低的資料,多層快取反而增加複雜度
4. **小型系統**: 單機應用,流量不大,單層快取已足夠

#### Q5: 如何選擇 L1 和 L2 的過期時間?

**答案**:
- **L1**: 設定為 L2 的 1/10 ~ 1/5,通常 1~10 分鐘
- **L2**: 根據資料特性,通常 30 分鐘~2 小時
- **原則**: L1 過期後能從 L2 快速恢復,L2 過期後從資料庫重建

**範例**:
- 商品詳情: L1=5 分鐘, L2=1 小時
- 使用者資訊: L1=3 分鐘, L2=30 分鐘
- 配置資訊: L1=10 分鐘, L2=1 天

### 總結

多層快取架構的核心思想是**就近原則** (Locality Principle):

1. **分層設計**: L1 (極快,小容量) + L2 (較快,中容量) + DB (全量)
2. **容量分配**: 遵循金字塔原則,L1 只快取最熱的 1%~5% 資料
3. **過期時間**: 遞增設定,L1 < L2,減少不一致時間
4. **一致性保證**: 統一刪除 + 發布/訂閱通知 + 版本號機制
5. **監控告警**: 關注命中率、延遲、容量使用率

**實務建議**: 
- 中小型系統: 使用兩層快取 (L1 + Redis) 即可
- 大型系統: 根據業務特性設計三層或分業務分層
- 選擇合適的本地快取庫: Caffeine (Java), sync.Map (Go), lru-cache (Node.js)
- 不要過度設計,根據實際需求權衡複雜度和收益
