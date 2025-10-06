# 如何設計秒殺系統？

- **難度**: 9
- **重要程度**: 5
- **標籤**: `系統設計`, `秒殺`, `高並行`, `庫存扣減`, `超賣問題`

## 問題詳述

設計一個秒殺系統,支援在極短時間內(如 10 秒)處理數百萬使用者對少量商品(如 1000 件)的搶購請求。系統需要保證庫存準確、不超賣、高可用,並且能夠承受瞬間流量沖擊。

## 核心理論與詳解

### 1. 秒殺系統的特點

#### 1.1 業務特點

**瞬時高並行**:
```
正常: 1000 QPS
秒殺開始: 100,000+ QPS (100倍+)
持續時間: 數秒到數十秒
```

**讀多寫少**:
```
讀請求(查詢): 99.9%
寫請求(下單): 0.1%
實際成功下單: 0.01% (1000件/100萬請求)
```

**庫存有限**:
```
商品數量: 100 ~ 10,000 件
請求數量: 數十萬 ~ 數百萬
競爭激烈: 成功率 < 1%
```

#### 1.2 技術挑戰

**1. 瞬時流量沖擊**:
- 正常流量的 100~1000 倍
- 需要極強的擴展能力

**2. 庫存超賣問題**:
- 並行扣減庫存容易出錯
- 需要強一致性保證

**3. 惡意請求**:
- 腳本攻擊
- 黃牛搶購
- DDoS 攻擊

**4. 系統穩定性**:
- 數據庫壓力
- 快取擊穿
- 服務雪崩

### 2. 需求澄清

#### 2.1 功能性需求

**核心功能**:
- ✅ 使用者可以查看秒殺商品列表
- ✅ 使用者可以在秒殺時間內下單
- ✅ 系統保證庫存準確,不超賣
- ✅ 支援訂單支付和取消

**延伸功能**:
- 秒殺前的提醒通知
- 防刷機制(驗證碼、限流)
- 訂單超時自動取消
- 黑名單和風控

#### 2.2 非功能性需求

**效能**:
- 支援 100,000+ QPS
- 回應時間 < 100ms
- 庫存扣減準確率 100%

**可用性**:
- 系統高可用 99.9%+
- 秒殺失敗不影響正常業務

**安全性**:
- 防止惡意刷單
- 防止黃牛搶購
- 防止超賣

### 3. 容量估算

#### 3.1 流量估算

**假設**:
- 參與秒殺使用者: 100 萬
- 秒殺時長: 10 秒
- 商品數量: 1000 件

**計算**:
```
峰值 QPS:
- 請求總數: 100 萬
- 時長: 10 秒
- QPS: 1,000,000 / 10 = 100,000 QPS

實際 QPS 可能更高(前 1-2 秒):
- 峰值: 200,000 ~ 500,000 QPS
```

#### 3.2 成功率

```
總請求: 1,000,000
商品數量: 1,000
成功率: 1,000 / 1,000,000 = 0.1%

即: 99.9% 的請求注定失敗
```

### 4. 核心架構設計

#### 4.1 整體架構圖

```
                  ┌──────────────┐
                  │   Client     │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │   CDN        │
                  │ (靜態資源)    │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ Load Balancer│
                  │  (Nginx)     │
                  └──────┬───────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
     ┌──────▼──────┐ ┌──▼──────┐ ┌──▼──────┐
     │   API       │ │  API    │ │  API    │
     │  Gateway    │ │ Gateway │ │ Gateway │
     └──────┬──────┘ └──┬──────┘ └──┬──────┘
            │           │           │
            └───────────┼───────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │Seckill  │   │ Order   │   │Product  │
    │Service  │   │Service  │   │Service  │
    └────┬────┘   └────┬────┘   └────┬────┘
         │             │             │
    ┌────▼────────────▼─────────────▼────┐
    │           Redis Cluster             │
    │  - 庫存扣減                          │
    │  - 熱點快取                          │
    │  - 分散式鎖                          │
    └────┬────────────┬─────────────┬────┘
         │            │             │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
    │  MQ     │  │  MQ     │  │  MQ     │
    │(Kafka)  │  │(Kafka)  │  │(Kafka)  │
    └────┬────┘  └────┬────┘  └────┬────┘
         │            │             │
         └────────────┼─────────────┘
                      │
              ┌───────▼────────┐
              │ Order Worker   │
              │ (非同步寫入DB)  │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │  MySQL Cluster │
              │  (主從複製)     │
              └────────────────┘
```

