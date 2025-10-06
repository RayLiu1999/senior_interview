# API 限流與降級策略

- **難度**: 7
- **重要程度**: 5
- **標籤**: `API`, `限流`, `降級`, `Rate Limiting`, `熔斷器`

## 問題詳述

在高併發場景下，API 可能面臨過載風險。限流和降級是保護系統穩定性的重要手段。理解各種限流算法、降級策略和熔斷機制，是資深後端工程師必備的技能。

## 核心理論與詳解

### 為什麼需要限流

```
問題場景：
1. 突發流量（如促銷活動）
   - 正常：1000 req/s
   - 突發：10000 req/s
   - 結果：系統崩潰

2. 惡意攻擊（DDoS）
   - 大量無效請求
   - 耗盡系統資源

3. 資源保護
   - 保護資料庫
   - 保護第三方 API
   - 防止雪崩效應

限流目標：
✅ 保護系統不過載
✅ 保證核心功能可用
✅ 提供公平的資源分配
```

---

### 限流算法

#### 1. 固定窗口計數器（Fixed Window Counter）

```
原理：
在固定時間窗口內統計請求數，超過閾值則拒絕。

時間軸：
0s      1s      2s      3s      4s
│───────│───────│───────│───────│
   100     150     80      120  (請求數)
   ✅      ❌      ✅      ✅   (限制 100 req/s)

實現：
requests_count[window] += 1
if requests_count[window] > limit:
    reject()

優勢：
- 實現簡單
- 記憶體佔用少

劣勢：
- 臨界問題（Boundary Issue）
  0.9s: 100 req  ]
  1.1s: 100 req  ] 200 req in 0.2s！
```

**Go 實現**：

```go
type FixedWindowLimiter struct {
    limit    int
    window   time.Duration
    counter  int
    lastReset time.Time
    mu       sync.Mutex
}

func (l *FixedWindowLimiter) Allow() bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    // 窗口重置
    if now.Sub(l.lastReset) >= l.window {
        l.counter = 0
        l.lastReset = now
    }
    
    if l.counter < l.limit {
        l.counter++
        return true
    }
    return false
}
```

#### 2. 滑動窗口計數器（Sliding Window Counter）

```
原理：
將時間窗口細分為多個小窗口，滑動統計。

時間軸（1 秒窗口，分為 10 個格子）：
0.0  0.1  0.2  0.3  0.4  0.5  0.6  0.7  0.8  0.9  1.0
│────│────│────│────│────│────│────│────│────│────│
  10   12   8    15   10   9    11   13   12   10

當前時間 0.5s，計算過去 1 秒的請求數：
sum(0.5s-1.5s 的所有格子) = 過去 1 秒的請求數

優勢：
- 解決臨界問題
- 更平滑的限流

劣勢：
- 實現較複雜
- 記憶體佔用較多
```

**Redis 實現**：

```go
func SlidingWindowLimiter(userID string, limit int) bool {
    now := time.Now().UnixMilli()
    window := 1000 // 1 秒
    
    key := fmt.Sprintf("rate_limit:%s", userID)
    
    // 移除過期的請求記錄
    redis.ZRemRangeByScore(key, 0, now-int64(window))
    
    // 統計當前窗口內的請求數
    count := redis.ZCard(key)
    
    if count < limit {
        // 添加當前請求
        redis.ZAdd(key, now, fmt.Sprintf("%d", now))
        redis.Expire(key, window)
        return true
    }
    return false
}
```

#### 3. 漏桶算法（Leaky Bucket）

```
原理：
請求以任意速率進入，以固定速率流出。

視覺化：
          請求（任意速率）
               ↓↓↓
        ┌─────────────┐
        │             │
        │   漏桶      │ ← 固定容量
        │             │
        │  ░░░░░░░░   │ ← 當前水位
        └──────┬──────┘
               ↓
        固定速率流出（如 100 req/s）

特性：
- 平滑流量
- 不允許突發
- 超過容量則溢出（拒絕請求）

適用場景：
- 需要嚴格控制流量速率
- 保護後端系統
```

**實現**：

```go
type LeakyBucket struct {
    capacity int           // 桶容量
    rate     time.Duration // 流出速率
    water    int           // 當前水位
    lastLeak time.Time     // 上次漏水時間
    mu       sync.Mutex
}

func (b *LeakyBucket) Allow() bool {
    b.mu.Lock()
    defer b.mu.Unlock()
    
    now := time.Now()
    
    // 計算漏出的水
    elapsed := now.Sub(b.lastLeak)
    leaked := int(elapsed / b.rate)
    
    if leaked > 0 {
        b.water = max(0, b.water-leaked)
        b.lastLeak = now
    }
    
    // 嘗試加水
    if b.water < b.capacity {
        b.water++
        return true
    }
    return false
}
```

#### 4. 令牌桶算法（Token Bucket）

