# 延遲佇列實現

- **難度**: 7
- **重要程度**: 4
- **標籤**: `延遲佇列`, `時間輪`, `定時任務`

## 問題詳述

延遲佇列用於延遲處理任務,在指定時間後才執行任務。常見於訂單超時取消、消息延遲發送、定時任務調度等場景。

## 核心理論與詳解

### 1. 延遲佇列基本原理

**核心需求**:
- 任務在指定時間後執行
- 支持動態添加任務
- 高效查找到期任務
- 支持任務取消

**常見實現方案**:
1. **優先佇列** (最小堆)
2. **時間輪** (Timing Wheel)
3. **Redis ZSet**
4. **延遲隊列中介軟體** (RabbitMQ、Kafka)

### 2. 方案一: 優先佇列實現

**原理**: 使用最小堆按執行時間排序任務。

```go
type DelayedTask struct {
    ID        string
    ExecuteAt time.Time
    Callback  func()
}

type DelayQueue struct {
    heap     *TaskHeap
    mu       sync.Mutex
    notEmpty chan struct{}
    closed   bool
}

func NewDelayQueue() *DelayQueue {
    dq := &DelayQueue{
        heap:     &TaskHeap{},
        notEmpty: make(chan struct{}, 1),
    }
    heap.Init(dq.heap)
    go dq.run()
    return dq
}

func (dq *DelayQueue) Push(task DelayedTask) {
    dq.mu.Lock()
    defer dq.mu.Unlock()
    
    if dq.closed {
        return
    }
    
    heap.Push(dq.heap, task)
    
    // 通知處理協程
    select {
    case dq.notEmpty <- struct{}{}:
    default:
    }
}

func (dq *DelayQueue) run() {
    timer := time.NewTimer(time.Hour)
    defer timer.Stop()
    
    for {
        dq.mu.Lock()
        if dq.closed {
            dq.mu.Unlock()
            return
        }
        
        if dq.heap.Len() == 0 {
            dq.mu.Unlock()
            <-dq.notEmpty
            continue
        }
        
        // 查看最早的任務
        task := (*dq.heap)[0]
        now := time.Now()
        
        if task.ExecuteAt.After(now) {
            // 還未到期,設置定時器
            timer.Reset(task.ExecuteAt.Sub(now))
            dq.mu.Unlock()
            <-timer.C
            continue
        }
        
        // 任務到期,執行任務
        heap.Pop(dq.heap)
        dq.mu.Unlock()
        
        // 異步執行任務
        go func() {
            defer func() {
                if r := recover(); r != nil {
                    log.Printf("Task panic: %v", r)
                }
            }()
            task.Callback()
        }()
    }
}

func (dq *DelayQueue) Close() {
    dq.mu.Lock()
    defer dq.mu.Unlock()
    dq.closed = true
    close(dq.notEmpty)
}

// 優先佇列實現
type TaskHeap []DelayedTask

func (h TaskHeap) Len() int           { return len(h) }
func (h TaskHeap) Less(i, j int) bool { return h[i].ExecuteAt.Before(h[j].ExecuteAt) }
func (h TaskHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *TaskHeap) Push(x interface{}) {
    *h = append(*h, x.(DelayedTask))
}

func (h *TaskHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}
```

**使用範例**:
```go
func main() {
    dq := NewDelayQueue()
    defer dq.Close()
    
    // 添加延遲任務
    dq.Push(DelayedTask{
        ID:        "task1",
        ExecuteAt: time.Now().Add(5 * time.Second),
        Callback: func() {
            fmt.Println("Task 1 executed")
        },
    })
    
    dq.Push(DelayedTask{
        ID:        "task2",
        ExecuteAt: time.Now().Add(10 * time.Second),
        Callback: func() {
            fmt.Println("Task 2 executed")
        },
    })
    
    time.Sleep(15 * time.Second)
}
```

### 3. 方案二: 時間輪實現

**原理**: 類似時鐘,將時間劃分為多個槽,任務存儲在對應的槽中。

**優勢**: 
- 添加任務 O(1)
- 查找到期任務 O(1)

**時間輪結構**:
```
Slot 0: []
Slot 1: [task1, task2]
Slot 2: []
...
Slot 59: [task100]

指針每秒移動一個槽
```

