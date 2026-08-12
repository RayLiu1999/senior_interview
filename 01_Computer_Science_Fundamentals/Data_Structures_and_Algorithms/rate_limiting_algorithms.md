# 限流算法（Token Bucket、Leaky Bucket、滑動窗口）

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Rate Limiting`, `Token Bucket`, `Leaky Bucket`, `Distributed System`

## 問題詳述

限流（Rate Limiting）是保護系統穩定性的重要手段，用於**控制請求速率**，防止流量洪峰導致系統崩潰。本題介紹四種經典限流算法：**固定窗口、滑動窗口、漏桶、令牌桶**。

### 測驗對應

- **Concept ID**: `concept.distributed-systems.rate-limiting.token-leaky-bucket`
- **Learning Objectives**:
  - `LO-1`: 能夠依照請求時間軸解釋固定窗口、滑動窗口、漏桶與令牌桶的限流行為。
  - `LO-2`: 能夠根據是否允許突發、是否需要平滑輸出與系統容量選擇合適演算法。
  - `LO-3`: 能夠設計分散式限流的共享狀態、原子操作、降級與拒絕回應策略。
- **Quick Quiz**: [Q11](../../QUIZ/01_Data_Structures_and_Algorithms.md#q11-限流演算法令牌桶漏桶)
- **Hard Assessment**: [Core Runtime & Data Structures Incident](../../QUIZ/Hard_Assessments/core_runtime_data_structures_incident.md) (`assessment.core-runtime.data-structures.incident.v1`)

## 核心理論與詳解

### 1. 限流的應用場景

#### 1.1 為什麼需要限流？

**場景 1：API 限流**
- 防止惡意用戶大量請求
- 保護後端服務不被打垮
- 例如：每個用戶每分鐘最多 60 個請求

**場景 2：數據庫保護**
- 控制併發查詢數量
- 防止慢查詢拖垮資料庫
- 例如：最多 100 個併發連接

**場景 3：消息隊列消費速率**
- 控制下游處理速度
- 避免下游服務過載
- 例如：每秒最多處理 1000 條消息

**場景 4：第三方 API 調用**
- 遵守第三方 API 的速率限制
- 例如：Twitter API 每 15 分鐘 180 次請求

---

### 2. 四種限流算法

#### 2.1 固定窗口計數器（Fixed Window Counter）

**核心思想**：
- 將時間劃分為**固定的窗口**（例如每分鐘）
- 每個窗口內計數，超過閾值則拒絕

**實現**：
```go
package ratelimit

import (
    "sync"
    "time"
)

type FixedWindowLimiter struct {
    limit      int       // 窗口內最大請求數
    window     time.Duration  // 窗口大小
    counter    int       // 當前窗口計數
    windowStart time.Time // 當前窗口開始時間
    mu         sync.Mutex
}

func NewFixedWindowLimiter(limit int, window time.Duration) *FixedWindowLimiter {
    return &FixedWindowLimiter{
        limit:      limit,
        window:     window,
        windowStart: time.Now(),
    }
}

func (l *FixedWindowLimiter) Allow() bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    
    // 檢查是否進入新窗口
    if now.Sub(l.windowStart) >= l.window {
        // 重置計數器
        l.counter = 0
        l.windowStart = now
    }
    
    // 檢查是否超過限制
    if l.counter >= l.limit {
        return false  // 拒絕請求
    }
    
    l.counter++
    return true
}
```

**使用範例**：
```go
limiter := NewFixedWindowLimiter(100, 1*time.Minute)  // 每分鐘 100 個請求

for {
    if limiter.Allow() {
        handleRequest()  // 處理請求
    } else {
        rejectRequest()  // 拒絕請求
    }
}
```

**優點**：
- ✅ 實現簡單
- ✅ 性能高（O(1)）
- ✅ 節省記憶體

**缺點**：
- ❌ **臨界問題**（窗口邊界流量突刺）

**臨界問題示例**：
```
限制：每分鐘 100 個請求

時間軸：
|-----窗口 1 (0:00-0:59)-----|-----窗口 2 (1:00-1:59)-----|
        90 個請求                    90 個請求
                            ↑
                         0:59-1:00 這 1 秒內有 180 個請求！
```

---

#### 2.2 滑動窗口計數器（Sliding Window Log）

**核心思想**：
- 記錄**每個請求的時間戳**
- 統計過去 N 秒內的請求數

**實現**：
```go
type SlidingWindowLimiter struct {
    limit      int
    window     time.Duration
    timestamps []time.Time  // 記錄請求時間戳
    mu         sync.Mutex
}

