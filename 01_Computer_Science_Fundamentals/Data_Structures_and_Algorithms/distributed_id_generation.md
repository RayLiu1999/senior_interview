# 分散式 ID 生成算法

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Snowflake`, `UUID`, `分散式ID`

## 問題詳述

在分散式系統中,需要為海量數據生成全局唯一的ID。這些ID需要滿足唯一性、有序性、高性能等要求。分散式ID生成是後端系統設計的核心問題之一。

## 核心理論與詳解

### 1. 分散式ID需求

**核心需求**:
- **全局唯一性**: 絕對不能重複
- **趨勢遞增**: 方便資料庫索引
- **高性能**: 毫秒級生成
- **高可用**: 不依賴單點
- **安全性**: 不易被猜測

**常見場景**:
- 訂單號生成
- 用戶ID分配
- 消息ID
- 分散式資料庫主鍵

### 2. 主流方案對比

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **UUID** | 簡單、本地生成 | 無序、佔空間 | 日誌ID、臨時ID |
| **資料庫自增** | 簡單、有序 | 依賴DB、性能瓶頸 | 小規模系統 |
| **Redis INCR** | 高性能 | 依賴Redis | 中等規模 |
| **Snowflake** | 有序、高性能、分散式 | 時鐘回撥問題 | 大規模分散式 |
| **Leaf (美團)** | 雙buffer、高可用 | 複雜度高 | 超大規模 |

### 3. Snowflake算法詳解

#### 結構設計

```
0 - 0000000000 0000000000 0000000000 0000000000 0 - 00000 - 00000 - 000000000000
   |                                               | |     | |     | |
   符號位(1bit)                                     時間戳(41bits)
                                                            機器ID(10bits)
                                                                  序列號(12bits)

總共64位(int64):
- 1位: 符號位,始終為0
- 41位: 時間戳(毫秒級),可用69年
- 10位: 機器ID(最多1024台機器)
   - 5位: 數據中心ID
   - 5位: 機器ID
- 12位: 序列號(每毫秒最多4096個ID)
```

#### Go實現

```go
type Snowflake struct {
    mu            sync.Mutex
    epoch         int64  // 起始時間戳(毫秒)
    datacenterID  int64  // 數據中心ID
    workerID      int64  // 機器ID
    sequence      int64  // 序列號
    lastTimestamp int64  // 上次生成ID的時間戳
}

const (
    workerIDBits     = 5
    datacenterIDBits = 5
    sequenceBits     = 12
    
    maxWorkerID     = -1 ^ (-1 << workerIDBits)     // 31
    maxDatacenterID = -1 ^ (-1 << datacenterIDBits) // 31
    maxSequence     = -1 ^ (-1 << sequenceBits)     // 4095
    
    workerIDShift      = sequenceBits                                // 12
    datacenterIDShift  = sequenceBits + workerIDBits                 // 17
    timestampLeftShift = sequenceBits + workerIDBits + datacenterIDBits // 22
)

func NewSnowflake(datacenterID, workerID int64) (*Snowflake, error) {
    if datacenterID < 0 || datacenterID > maxDatacenterID {
        return nil, fmt.Errorf("datacenterID must be between 0 and %d", maxDatacenterID)
    }
    if workerID < 0 || workerID > maxWorkerID {
        return nil, fmt.Errorf("workerID must be between 0 and %d", maxWorkerID)
    }
    
    return &Snowflake{
        epoch:        1609459200000, // 2021-01-01 00:00:00
        datacenterID: datacenterID,
        workerID:     workerID,
        sequence:     0,
        lastTimestamp: -1,
    }, nil
}

func (s *Snowflake) NextID() (int64, error) {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    timestamp := s.timeGen()
    
    // 時鐘回撥
    if timestamp < s.lastTimestamp {
        return 0, fmt.Errorf("clock moved backwards")
    }
    
    if timestamp == s.lastTimestamp {
        // 同一毫秒內,序列號自增
        s.sequence = (s.sequence + 1) & maxSequence
        if s.sequence == 0 {
            // 序列號用完,等待下一毫秒
            timestamp = s.tilNextMillis(s.lastTimestamp)
        }
    } else {
        // 新的毫秒,序列號重置為0
        s.sequence = 0
    }
    
    s.lastTimestamp = timestamp
    
    // 組裝ID
    id := ((timestamp - s.epoch) << timestampLeftShift) |
          (s.datacenterID << datacenterIDShift) |
          (s.workerID << workerIDShift) |
          s.sequence
    
    return id, nil
}

func (s *Snowflake) timeGen() int64 {
    return time.Now().UnixNano() / 1e6
}

func (s *Snowflake) tilNextMillis(lastTimestamp int64) int64 {
    timestamp := s.timeGen()
    for timestamp <= lastTimestamp {
        timestamp = s.timeGen()
    }
    return timestamp
}

// 解析ID
func ParseSnowflakeID(id int64) (timestamp, datacenterID, workerID, sequence int64) {
    timestamp = (id >> timestampLeftShift) + 1609459200000
    datacenterID = (id >> datacenterIDShift) & maxDatacenterID
    workerID = (id >> workerIDShift) & maxWorkerID
    sequence = id & maxSequence
    return
}
```

#### 時鐘回撥處理

```go
// 方案一: 拒絕生成
if timestamp < s.lastTimestamp {
    return 0, fmt.Errorf("clock moved backwards")
}