#### 4.2 核心組件

**1. 限流層**:
- 入口限流(Nginx)
- 閘道限流(令牌桶)
- 服務限流(Sentinel)

**2. 庫存扣減層**:
- Redis 原子操作
- Lua 腳本保證原子性
- 預扣庫存機制

**3. 非同步處理層**:
- Kafka 訊息佇列
- 削峰填谷
- 非同步寫資料庫

**4. 儲存層**:
- Redis 快取熱點資料
- MySQL 持久化訂單
- 主從分離

### 5. 庫存扣減方案 (核心難點)

#### 5.1 方案對比

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| **MySQL 行鎖** | 實現簡單 | 效能差,容易死鎖 | 低並行 |
| **Redis 原子操作** | 效能高,支援高並行 | 需要處理快取與資料庫同步 | 秒殺系統(推薦) |
| **分散式鎖** | 保證一致性 | 效能較差,實現複雜 | 中等並行 |
| **訊息佇列** | 削峰填谷 | 延遲較高 | 非即時場景 |

#### 5.2 MySQL 行鎖方案 (不推薦)

**實現**:
```sql
-- 悲觀鎖
BEGIN;
SELECT stock FROM products WHERE product_id = 123 FOR UPDATE;
-- 檢查庫存
UPDATE products SET stock = stock - 1 WHERE product_id = 123 AND stock > 0;
COMMIT;

-- 樂觀鎖
UPDATE products 
SET stock = stock - 1, version = version + 1 
WHERE product_id = 123 AND stock > 0 AND version = ?;
```

**問題**:
- ❌ 資料庫壓力巨大(100,000 QPS)
- ❌ 容易死鎖
- ❌ 回應時間長

#### 5.3 Redis 原子操作方案 (推薦)

**方案 1: DECR 命令**

```go
func DecrStock(productID int64) (bool, error) {
    key := fmt.Sprintf("seckill:stock:%d", productID)
    
    // Redis DECR 是原子操作
    result, err := redis.Decr(key).Result()
    if err != nil {
        return false, err
    }
    
    // 檢查是否扣減成功
    if result < 0 {
        // 庫存不足,回滾
        redis.Incr(key)
        return false, errors.New("sold out")
    }
    
    return true, nil
}
```

**方案 2: Lua 腳本 (最推薦)**

```lua
-- stock_decr.lua
local key = KEYS[1]
local quantity = tonumber(ARGV[1])

-- 獲取當前庫存
local stock = tonumber(redis.call('GET', key))

if stock == nil then
    return -1  -- 商品不存在
end

if stock < quantity then
    return 0  -- 庫存不足
end

-- 扣減庫存
redis.call('DECRBY', key, quantity)
return 1  -- 成功
```

**Go 實現**:
```go
var luaScript = `
local key = KEYS[1]
local stock = tonumber(redis.call('GET', key))
if stock == nil or stock <= 0 then
    return 0
end
redis.call('DECR', key)
return 1
`

func DecrStockWithLua(productID int64, userID int64) (bool, error) {
    key := fmt.Sprintf("seckill:stock:%d", productID)
    
    // 執行 Lua 腳本(原子操作)
    result, err := redis.Eval(luaScript, []string{key}).Int()
    if err != nil {
        return false, err
    }
    
    if result == 0 {
        return false, errors.New("sold out")
    }
    
    // 扣減成功,建立預訂單
    CreatePreOrder(productID, userID)
    
    return true, nil
}
```