func NewSlidingWindowLimiter(limit int, window time.Duration) *SlidingWindowLimiter {
    return &SlidingWindowLimiter{
        limit:      limit,
        window:     window,
        timestamps: make([]time.Time, 0),
    }
}

func (l *SlidingWindowLimiter) Allow() bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    windowStart := now.Add(-l.window)
    
    // 移除窗口外的時間戳
    validIndex := 0
    for i, ts := range l.timestamps {
        if ts.After(windowStart) {
            validIndex = i
            break
        }
    }
    l.timestamps = l.timestamps[validIndex:]
    
    // 檢查是否超過限制
    if len(l.timestamps) >= l.limit {
        return false
    }
    
    // 記錄當前請求
    l.timestamps = append(l.timestamps, now)
    return true
}
```

**優點**：
- ✅ 精確限流，無臨界問題
- ✅ 可以實現更複雜的限流策略

**缺點**：
- ❌ **空間消耗大**（需要存儲所有時間戳）
- ❌ 清理過期時間戳有性能開銷

**優化版：滑動窗口計數器**

將時間窗口劃分為多個小格子：

```go
type SlidingWindowCounterLimiter struct {
    limit      int
    window     time.Duration
    slotSize   time.Duration  // 小格子大小
    slots      map[int64]int  // 格子 -> 計數
    mu         sync.Mutex
}

func NewSlidingWindowCounterLimiter(limit int, window time.Duration, slotSize time.Duration) *SlidingWindowCounterLimiter {
    return &SlidingWindowCounterLimiter{
        limit:    limit,
        window:   window,
        slotSize: slotSize,
        slots:    make(map[int64]int),
    }
}

func (l *SlidingWindowCounterLimiter) Allow() bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    currentSlot := now.Unix() / int64(l.slotSize.Seconds())
    windowStart := now.Add(-l.window)
    startSlot := windowStart.Unix() / int64(l.slotSize.Seconds())
    
    // 清理過期的格子
    for slot := range l.slots {
        if slot < startSlot {
            delete(l.slots, slot)
        }
    }
    
    // 統計窗口內的請求數
    count := 0
    for slot := startSlot; slot <= currentSlot; slot++ {
        count += l.slots[slot]
    }
    
    // 檢查是否超過限制
    if count >= l.limit {
        return false
    }
    
    // 增加當前格子的計數
    l.slots[currentSlot]++
    return true
}
```

---

#### 2.3 漏桶算法（Leaky Bucket）

**核心思想**：
- 請求像**水滴**進入**桶**
- 桶以**固定速率**流出（處理請求）
- 桶滿則拒絕請求

**特點**：
- ✅ **平滑輸出流量**
- ❌ 無法應對突發流量

**圖解**：
```
請求流入
   ↓↓↓↓↓
  ┌────┐
  │    │ 漏桶（容量 100）
  │~~~~│ 
  │~~~~│ 
  └──↓─┘
    ↓↓↓  固定速率流出（10 req/s）
   處理請求
```

**實現**：
```go
type LeakyBucketLimiter struct {
    capacity   int           // 桶容量
    rate       float64       // 流出速率（請求/秒）
    water      float64       // 當前水量
    lastLeak   time.Time     // 上次漏水時間
    mu         sync.Mutex
}

func NewLeakyBucketLimiter(capacity int, rate float64) *LeakyBucketLimiter {
    return &LeakyBucketLimiter{
        capacity: capacity,
        rate:     rate,
        water:    0,
        lastLeak: time.Now(),
    }
}

func (l *LeakyBucketLimiter) Allow() bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    
    // 計算漏出的水量
    elapsed := now.Sub(l.lastLeak).Seconds()
    leaked := elapsed * l.rate
    
    // 更新當前水量
    l.water = math.Max(0, l.water - leaked)
    l.lastLeak = now
    
    // 檢查是否還有空間
    if l.water + 1 > float64(l.capacity) {
        return false  // 桶滿，拒絕請求
    }
    
    // 加入一滴水
    l.water += 1
    return true
}
```

**應用場景**：
- 消息隊列消費速率控制
- 視頻流量整形（traffic shaping）

---

#### 2.4 令牌桶算法（Token Bucket）

**核心思想**：
- 桶中存放**令牌**
- 以固定速率產生令牌
- 請求需要消耗令牌，沒有令牌則拒絕

**特點**：
- ✅ **支持突發流量**（預存令牌）
- ✅ 最常用的限流算法

**圖解**：
```
令牌產生器（10 tokens/s）
        ↓
      ┌────┐
      │ 🪙🪙│ 令牌桶（容量 100）
      │ 🪙🪙│ 
      └────┘
        ↑
   請求消耗令牌
