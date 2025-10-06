# 磁盤 I/O 優化

- **難度**: 6
- **重要程度**: 5
- **標籤**: `I/O 調度`, `緩存`, `零拷貝`, `mmap`, `DMA`, `預讀`

## 問題詳述

解釋磁盤 I/O 的性能瓶頸、操作系統層面的優化技術（I/O 調度算法、頁緩存、預讀）、零拷貝技術（sendfile、mmap），以及應用層的優化策略。

## 核心理論與詳解

### 1. 磁盤 I/O 性能特徵

#### 機械硬盤（HDD）延遲組成

```
總延遲 = 尋道時間 + 旋轉延遲 + 傳輸時間

尋道時間（Seek Time）: 3-15ms
    └─ 磁頭移動到目標磁道

旋轉延遲（Rotational Latency）: 0-8ms (平均 4ms)
    └─ 等待目標扇區旋轉到磁頭下

傳輸時間（Transfer Time）: 微秒級
    └─ 實際讀取數據

示例：
讀取 4KB 數據 ≈ 10ms
讀取 1MB 數據 ≈ 10ms + (1024KB / 100MB/s) ≈ 20ms
```

**關鍵特性**：
- 隨機 I/O 慢（每次都有尋道+旋轉延遲）
- 順序 I/O 快（一次尋道可讀取大量連續數據）
- IOPS（每秒 I/O 操作數）受限（~100-200）

#### 固態硬盤（SSD）特性

```
讀取延遲: 0.1ms
寫入延遲: 0.1-1ms
隨機 IOPS: 50K-500K（遠超HDD）
順序讀寫: 500MB/s - 7GB/s
```

**優勢**：
- 無機械部件，隨機訪問快
- 延遲低且穩定

**限制**：
- 寫入放大（Write Amplification）
- 有限的擦寫次數
- 價格較高

### 2. 操作系統 I/O 棧

```
應用程序
    ↓ read()/write()
系統調用層
    ↓
虛擬文件系統 (VFS)
    ↓
頁緩存 (Page Cache)
    ↓
文件系統 (ext4/XFS)
    ↓
塊層 (Block Layer)
    ↓
I/O 調度器
    ↓
設備驅動
    ↓
硬件 (DMA 控制器)
    ↓
磁盤
```

### 3. 頁緩存（Page Cache）

#### 工作原理

**讀緩存**：
```
1. 應用調用 read()
2. 內核檢查頁緩存
   ├─ 命中：直接返回（極快）
   └─ 未命中：從磁盤讀取 → 存入緩存 → 返回
```

**寫緩存**：
```
寫入策略：
1. Write-Through（直寫）
   └─ 同時寫緩存和磁盤（安全但慢）

2. Write-Back（回寫，默認）
   ├─ 先寫緩存，標記為髒頁（Dirty Page）
   ├─ 異步刷新到磁盤（pdflush/flusher 線程）
   └─ 快但有數據丟失風險

3. Write-Around（繞寫）
   └─ 直接寫磁盤，不更新緩存
```

#### 緩存管理

**LRU 替換**：
- 最近最少使用的頁被淘汰
- 保留熱數據

**髒頁刷新時機**：
```bash
# 查看配置
cat /proc/sys/vm/dirty_ratio           # 30（髒頁占總內存30%時同步刷新）
cat /proc/sys/vm/dirty_background_ratio # 10（髒頁占10%時後台刷新）
cat /proc/sys/vm/dirty_expire_centisecs # 3000（髒頁存活30秒後刷新）
```

#### 繞過緩存（Direct I/O）

```go
// 使用 O_DIRECT 標誌
fd, _ := syscall.Open("/data/file", syscall.O_RDWR|syscall.O_DIRECT, 0666)
```

**適用場景**：
- 數據庫系統（自己管理緩存）
- 大文件順序讀寫（不需要緩存）
- 避免緩存污染

### 4. 預讀（Readahead）

#### 順序預讀

```
應用讀取 Block 0:
    ↓
內核預測會順序讀取:
    └─ 預讀 Block 1, 2, 3, 4...

優勢：
- 減少後續 I/O 延遲
- 利用磁盤順序讀取優勢
```

**動態調整**：
- 檢測到順序訪問模式 → 增加預讀量
- 檢測到隨機訪問 → 減少或停止預讀

```bash
# 查看預讀大小
blockdev --getra /dev/sda  # 單位：512字節扇區

# 設置預讀大小
blockdev --setra 256 /dev/sda  # 128KB
```

#### 應用層控制

```go
// Go 中提示內核預讀
file.Seek(offset, 0)
syscall.Fadvise(int(file.Fd()), offset, length, syscall.FADV_WILLNEED)
```

### 5. I/O 調度算法

#### 為什麼需要調度

```
應用請求順序：Block 100, 10, 50, 200
磁盤訪問順序（優化後）：10, 50, 100, 200
    ↑ 減少磁頭移動距離
```

#### (1) NOOP（No Operation）

