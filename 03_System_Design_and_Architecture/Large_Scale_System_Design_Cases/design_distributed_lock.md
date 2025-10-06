# 如何設計分散式鎖?

- **難度**: 8
- **重要程度**: 5
- **標籤**: `系統設計`, `分散式鎖`, `Redis`, `ZooKeeper`, `Etcd`

## 問題詳述

設計一個分散式鎖系統,用於分散式環境下的資源協調和互斥存取。系統需要保證互斥性、避免死鎖、支援鎖超時和續期,並處理網路分割槽等異常情況。

## 核心理論與詳解

### 1. 分散式鎖的特點

#### 1.1 為什麼需要分散式鎖?

**單機鎖的侷限**:
```
單程序: synchronized, mutex (✅ 有效)
多程序: 檔案鎖 (✅ 有效)
分散式: 多個伺服器 (❌ 無效)
```

**分散式場景**:
```
場景 1: 秒殺庫存扣減
- 10 臺伺服器同時處理請求
- 需要保證庫存不超賣

場景 2: 定時任務
- 3 臺伺服器部署相同定時任務
- 只需要一臺執行

場景 3: 資料修改
- 多個服務同時修改同一資料
- 需要保證資料一致性
```

#### 1.2 分散式鎖的要求

**1. 互斥性 (Mutual Exclusion)**:
```
同一時刻只有一個客戶端持有鎖
```

**2. 死鎖避免 (No Deadlock)**:
```
即使持有鎖的客戶端崩潰,鎖也能被釋放
```

**3. 容錯性 (Fault Tolerance)**:
```
部分節點故障不影響鎖服務
```

**4. 解鈴還須繫鈴人 (Ownership)**:
```
只有加鎖的客戶端才能解鎖
```

### 2. 分散式鎖的實現方案

#### 2.1 方案對比

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|---------|
| **資料庫** | 簡單易懂 | 效能差,單點故障 | 低並行場景 |
| **Redis** | 效能高,實現簡單 | 可能不完全可靠 | 高效能場景 |
| **ZooKeeper** | 強一致性,可靠 | 效能較差,運維複雜 | 強一致性需求 |
| **Etcd** | 強一致性,現代化 | 效能中等 | 雲原生環境 |

#### 2.2 選擇建議

```
效能優先: Redis (Redlock)
一致性優先: ZooKeeper / Etcd
簡單場景: 資料庫 (SELECT FOR UPDATE)
```

### 3. Redis 分散式鎖

#### 3.1 基礎實現

**方案 1: SETNX + EXPIRE**

```go
// ❌ 錯誤實現 (非原子性)
func WrongLock(key string, value string, ttl int) bool {
    // 1. 設定鎖
    ok := redis.SetNX(key, value)
    if !ok {
        return false
    }
    
    // 2. 設定過期時間
    redis.Expire(key, ttl)
    
    // 問題: 步驟 1 和 2 之間,程序可能崩潰
    // 導致鎖永不過期 (死鎖)
    
    return true
}
```

**方案 2: SET NX EX (正確)**

```go
// ✅ 正確實現 (原子性)
func Lock(key string, value string, ttl time.Duration) bool {
    // SET key value NX EX ttl
    // NX: 只在鍵不存在時設定
    // EX: 設定過期時間(秒)
    
    result, err := redis.SetNX(context.Background(), key, value, ttl).Result()
    if err != nil {
        return false
    }
    
    return result
}

func Unlock(key string, value string) bool {
    // Lua 腳本保證原子性
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    
    result, err := redis.Eval(context.Background(), script, 
        []string{key}, value).Int()
    
    return err == nil && result == 1
}
```

**使用示例**:
```go
func ProcessWithLock(resourceID string) {
    lockKey := "lock:resource:" + resourceID
    lockValue := uuid.New().String() // 唯一標識
    
    // 1. 獲取鎖
    if !Lock(lockKey, lockValue, 10*time.Second) {
        log.Info("failed to acquire lock")
        return
    }
    defer Unlock(lockKey, lockValue)
    
    // 2. 臨界區:處理業務
    ProcessResource(resourceID)
}
```

#### 3.2 完整實現

