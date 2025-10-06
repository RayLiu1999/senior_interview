# 快取預熱與更新策略

- **難度**: 7
- **重要程度**: 4
- **標籤**: `Cache Warming`, `Cache Update`, `Preloading`, `Refresh Strategy`

## 問題詳述

在系統啟動或快取重建時,如何有效地進行快取預熱?在快取運行期間,如何設計合理的更新策略來保持資料的新鮮度?請詳細說明快取預熱的方法、更新策略以及各自的適用場景。

## 核心理論與詳解

快取預熱 (Cache Warming) 和更新策略是快取系統設計中的重要環節。預熱不當會導致**冷啟動問題** (Cold Start),大量請求未命中快取而衝擊資料庫;更新策略不當則會導致**資料陳舊**或**快取頻繁失效**,影響系統效能和使用者體驗。

### 快取預熱 (Cache Warming)

#### 什麼是快取預熱

快取預熱是指在系統啟動或快取清空後,**主動將熱點資料預先載入快取**,避免在服務啟動初期因大量快取未命中 (Cache Miss) 而導致資料庫壓力驟增。

#### 為什麼需要快取預熱

**冷啟動問題的影響**:

1. **資料庫壓力驟增**: 
   - 系統剛啟動時,快取為空
   - 大量請求直接打到資料庫
   - 可能導致資料庫連接池耗盡、查詢超時

2. **使用者體驗下降**:
   - 前期請求延遲高 (需從資料庫讀取)
   - 部分請求可能失敗或超時

3. **雪崩風險**:
   - 如果是分散式系統,一個節點重啟可能引發連鎖反應
   - 其他節點承載更多流量,也可能崩潰

#### 快取預熱策略

##### 策略一: 全量預熱

**原理**: 在系統啟動時,將所有常用資料一次性載入快取。

**實現步驟**:

```text
1. 系統啟動時,先不接收外部流量
2. 從資料庫批次讀取熱點資料
3. 依次寫入快取
4. 預熱完成後,開始接收流量
```

**範例 (概念性)**:

```go
// Go 語言示例: 全量預熱

func WarmUpCache(cache CacheClient, db DatabaseClient) error {
    log.Println("開始快取預熱...")
    
    // 1. 從資料庫查詢所有需要預熱的資料
    // 例如: 熱門商品、分類資訊、配置資料等
    hotProducts, err := db.QueryHotProducts(1000) // 前 1000 個熱門商品
    if err != nil {
        return fmt.Errorf("查詢熱門商品失敗: %w", err)
    }
    
    // 2. 批次寫入快取
    for _, product := range hotProducts {
        key := fmt.Sprintf("product:%d", product.ID)
        err := cache.Set(key, product, 1*time.Hour)
        if err != nil {
            log.Printf("預熱失敗: %s, 錯誤: %v", key, err)
            // 繼續預熱其他資料,不要因單個失敗而中斷
        }
    }
    
    log.Printf("快取預熱完成,共預熱 %d 個商品", len(hotProducts))
    return nil
}

func main() {
    cache := NewRedisClient()
    db := NewDatabaseClient()
    
    // 系統啟動時先預熱
    if err := WarmUpCache(cache, db); err != nil {
        log.Fatalf("快取預熱失敗: %v", err)
    }
    
    // 啟動 Web 服務
    StartWebServer()
}
```

**優點**:
- 實現簡單直觀
- 預熱完成後命中率立即達到最高
- 適合資料量可控的場景

**缺點**:
- 啟動時間長,影響服務可用性
- 記憶體壓力大,可能載入不必要的資料
- 不適合海量資料場景

**適用場景**:
- 資料量較小 (幾千到幾萬條)
- 核心資料明確且穩定
- 啟動時間不敏感的系統

##### 策略二: 增量預熱 (漸進式預熱)

**原理**: 系統啟動後立即接收流量,同時在後台**逐步預熱**熱點資料。

**實現步驟**:

```text
1. 系統啟動,立即開始接收流量
2. 啟動後台預熱任務
3. 根據優先級逐步載入資料
4. 用戶請求和預熱任務並行進行
```

**範例 (概念性)**:

```go
// Go 語言示例: 增量預熱

func IncrementalWarmUp(cache CacheClient, db DatabaseClient) {
    log.Println("開始增量預熱...")
    
    // 使用 Goroutine 在後台執行預熱
    go func() {
        // 1. 優先載入核心資料 (如首頁數據)
        warmUpHomePage(cache, db)
        
        // 2. 載入次級資料 (如熱門分類)
        warmUpCategories(cache, db)
        
        // 3. 載入其他資料 (分批次,避免瞬間壓力)
        warmUpProductsBatch(cache, db, 100) // 每批 100 個
        
        log.Println("增量預熱完成")
    }()
}

func warmUpProductsBatch(cache CacheClient, db DatabaseClient, batchSize int) {
    offset := 0
    for {
        products, err := db.QueryHotProducts(batchSize, offset)
        if err != nil || len(products) == 0 {
            break
        }
        
        for _, product := range products {
            key := fmt.Sprintf("product:%d", product.ID)
            cache.Set(key, product, 1*time.Hour)
        }
        
        offset += batchSize
        time.Sleep(100 * time.Millisecond) // 限流,避免過度壓迫資料庫
    }
}
```

**優點**:
- 啟動快速,不影響服務可用性
- 資料庫壓力平滑,不會瞬間暴增
- 可根據實際流量動態調整

**缺點**:
- 前期命中率較低
- 實現相對複雜

**適用場景**:
- 資料量較大
- 對啟動時間敏感
- 允許前期命中率較低

##### 策略三: 按需預熱 (Lazy Loading)

**原理**: 不主動預熱,完全依靠使用者請求來逐步填充快取。

**實現**: 標準的 Cache-Aside 模式:

```go
func GetProduct(id int, cache CacheClient, db DatabaseClient) (*Product, error) {
    key := fmt.Sprintf("product:%d", id)
    
    // 1. 嘗試從快取讀取
    if product, found := cache.Get(key); found {
        return product.(*Product), nil
    }
    
    // 2. 快取未命中,從資料庫讀取
    product, err := db.GetProduct(id)
    if err != nil {
        return nil, err
    }
    
    // 3. 寫入快取
    cache.Set(key, product, 1*time.Hour)
    
    return product, nil
}
```

**優點**:
- 實現最簡單
- 只快取實際被訪問的資料,記憶體利用率高
- 無啟動延遲

**缺點**:
- 冷啟動期間命中率為 0
- 資料庫會承受初期的流量衝擊

**適用場景**:
- 小型系統
- 流量低的應用
- 資料庫壓力不大

##### 策略四: 基於日誌預熱

**原理**: 根據歷史訪問日誌,統計熱點資料並預熱。

**實現步驟**:

```text
1. 分析前一天或前一週的訪問日誌
2. 統計訪問頻率最高的 Top N 資料
3. 在系統啟動時優先預熱這些資料
```

**範例**:

```go
// Go 語言示例: 基於日誌預熱

func WarmUpFromLogs(cache CacheClient, db DatabaseClient, logFile string) error {
    // 1. 分析日誌,統計熱點資料
    hotKeys := analyzeAccessLogs(logFile, 1000) // 取前 1000 個熱點
    
    // 2. 根據熱度排序,優先預熱最熱的資料
    sort.Slice(hotKeys, func(i, j int) bool {
        return hotKeys[i].AccessCount > hotKeys[j].AccessCount
    })
    
    // 3. 預熱熱點資料
    for _, hotKey := range hotKeys {
        data, err := db.Query(hotKey.Key)
        if err != nil {
            continue
        }
        cache.Set(hotKey.Key, data, 1*time.Hour)
    }
    
    return nil
}

func analyzeAccessLogs(logFile string, topN int) []HotKey {
    // 解析日誌,統計訪問頻率
    // 返回訪問頻率最高的 topN 個 key
    // 實現略...
    return []HotKey{}
}
```

**優點**:
- 精準預熱真正的熱點資料
- 資料驅動,適應性強

**缺點**:
- 需要收集和分析日誌
- 實現較複雜
- 對突發熱點反應慢

**適用場景**:
- 有完善的日誌系統
- 熱點資料相對穩定
- 大型系統

##### 策略五: 定時預熱 (Scheduled Warming)

**原理**: 在流量低谷期 (如凌晨),定時執行預熱任務。

**實現**:

```go
// Go 語言示例: 定時預熱

func ScheduledWarmUp(cache CacheClient, db DatabaseClient) {
    // 使用 cron 定時任務,在每天凌晨 3 點執行預熱
    c := cron.New()
    c.AddFunc("0 3 * * *", func() {
        log.Println("開始定時預熱...")
        WarmUpCache(cache, db)
        log.Println("定時預熱完成")
    })
    c.Start()
}
```

**優點**:
- 不影響高峰期效能
- 定期刷新快取,保持資料新鮮

**缺點**:
- 需要額外的排程系統
- 仍存在短暫的冷啟動窗口

**適用場景**:
- 有明顯的流量高峰和低谷
- 資料有一定時效性

### 快取更新策略

快取更新策略決定了如何保持快取資料的新鮮度,避免資料陳舊。

#### 更新策略對比

##### 策略一: 被動更新 (TTL 過期)