- 最簡單：FIFO 隊列
- 無重排序
- 適合 SSD（無尋道成本）

#### (2) Deadline 調度器

**目標**：保證 I/O 請求在截止時間內完成

```
兩個隊列：
1. 讀請求隊列（截止時間：500ms）
2. 寫請求隊列（截止時間：5s）

優先級：
讀 > 寫（讀通常阻塞進程）

排序隊列：
按塊地址排序（減少尋道）

調度邏輯：
if 有請求超期:
    處理最早超期的請求
else:
    從排序隊列中處理（優化吞吐量）
```

**適用**：HDD、數據庫服務器

#### (3) CFQ（Completely Fair Queuing，默認）

**目標**：公平分配 I/O 帶寬

```
每個進程一個隊列：
進程A: [req1] [req2] ...
進程B: [req1] [req2] ...
進程C: [req1] [req2] ...

時間片輪轉：
- 每個進程分配固定時間片
- 時間片內處理該進程的請求
- 防止某個進程獨占 I/O
```

**優點**：
- 公平性好
- 避免飢餓

**缺點**：
- 吞吐量不如 Deadline

#### (4) mq-deadline / BFQ（現代調度器）

**多隊列（mq-deadline）**：
- 利用 SSD 的並行性
- 為每個 CPU 核心維護隊列
- 減少鎖競爭

**BFQ（Budget Fair Queuing）**：
- CFQ 的改進版
- 更好的公平性和響應性

### 6. 零拷貝技術（Zero-Copy）

#### 傳統 I/O 的問題

```
傳統文件傳輸（如發送文件到網絡）:

read(file_fd, buffer, size);  
write(socket_fd, buffer, size);

數據拷貝：
1. DMA: 磁盤 → 內核緩衝區
2. CPU: 內核緩衝區 → 用戶空間緩衝區 ← 拷貝1
3. CPU: 用戶空間緩衝區 → Socket緩衝區 ← 拷貝2
4. DMA: Socket緩衝區 → 網卡

總共 4 次拷貝，2 次 CPU 拷貝
```

#### sendfile() 系統調用

```go
// Linux sendfile
sendfile(socket_fd, file_fd, offset, count);

數據流：
1. DMA: 磁盤 → 內核緩衝區
2. CPU: 內核緩衝區 → Socket緩衝區 ← 僅1次CPU拷貝
3. DMA: Socket緩衝區 → 網卡

或（支持 DMA scatter-gather）:
1. DMA: 磁盤 → 內核緩衝區
2. DMA: 內核緩衝區 → 網卡 ← 0次CPU拷貝！
```

**應用**：
- Nginx 文件服務
- Kafka 日誌傳輸
- 任何文件到網絡的場景

#### mmap() + write()

```go
// 內存映射文件
data := mmap(file_fd, size, PROT_READ, MAP_SHARED)
write(socket_fd, data, size)

數據流：
1. 缺頁中斷觸發：磁盤 → 頁緩存
2. 直接從頁緩存 → Socket緩衝區
3. Socket緩衝區 → 網卡

優點：
- 避免用戶空間緩衝區
- 共享內存

缺點：
- 頁錯誤開銷
- 不適合小文件
```

#### splice()

```go
// Linux splice (零拷貝管道)
splice(file_fd, NULL, pipe_fd[1], NULL, size, 0);
splice(pipe_fd[0], NULL, socket_fd, NULL, size, 0);

數據流：
磁盤 → 內核緩衝區 → 管道 → Socket → 網卡
     ↑ 全程在內核空間，0 次用戶空間拷貝
```

### 7. DMA（Direct Memory Access）

#### 工作原理

```
無 DMA：
CPU 從磁盤逐字節搬運數據到內存（占用 CPU）

有 DMA：
1. CPU 配置 DMA 控制器（源地址、目標地址、大小）
2. DMA 控制器自主完成數據傳輸
3. 完成後發送中斷通知 CPU

優勢：
- CPU 釋放出來處理其他任務
- 提高 I/O 吞吐量
```

#### Scatter-Gather DMA

```
傳統 DMA：
只能傳輸連續內存

Scatter-Gather DMA：
├─ Scatter: 從連續設備讀取到多個內存片段
└─ Gather: 從多個內存片段寫入連續設備

應用：
sendfile() 實現真正的零拷貝
```

### 8. 異步 I/O（AIO）

#### 同步 vs 異步

```
同步 I/O（阻塞）:
fd = open("file.txt")
data = read(fd, buffer, size)  ← 阻塞等待
process(data)

異步 I/O:
aio_read(&request)  ← 立即返回
// 繼續執行其他任務
aio_suspend(&request)  // 或輪詢狀態
data = get_result(&request)
process(data)
```

#### Linux AIO

```go
// POSIX AIO
var aiocb C.struct_aiocb
C.aio_read(&aiocb)

// 檢查狀態
for C.aio_error(&aiocb) == C.EINPROGRESS {
    // 處理其他任務
}
```