```go
type TimingWheel struct {
    interval   time.Duration  // 每個槽的時間間隔
    slots      int            // 槽的數量
    buckets    [][]*Task      // 時間槽
    currentPos int            // 當前指針位置
    mu         sync.RWMutex
    ticker     *time.Ticker
    stopChan   chan struct{}
}

type Task struct {
    ID       string
    Delay    time.Duration
    Rounds   int            // 需要轉多少圈
    Callback func()
}

func NewTimingWheel(interval time.Duration, slots int) *TimingWheel {
    tw := &TimingWheel{
        interval:   interval,
        slots:      slots,
        buckets:    make([][]*Task, slots),
        currentPos: 0,
        ticker:     time.NewTicker(interval),
        stopChan:   make(chan struct{}),
    }
    
    go tw.run()
    return tw
}

func (tw *TimingWheel) AddTask(task *Task) {
    tw.mu.Lock()
    defer tw.mu.Unlock()
    
    // 計算任務應該放在哪個槽
    pos, rounds := tw.calculatePosition(task.Delay)
    task.Rounds = rounds
    
    tw.buckets[pos] = append(tw.buckets[pos], task)
}

func (tw *TimingWheel) calculatePosition(delay time.Duration) (int, int) {
    steps := int(delay / tw.interval)
    pos := (tw.currentPos + steps) % tw.slots
    rounds := steps / tw.slots
    return pos, rounds
}

func (tw *TimingWheel) run() {
    for {
        select {
        case <-tw.ticker.C:
            tw.tick()
        case <-tw.stopChan:
            tw.ticker.Stop()
            return
        }
    }
}

func (tw *TimingWheel) tick() {
    tw.mu.Lock()
    
    // 移動指針
    tw.currentPos = (tw.currentPos + 1) % tw.slots
    
    // 獲取當前槽的任務
    tasks := tw.buckets[tw.currentPos]
    tw.buckets[tw.currentPos] = nil
    
    tw.mu.Unlock()
    
    // 執行到期任務
    for _, task := range tasks {
        if task.Rounds > 0 {
            // 還需要轉圈,重新添加到時間輪
            task.Rounds--
            tw.mu.Lock()
            tw.buckets[tw.currentPos] = append(tw.buckets[tw.currentPos], task)
            tw.mu.Unlock()
        } else {
            // 任務到期,執行
            go func(t *Task) {
                defer func() {
                    if r := recover(); r != nil {
                        log.Printf("Task panic: %v", r)
                    }
                }()
                t.Callback()
            }(task)
        }
    }
}

func (tw *TimingWheel) Stop() {
    close(tw.stopChan)
}
```

**使用範例**:
```go
func main() {
    // 創建時間輪: 每秒一個槽,共60個槽
    tw := NewTimingWheel(time.Second, 60)
    defer tw.Stop()
    
    // 添加5秒後執行的任務
    tw.AddTask(&Task{
        ID:    "task1",
        Delay: 5 * time.Second,
        Callback: func() {
            fmt.Println("Task 1 executed")
        },
    })
    
    // 添加65秒後執行的任務 (需要轉一圈)
    tw.AddTask(&Task{
        ID:    "task2",
        Delay: 65 * time.Second,
        Callback: func() {
            fmt.Println("Task 2 executed")
        },
    })
    
    time.Sleep(70 * time.Second)
}
```

### 4. 方案三: Redis ZSet實現

**原理**: 使用Redis的有序集合,score為執行時間戳。

```go
type RedisDelayQueue struct {
    client *redis.Client
    key    string
}

func NewRedisDelayQueue(client *redis.Client, key string) *RedisDelayQueue {
    rdq := &RedisDelayQueue{
        client: client,
        key:    key,
    }
    go rdq.consume()
    return rdq
}

func (rdq *RedisDelayQueue) Push(taskID string, executeAt time.Time) error {
    score := float64(executeAt.Unix())
    return rdq.client.ZAdd(context.Background(), rdq.key, &redis.Z{
        Score:  score,
        Member: taskID,
    }).Err()
}

func (rdq *RedisDelayQueue) consume() {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        now := float64(time.Now().Unix())
        
        // 獲取到期任務
        tasks, err := rdq.client.ZRangeByScore(context.Background(), rdq.key, &redis.ZRangeBy{
            Min: "0",
            Max: fmt.Sprintf("%f", now),
        }).Result()
        
        if err != nil || len(tasks) == 0 {
            continue
        }
        
        // 執行任務
        for _, taskID := range tasks {
            // 刪除任務 (防止重複執行)
            rdq.client.ZRem(context.Background(), rdq.key, taskID)
            
            // 執行任務
            go rdq.executeTask(taskID)
        }
    }
}

func (rdq *RedisDelayQueue) executeTask(taskID string) {
    // 從資料庫或其他地方獲取任務詳情並執行
    fmt.Printf("Executing task: %s\n", taskID)
}
```

## 實際應用場景

### 1. 訂單超時自動取消