**優勢**:
- ✅ 原子性保證
- ✅ 效能極高 (10萬+ QPS)
- ✅ 避免超賣

#### 5.4 預扣庫存 + 非同步下單

**流程**:
```
1. 使用者點擊秒殺
   ↓
2. Redis 扣減庫存(同步)
   ↓ (成功)
3. 返回"搶購成功"
   ↓
4. 發送訊息到 Kafka(非同步)
   ↓
5. Worker 消費訊息
   ↓
6. 建立訂單寫入資料庫
   ↓
7. 扣減 MySQL 庫存(最終一致)
```

**實現**:
```go
// 秒殺服務
func Seckill(productID, userID int64) error {
    // 1. 檢查使用者是否已經搶購過
    if HasPurchased(userID, productID) {
        return errors.New("already purchased")
    }
    
    // 2. Redis 扣減庫存
    success, err := DecrStockWithLua(productID, userID)
    if !success {
        return errors.New("sold out")
    }
    
    // 3. 記錄搶購資格
    SetPurchased(userID, productID)
    
    // 4. 發送訊息到 Kafka(非同步建立訂單)
    kafka.Publish("order.create", OrderMessage{
        ProductID: productID,
        UserID:    userID,
        Timestamp: time.Now().Unix(),
    })
    
    return nil
}

// 訂單 Worker
func OrderWorker() {
    for msg := range kafka.Consume("order.create") {
        order := msg.(OrderMessage)
        
        // 建立訂單
        orderID := CreateOrder(order.ProductID, order.UserID)
        
        // 扣減資料庫庫存(冪等)
        DecrDBStock(order.ProductID, 1)
        
        // 發送訂單通知
        SendOrderNotification(order.UserID, orderID)
    }
}
```

### 6. 限流策略

#### 6.1 多層限流

**1. 前端限流**:
```javascript
// 按鈕置灰,防止重複提交
let clicked = false;

function seckill() {
    if (clicked) return;
    clicked = true;
    
    // 發送請求
    fetch('/api/seckill')
        .finally(() => {
            // 3 秒後才能再次點擊
            setTimeout(() => {
                clicked = false;
            }, 3000);
        });
}
```

**2. Nginx 限流**:
```nginx
# 限制每個 IP 每秒 10 個請求
limit_req_zone $binary_remote_addr zone=seckill:10m rate=10r/s;

location /api/seckill {
    limit_req zone=seckill burst=20 nodelay;
    proxy_pass http://backend;
}
```

**3. 閘道限流(令牌桶)**:
```go
import "golang.org/x/time/rate"

// 全局限流: 100,000 QPS
var globalLimiter = rate.NewLimiter(100000, 100000)

func SeckillHandler(w http.ResponseWriter, r *http.Request) {
    // 嘗試獲取令牌
    if !globalLimiter.Allow() {
        http.Error(w, "Too many requests", http.StatusTooManyRequests)
        return
    }
    
    // 處理請求
    Seckill(productID, userID)
}
```

**4. 使用者維度限流**:
```go
// 每個使用者每秒最多 5 次請求
var userLimiters = sync.Map{}

func GetUserLimiter(userID int64) *rate.Limiter {
    limiter, exists := userLimiters.Load(userID)
    if !exists {
        limiter = rate.NewLimiter(5, 5)
        userLimiters.Store(userID, limiter)
    }
    return limiter.(*rate.Limiter)
}

func SeckillWithUserLimit(userID, productID int64) error {
    limiter := GetUserLimiter(userID)
    
    if !limiter.Allow() {
        return errors.New("rate limit exceeded")
    }
    
    return Seckill(productID, userID)
}
```

#### 6.2 漏桶 vs 令牌桶