```go
package redislock

import (
    "context"
    "errors"
    "time"
    
    "github.com/go-redis/redis/v8"
    "github.com/google/uuid"
)

type RedisLock struct {
    client *redis.Client
    key    string
    value  string
    ttl    time.Duration
}

func NewRedisLock(client *redis.Client, key string, ttl time.Duration) *RedisLock {
    return &RedisLock{
        client: client,
        key:    key,
        value:  uuid.New().String(),
        ttl:    ttl,
    }
}

// Acquire 獲取鎖
func (l *RedisLock) Acquire() (bool, error) {
    ctx := context.Background()
    
    // SET key value NX EX ttl
    ok, err := l.client.SetNX(ctx, l.key, l.value, l.ttl).Result()
    if err != nil {
        return false, err
    }
    
    return ok, nil
}

// Release 釋放鎖
func (l *RedisLock) Release() error {
    ctx := context.Background()
    
    // Lua 腳本保證原子性
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    
    result, err := l.client.Eval(ctx, script, []string{l.key}, l.value).Int()
    if err != nil {
        return err
    }
    
    if result == 0 {
        return errors.New("lock not held")
    }
    
    return nil
}

// TryLock 嘗試獲取鎖,立即返回
func (l *RedisLock) TryLock() bool {
    ok, _ := l.Acquire()
    return ok
}

// Lock 獲取鎖,阻塞直到成功或超時
func (l *RedisLock) Lock(timeout time.Duration) error {
    deadline := time.Now().Add(timeout)
    
    for time.Now().Before(deadline) {
        ok, err := l.Acquire()
        if err != nil {
            return err
        }
        
        if ok {
            return nil
        }
        
        // 退避等待
        time.Sleep(100 * time.Millisecond)
    }
    
    return errors.New("lock timeout")
}

// 使用示例
func ExampleUsage() {
    client := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
    
    lock := NewRedisLock(client, "lock:order:123", 10*time.Second)
    
    // 方式 1: 嘗試獲取
    if lock.TryLock() {
        defer lock.Release()
        
        // 業務邏輯
        ProcessOrder(123)
    }
    
    // 方式 2: 阻塞獲取
    err := lock.Lock(5 * time.Second)
    if err != nil {
        log.Error("failed to acquire lock", err)
        return
    }
    defer lock.Release()
    
    // 業務邏輯
    ProcessOrder(123)
}
```

#### 3.3 鎖續期 (Watchdog)

**問題**: 業務執行時間超過鎖過期時間。

```
鎖 TTL: 10 秒
業務執行: 15 秒

時間軸:
0s:  獲取鎖成功
10s: 鎖過期(自動釋放)
10s: 其他客戶端獲取鎖
15s: 原客戶端釋放鎖(誤刪其他客戶端的鎖!)
```

**解決方案: 自動續期**

```go
type RedisLockWithRenewal struct {
    RedisLock
    stopRenewal chan struct{}
}

func (l *RedisLockWithRenewal) Acquire() (bool, error) {
    ok, err := l.RedisLock.Acquire()
    if !ok || err != nil {
        return ok, err
    }
    
    // 啟動續期 goroutine
    l.stopRenewal = make(chan struct{})
    go l.renewLock()
    
    return true, nil
}

func (l *RedisLockWithRenewal) Release() error {
    // 停止續期
    close(l.stopRenewal)
    
    // 釋放鎖
    return l.RedisLock.Release()
}

func (l *RedisLockWithRenewal) renewLock() {
    ticker := time.NewTicker(l.ttl / 3) // 每 1/3 TTL 續期一次
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            // 續期
            script := `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("EXPIRE", KEYS[1], ARGV[2])
                else
                    return 0
                end
            `
            
            l.client.Eval(context.Background(), script,
                []string{l.key}, l.value, int(l.ttl.Seconds()))
            
        case <-l.stopRenewal:
            return
        }
    }
}
```

**使用**:
```go
lock := NewRedisLockWithRenewal(client, "lock:task", 10*time.Second)

if lock.Acquire() {
    defer lock.Release()
    
    // 業務執行 30 秒也不怕
    // Watchdog 會自動續期
    LongRunningTask()
}
```