```
原理：
以固定速率生成令牌，請求消耗令牌，無令牌則拒絕。

視覺化：
        令牌生成器（固定速率）
               ↓
        ┌─────────────┐
        │  ○ ○ ○ ○    │ ← 令牌
        │  ○ ○        │
        │             │ ← 桶容量
        └─────────────┘
               ↑
          請求消耗令牌

特性：
- 允許一定程度的突發（桶中累積的令牌）
- 長期平均速率受限
- 靈活性高

適用場景：
- 允許短時突發
- 大部分限流場景
```

**實現（使用 Go 標準庫）**：

```go
import "golang.org/x/time/rate"

// 創建限流器：每秒 10 個請求，突發容量 20
limiter := rate.NewLimiter(10, 20)

// 嘗試消費 1 個令牌
if limiter.Allow() {
    // 處理請求
} else {
    // 拒絕請求
}

// 等待令牌可用（阻塞）
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
if err := limiter.Wait(ctx); err == nil {
    // 處理請求
} else {
    // 超時
}
```

#### 算法對比

| 算法 | 突發支援 | 流量平滑 | 實現複雜度 | 適用場景 |
|------|---------|---------|-----------|---------|
| **固定窗口** | ❌ | ❌ | 簡單 | 粗略限流 |
| **滑動窗口** | 有限 | ✅ | 中等 | 精確限流 |
| **漏桶** | ❌ | ✅✅ | 中等 | 嚴格速率控制 |
| **令牌桶** | ✅✅ | ✅ | 簡單 | 大部分場景 ✨ |

**推薦**：令牌桶（Token Bucket）是最常用的算法，平衡了靈活性和效果。

---

### 限流的維度

#### 1. 基於用戶

```
場景：每個用戶每分鐘最多 100 個請求

實現：
key = f"rate_limit:user:{user_id}"
```

#### 2. 基於 IP

```
場景：防止 DDoS 攻擊

實現：
key = f"rate_limit:ip:{client_ip}"

注意：
- 考慮代理和 NAT
- 可能誤傷合法用戶
```

#### 3. 基於 API 端點

```
場景：不同 API 有不同的限流策略

實現：
/api/search → 10 req/s  (昂貴操作)
/api/users   → 100 req/s (輕量操作)

key = f"rate_limit:api:{api_path}:{user_id}"
```

#### 4. 基於租戶（Multi-Tenant）

```
場景：SaaS 平台，不同客戶不同配額

實現：
Free Plan:  100 req/min
Pro Plan:   1000 req/min
Enterprise: 10000 req/min

key = f"rate_limit:tenant:{tenant_id}"
```

#### 5. 分散式限流

```
問題：多個伺服器實例如何共享限流狀態？

解決方案：
1. 使用 Redis 集中式限流
   ✅ 精確
   ❌ 增加延遲和複雜度

2. 使用本地限流 + 同步
   ✅ 低延遲
   ❌ 不夠精確

3. 混合方案
   - 粗略的本地限流（快速拒絕）
   - 精確的 Redis 限流（二次檢查）
```

**Redis 分散式限流**：

```go
// 使用 Redis + Lua 保證原子性
const script = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call('GET', key)

if current and tonumber(current) >= limit then
    return 0
else
    redis.call('INCR', key)
    if current == nil or tonumber(current) == 0 then
        redis.call('EXPIRE', key, window)
    end
    return 1
end
`

func RateLimitRedis(key string, limit int, window int) bool {
    result, err := redis.Eval(script, []string{key}, limit, window)
    return result == 1 && err == nil
}
```

---

### 降級策略

**降級**是在系統壓力過大時，主動關閉部分非核心功能，保證核心功能可用。

#### 降級的層次

```
Level 1: 延遲響應
- 增加快取時間
- 返回舊資料

Level 2: 功能降級
- 關閉推薦功能
- 關閉評論功能
- 簡化頁面

Level 3: 讀降級
- 只讀模式
- 禁止寫入操作

Level 4: 核心保護
- 只保留登入、查看核心功能
- 關閉所有其他功能
```

#### 降級策略範例

```go
type FeatureFlag struct {
    mu     sync.RWMutex
    flags  map[string]bool
}

// 檢查功能是否開啟
func (f *FeatureFlag) IsEnabled(feature string) bool {
    f.mu.RLock()
    defer f.mu.RUnlock()
    return f.flags[feature]
}

// 動態關閉功能
func (f *FeatureFlag) Disable(feature string) {
    f.mu.Lock()
    defer f.mu.Unlock()
    f.flags[feature] = false
}

// 使用範例
if featureFlag.IsEnabled("recommendations") {
    // 返回個性化推薦
    recommendations := getRecommendations(userID)
    return recommendations
} else {
    // 降級：返回熱門內容
    return getPopularItems()
}
```

#### 自動降級

```
根據系統指標自動觸發降級：

監控指標：
- CPU 使用率 > 80%
- 記憶體使用率 > 85%
- API 延遲 > 1s
- 錯誤率 > 5%