#### io_uring（現代異步 I/O）

**Linux 5.1+ 的高性能異步 I/O 接口**

```
提交隊列（SQ）     完成隊列（CQ）
    ↓                  ↑
   內核
    ↓                  ↑
用戶程序批量提交請求 → 批量處理結果

優勢：
- 真正的異步（不阻塞）
- 批量操作減少系統調用
- 共享內存環（減少拷貝）
```

### 9. 應用層優化策略

#### (1) 批量 I/O

```go
// ✗ 逐個寫入（大量系統調用）
for i := 0; i < 10000; i++ {
    write(fd, data[i], size)
}

// ✓ 批量寫入
buffer := make([]byte, 0, totalSize)
for i := 0; i < 10000; i++ {
    buffer = append(buffer, data[i]...)
}
write(fd, buffer, len(buffer))
```

#### (2) 使用緩衝 I/O

```go
// ✗ 無緩衝（頻繁系統調用）
for _, line := range lines {
    fmt.Fprintf(file, "%s\n", line)
}

// ✓ 使用 bufio
writer := bufio.NewWriter(file)
for _, line := range lines {
    writer.WriteString(line + "\n")
}
writer.Flush()  // 一次刷新
```

#### (3) 對齊訪問（Direct I/O）

```go
// Direct I/O 要求：
// - 偏移量必須是塊大小的倍數
// - 數據長度必須是塊大小的倍數
// - 內存緩衝區地址必須對齊

const blockSize = 4096
buffer := make([]byte, blockSize)
offset := blockSize * n  // 對齊的偏移量
```

#### (4) 預分配空間

```go
// ✗ 動態擴展文件（碎片化）
for i := 0; i < 10000; i++ {
    write(fd, data, size)  // 文件逐漸增長
}

// ✓ 預分配（減少碎片，提高性能）
fallocate(fd, 0, 0, 10000*size)  // 預分配空間
for i := 0; i < 10000; i++ {
    write(fd, data, size)
}
```

#### (5) 數據結構對齊

```
B+Tree 節點對齊到頁大小（4KB）：
- 一次 I/O 讀取完整節點
- 避免跨頁讀取
```

### 10. 監控與診斷

#### iostat（I/O 統計）

```bash
iostat -x 1

Device  r/s   w/s   rkB/s  wkB/s  await  svctm  %util
sda     120   30    4800   1200   8.5    2.1    80%

關鍵指標：
- r/s, w/s: 每秒讀寫次數
- await: 平均等待時間（ms）
- %util: 磁盤繁忙度（接近100%表示飽和）
```

#### iotop（進程 I/O）

```bash
iotop -o  # 只顯示有 I/O 的進程

找出 I/O 密集型進程
```

#### 查看頁緩存狀態

```bash
# 緩存使用情況
free -h

# 清空緩存（測試用）
sync; echo 3 > /proc/sys/vm/drop_caches

# 查看文件緩存情況
vmtouch -v /path/to/file
```

## 實際應用場景

### 1. 數據庫系統

**MySQL InnoDB**：
- 自己管理緩衝池（innodb_buffer_pool_size）
- 使用 Direct I/O 繞過頁緩存
- O_DIRECT + 異步 I/O
- 日誌文件使用 fsync 確保持久化

**PostgreSQL**：
- 依賴操作系統頁緩存
- 使用 mmap 映射共享內存
- WAL 日誌使用 fsync

### 2. Kafka

**高吞吐量設計**：
- 順序寫入日誌（充分利用 HDD 優勢）
- 依賴頁緩存（不自己管理緩存）
- sendfile() 實現零拷貝消費
- 批量寫入減少系統調用

### 3. Nginx

```
配置優化：
sendfile on;           # 啟用零拷貝
tcp_nopush on;         # 批量發送
aio threads;           # 異步 I/O
directio 4m;           # 大文件使用 Direct I/O
```

### 4. Redis

**內存為主，I/O 優化**：
- AOF 日誌：appendfsync everysec（每秒刷新）
- RDB 快照：fork + 寫時複製
- 使用內存映射（RDB 加載）

## 總結

### 優化層次

```
硬件層：SSD > HDD，RAID 條帶化
內核層：I/O 調度器、頁緩存、預讀
系統調用：零拷貝、異步 I/O、Direct I/O
應用層：批量操作、緩衝、預分配
```

### 通用原則

1. **順序優於隨機**：盡量順序訪問
2. **批量優於單次**：減少系統調用
3. **異步優於同步**：提高並發度
4. **緩存優先**：利用頁緩存/應用緩存
5. **零拷貝**：減少數據搬運
6. **對齊訪問**：匹配塊大小

### 資深工程師需掌握

- 理解 I/O 棧的每一層
- 根據應用特點選擇優化策略
- 使用工具診斷 I/O 瓶頸
- 權衡吞吐量與延遲
- 理解數據持久化的權衡（性能 vs 可靠性）
- 設計 I/O 友好的數據結構