```

**實現**：
```go
type TokenBucketLimiter struct {
    capacity    int       // 桶容量
    rate        float64   // 令牌產生速率（個/秒）
    tokens      float64   // 當前令牌數
    lastRefill  time.Time // 上次填充時間
    mu          sync.Mutex
}

func NewTokenBucketLimiter(capacity int, rate float64) *TokenBucketLimiter {
    return &TokenBucketLimiter{
        capacity:   capacity,
        rate:       rate,
        tokens:     float64(capacity),  // 初始填滿
        lastRefill: time.Now(),
    }
}

func (l *TokenBucketLimiter) Allow() bool {
    return l.AllowN(1)
}

func (l *TokenBucketLimiter) AllowN(n int) bool {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    now := time.Now()
    
    // 計算新產生的令牌
    elapsed := now.Sub(l.lastRefill).Seconds()
    newTokens := elapsed * l.rate
    
    // 更新令牌數（不超過容量）
    l.tokens = math.Min(float64(l.capacity), l.tokens + newTokens)
    l.lastRefill = now
    
    // 檢查令牌是否足夠
    if l.tokens < float64(n) {
        return false  // 令牌不足，拒絕請求
    }
    
    // 消耗令牌
    l.tokens -= float64(n)
    return true
}

// 支持阻塞等待
func (l *TokenBucketLimiter) Wait(ctx context.Context, n int) error {
    for {
        if l.AllowN(n) {
            return nil
        }
        
        // 等待一段時間後重試
        select {
        case <-time.After(10 * time.Millisecond):
            continue
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}
```

**使用範例**：
```go
// 每秒 10 個令牌，桶容量 100（可突發）
limiter := NewTokenBucketLimiter(100, 10)

// 非阻塞
if limiter.Allow() {
    handleRequest()
}

// 阻塞等待（帶超時）
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
defer cancel()

if err := limiter.Wait(ctx, 1); err != nil {
    return errors.New("rate limit exceeded")
}
handleRequest()
```

**令牌桶 vs 漏桶**：

| 特性 | 令牌桶 | 漏桶 |
|------|--------|------|
| **突發流量** | ✅ 支持（預存令牌） | ❌ 不支持 |
| **輸出速率** | 可變（有令牌就快） | 固定 |
| **應用場景** | API 限流 | 流量整形 |

---

### 3. 分散式限流

#### 3.1 基於 Redis 的分散式限流

**問題**：
- 單機限流無法應對多實例
- 需要全局共享的計數器

**解決方案**：使用 Redis + Lua 腳本

**令牌桶的 Redis 實現**：
```go
package ratelimit

import (
    "context"
    "github.com/go-redis/redis/v8"
    "time"
)

type RedisTokenBucketLimiter struct {
    rdb      *redis.Client
    key      string
    capacity int
    rate     float64
}

// Lua 腳本：原子性地獲取令牌
const luaScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1]) or capacity
local last_refill = tonumber(bucket[2]) or now

-- 計算新令牌
local elapsed = now - last_refill
local new_tokens = math.min(capacity, tokens + elapsed * rate)

-- 檢查令牌是否足夠
if new_tokens >= requested then
    new_tokens = new_tokens - requested
    redis.call('HMSET', key, 'tokens', new_tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)  -- 1 小時過期
    return 1  -- 允許
else
    return 0  -- 拒絕
end
`

func NewRedisTokenBucketLimiter(rdb *redis.Client, key string, capacity int, rate float64) *RedisTokenBucketLimiter {
    return &RedisTokenBucketLimiter{
        rdb:      rdb,
        key:      key,
        capacity: capacity,
        rate:     rate,
    }
}

func (l *RedisTokenBucketLimiter) Allow(ctx context.Context) (bool, error) {
    return l.AllowN(ctx, 1)
}

func (l *RedisTokenBucketLimiter) AllowN(ctx context.Context, n int) (bool, error) {
    now := float64(time.Now().UnixNano()) / 1e9
    
    result, err := l.rdb.Eval(ctx, luaScript, []string{l.key}, 
        l.capacity, l.rate, n, now).Int()
    
    if err != nil {
        return false, err
    }
    
    return result == 1, nil
}
```

**使用範例**：
```go
// 全局限流：每秒 1000 個請求
limiter := NewRedisTokenBucketLimiter(
    redisClient,
    "global:rate_limit",
    1000,  // 容量
    1000,  // 每秒產生 1000 個令牌
)

// 用戶級限流：每個用戶每秒 10 個請求
userLimiter := NewRedisTokenBucketLimiter(
    redisClient,
    fmt.Sprintf("user:%d:rate_limit", userID),
    10,
    10,
)

if allowed, _ := limiter.Allow(ctx); !allowed {
    return errors.New("rate limit exceeded")
}
```

