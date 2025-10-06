# Operating System (作業系統)

作業系統是計算機系統的核心軟體,管理硬體資源並為應用程序提供服務。本章節收錄資深後端工程師必須掌握的作業系統相關面試題。

## 📋 題目索引

### 進程與線程 (Process & Thread)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [進程 vs 線程對比](./process_vs_thread.md) | 4 | 5 | `進程`, `線程`, `並發` |
| [進程間通信 (IPC)](./inter_process_communication.md) | 6 | 5 | `IPC`, `管道`, `共享內存`, `消息隊列` |
| [線程同步機制](./thread_synchronization.md) | 7 | 5 | `互斥鎖`, `信號量`, `條件變量`, `死鎖` |
| [死鎖原理與預防](./deadlock_prevention.md) | 7 | 5 | `死鎖`, `銀行家算法`, `資源分配` |

### 內存管理 (Memory Management)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [虛擬內存與分頁機制](./virtual_memory_paging.md) | 6 | 5 | `虛擬內存`, `分頁`, `TLB`, `缺頁中斷` |
| [內存分配算法](./memory_allocation_algorithms.md) | 5 | 4 | `堆`, `棧`, `內存池`, `碎片化` |
| [垃圾回收機制](./garbage_collection.md) | 6 | 4 | `GC`, `標記清除`, `引用計數`, `分代回收` |

### CPU 調度 (CPU Scheduling)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [進程調度算法](./process_scheduling_algorithms.md) | 6 | 4 | `FCFS`, `SJF`, `優先級`, `時間片輪轉` |
| [上下文切換開銷](./context_switch_overhead.md) | 5 | 4 | `上下文切換`, `寄存器`, `緩存失效` |

### 文件系統 (File System)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [文件系統原理](./file_system_basics.md) | 5 | 4 | `inode`, `目錄`, `文件描述符` |
| [磁盤 I/O 優化](./disk_io_optimization.md) | 6 | 5 | `I/O 調度`, `緩存`, `零拷貝` |

### I/O 模型 (I/O Models)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [五種 I/O 模型對比](./io_models_comparison.md) | 7 | 5 | `阻塞`, `非阻塞`, `多路復用`, `異步I/O` |
| [epoll vs select vs poll](./epoll_select_poll.md) | 7 | 5 | `epoll`, `select`, `poll`, `事件驅動` |

### 系統調用與中斷 (System Call & Interrupt)

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [系統調用原理](./system_call_mechanism.md) | 6 | 4 | `系統調用`, `用戶態`, `內核態` |
| [中斷處理機制](./interrupt_handling.md) | 6 | 3 | `中斷`, `軟中斷`, `硬中斷` |

## 🎯 學習路徑建議

### 初級 (1-2 個月)

**目標**: 掌握進程、線程和基礎內存管理

1. **進程與線程基礎**
   - 進程 vs 線程
   - 進程狀態轉換
   - 上下文切換

2. **內存管理入門**
   - 虛擬內存概念
   - 棧和堆的區別
   - 內存分配

3. **實戰練習**
   - 多線程編程
   - 使用 fork() 創建進程
   - 觀察內存使用情況

**時間分配**: 理論學習 40% + 系統觀察 30% + 編程實作 30%

### 中級 (2-4 個月)

**目標**: 深入理解並發、同步和 I/O 模型

1. **並發與同步**
   - 線程同步機制 (mutex, semaphore, condition variable)
   - 死鎖檢測與預防
   - 進程間通信 (IPC)

2. **I/O 系統**
   - 五種 I/O 模型
   - epoll/select/poll 對比
   - 零拷貝技術

3. **實戰項目**
   - 實現生產者-消費者模型
   - 使用 epoll 實現高並發伺服器
   - 分析系統調用開銷

**時間分配**: 並發編程 40% + I/O 編程 40% + 效能分析 20%

### 高級 (4-6 個月)

**目標**: 精通調度、優化和系統設計

1. **進階主題**
   - CPU 調度算法
   - 內存管理優化
   - 文件系統原理

2. **效能優化**
   - 減少上下文切換
   - 內存池設計
   - 磁盤 I/O 優化