### 4. Redlock 演算法

#### 4.1 問題:單例項 Redis 不可靠

```
場景:
1. 客戶端 A 獲取鎖
2. Redis Master 崩潰
3. Slave 升級為 Master(但鎖資料未複製)
4. 客戶端 B 獲取鎖(成功!)
5. A 和 B 同時持有鎖(違反互斥性)
```

#### 4.2 Redlock 演算法

**核心思想**: 使用多個獨立的 Redis 例項(N = 5)。

**獲取鎖流程**:
```
1. 記錄當前時間 T1
2. 依次向 5 個 Redis 例項獲取鎖
3. 如果在超時時間內,成功獲取 >= 3 個鎖(N/2 + 1)
4. 記錄當前時間 T2
5. 鎖的有效時間 = TTL - (T2 - T1)
6. 如果有效時間 > 0,則獲取鎖成功
7. 否則釋放所有鎖
```

**實現**:
```go
type Redlock struct {
    clients []*redis.Client
    quorum  int
}

func NewRedlock(addrs []string) *Redlock {
    clients := make([]*redis.Client, len(addrs))
    for i, addr := range addrs {
        clients[i] = redis.NewClient(&redis.Options{
            Addr: addr,
        })
    }
    
    return &Redlock{
        clients: clients,
        quorum:  len(clients)/2 + 1,
    }
}

func (r *Redlock) Lock(key string, value string, ttl time.Duration) bool {
    startTime := time.Now()
    
    successCount := 0
    
    // 向所有 Redis 例項獲取鎖
    for _, client := range r.clients {
        ok, _ := client.SetNX(context.Background(), key, value, ttl).Result()
        if ok {
            successCount++
        }
        
        // 超時檢查
        if time.Since(startTime) > ttl/2 {
            break
        }
    }
    
    // 檢查是否達到 quorum
    if successCount >= r.quorum {
        // 計算鎖的有效時間
        elapsed := time.Since(startTime)
        validity := ttl - elapsed
        
        if validity > 0 {
            return true
        }
    }
    
    // 獲取失敗,釋放已獲取的鎖
    r.Unlock(key, value)
    return false
}

func (r *Redlock) Unlock(key string, value string) {
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    
    for _, client := range r.clients {
        client.Eval(context.Background(), script, []string{key}, value)
    }
}

// 使用
func ExampleRedlock() {
    redlock := NewRedlock([]string{
        "redis1:6379",
        "redis2:6379",
        "redis3:6379",
        "redis4:6379",
        "redis5:6379",
    })
    
    lockKey := "lock:resource:123"
    lockValue := uuid.New().String()
    
    if redlock.Lock(lockKey, lockValue, 10*time.Second) {
        defer redlock.Unlock(lockKey, lockValue)
        
        // 業務邏輯
        ProcessResource(123)
    }
}
```

#### 4.3 Redlock 爭議

**Martin Kleppmann 的質疑**:

1. **時鐘跳躍問題**:
```
客戶端 A 獲取鎖(TTL 10 秒)
伺服器時鐘快進 20 秒
鎖立即過期
客戶端 B 獲取鎖
```

2. **GC 停頓問題**:
```
客戶端 A 獲取鎖
GC 停頓 15 秒
鎖已過期
恢復後誤以為還持有鎖
```

**Redis 作者 Antirez 的迴應**:

```
Redlock 不追求完美一致性
適用於效率型場景(秒殺、去重)
需要完美一致性請用 ZooKeeper
```

**實務建議**:

```
效率優先: Redis 單例項 + Watchdog
可靠性優先: ZooKeeper / Etcd
折衷: Redlock (5 個例項)
```

### 5. ZooKeeper 分散式鎖

#### 5.1 原理

**利用 ZooKeeper 的臨時順序節點**:

```
/locks/resource_123/
  ├── lock_0000000001 (客戶端 A)
  ├── lock_0000000002 (客戶端 B)
  └── lock_0000000003 (客戶端 C)

規則:
- 序號最小的客戶端持有鎖
- 客戶端斷開連線,臨時節點自動刪除
- 其他客戶端監聽前一個節點
```

#### 5.2 實現

