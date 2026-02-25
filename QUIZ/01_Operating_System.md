# 作業系統 (Operating System) - 重點考題 (Quiz)

> 這份考題是從作業系統章節中挑選出**重要程度 4-5** 的核心題目，設計成自我測驗的形式。
> 
> **使用方式**：先嘗試自己回答問題，再展開「答案提示」核對重點，最後點擊連結查看完整解答。

---

## 🔄 進程與線程

### Q1: 進程與線程的區別是什麼？

**難度**: ⭐⭐⭐⭐ (4) | **重要性**: 🔴 必考

請比較進程和線程的區別，並說明各自適合的使用場景。

<details>
<summary>💡 答案提示</summary>

| 比較項目 | 進程 (Process) | 線程 (Thread) |
|----------|---------------|---------------|
| 定義 | 資源分配的基本單位 | CPU 調度的基本單位 |
| 地址空間 | 獨立地址空間 | 共享進程的地址空間 |
| 創建開銷 | 高（需要分配資源） | 低（共享資源） |
| 通信方式 | IPC（管道、共享內存等） | 直接讀寫共享變量 |
| 隔離性 | 強（進程崩潰不影響其他） | 弱（線程崩潰可能影響整個進程） |
| 切換開銷 | 高（需要切換地址空間） | 低 |

**使用場景**：
- **進程**：需要隔離的獨立服務、瀏覽器標籤頁
- **線程**：需要共享資料、高並發處理

**Go 語言特殊**：
- Goroutine 是用戶態線程
- 比系統線程更輕量（幾 KB）
- M:N 調度模型

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/process_vs_thread.md)

---

### Q2: 進程間通信 (IPC) 有哪些方式？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請列舉常見的進程間通信方式，並比較它們的優缺點。

<details>
<summary>💡 答案提示</summary>

| IPC 方式 | 特點 | 適用場景 |
|----------|------|----------|
| **管道 (Pipe)** | 單向、親緣進程 | 父子進程通信 |
| **命名管道 (FIFO)** | 可用於非親緣進程 | 不相關進程通信 |
| **消息佇列** | 結構化消息、內核管理 | 異步通信 |
| **共享內存** | 最快、需要同步 | 大量資料共享 |
| **信號 (Signal)** | 通知機制 | 進程控制 |
| **Socket** | 可跨機器 | 網路通信、微服務 |

**共享內存 + 信號量**：
- 最高效的組合
- 共享內存傳資料
- 信號量做同步

**現代應用**：
- Redis/Memcached：跨進程快取
- gRPC/HTTP：跨服務通信
- Kafka/RabbitMQ：消息佇列

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/inter_process_communication.md)

---

### Q3: 什麼是死鎖？如何預防和解決？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋死鎖的四個必要條件，以及如何預防死鎖。

<details>
<summary>💡 答案提示</summary>

**死鎖四個必要條件**：
1. **互斥**：資源只能被一個進程持有
2. **持有並等待**：持有資源的同時等待其他資源
3. **不可剝奪**：資源只能由持有者主動釋放
4. **循環等待**：進程間形成環形等待鏈

**預防策略**（破壞任一條件）：

| 條件 | 預防方法 |
|------|----------|
| 持有並等待 | 一次性申請所有資源 |
| 不可剝奪 | 申請失敗時釋放已持有資源 |
| 循環等待 | 按固定順序獲取鎖 |

**實務建議**：
1. **按順序加鎖**：定義全局鎖順序
2. **使用 tryLock + 超時**
3. **減少鎖粒度**
4. **使用無鎖資料結構**

**Go 死鎖檢測**：
- `go run -race` 檢測競態條件
- `GODEBUG=schedtrace=1000` 調度追蹤

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/deadlock_prevention.md)

---

## 💾 記憶體管理

### Q4: 解釋虛擬記憶體和分頁機制

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請說明虛擬記憶體的作用、分頁機制的原理，以及頁面置換演算法。

<details>
<summary>💡 答案提示</summary>

**虛擬記憶體的作用**：
1. 每個進程有獨立的地址空間
2. 記憶體隔離和保護
3. 可使用比物理記憶體更大的地址空間

**分頁機制**：
```
虛擬地址 → 頁表 → 物理地址
         MMU (Memory Management Unit)
```

- **頁 (Page)**：虛擬記憶體的基本單位（通常 4KB）
- **頁框 (Frame)**：物理記憶體的基本單位
- **頁表**：虛擬頁到物理頁框的映射

**TLB (Translation Lookaside Buffer)**：
- 頁表的快取
- 加速地址轉換

**頁面置換演算法**：
| 演算法 | 原理 | 特點 |
|--------|------|------|
| FIFO | 先進先出 | 簡單但效果差 |
| LRU | 最近最少使用 | 效果好，實現複雜 |
| Clock | 近似 LRU | 效能和效果的平衡 |

**缺頁中斷**：
訪問的頁不在記憶體 → 觸發缺頁中斷 → 載入頁面

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/virtual_memory_paging.md)

---

## 📁 I/O 模型

### Q5: 五種 I/O 模型的區別是什麼？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋五種 I/O 模型的工作原理和適用場景。

<details>
<summary>💡 答案提示</summary>

| I/O 模型 | 阻塞等待 | 資料拷貝 | 特點 |
|----------|----------|----------|------|
| **阻塞 I/O** | 阻塞 | 阻塞 | 最簡單，一個連接一個線程 |
| **非阻塞 I/O** | 輪詢 | 阻塞 | 需要不斷輪詢，CPU 浪費 |
| **I/O 多路復用** | 阻塞在 select | 阻塞 | 單線程處理多連接 |
| **信號驅動** | 非阻塞 | 阻塞 | 較少使用 |
| **異步 I/O** | 非阻塞 | 非阻塞 | 真正的異步，回調通知 |