```go
type OrderService struct {
    delayQueue *DelayQueue
}

func (os *OrderService) CreateOrder(order Order) {
    // 保存訂單
    db.Save(order)
    
    // 添加30分鐘後檢查訂單狀態的任務
    os.delayQueue.Push(DelayedTask{
        ID:        order.ID,
        ExecuteAt: time.Now().Add(30 * time.Minute),
        Callback: func() {
            os.checkAndCancelOrder(order.ID)
        },
    })
}

func (os *OrderService) checkAndCancelOrder(orderID string) {
    order := db.GetOrder(orderID)
    
    // 如果訂單未支付,自動取消
    if order.Status == "UNPAID" {
        order.Status = "CANCELLED"
        db.Update(order)
        
        // 釋放庫存
        inventory.Release(order.Items)
        
        log.Printf("Order %s auto-cancelled due to timeout", orderID)
    }
}
```

### 2. 消息重試機制

```go
type MessageQueue struct {
    delayQueue *DelayQueue
    maxRetries int
}

func (mq *MessageQueue) SendMessage(msg Message) {
    err := mq.deliver(msg)
    
    if err != nil && msg.RetryCount < mq.maxRetries {
        // 發送失敗,添加重試任務
        retryDelay := time.Duration(math.Pow(2, float64(msg.RetryCount))) * time.Second
        
        mq.delayQueue.Push(DelayedTask{
            ID:        msg.ID,
            ExecuteAt: time.Now().Add(retryDelay),
            Callback: func() {
                msg.RetryCount++
                mq.SendMessage(msg)
            },
        })
        
        log.Printf("Message %s scheduled for retry in %v", msg.ID, retryDelay)
    }
}

func (mq *MessageQueue) deliver(msg Message) error {
    // 嘗試發送消息
    return sendToDownstream(msg)
}
```

### 3. 定時任務調度

```go
type CronScheduler struct {
    timingWheel *TimingWheel
}

func (cs *CronScheduler) ScheduleDaily(taskName string, hour, minute int, callback func()) {
    now := time.Now()
    nextRun := time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())
    
    if nextRun.Before(now) {
        nextRun = nextRun.Add(24 * time.Hour)
    }
    
    delay := nextRun.Sub(now)
    
    cs.timingWheel.AddTask(&Task{
        ID:    taskName,
        Delay: delay,
        Callback: func() {
            callback()
            // 重新調度下一次執行
            cs.ScheduleDaily(taskName, hour, minute, callback)
        },
    })
}

// 使用範例
func main() {
    scheduler := &CronScheduler{
        timingWheel: NewTimingWheel(time.Second, 3600),
    }
    
    // 每天凌晨2點執行備份
    scheduler.ScheduleDaily("daily-backup", 2, 0, func() {
        performBackup()
    })
}
```

### 4. 限流 - Token Bucket

```go
type TokenBucket struct {
    capacity   int
    tokens     int
    refillRate int // 每秒補充的token數
    mu         sync.Mutex
    timingWheel *TimingWheel
}

func NewTokenBucket(capacity, refillRate int) *TokenBucket {
    tb := &TokenBucket{
        capacity:   capacity,
        tokens:     capacity,
        refillRate: refillRate,
        timingWheel: NewTimingWheel(time.Second, 60),
    }
    
    // 定期補充token
    tb.scheduleRefill()
    
    return tb
}

func (tb *TokenBucket) scheduleRefill() {
    tb.timingWheel.AddTask(&Task{
        ID:    "refill",
        Delay: time.Second,
        Callback: func() {
            tb.refill()
            tb.scheduleRefill() // 重新調度
        },
    })
}

func (tb *TokenBucket) refill() {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    tb.tokens = min(tb.capacity, tb.tokens + tb.refillRate)
}

func (tb *TokenBucket) TryAcquire() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()
    
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}
```

## 總結

**延遲佇列核心要點**:
1. **優先佇列**: 簡單直觀,適合任務量不大的場景
2. **時間輪**: 高性能,適合大量任務的場景
3. **Redis ZSet**: 分散式環境,支持持久化
4. **選擇依據**: 任務量、精度要求、分散式需求

**性能對比**:
- 優先佇列: 添加 O(log n),取出 O(log n)
- 時間輪: 添加 O(1),取出 O(1)
- Redis ZSet: 網絡開銷,但支持分散式

**實際應用**:
- 訂單超時取消
- 消息重試機制
- 定時任務調度
- 限流令牌補充

**面試要點**:
- 能說明各方案的優缺點
- 理解時間輪的原理
- 能實現基本的延遲佇列
- 了解實際業務場景

延遲佇列是後端系統常見的基礎組件,理解其原理和實現對於系統設計非常重要。