```go
package zklock

import (
    "fmt"
    "path"
    "sort"
    "strings"
    
    "github.com/samuel/go-zookeeper/zk"
)

type ZKLock struct {
    conn      *zk.Conn
    path      string
    node      string
    lockPath  string
}

func NewZKLock(conn *zk.Conn, lockPath string) *ZKLock {
    return &ZKLock{
        conn:     conn,
        lockPath: lockPath,
    }
}

// Lock 獲取鎖
func (l *ZKLock) Lock() error {
    // 1. 建立父節點
    l.createParentNode()
    
    // 2. 建立臨時順序節點
    nodePath := path.Join(l.lockPath, "lock_")
    createdPath, err := l.conn.Create(nodePath, []byte{}, 
        zk.FlagEphemeral|zk.FlagSequence, zk.WorldACL(zk.PermAll))
    if err != nil {
        return err
    }
    
    l.node = path.Base(createdPath)
    
    // 3. 嘗試獲取鎖
    for {
        // 獲取所有子節點
        children, _, err := l.conn.Children(l.lockPath)
        if err != nil {
            return err
        }
        
        sort.Strings(children)
        
        // 如果自己是最小的,獲取鎖成功
        if children[0] == l.node {
            return nil
        }
        
        // 找到前一個節點
        var prevNode string
        for i, child := range children {
            if child == l.node {
                prevNode = children[i-1]
                break
            }
        }
        
        // 監聽前一個節點
        prevPath := path.Join(l.lockPath, prevNode)
        exists, _, ch, err := l.conn.ExistsW(prevPath)
        if err != nil {
            return err
        }
        
        if !exists {
            // 前一個節點已刪除,重試
            continue
        }
        
        // 阻塞等待前一個節點刪除
        <-ch
    }
}

// Unlock 釋放鎖
func (l *ZKLock) Unlock() error {
    nodePath := path.Join(l.lockPath, l.node)
    return l.conn.Delete(nodePath, -1)
}

func (l *ZKLock) createParentNode() error {
    parts := strings.Split(l.lockPath, "/")
    current := ""
    
    for _, part := range parts {
        if part == "" {
            continue
        }
        
        current = path.Join(current, part)
        exists, _, err := l.conn.Exists(current)
        if err != nil {
            return err
        }
        
        if !exists {
            _, err := l.conn.Create(current, []byte{}, 0, 
                zk.WorldACL(zk.PermAll))
            if err != nil && err != zk.ErrNodeExists {
                return err
            }
        }
    }
    
    return nil
}

// 使用示例
func ExampleZKLock() {
    // 連線 ZooKeeper
    conn, _, err := zk.Connect([]string{"localhost:2181"}, time.Second*5)
    if err != nil {
        panic(err)
    }
    defer conn.Close()
    
    // 建立鎖
    lock := NewZKLock(conn, "/locks/resource_123")
    
    // 獲取鎖
    err = lock.Lock()
    if err != nil {
        log.Error("failed to acquire lock", err)
        return
    }
    defer lock.Unlock()
    
    // 業務邏輯
    ProcessResource(123)
}
```

#### 5.3 ZooKeeper 鎖的優點

**1. 強一致性**:
```
基於 ZAB 協議(類似 Raft)
保證資料強一致性
```

**2. 自動容錯**:
```
客戶端斷開連線
臨時節點自動刪除
避免死鎖
```

**3. 公平鎖**:
```
按建立順序排隊
先來先得
```

**4. 高可用**:
```
叢集部署(2N+1 個節點)
容忍 N 個節點故障
```

### 6. Etcd 分散式鎖

#### 6.1 原理

**利用 Etcd 的 Lease 機制**:

```
1. 建立 Lease(租約,TTL 10 秒)
2. 在鍵上設定 Lease
3. 定期 KeepAlive 續期
4. 鎖過期或主動刪除時釋放
```

#### 6.2 實現