| 演算法 | 特點 | 適用場景 |
|-------|------|---------|
| **漏桶** | 固定速率處理,平滑流量 | 保護後端穩定 |
| **令牌桶** | 允許突發流量,更靈活 | 秒殺場景(推薦) |

### 7. 防刷機制

#### 7.1 驗證碼

**目的**: 增加攻擊成本,防止腳本刷單。

**實現**:
```go
// 秒殺前需要先完成驗證碼
func Seckill(productID, userID int64, captchaCode string) error {
    // 1. 驗證驗證碼
    if !VerifyCaptcha(userID, captchaCode) {
        return errors.New("invalid captcha")
    }
    
    // 2. 繼續秒殺邏輯
    // ...
}
```

**動態驗證碼**:
- 滑塊驗證
- 行為驗證(軌跡分析)
- 圖片點選驗證

#### 7.2 限制購買次數

**Redis 記錄**:
```go
func HasPurchased(userID, productID int64) bool {
    key := fmt.Sprintf("seckill:purchased:%d:%d", productID, userID)
    exists, _ := redis.Exists(key).Result()
    return exists > 0
}

func SetPurchased(userID, productID int64) {
    key := fmt.Sprintf("seckill:purchased:%d:%d", productID, userID)
    // 設定 24 小時過期
    redis.Set(key, 1, 24*time.Hour)
}
```

#### 7.3 黑名單機制

**識別異常行為**:
```go
func CheckAbnormal(userID int64) bool {
    // 1. 檢查請求頻率
    reqCount := GetUserRequestCount(userID, 1*time.Minute)
    if reqCount > 100 {
        AddToBlacklist(userID)
        return true
    }
    
    // 2. 檢查是否在黑名單
    if IsInBlacklist(userID) {
        return true
    }
    
    return false
}
```

#### 7.4 風控系統

**多維度檢測**:
```go
type RiskScorer struct{}

func (r *RiskScorer) CalculateRisk(userID int64) int {
    score := 0
    
    // 1. 帳號註冊時間
    if GetAccountAge(userID) < 7*24*time.Hour {
        score += 20
    }
    
    // 2. 請求頻率
    if GetRequestRate(userID) > 10 {
        score += 30
    }
    
    // 3. 設備指紋
    if IsSuspiciousDevice(userID) {
        score += 25
    }
    
    // 4. IP 地理位置
    if IsSuspiciousIP(userID) {
        score += 25
    }
    
    return score
}

func AllowSeckill(userID int64) bool {
    score := riskScorer.CalculateRisk(userID)
    
    // 分數 > 60 視為高風險
    if score > 60 {
        return false
    }
    
    return true
}
```

### 8. 快取策略

#### 8.1 頁面靜態化

**商品詳情頁靜態化**:
```
秒殺開始前:
- 將商品頁面生成靜態 HTML
- 上傳到 CDN
- 使用者直接從 CDN 獲取

優點:
- 減少伺服器壓力
- 加快載入速度
```

#### 8.2 Redis 快取預熱

**秒殺開始前預載**:
```go
func WarmupCache(productID int64) {
    // 1. 從資料庫載入商品資訊
    product := db.GetProduct(productID)
    
    // 2. 寫入 Redis
    redis.Set(
        fmt.Sprintf("product:%d", productID),
        json.Marshal(product),
        24*time.Hour,
    )
    
    // 3. 初始化庫存
    redis.Set(
        fmt.Sprintf("seckill:stock:%d", productID),
        product.Stock,
        24*time.Hour,
    )
}
```

#### 8.3 本地快取

**應用程式層快取**:
```go
import "github.com/patrickmn/go-cache"

var localCache = cache.New(5*time.Minute, 10*time.Minute)

func GetProduct(productID int64) (*Product, error) {
    // 1. 本地快取
    if val, found := localCache.Get(fmt.Sprintf("product:%d", productID)); found {
        return val.(*Product), nil
    }
    
    // 2. Redis
    product, err := GetProductFromRedis(productID)
    if err == nil {
        localCache.Set(fmt.Sprintf("product:%d", productID), product, cache.DefaultExpiration)
        return product, nil
    }
    
    // 3. 資料庫
    product, err = GetProductFromDB(productID)
    if err == nil {
        localCache.Set(fmt.Sprintf("product:%d", productID), product, cache.DefaultExpiration)
        redis.Set(fmt.Sprintf("product:%d", productID), product, 1*time.Hour)
    }
    
    return product, err
}
```