---

#### 3.2 基於 Redis 的滑動窗口

```go
// Redis sorted set 實現滑動窗口
func slidingWindowRedis(ctx context.Context, rdb *redis.Client, key string, limit int, window time.Duration) (bool, error) {
    now := time.Now()
    windowStart := now.Add(-window).UnixNano()
    
    pipe := rdb.TxPipeline()
    
    // 1. 移除窗口外的記錄
    pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))
    
    // 2. 統計窗口內的記錄數
    pipe.ZCard(ctx, key)
    
    // 3. 添加當前請求
    pipe.ZAdd(ctx, key, &redis.Z{
        Score:  float64(now.UnixNano()),
        Member: now.UnixNano(),
    })
    
    // 4. 設置過期時間
    pipe.Expire(ctx, key, window)
    
    cmds, err := pipe.Exec(ctx)
    if err != nil {
        return false, err
    }
    
    // 檢查計數
    count := cmds[1].(*redis.IntCmd).Val()
    return count < int64(limit), nil
}
```

---

### 4. 實際應用案例

#### 4.1 Nginx 限流

**配置**：
```nginx
http {
    # 定義限流規則（令牌桶）
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    
    server {
        location /api/ {
            # 每個 IP 每秒 10 個請求，突發 20 個
            limit_req zone=one burst=20 nodelay;
            
            proxy_pass http://backend;
        }
    }
}
```

#### 4.2 Kong API Gateway

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
      policy: redis
      redis_host: redis.example.com
```

#### 4.3 Go 標準庫 rate.Limiter

```go
import "golang.org/x/time/rate"

// 令牌桶實現
limiter := rate.NewLimiter(10, 100)  // 每秒 10 個，桶容量 100

// 阻塞等待
if err := limiter.Wait(ctx); err != nil {
    return err
}

// 非阻塞
if !limiter.Allow() {
    return errors.New("rate limit exceeded")
}

// 預留 N 個令牌
reservation := limiter.Reserve()
if !reservation.OK() {
    return errors.New("rate limit exceeded")
}
time.Sleep(reservation.Delay())  // 等待令牌可用
```

---

## 面試技巧與常見陷阱

### 1. 算法選擇

| 場景 | 推薦算法 | 原因 |
|------|---------|------|
| API 限流 | 令牌桶 | 支持突發流量 |
| 消息隊列 | 漏桶 | 平滑消費速率 |
| 簡單計數 | 滑動窗口 | 精確、無臨界問題 |
| 高性能場景 | 固定窗口 | 最快、最省內存 |

### 2. 分散式限流的挑戰

**問題 1：時鐘不同步**
- 不同機器的時間可能不一致
- 解決：使用 Redis 的時間或邏輯時鐘

**問題 2：Redis 單點故障**
- 限流器依賴 Redis
- 解決：使用 Redis Cluster 或降級策略

**問題 3：性能開銷**
- 每個請求都要訪問 Redis
- 解決：本地限流 + 全局限流結合

### 3. 常見錯誤

**錯誤 1：限流粒度選擇不當**
```go
// ❌ 所有用戶共享一個限流器
limiter := NewTokenBucketLimiter(1000, 1000)

// ✅ 每個用戶一個限流器
limiters := make(map[int]*TokenBucketLimiter)
limiter := limiters[userID]
```

**錯誤 2：忘記清理過期數據**
```go
// ❌ 滑動窗口不清理舊記錄，內存洩漏
timestamps = append(timestamps, now)

// ✅ 定期清理
for i, ts := range timestamps {
    if ts.After(windowStart) {
        timestamps = timestamps[i:]
        break
    }
}
```

---

## 複雜度分析

| 算法 | 時間複雜度 | 空間複雜度 | 突發流量 | 精確度 |
|------|-----------|-----------|---------|--------|
| 固定窗口 | O(1) | O(1) | ❌ | ❌ 臨界問題 |
| 滑動窗口（日誌） | O(n) | O(n) | ✅ | ✅ 精確 |
| 滑動窗口（計數） | O(k) | O(k) | ✅ | ✅ 較精確 |
| 漏桶 | O(1) | O(1) | ❌ | ✅ 平滑 |
| 令牌桶 | O(1) | O(1) | ✅ | ✅ 精確 |

---

## 延伸閱讀

- **經典論文**：Token Bucket Algorithm (RFC 2697)
- **開源項目**：
  - [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate)
  - [uber-go/ratelimit](https://github.com/uber-go/ratelimit)
- **進階主題**：自適應限流、動態調整速率