```go
package etcdlock

import (
    "context"
    "time"
    
    clientv3 "go.etcd.io/etcd/client/v3"
    "go.etcd.io/etcd/client/v3/concurrency"
)

type EtcdLock struct {
    client  *clientv3.Client
    session *concurrency.Session
    mutex   *concurrency.Mutex
    key     string
}

func NewEtcdLock(client *clientv3.Client, key string, ttl int) (*EtcdLock, error) {
    // 建立 session(帶 Lease)
    session, err := concurrency.NewSession(client, 
        concurrency.WithTTL(ttl))
    if err != nil {
        return nil, err
    }
    
    // 建立 mutex
    mutex := concurrency.NewMutex(session, key)
    
    return &EtcdLock{
        client:  client,
        session: session,
        mutex:   mutex,
        key:     key,
    }, nil
}

// Lock 獲取鎖
func (l *EtcdLock) Lock(ctx context.Context) error {
    return l.mutex.Lock(ctx)
}

// Unlock 釋放鎖
func (l *EtcdLock) Unlock(ctx context.Context) error {
    return l.mutex.Unlock(ctx)
}

// Close 關閉 session
func (l *EtcdLock) Close() error {
    return l.session.Close()
}

// 使用示例
func ExampleEtcdLock() {
    // 連線 Etcd
    client, err := clientv3.New(clientv3.Config{
        Endpoints:   []string{"localhost:2379"},
        DialTimeout: 5 * time.Second,
    })
    if err != nil {
        panic(err)
    }
    defer client.Close()
    
    // 建立鎖
    lock, err := NewEtcdLock(client, "/locks/resource_123", 10)
    if err != nil {
        log.Error("failed to create lock", err)
        return
    }
    defer lock.Close()
    
    // 獲取鎖
    ctx := context.Background()
    err = lock.Lock(ctx)
    if err != nil {
        log.Error("failed to acquire lock", err)
        return
    }
    defer lock.Unlock(ctx)
    
    // 業務邏輯
    ProcessResource(123)
}
```

### 7. 分散式鎖的最佳實踐

#### 7.1 避免常見錯誤

**錯誤 1: 鎖過期時間設定不當**

```go
// ❌ 錯誤
lock := NewLock("resource", 1*time.Second) // TTL 太短
lock.Acquire()

// 業務執行 5 秒
ProcessLongTask() // 5 秒

lock.Release() // 鎖已過期,誤刪其他客戶端的鎖
```

**正確做法**:
```go
// ✅ 正確
// 1. TTL 設定為業務時間的 2-3 倍
lock := NewLock("resource", 10*time.Second)

// 2. 使用 Watchdog 自動續期
lockWithRenewal := NewLockWithWatchdog("resource", 10*time.Second)
```

**錯誤 2: 未檢查鎖持有者**

```go
// ❌ 錯誤
func Unlock(key string) {
    redis.Del(key) // 可能誤刪其他客戶端的鎖
}
```

**正確做法**:
```go
// ✅ 正確
func Unlock(key string, value string) {
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    redis.Eval(script, []string{key}, value)
}
```

**錯誤 3: 鎖粒度過大**

```go
// ❌ 錯誤:全域性鎖
lock := NewLock("global_lock")

// 所有請求都阻塞
```

**正確做法**:
```go
// ✅ 正確:細粒度鎖
lock := NewLock("resource:" + resourceID)

// 只鎖定特定資源
```

#### 7.2 效能優化

**1. 使用本地快取減少競爭**

```go
func ProcessWithCache(resourceID string) {
    // 1. 本地快取
    if cached, ok := localCache.Get(resourceID); ok {
        return cached
    }
    
    // 2. 獲取分散式鎖
    lock := NewLock("resource:" + resourceID)
    if !lock.Acquire() {
        return nil
    }
    defer lock.Release()
    
    // 3. 雙檢查(Double Check)
    if cached, ok := localCache.Get(resourceID); ok {
        return cached
    }
    
    // 4. 處理資料
    result := ProcessResource(resourceID)
    
    // 5. 寫入快取
    localCache.Set(resourceID, result, 1*time.Minute)
    
    return result
}
```

**2. 自旋鎖 vs 阻塞鎖**

```go
// 自旋鎖(適用於鎖持有時間短)
func SpinLock(key string, maxRetries int) bool {
    for i := 0; i < maxRetries; i++ {
        if lock.TryLock() {
            return true
        }
        time.Sleep(10 * time.Millisecond)
    }
    return false
}

// 阻塞鎖(適用於鎖持有時間長)
func BlockingLock(key string, timeout time.Duration) bool {
    return lock.Lock(timeout) // 阻塞直到獲取或超時
}
```