**原理**: 為快取設定過期時間 (TTL),過期後自動失效,下次訪問時重新載入。

**實現**:

```go
// 設定 1 小時過期
cache.Set("product:123", product, 1*time.Hour)
```

**優點**:
- 實現極為簡單
- 自動清理過期資料

**缺點**:
- 可能返回陳舊資料 (在過期前)
- 過期瞬間可能有大量請求未命中

**適用場景**:
- 對資料即時性要求不高
- 通用的快取場景

**TTL 設定建議**:

| 資料類型 | 建議 TTL | 理由 |
|---------|---------|------|
| 靜態配置 | 1 天~7 天 | 極少變更 |
| 商品詳情 | 1~6 小時 | 偶爾更新 |
| 使用者資訊 | 30 分鐘~1 小時 | 較少更新 |
| 熱點數據 | 5~30 分鐘 | 頻繁訪問,允許短暫過期 |
| 排行榜 | 1~10 分鐘 | 需要較高即時性 |

##### 策略二: 主動更新 (Write-Through)

**原理**: 更新資料庫時,同步更新快取。

**實現**:

```go
func UpdateProduct(id int, newData Product, cache CacheClient, db DatabaseClient) error {
    // 1. 更新資料庫
    if err := db.UpdateProduct(id, newData); err != nil {
        return err
    }
    
    // 2. 同步更新快取
    key := fmt.Sprintf("product:%d", id)
    if err := cache.Set(key, newData, 1*time.Hour); err != nil {
        log.Printf("更新快取失敗: %v", err)
        // 根據業務決定是否需要回滾資料庫
    }
    
    return nil
}
```

**優點**:
- 資料即時性高
- 讀取時總是能得到最新資料

**缺點**:
- 寫入延遲增加
- 如果快取更新失敗,需要處理一致性問題

**適用場景**:
- 對資料即時性要求高
- 寫入頻率不高

##### 策略三: 刪除快取 (Cache Invalidation)

**原理**: 更新資料庫後,刪除對應的快取,下次讀取時重新載入。

**實現**:

```go
func UpdateProductWithInvalidation(id int, newData Product, cache CacheClient, db DatabaseClient) error {
    // 1. 更新資料庫
    if err := db.UpdateProduct(id, newData); err != nil {
        return err
    }
    
    // 2. 刪除快取
    key := fmt.Sprintf("product:%d", id)
    if err := cache.Delete(key); err != nil {
        log.Printf("刪除快取失敗: %v", err)
    }
    
    return nil
}
```

**優點**:
- 實現簡單
- 避免快取更新失敗導致的不一致

**缺點**:
- 刪除後第一次讀取會未命中
- 可能增加資料庫壓力

**適用場景**:
- 通用場景,業界最常用 ⭐
- 更新頻率適中

##### 策略四: 定時刷新 (Scheduled Refresh)

**原理**: 在後台定時重新載入熱點資料。

**實現**:

```go
func RefreshHotProducts(cache CacheClient, db DatabaseClient) {
    // 每 10 分鐘刷新一次熱門商品
    ticker := time.NewTicker(10 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        products, err := db.QueryHotProducts(100)
        if err != nil {
            log.Printf("刷新失敗: %v", err)
            continue
        }
        
        for _, product := range products {
            key := fmt.Sprintf("product:%d", product.ID)
            cache.Set(key, product, 30*time.Minute)
        }
        
        log.Printf("已刷新 %d 個熱門商品", len(products))
    }
}
```

**優點**:
- 保證熱點資料始終新鮮
- 不依賴使用者請求觸發

**缺點**:
- 增加資料庫負載
- 可能刷新不需要的資料

**適用場景**:
- 明確的熱點資料
- 資料更新頻繁但不需即時

##### 策略五: 訂閱資料庫變更 (Binlog / CDC)

**原理**: 監聽資料庫的變更事件 (如 MySQL Binlog),自動同步到快取。

**實現流程**:

```text
1. 應用程式更新資料庫
2. MySQL 產生 Binlog
3. Canal/Debezium 訂閱 Binlog
4. 解析變更事件
5. 自動更新或刪除快取
```

**優點**:
- 與業務邏輯完全解耦
- 不會遺漏任何資料變更
- 即時性高

**缺點**:
- 架構複雜,需要額外中間件
- 運維成本高
- 存在毫秒級延遲

**適用場景**:
- 大型分散式系統
- 需要多個系統同步資料
- 有專職運維團隊

### 快取更新的最佳實踐

#### 1. 過期時間加隨機值

避免大量快取同時過期引發雪崩:

```go
// 在基礎過期時間上加隨機值
baseExpiration := 1 * time.Hour
randomSeconds := rand.Intn(300) // 0~300 秒隨機值
expiration := baseExpiration + time.Duration(randomSeconds)*time.Second

cache.Set(key, value, expiration)
```