降級決策：
if cpu_usage > 80% && latency > 1000ms {
    disableFeature("recommendations")
    disableFeature("comments")
}

if cpu_usage > 90% {
    enableReadOnlyMode()
}
```

---

### 熔斷器（Circuit Breaker）

**熔斷器**用於防止故障擴散，當下游服務不可用時，快速失敗而非等待超時。

#### 三種狀態

```
狀態轉換圖：

    ┌─────────┐
    │ Closed  │ (正常狀態)
    │         │
    └────┬────┘
         │ 錯誤率 > 閾值
         ▼
    ┌─────────┐
    │  Open   │ (熔斷狀態)
    │         │
    └────┬────┘
         │ 超時後
         ▼
    ┌──────────┐
    │Half-Open │ (半開狀態)
    │          │
    └─────┬────┘
          │
    ┌─────┴───────┐
    │             │
成功率高       失敗
    │             │
    ▼             ▼
 Closed         Open
```

**1. Closed（關閉）**：
```
- 正常狀態，請求正常通過
- 統計成功/失敗次數
- 錯誤率超過閾值 → Open
```

**2. Open（開啟）**：
```
- 熔斷狀態，直接拒絕請求
- 快速失敗，不調用下游
- 一段時間後 → Half-Open
```

**3. Half-Open（半開）**：
```
- 嘗試恢復，允許少量請求
- 成功率高 → Closed
- 仍然失敗 → Open
```

#### 實現範例

```go
import "github.com/sony/gobreaker"

// 創建熔斷器
cb := gobreaker.NewCircuitBreaker(gobreaker.Settings{
    Name:        "APIBreaker",
    MaxRequests: 3,     // Half-Open 時最多 3 個請求
    Interval:    60,    // 統計窗口 60 秒
    Timeout:     30,    // Open 30 秒後進入 Half-Open
    ReadyToTrip: func(counts gobreaker.Counts) bool {
        failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
        return counts.Requests >= 3 && failureRatio >= 0.6
    },
})

// 使用熔斷器
result, err := cb.Execute(func() (interface{}, error) {
    return callDownstreamAPI()
})

if err != nil {
    if err == gobreaker.ErrOpenState {
        // 熔斷器開啟，快速失敗
        return handleFallback()
    }
    // 其他錯誤
    return err
}
```

---

### 響應策略

當請求被限流時，如何響應？

#### 1. 直接拒絕

```
HTTP 429 Too Many Requests

Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 60

Body:
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit. Please try again in 60 seconds."
}
```

#### 2. 排隊等待

```go
// 使用帶超時的等待
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

if err := limiter.Wait(ctx); err != nil {
    // 等待超時，拒絕請求
    return http.StatusTooManyRequests
}

// 處理請求
```

#### 3. 降級服務

```go
if !limiter.Allow() {
    // 返回快取資料
    return getCachedData()
}

// 返回實時資料
return getRealtimeData()
```

---

### 最佳實踐

```
1. 分層限流
   - Nginx/API Gateway 層：粗略限流
   - 應用層：精細限流
   - 資料庫層：連接池限制

2. 合理設置閾值
   - 基於容量規劃
   - 留有餘量（如 80% 容量）
   - 定期調整

3. 監控和告警
   - 監控限流觸發次數
   - 監控被拒絕的請求
   - 設置告警閾值

4. 友好的錯誤訊息
   - 明確說明限流原因
   - 提供 Retry-After 資訊
   - 指導用戶如何處理

5. 測試和驗證
   - 壓力測試驗證限流效果
   - 混沌工程測試降級策略
   - 定期演練
```

---

### 常見面試問題

#### Q1：令牌桶和漏桶有什麼區別？

**回答要點**：
- 令牌桶：允許突發，更靈活
- 漏桶：嚴格速率，更平滑
- 令牌桶更常用

#### Q2：如何實現分散式限流？

**回答要點**：
- 使用 Redis 集中式限流
- Lua 腳本保證原子性
- 考慮 Redis 故障的降級方案

#### Q3：什麼時候需要降級？

**回答要點**：
- 系統過載
- 下游服務不可用
- 突發流量
- 保護核心功能

#### Q4：熔斷器和限流有什麼區別？

**回答要點**：
- 限流：控制請求速率
- 熔斷：防止故障擴散
- 互補使用

---

## 總結

API 限流和降級是保護系統穩定性的關鍵手段：

1. **限流算法**：令牌桶最常用，平衡靈活性和效果
2. **降級策略**：分層降級，保證核心功能
3. **熔斷器**：防止故障擴散，快速失敗
4. **分散式限流**：使用 Redis 實現集中式限流

**設計原則**：
- 多層防護（網關、應用、資料庫）
- 合理設置閾值（留有餘量）
- 友好的錯誤訊息
- 持續監控和調整

記住：**限流和降級不是目的，而是手段**。目標是在保護系統的同時，盡可能提供良好的用戶體驗。