**3. 分段鎖**

```go
// 將資源分成多個段,降低競爭
func GetLockKey(resourceID int64, segments int) string {
    segment := resourceID % int64(segments)
    return fmt.Sprintf("lock:resource:segment:%d", segment)
}

// 使用
lockKey := GetLockKey(123, 16) // 16 個段
lock := NewLock(lockKey)
```

### 8. 監控與告警

#### 8.1 關鍵指標

**業務指標**:
```
- 鎖獲取成功率
- 鎖等待時間 P99
- 鎖持有時間分佈
- 鎖競爭次數
```

**系統指標**:
```
- Redis/ZooKeeper 可用性
- 網路延遲
- 鎖過期率
```

#### 8.2 告警規則

```yaml
alerts:
  - name: LowAcquireRate
    condition: lock_acquire_rate < 80%
    action: 檢查鎖競爭或死鎖
    
  - name: HighWaitTime
    condition: lock_wait_p99 > 1s
    action: 最佳化鎖粒度或增加資源
    
  - name: HighExpireRate
    condition: lock_expire_rate > 5%
    action: 檢查業務執行時間或 TTL 設定
```

## 常見面試考點

### Q1: Redis 分散式鎖如何避免死鎖?

**答案**:

死鎖的原因:
```
1. 客戶端獲取鎖後崩潰
2. 鎖永不釋放
3. 其他客戶端永遠無法獲取鎖
```

**解決方案**:

**1. 設定過期時間 (TTL)**

```go
// SET key value NX EX 10
redis.SetNX(key, value, 10*time.Second)

// 即使客戶端崩潰,鎖也會在 10 秒後自動釋放
```

**2. 合理設定 TTL**

```
TTL 太短: 業務未完成鎖就過期
TTL 太長: 死鎖時間過長

建議: TTL = 業務時間 × 2 ~ 3
```

**3. 使用 Watchdog 自動續期**

```go
// 每 1/3 TTL 續期一次
func renewLock() {
    ticker := time.NewTicker(ttl / 3)
    for {
        select {
        case <-ticker.C:
            redis.Expire(key, ttl)
        case <-stopChan:
            return
        }
    }
}
```

**4. 監控鎖持有時間**

```go
func ProcessWithMonitoring() {
    start := time.Now()
    
    lock.Acquire()
    defer lock.Release()
    
    ProcessBusiness()
    
    duration := time.Since(start)
    
    // 告警:鎖持有時間過長
    if duration > 5*time.Second {
        log.Warn("lock held too long", duration)
    }
}
```

### Q2: 如何保證只有加鎖的客戶端才能解鎖?

**答案**:

**問題場景**:

```
時間軸:
0s:  客戶端 A 獲取鎖(TTL 10s,value = "A")
9s:  客戶端 A 業務執行中
10s: 鎖過期,自動釋放
10s: 客戶端 B 獲取鎖(value = "B")
11s: 客戶端 A 完成業務,呼叫 Unlock
11s: 客戶端 A 誤刪了客戶端 B 的鎖!
```

**解決方案: 鎖的唯一標識**

**錯誤做法**:
```go
// ❌ 不檢查持有者
func WrongUnlock(key string) {
    redis.Del(key) // 誤刪其他客戶端的鎖
}
```

**正確做法**:
```go
// ✅ 使用 UUID 作為鎖的 value
lockValue := uuid.New().String()

// 加鎖
redis.SetNX(key, lockValue, ttl)

// 解鎖時檢查 value
func Unlock(key string, value string) bool {
    // Lua 腳本保證原子性
    script := `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        else
            return 0
        end
    `
    
    result := redis.Eval(script, []string{key}, value)
    return result == 1
}
```

**為什麼需要 Lua 腳本?**