#### 2. 雙重過期時間 (物理 + 邏輯)

```go
type CachedData struct {
    Value      interface{}
    ExpireAt   time.Time    // 邏輯過期時間
    HardExpire time.Time    // 物理過期時間 (留緩衝)
}

func GetWithDoubleExpiration(key string) (interface{}, error) {
    data, found := cache.Get(key)
    if !found {
        return reloadFromDB(key)
    }
    
    cached := data.(*CachedData)
    
    // 檢查邏輯過期時間
    if time.Now().After(cached.ExpireAt) {
        // 已邏輯過期,異步刷新
        go reloadFromDB(key)
        // 但仍返回舊資料,避免穿透
        return cached.Value, nil
    }
    
    return cached.Value, nil
}
```

#### 3. 分級快取策略

不同重要性的資料使用不同的更新策略:

| 資料級別 | 更新策略 | TTL | 理由 |
|---------|---------|-----|------|
| 核心資料 | 定時刷新 | 30 分鐘 | 必須保持新鮮 |
| 熱點資料 | 主動刪除 | 1 小時 | 更新後立即失效 |
| 普通資料 | TTL 過期 | 6 小時 | 降低系統負擔 |
| 冷門資料 | TTL 過期 | 24 小時 | 減少記憶體佔用 |

#### 4. 快取更新失敗的處理

```go
func UpdateWithRetry(key string, value interface{}, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        err := cache.Set(key, value, 1*time.Hour)
        if err == nil {
            return nil
        }
        
        lastErr = err
        time.Sleep(time.Duration(i*100) * time.Millisecond) // 指數退避
    }
    
    // 更新失敗,記錄告警
    alerting.Send("快取更新失敗", fmt.Sprintf("key: %s, error: %v", key, lastErr))
    
    return lastErr
}
```

### 常見面試考點

#### Q1: 系統啟動時應該如何進行快取預熱?

**答案**: 根據系統規模選擇策略:
- **小型系統**: 全量預熱,啟動時一次性載入所有熱點資料
- **中型系統**: 增量預熱,優先載入核心資料,其他資料後台逐步載入
- **大型系統**: 基於日誌預熱,分析歷史訪問記錄,精準預熱真正的熱點

**關鍵**: 避免冷啟動導致的資料庫壓力,但也要控制預熱時間,不能無限延長啟動時間。

#### Q2: 更新資料庫後,應該更新快取還是刪除快取?

**答案**: **優先刪除快取**,原因:
- 刪除更簡單,不易出錯
- 避免更新失敗導致的不一致
- 下次讀取時自動載入最新資料

只有在對即時性要求極高的場景下,才考慮主動更新快取。

#### Q3: 如何避免快取預熱導致的資料庫壓力?

**答案**:
1. **分批次預熱**: 不要一次性讀取所有資料,分批讀取並限流
2. **延遲執行**: 每批次之間加入短暫延遲 (如 100ms)
3. **非高峰期預熱**: 在凌晨等流量低谷期執行
4. **只讀副本**: 從資料庫的只讀副本 (Slave) 讀取預熱資料,不影響主庫

#### Q4: 快取的 TTL 應該設定多久?

**答案**: 根據資料特性決定:
- **靜態配置**: 1 天~7 天 (極少變更)
- **商品詳情**: 1~6 小時 (偶爾更新)
- **使用者資訊**: 30 分鐘~1 小時 (較少更新)
- **實時數據**: 1~10 分鐘 (需要較高即時性)

**原則**: 在資料新鮮度和快取命中率之間權衡,並加入隨機值避免雪崩。

#### Q5: 定時刷新快取和被動過期哪個更好?

**答案**: **視場景而定**:
- **定時刷新**: 適合明確的熱點資料,保證始終新鮮,但增加資料庫負載
- **被動過期**: 適合通用場景,實現簡單,但可能返回陳舊資料

**實務中常見做法**: 結合使用 - 核心熱點資料定時刷新,普通資料被動過期。

### 總結

**快取預熱策略選擇**:
- 資料量小 → 全量預熱
- 資料量大 → 增量預熱或基於日誌預熱
- 啟動敏感 → 按需預熱 (Lazy Loading)

**快取更新策略選擇**:
- 通用場景 → TTL 過期 + 刪除快取 ⭐
- 即時性高 → 主動更新或定時刷新
- 大型系統 → Binlog 訂閱 (CDC)

**核心原則**: 
1. 預熱要控制節奏,避免壓垮資料庫
2. 更新優先刪除,簡單可靠
3. TTL 加隨機值,避免雪崩
4. 分級管理,核心資料特殊對待