### 9. 訂單處理流程

#### 9.1 完整流程

```
1. 使用者點擊搶購
   ↓
2. 前端限流(防止重複點擊)
   ↓
3. Nginx 限流
   ↓
4. API Gateway 限流 + 驗證碼
   ↓
5. 風控檢查
   ↓
6. Redis 扣減庫存(原子操作)
   ↓ (成功)
7. 建立預訂單(Redis)
   ↓
8. 返回"搶購成功"給使用者
   ↓
9. 發送訊息到 Kafka
   ↓
10. Worker 消費訊息
    ↓
11. 建立正式訂單(MySQL)
    ↓
12. 扣減資料庫庫存
    ↓
13. 發送訂單通知
```

#### 9.2 訂單超時取消

**問題**: 使用者搶購成功但未支付,需要釋放庫存。

**方案 1: 延遲訊息 (Kafka)**

```go
// 建立訂單時發送延遲訊息
func CreateOrder(order Order) {
    // 1. 建立訂單
    db.Insert(order)
    
    // 2. 發送 30 分鐘後的延遲訊息
    kafka.PublishDelayed("order.timeout", order.ID, 30*time.Minute)
}

// Worker 處理超時訂單
func TimeoutWorker() {
    for msg := range kafka.Consume("order.timeout") {
        orderID := msg.(int64)
        
        // 檢查訂單狀態
        order := db.GetOrder(orderID)
        
        if order.Status == "unpaid" {
            // 取消訂單
            CancelOrder(orderID)
            
            // 回滾庫存
            redis.Incr(fmt.Sprintf("seckill:stock:%d", order.ProductID))
        }
    }
}
```

**方案 2: Redis 過期鍵 + Key Space Notification**

```go
// 建立訂單時設定過期鍵
func CreateOrder(order Order) {
    db.Insert(order)
    
    // Redis 過期鍵
    key := fmt.Sprintf("order:timeout:%d", order.ID)
    redis.Set(key, order.ID, 30*time.Minute)
}

// 監聽過期事件
func ListenExpiredKeys() {
    pubsub := redis.Subscribe("__keyevent@0__:expired")
    
    for msg := range pubsub.Channel() {
        if strings.HasPrefix(msg.Payload, "order:timeout:") {
            orderID := ExtractOrderID(msg.Payload)
            
            // 處理超時訂單
            CancelOrderIfUnpaid(orderID)
        }
    }
}
```

### 10. 資料一致性

#### 10.1 Redis 與 MySQL 一致性

**問題**: Redis 扣減成功但 MySQL 寫入失敗。

**解決方案**:

**1. 最終一致性 (推薦)**

```
Redis 為主,MySQL 為輔
- Redis 扣減庫存(即時)
- MySQL 非同步更新(最終一致)
- 定時任務校對(修復不一致)
```

**2. 定時校對**

```go
func ReconcileStock() {
    ticker := time.NewTicker(5 * time.Minute)
    
    for range ticker.C {
        products := GetSeckillProducts()
        
        for _, product := range products {
            // Redis 庫存
            redisStock := redis.Get(
                fmt.Sprintf("seckill:stock:%d", product.ID),
            ).Int()
            
            // MySQL 庫存
            dbStock := db.GetStock(product.ID)
            
            // 不一致則修復
            if redisStock != dbStock {
                log.Warn("Stock mismatch", product.ID, redisStock, dbStock)
                
                // 以 Redis 為準
                db.UpdateStock(product.ID, redisStock)
            }
        }
    }
}
```