```go
// ❌ 非原子操作
func WrongUnlock(key string, value string) {
    // 1. 檢查 value
    if redis.Get(key) == value {
        // 2. 刪除鎖
        redis.Del(key)
    }
    
    // 問題: 步驟 1 和 2 之間,鎖可能已過期
    // 其他客戶端獲取了鎖
    // 導致誤刪
}

// ✅ 原子操作
// Lua 腳本在 Redis 伺服器端原子性執行
```

### Q3: Redis 單例項鎖 vs Redlock,如何選擇?

**答案**:

**Redis 單例項鎖**:

**優點**:
```
- 實現簡單
- 效能高(單次 Redis 請求)
- 延遲低(< 1ms)
```

**缺點**:
```
- 單點故障
- 主從切換時可能丟失鎖
```

**適用場景**:
```
- 效能要求高
- 可容忍偶爾失敗
- 秒殺、去重、冪等
```

**Redlock (5 個例項)**:

**優點**:
```
- 更可靠(容忍 2 個例項故障)
- 無單點問題
```

**缺點**:
```
- 實現複雜
- 效能較差(5 次 Redis 請求)
- 延遲較高(5~10ms)
- 運維成本高(5 個獨立例項)
```

**適用場景**:
```
- 可靠性要求高
- 可容忍效能損失
- 金融交易、訂單處理
```

**選擇建議**:

| 場景 | 推薦方案 | 理由 |
|------|---------|------|
| **秒殺、限流** | Redis 單例項 + Watchdog | 效能優先 |
| **冪等、去重** | Redis 單例項 | 簡單高效 |
| **訂單處理** | Redlock 或 ZooKeeper | 可靠性優先 |
| **分散式任務排程** | ZooKeeper / Etcd | 強一致性 |
| **高頻低價值操作** | Redis 單例項 | 效能優先 |
| **低頻高價值操作** | ZooKeeper / Etcd | 可靠性優先 |

**實務經驗**:

```
絕大多數場景: Redis 單例項 + Watchdog 已足夠
極端可靠性需求: ZooKeeper / Etcd
折衷方案: Redlock (3 個例項,容忍 1 個故障)
```

### Q4: Redis 鎖 vs ZooKeeper 鎖,有什麼區別?

**答案**:

| 特性 | Redis | ZooKeeper |
|------|-------|-----------|
| **一致性** | 最終一致性 | 強一致性 (ZAB) |
| **效能** | 極高 (10萬+ QPS) | 中等 (1萬 QPS) |
| **可靠性** | 中等 (單點故障) | 高 (叢集容錯) |
| **實現複雜度** | 簡單 | 中等 |
| **運維複雜度** | 簡單 | 複雜 |
| **鎖型別** | 非公平鎖 | 公平鎖 |
| **死鎖處理** | TTL 自動過期 | Session 自動釋放 |
| **適用場景** | 效能優先 | 一致性優先 |

**詳細對比**:

**1. 一致性**

```
Redis:
- 主從非同步複製
- 主從切換可能丟失鎖
- 最終一致性

ZooKeeper:
- ZAB 協議(類似 Raft)
- 強一致性
- 資料不會丟失
```

**2. 效能**

```
Redis:
- 單次獲取鎖: 1 次網路請求
- 延遲: < 1ms
- QPS: 10萬+

ZooKeeper:
- 單次獲取鎖: 多次網路請求(建立節點、查詢、監聽)
- 延遲: 10~50ms
- QPS: 1萬
```

**3. 死鎖處理**

```
Redis:
- 依賴 TTL
- 需要合理設定過期時間
- 需要 Watchdog 續期

ZooKeeper:
- 客戶端斷開,臨時節點自動刪除
- 無需設定 TTL
- 自動容錯
```

**4. 鎖型別**

```
Redis:
- 非公平鎖(競爭獲取)
- 可能出現飢餓

ZooKeeper:
- 公平鎖(順序節點)
- FIFO,不會飢餓
```

**選擇建議**:

```
高效能場景: Redis
- 秒殺
- 限流
- 快取更新

強一致性場景: ZooKeeper
- 分散式協調
- 主節點選舉
- 配置管理
- 分散式任務排程
```

### Q5: 如何處理分散式鎖的超時問題?

**答案**:

**問題場景**:

```
時間軸:
0s:  客戶端獲取鎖(TTL 10s)
0s:  開始執行業務
8s:  業務執行中...
10s: 鎖過期,自動釋放
10s: 其他客戶端獲取鎖
12s: 原客戶端完成業務
12s: 兩個客戶端同時在臨界區! (違反互斥性)
```

**解決方案**:

**1. 合理設定 TTL**

```go
// 評估業務執行時間
業務平均時間: 3 秒
業務 P99 時間: 8 秒

// TTL 設定為 P99 × 2
TTL: 16 秒
```

**2. Watchdog 自動續期**

```go
func AcquireWithWatchdog() {
    lock := NewLock("resource", 10*time.Second)
    lock.Acquire()
    
    // 啟動 Watchdog
    stopChan := make(chan struct{})
    go func() {
        ticker := time.NewTicker(3 * time.Second) // 每 1/3 TTL
        defer ticker.Stop()
        
        for {
            select {
            case <-ticker.C:
                // 續期
                lock.Renew(10 * time.Second)
            case <-stopChan:
                return
            }
        }
    }()
    
    // 業務執行
    ProcessBusiness()
    
    // 停止 Watchdog
    close(stopChan)
    lock.Release()
}
```

**3. Fencing Token (最可靠)**

```
概念: 給每個鎖分配遞增的 token

流程:
1. 客戶端獲取鎖時,同時獲取 token (例如: 123)
2. 客戶端操作資源時,帶上 token
3. 資源檢查 token,只接受 token 更大的請求

示例:
- 客戶端 A 獲取鎖,token = 123
- 客戶端 A 鎖過期
- 客戶端 B 獲取鎖,token = 124
- 客戶端 A 請求資源,token = 123 (拒絕)
- 客戶端 B 請求資源,token = 124 (接受)
```

**實現**:
```go
func ProcessWithFencingToken() {
    // 1. 獲取鎖和 token
    lock, token := AcquireLockWithToken("resource")
    defer lock.Release()
    
    // 2. 操作資源時帶上 token
    UpdateResource(resourceID, data, token)
}

func UpdateResource(id int64, data Data, token int64) error {
    // 檢查 token
    currentToken := GetCurrentToken(id)
    
    if token < currentToken {
        return errors.New("stale token, request rejected")
    }
    
    // 更新資源
    db.Update(id, data)
    
    // 更新 token
    SetCurrentToken(id, token)
    
    return nil
}
```

**4. 超時監控**

```go
func ProcessWithTimeout() {
    lock := NewLock("resource", 10*time.Second)
    lock.Acquire()
    defer lock.Release()
    
    // 設定超時
    ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
    defer cancel()
    
    // 執行業務
    err := ProcessBusinessWithContext(ctx)
    
    if err == context.DeadlineExceeded {
        log.Error("business timeout, lock may expire")
        // 告警或回滾
    }
}
```

**推薦方案組合**:

```
基礎: 合理設定 TTL (P99 × 2)
進階: Watchdog 自動續期
終極: Fencing Token (最可靠,但實現複雜)
```

## 總結

分散式鎖是分散式系統協調的基礎元件,涵蓋了:

**核心挑戰**:
1. **互斥性**: 同一時刻只有一個客戶端持有鎖
2. **死鎖避免**: 鎖必須能夠被釋放
3. **容錯性**: 部分節點故障不影響鎖服務
4. **效能**: 高並行下的效能表現

**關鍵技術**:
- **Redis SETNX + TTL**: 高效能,實現簡單
- **Redlock 演算法**: 多例項提高可靠性
- **ZooKeeper 臨時順序節點**: 強一致性,公平鎖
- **Etcd Lease**: 雲原生,現代化

**設計原則**:
- **選擇合適的方案**: 效能 vs 一致性
- **避免常見錯誤**: TTL 設定、鎖持有者檢查、鎖粒度
- **Watchdog 續期**: 避免鎖過期問題
- **監控告警**: 追蹤鎖效能和異常

**實務建議**:
```
高效能場景: Redis 單例項 + Watchdog
高可靠場景: ZooKeeper / Etcd
折衷方案: Redlock (3~5 個例項)
```

掌握分散式鎖設計,對理解分散式協調、一致性、CAP 定理有重要幫助!