**I/O 多路復用（最常用）**：
- 一個線程監控多個 fd
- 有事件才處理
- 如 select, poll, epoll

**同步 vs 異步**：
- 同步：資料拷貝時用戶進程參與
- 異步：內核完成所有操作後通知

**阻塞 vs 非阻塞**：
- 阻塞：調用後等待返回
- 非阻塞：立即返回，可能無結果

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/io_models_comparison.md)

---

### Q6: epoll vs select vs poll 的區別

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請比較這三種 I/O 多路復用機制的差異和優劣。

<details>
<summary>💡 答案提示</summary>

| 特性 | select | poll | epoll |
|------|--------|------|-------|
| 資料結構 | 位圖（fd_set） | 鏈表 | 紅黑樹 + 就緒鏈表 |
| fd 上限 | 1024 | 無限制 | 無限制 |
| 傳遞方式 | 每次全部拷貝 | 每次全部拷貝 | 只拷貝就緒的 |
| 事件獲取 | 遍歷 O(n) | 遍歷 O(n) | 回調 O(1) |
| 觸發模式 | 水平觸發 | 水平觸發 | LT / ET |

**epoll 高效的原因**：
1. **事件驅動**：只關心就緒的 fd
2. **mmap 映射**：減少內核到用戶空間拷貝
3. **回調機制**：fd 就緒時加入就緒隊列

**觸發模式**：
- **LT (Level Triggered)**：有資料就一直通知
- **ET (Edge Triggered)**：只在狀態變化時通知一次，需要非阻塞 I/O

**適用場景**：
- 連接數少（<1000）：select 夠用
- 連接數多：必須用 epoll
- 跨平台：select（但效能差）

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/epoll_select_poll.md)

---

### Q7: 什麼是零拷貝 (Zero-Copy)？

**難度**: ⭐⭐⭐⭐⭐⭐ (6) | **重要性**: 🔴 必考

請解釋零拷貝的原理和應用場景。

<details>
<summary>💡 答案提示</summary>

**傳統 I/O 的拷貝過程**：
```
磁碟 → 內核緩衝區 → 用戶緩衝區 → Socket緩衝區 → 網卡
       (1)         (2)          (3)           (4)
```
- 4 次拷貝，4 次上下文切換

**零拷貝方案**：

1. **mmap + write**
   - 減少一次拷貝
   - 用戶空間直接映射內核緩衝區

2. **sendfile**
   - 資料完全在內核完成
   - 2 次拷貝，2 次上下文切換

3. **sendfile + DMA gather**
   - 最高效，0 次 CPU 拷貝
   - 只有 DMA 拷貝

**應用場景**：
| 技術 | 應用 |
|------|------|
| Kafka | 日誌傳輸 |
| Nginx | 靜態文件 |
| Netty | 網路框架 |

**Go 語言**：
- `io.Copy` 會利用 splice 系統調用
- `net.TCPConn.ReadFrom` 零拷貝傳輸

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/disk_io_optimization.md)

---

## 🔐 線程同步

### Q8: 線程同步機制有哪些？

**難度**: ⭐⭐⭐⭐⭐⭐⭐ (7) | **重要性**: 🔴 必考

請解釋互斥鎖、讀寫鎖、條件變量、信號量的差異和使用場景。

<details>
<summary>💡 答案提示</summary>

| 機制 | 特點 | 適用場景 |
|------|------|----------|
| **互斥鎖 (Mutex)** | 獨佔訪問 | 通用臨界區保護 |
| **讀寫鎖 (RWLock)** | 讀共享，寫獨佔 | 讀多寫少 |
| **自旋鎖 (SpinLock)** | 忙等待 | 臨界區極短 |
| **條件變量 (Cond)** | 等待條件滿足 | 生產者-消費者 |
| **信號量 (Semaphore)** | 計數器控制並發數 | 限制並發數 |

**Go 語言同步原語**：
```go
// Mutex
var mu sync.Mutex
mu.Lock()
// critical section
mu.Unlock()

// RWMutex
var rwmu sync.RWMutex
rwmu.RLock()   // 讀鎖
rwmu.RUnlock()
rwmu.Lock()    // 寫鎖
rwmu.Unlock()

// WaitGroup
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    // work
}()
wg.Wait()

// Channel (更常用)
ch := make(chan struct{}, 10) // 限制並發為 10
```

**選擇建議**：
- 默認用 Mutex
- 讀多寫少用 RWMutex
- Go 推薦用 Channel 做同步

</details>

📖 [查看完整答案](../01_Computer_Science_Fundamentals/Operating_System/thread_synchronization.md)

---

## 📊 學習進度檢核

完成以上題目後，請自我評估：

| 評估項目 | 自評 |
|----------|------|
| 能區分進程和線程 | ⬜ |
| 了解各種 IPC 方式 | ⬜ |
| 理解死鎖條件和預防 | ⬜ |
| 掌握虛擬記憶體和分頁 | ⬜ |
| 能比較五種 I/O 模型 | ⬜ |
| 理解 epoll vs select | ⬜ |
| 了解零拷貝原理 | ⬜ |
| 掌握線程同步機制 | ⬜ |

**建議**：未能完整回答的題目，請回到對應的詳細文章深入學習。建議搭配 Linux 實際操作（strace, perf 等工具）加深理解。