#### 10.2 分散式事務

**Saga 模式**:

```go
// 分散式事務協調器
func SeckillSaga(productID, userID int64) error {
    saga := NewSaga()
    
    // Step 1: 扣減 Redis 庫存
    saga.AddStep(
        func() error {
            return DecrRedisStock(productID)
        },
        func() error {
            return IncrRedisStock(productID) // 回滾
        },
    )
    
    // Step 2: 建立訂單
    saga.AddStep(
        func() error {
            return CreateOrder(productID, userID)
        },
        func() error {
            return CancelOrder(orderID) // 回滾
        },
    )
    
    // Step 3: 扣減資料庫庫存
    saga.AddStep(
        func() error {
            return DecrDBStock(productID)
        },
        func() error {
            return IncrDBStock(productID) // 回滾
        },
    )
    
    // 執行 Saga
    return saga.Execute()
}
```

### 11. 效能優化

#### 11.1 資料庫優化

**1. 讀寫分離**:
```
Master: 寫入訂單
Slave: 查詢訂單狀態
```

**2. 索引優化**:
```sql
-- 訂單表索引
CREATE INDEX idx_user_product ON orders(user_id, product_id);
CREATE INDEX idx_status_created ON orders(status, created_at);
```

**3. 分庫分表**:
```
按商品 ID 分庫:
- seckill_db_0 (product_id % 4 == 0)
- seckill_db_1 (product_id % 4 == 1)
- seckill_db_2 (product_id % 4 == 2)
- seckill_db_3 (product_id % 4 == 3)
```

#### 11.2 Redis 優化

**1. Redis Cluster**:
```
16 個 Master 節點
每個 Master 有 2 個 Slave
提供高可用和水平擴展
```

**2. Pipeline 批次操作**:
```go
func BatchDecrStock(productIDs []int64) {
    pipe := redis.Pipeline()
    
    for _, productID := range productIDs {
        key := fmt.Sprintf("seckill:stock:%d", productID)
        pipe.Decr(key)
    }
    
    pipe.Exec()
}
```

**3. 連線池**:
```go
redisPool := &redis.Pool{
    MaxIdle:     100,
    MaxActive:   10000,
    IdleTimeout: 240 * time.Second,
}
```

#### 11.3 非同步化

**所有非核心操作都非同步**:

```go
func Seckill(productID, userID int64) error {
    // 1. 同步操作: 扣減庫存
    success := DecrStock(productID)
    if !success {
        return errors.New("sold out")
    }
    
    // 2. 同步操作: 建立預訂單
    preOrderID := CreatePreOrder(productID, userID)
    
    // 3. 非同步操作: 發送訊息
    go kafka.Publish("order.create", OrderMsg{...})
    
    // 4. 非同步操作: 記錄日誌
    go logger.Info("seckill success", productID, userID)
    
    // 5. 非同步操作: 發送通知
    go SendNotification(userID, "success")
    
    return nil
}
```

### 12. 監控與告警

#### 12.1 關鍵指標

**業務指標**:
```
- 秒殺 QPS
- 成功率(下單成功 / 總請求)
- 庫存剩餘
- 超賣數量(應為 0)
```

**系統指標**:
```
- Redis 命中率
- Kafka 延遲
- 資料庫連線數
- API 回應時間(P99)
```

#### 12.2 告警規則

```yaml
alerts:
  - name: HighQPS
    condition: qps > 200000
    action: 啟動限流
    
  - name: StockOversold
    condition: redis_stock < mysql_stock
    action: 立即停止秒殺
    
  - name: KafkaLag
    condition: consumer_lag > 10000
    action: 擴容 Worker
```

## 常見面試考點

### Q1:如何防止庫存超賣?

**答案**:

超賣是秒殺系統最嚴重的問題,有多種防範方案:

**1. Redis 原子操作 (推薦)**