// 方案二: 等待時鐘追上
if timestamp < s.lastTimestamp {
    offset := s.lastTimestamp - timestamp
    if offset > 5 {
        return 0, fmt.Errorf("clock moved backwards by %dms", offset)
    }
    time.Sleep(time.Duration(offset) * time.Millisecond)
    timestamp = s.timeGen()
}

// 方案三: 使用擴展位存儲時鐘回撥標記
type SnowflakeV2 struct {
    // ...原有欄位
    clockBackwardFlag bool
}
```

### 4. 其他ID生成方案

#### 方案一: UUID

```go
import "github.com/google/uuid"

// UUID v1: 基於時間和MAC地址
func generateUUIDv1() string {
    return uuid.New().String()
}

// UUID v4: 完全隨機
func generateUUIDv4() string {
    return uuid.New().String()
}

// 優點: 簡單、本地生成、全局唯一
// 缺點: 無序、佔空間(36字節)、不適合做主鍵
```

#### 方案二: 資料庫自增

```sql
CREATE TABLE id_generator (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stub CHAR(1) NOT NULL DEFAULT ''
) ENGINE=MyISAM;

-- 生成ID
REPLACE INTO id_generator (stub) VALUES ('a');
SELECT LAST_INSERT_ID();

-- 優點: 簡單、有序
-- 缺點: 依賴資料庫、性能瓶頸、單點故障
```

#### 方案三: Redis INCR

```go
func generateIDWithRedis(client *redis.Client, key string) (int64, error) {
    id, err := client.Incr(context.Background(), key).Result()
    if err != nil {
        return 0, err
    }
    return id, nil
}

// 優點: 高性能、原子性
// 缺點: 依賴Redis、需要持久化
```

#### 方案四: Leaf (美團開源)

**Leaf-Segment方案**:
```go
type LeafSegment struct {
    mu         sync.RWMutex
    currentID  int64
    maxID      int64
    step       int64
    loadingNext bool
}

func (l *LeafSegment) NextID() (int64, error) {
    l.mu.Lock()
    defer l.mu.Unlock()
    
    if l.currentID >= l.maxID {
        // 從資料庫加載新號段
        return 0, fmt.Errorf("need to load new segment")
    }
    
    l.currentID++
    
    // 當使用到號段的10%時,異步加載下一個號段
    if !l.loadingNext && l.currentID >= l.maxID*0.9 {
        l.loadingNext = true
        go l.loadNextSegment()
    }
    
    return l.currentID, nil
}

func (l *LeafSegment) loadNextSegment() {
    // 從資料庫加載下一個號段
    // UPDATE id_generator SET max_id = max_id + step WHERE biz_type = 'order'
}
```

### 5. 方案選擇建議

**小規模系統(QPS < 1000)**:
- 使用資料庫自增
- 簡單可靠

**中等規模(QPS 1000-10000)**:
- Redis INCR
- Leaf-Segment

**大規模分散式(QPS > 10000)**:
- Snowflake
- Leaf-Snowflake

**特殊場景**:
- 日誌追蹤: UUID
- 臨時ID: 隨機數
- 展示ID: 自定義編碼(如短鏈接)

## 實際應用場景

### 1. 訂單號生成

```go
type OrderIDGenerator struct {
    snowflake *Snowflake
    prefix    string
}

func (g *OrderIDGenerator) Generate() string {
    id, _ := g.snowflake.NextID()
    // 添加業務前綴和校驗位
    return fmt.Sprintf("%s%016d%d", g.prefix, id, g.checksum(id))
}

func (g *OrderIDGenerator) checksum(id int64) int {
    // 簡單的校驗位算法
    sum := int64(0)
    for id > 0 {
        sum += id % 10
        id /= 10
    }
    return int(sum % 10)
}
```

### 2. 分散式追蹤ID

```go
type TraceIDGenerator struct {
    sf *Snowflake
}

func (g *TraceIDGenerator) Generate(ctx context.Context) string {
    id, _ := g.sf.NextID()
    // 格式: timestamp-snowflakeID-random
    return fmt.Sprintf("%d-%016x-%04x", 
        time.Now().Unix(), id, rand.Intn(0xFFFF))
}
```

### 3. 短鏈接ID生成

```go
func generateShortURL(longURL string) string {
    // 使用Snowflake生成ID
    id, _ := snowflake.NextID()
    
    // Base62編碼(0-9a-zA-Z)
    return base62Encode(id)
}

const base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func base62Encode(num int64) string {
    if num == 0 {
        return "0"
    }
    
    result := ""
    for num > 0 {
        result = string(base62Chars[num % 62]) + result
        num /= 62
    }
    return result
}
```

## 總結

**分散式ID生成核心要點**:
1. **Snowflake**: 最常用,平衡性能和複雜度
2. **時鐘回撥**: 關鍵問題,需要妥善處理
3. **機器ID分配**: 可用Zookeeper、etcd等協調
4. **號段模式**: 減少資料庫訪問,提高性能
5. **業務定制**: 根據實際需求選擇或改進方案

**實現要點**:
- 確保唯一性(並發控制)
- 處理時鐘回撥
- 考慮擴展性
- 監控告警(ID生成失敗率)

**面試考點**:
- Snowflake算法原理和實現
- 時鐘回撥問題及解決方案
- 不同方案的優缺點對比
- 實際業務場景的方案選擇

分散式ID生成是分散式系統的基礎組件,深入理解其原理和實現細節對於系統設計至關重要。