3. **系統級編程**
   - 系統調用實現
   - 內核模組開發
   - 效能剖析工具 (perf, strace, ltrace)

**時間分配**: 內核原理 30% + 效能優化 40% + 系統工具 30%

## 💡 核心知識點

### 1. 進程與線程

- **進程**: 資源分配的基本單位,擁有獨立地址空間
- **線程**: CPU 調度的基本單位,共享進程資源
- **關鍵差異**: 創建開銷、通信方式、隔離性

### 2. 內存管理

- **虛擬內存**: 每個進程有獨立的虛擬地址空間
- **分頁機制**: 將虛擬地址映射到物理地址
- **頁面置換**: LRU、FIFO、Clock 算法

### 3. 並發與同步

- **競態條件**: 多個線程訪問共享資源導致不一致
- **臨界區**: 需要互斥訪問的代碼段
- **同步機制**: Mutex、Semaphore、Monitor

### 4. I/O 模型

- **阻塞 I/O**: 等待數據,阻塞當前線程
- **非阻塞 I/O**: 立即返回,需要輪詢
- **I/O 多路復用**: 單線程監控多個 fd
- **異步 I/O**: 內核完成後通知應用

### 5. 調度算法

- **先來先服務 (FCFS)**: 公平但平均等待時間長
- **最短作業優先 (SJF)**: 最優平均等待時間,但可能餓死
- **時間片輪轉 (RR)**: 公平,適合分時系統
- **多級反饋隊列**: 結合多種策略,實際系統常用

## 📚 推薦資源

### 書籍

- 《Operating System Concepts (Dinosaur Book)》- 作業系統經典教材
- 《Modern Operating Systems》- 現代作業系統設計
- 《UNIX 環境高級編程 (APUE)》- UNIX 系統編程聖經
- 《深入理解計算機系統 (CSAPP)》- 系統層面理解計算機

### 線上資源

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Linux 內核文檔
- [OSDev Wiki](https://wiki.osdev.org/) - 作業系統開發知識庫
- [MIT 6.828: Operating System Engineering](https://pdos.csail.mit.edu/6.828/) - MIT 作業系統課程

### 工具

- **strace** - 追蹤系統調用
- **ltrace** - 追蹤函數庫調用
- **perf** - 效能剖析工具
- **valgrind** - 內存洩漏檢測
- **gdb** - 調試工具
- **top/htop** - 進程監控

## 🔗 相關章節

- [計算機網路](../Networking/) - Socket 編程、網路 I/O 模型
- [資料結構與算法](../Data_Structures_and_Algorithms/) - 調度算法、內存池
- [系統設計](../../03_System_Design_and_Architecture/) - 高並發系統設計

## 🔧 實戰建議

### Linux 系統觀察

```bash
# 查看進程信息
ps aux
top
htop

# 查看線程信息
ps -eLf
top -H

# 查看內存使用
free -h
cat /proc/meminfo
vmstat

# 查看系統調用
strace -c <command>

# 查看打開的文件描述符
lsof -p <pid>

# 查看 CPU 信息
lscpu
cat /proc/cpuinfo

# 查看磁盤 I/O
iostat
iotop
```

### 編程實踐

```go
// Go 語言示例

// 1. 創建進程 (使用 exec 包)
cmd := exec.Command("ls", "-l")
output, _ := cmd.CombinedOutput()

// 2. 創建線程 (goroutine)
go func() {
    // 並發執行
}()

// 3. 互斥鎖
var mu sync.Mutex
mu.Lock()
// 臨界區
mu.Unlock()

// 4. 非阻塞 I/O (使用 select)
select {
case msg := <-ch:
    // 處理消息
case <-time.After(time.Second):
    // 超時
}
```

### 效能分析

```bash
# CPU 效能分析
perf stat <command>
perf record <command>
perf report

# 內存分析
valgrind --leak-check=full <command>

# 火焰圖
perf record -F 99 -a -g -- sleep 60
perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg
```

---

> **提示**: 學習作業系統時,建議結合 Linux 原始碼閱讀和系統工具實踐。多使用 strace、perf 等工具觀察系統行為,加深對理論的理解。從進程/線程基礎開始,逐步深入到並發、內存管理和 I/O 優化。