```lua
-- Lua 腳本保證原子性
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock <= 0 then
    return 0
end
redis.call('DECR', KEYS[1])
return 1
```

**優點**: 效能高,100% 防止超賣

**2. MySQL 樂觀鎖**

```sql
UPDATE products 
SET stock = stock - 1, version = version + 1
WHERE product_id = ? AND stock > 0 AND version = ?
```

**優點**: 實現簡單
**缺點**: 效能差,大量請求失敗重試

**3. 分散式鎖**

```go
func DecrStockWithLock(productID int64) bool {
    lock := redis.NewLock("lock:stock:" + productID)
    
    if lock.Acquire(5 * time.Second) {
        defer lock.Release()
        
        stock := GetStock(productID)
        if stock > 0 {
            DecrStock(productID)
            return true
        }
    }
    
    return false
}
```

**優點**: 保證一致性
**缺點**: 效能較差

**4. 預扣庫存 + 補償**

```
1. Redis 預扣庫存
2. 非同步寫入資料庫
3. 定時校對,發現不一致則補償
```

**推薦方案**: **Redis Lua 腳本 + 定時校對**

### Q2:如何應對瞬時高並行?

**答案**:

秒殺的瞬時流量可能是平時的 100~1000 倍,需要多層防護:

**1. 前端限流**

```javascript
// 防止重複點擊
let processing = false;

function seckill() {
    if (processing) return;
    processing = true;
    
    fetch('/api/seckill')
        .finally(() => {
            setTimeout(() => {
                processing = false;
            }, 3000);
        });
}
```

**2. CDN + 頁面靜態化**

```
商品詳情頁 → 靜態 HTML → CDN
減少 90%+ 的伺服器請求
```

**3. 限流(多層)**

```
Nginx 限流: 每 IP 10 req/s
Gateway 限流: 全局 100,000 req/s
使用者限流: 每使用者 5 req/s
```

**4. 非同步處理**

```
同步: Redis 扣庫存 (0.1ms)
非同步: 建立訂單 (100ms)

回應時間從 100ms 降到 1ms
```

**5. 削峰填谷(Kafka)**

```
秒殺服務 → Kafka (緩衝) → 訂單服務
將瞬時 10 萬 QPS 削減到 1 萬 QPS
```

**6. 水平擴展**

```
提前擴容:
- API 伺服器: 10 → 100 台
- Redis: 單機 → Cluster
- Kafka: 增加 partition
```

### Q3:如何防止黃牛和腳本刷單?

**答案**:

**1. 驗證碼**

```
秒殺前 1 分鐘:
- 彈出滑塊驗證碼
- 增加攻擊成本
- 人機識別
```

**2. 限制購買次數**

```go
// 每個使用者只能搶購一次
func CheckPurchaseLimit(userID, productID int64) bool {
    key := fmt.Sprintf("seckill:limit:%d:%d", productID, userID)
    return redis.Exists(key) == 0
}
```

**3. 風控系統**

```go
func RiskCheck(userID int64) bool {
    score := 0
    
    // 帳號年齡
    if AccountAge(userID) < 7*24*time.Hour {
        score += 30
    }
    
    // 請求頻率
    if RequestRate(userID) > 10/s {
        score += 40
    }
    
    // 設備指紋
    if DuplicateDevice(userID) {
        score += 30
    }
    
    return score < 60 // 風險分數閾值
}
```

**4. 實名認證**

```
強制實名認證
手機號驗證
防止一人多號
```

**5. 黑名單**

```go
// 識別異常行為
if IsAbnormal(userID) {
    AddToBlacklist(userID, 24*time.Hour)
}

// 秒殺前檢查
if InBlacklist(userID) {
    return errors.New("forbidden")
}
```

**6. 行為分析**

```
機器學習識別:
- 點擊模式
- 滑鼠軌跡
- 瀏覽時長
- 設備指紋
```

### Q4:秒殺結束後如何處理剩餘庫存?

**答案**:

**情況 1: 正常庫存耗盡**

```
Redis 庫存 = 0
MySQL 庫存 = 0
一切正常
```

**情況 2: 有剩餘庫存**

原因可能是:
- 使用者下單後未支付
- 風控攔截了部分請求
- 系統限流導致未充分消費

**處理方案**:

**1. 開放剩餘庫存**

```go
func OpenRemainingStock(productID int64) {
    // 1. 統計剩餘庫存
    remaining := redis.Get("seckill:stock:" + productID).Int()
    
    if remaining > 0 {
        // 2. 轉為普通商品
        product := db.GetProduct(productID)
        product.Stock = remaining
        product.Type = "normal"
        db.Update(product)
        
        // 3. 通知使用者
        NotifyUsers("剩餘庫存開放")
    }
}
```

**2. 二次秒殺**

```
12:00 第一次秒殺(1000 件)
13:00 第二次秒殺(剩餘庫存)
```

**3. 訂單超時釋放**

```go
// 30 分鐘未支付,釋放庫存
func ReleaseStock(orderID int64) {
    order := db.GetOrder(orderID)
    
    if order.Status == "unpaid" {
        // 取消訂單
        CancelOrder(orderID)
        
        // 回滾庫存
        redis.Incr("seckill:stock:" + order.ProductID)
        db.IncrStock(order.ProductID)
    }
}
```

### Q5:Redis 宕機怎麼辦?

**答案**:

Redis 是秒殺系統的核心,需要高可用方案:

**1. Redis Cluster (推薦)**

```
16 個 Master 節點
每個 Master 有 2 個 Slave
自動故障轉移
```

**架構**:
```
Master 1 → Slave 1-1, Slave 1-2
Master 2 → Slave 2-1, Slave 2-2
...
Master 16 → Slave 16-1, Slave 16-2
```

**2. Sentinel 哨兵模式**

```
Master
  ↓ 複製
Slave 1, Slave 2, Slave 3
  ↑ 監控
Sentinel 1, Sentinel 2, Sentinel 3
```

**3. 持久化**

```bash
# RDB: 定期快照
save 900 1
save 300 10
save 60 10000

# AOF: 操作日誌
appendonly yes
appendfsync everysec
```

**4. 降級方案**

```go
func Seckill(productID, userID int64) error {
    // 嘗試 Redis
    success, err := DecrRedisStock(productID)
    
    if err != nil {
        // Redis 失敗,降級到資料庫
        log.Error("Redis down, fallback to DB")
        return SeckillWithDB(productID, userID)
    }
    
    return nil
}
```

**5. 監控告警**

```yaml
alerts:
  - name: RedisDown
    condition: redis_unavailable
    action: 
      - 自動切換到 Slave
      - 通知運維
      - 啟動降級方案
```

**最佳實踐**:
- 使用 Redis Cluster
- 雙中心部署(異地容災)
- 定期演練故障切換

## 總結

秒殺系統是高並行系統設計的經典案例,涵蓋了:

**核心挑戰**:
1. **瞬時高並行**: 100~1000 倍流量沖擊
2. **庫存準確性**: 100% 防止超賣
3. **系統穩定性**: 秒殺失敗不影響正常業務
4. **安全防護**: 防止黃牛和腳本攻擊

**關鍵技術**:
- **Redis Lua 腳本**: 原子性扣減庫存
- **Kafka**: 非同步處理,削峰填谷
- **限流**: 多層限流(前端、Nginx、Gateway、服務)
- **快取**: CDN、Redis、本地快取
- **非同步**: 預扣庫存 + 非同步下單

**設計原則**:
- **能不做就不做**: 99.9% 請求注定失敗,快速拒絕
- **非同步化**: 同步做核心操作,非同步做其他
- **多層防護**: 限流、降級、熔斷
- **最終一致性**: Redis 為主,MySQL 為輔

掌握秒殺系統設計,對理解高並行、分散式系統有極大幫助!
