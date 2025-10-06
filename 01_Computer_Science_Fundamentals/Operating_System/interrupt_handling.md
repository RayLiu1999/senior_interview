# 中斷處理機制

- **難度**: 6
- **重要程度**: 3
- **標籤**: `中斷`, `軟中斷`, `硬中斷`, `中斷向量表`, `中斷上下文`

## 問題詳述

解釋中斷的概念、硬中斷與軟中斷的區別、中斷處理流程、中斷上下文的限制，以及 Linux 的軟中斷機制（softirq）和 tasklet。

## 核心理論與詳解

### 1. 中斷的基本概念

**中斷（Interrupt）**：硬件或軟件向 CPU 發出的信號，打斷當前程序執行

**作用**：
- 異步處理 I/O（不需輪詢）
- 響應外部事件（鍵盤、網絡包）
- 處理異常（除零、缺頁）

**中斷 vs 輪詢**：
```
輪詢（Polling）：
while (1) {
    if (設備就緒) {
        處理數據;
    }
}
→ 浪費 CPU

中斷（Interrupt）：
程序正常執行...
[設備就緒 → 觸發中斷]
→ 暫停程序
→ 處理中斷
→ 恢復程序
→ 效率高
```

### 2. 中斷類型

#### 硬中斷（Hardware Interrupt）

由硬件設備觸發：
- 時鐘中斷（Timer）
- I/O 設備（鍵盤、網卡、磁盤）
- 外部中斷引腳

**特點**：
- 異步（任何時刻發生）
- 優先級高
- 不可屏蔽中斷（NMI）

#### 軟中斷（Software Interrupt）

由指令觸發：
- 系統調用（int 0x80、syscall）
- 異常（除零、缺頁、段錯誤）

**特點**：
- 同步（執行特定指令時）
- 可預期

### 3. 中斷處理流程

```
1. 設備發出中斷信號
   ↓
2. CPU 完成當前指令
   ↓
3. 檢查中斷標誌（EFLAGS.IF）
   ├─ 屏蔽：忽略
   └─ 未屏蔽：繼續
   ↓
4. 保存當前程序狀態
   ├─ 保存 PC、標誌寄存器到棧
   └─ 切換到內核態
   ↓
5. 查中斷向量表（IDT）
   └─ 獲取中斷處理程序地址
   ↓
6. 執行中斷服務例程（ISR）
   ├─ 上半部（Top Half）：快速處理
   └─ 下半部（Bottom Half）：延遲處理
   ↓
7. 恢復程序狀態
   └─ 彈出棧，返回用戶態
   ↓
8. 繼續執行被中斷的程序
```

### 4. 中斷向量表（IDT）

```
中斷號  |  處理程序
--------|----------------
0       |  divide_error
13      |  general_protection
14      |  page_fault
32      |  timer_interrupt
33      |  keyboard_interrupt
...     |  ...
128     |  system_call
```

**x86-64**：256 個中斷向量

### 5. 上半部 vs 下半部

#### 為什麼需要分離

中斷上下文限制：
- 不能睡眠（無進程上下文）
- 不能調用可能阻塞的函數
- 應盡快完成（影響系統響應）

#### 上半部（Top Half / Hard IRQ）

```
快速處理：
- 讀取設備狀態
- 應答中斷（ACK）
- 保存數據到內核緩衝區
- 調度下半部處理
```

#### 下半部（Bottom Half）

**三種機制**：

**1. Softirq（軟中斷）**
```c
// Linux 內核定義的軟中斷類型
enum {
    HI_SOFTIRQ,       // 高優先級tasklet
    TIMER_SOFTIRQ,    // 定時器
    NET_TX_SOFTIRQ,   // 網絡發送
    NET_RX_SOFTIRQ,   // 網絡接收
    BLOCK_SOFTIRQ,    // 塊設備
    ...
};
```

**特點**：
- 在中斷返回前檢查並執行
- 可在不同 CPU 並行執行
- 編譯時靜態定義

**2. Tasklet**
```c
// 基於 softirq 實現
struct tasklet_struct {
    void (*func)(unsigned long);
    unsigned long data;
};

// 調度 tasklet
tasklet_schedule(&my_tasklet);
```

**特點**：
- 動態創建
- 同一 tasklet 不會並行執行
- 比 softirq 易用

**3. Workqueue（工作隊列）**
```c
// 可睡眠的延遲處理
struct work_struct work;
INIT_WORK(&work, work_handler);
schedule_work(&work);
```

**特點**：
- 有進程上下文
- 可以睡眠
- 可調用阻塞函數

### 6. 中斷上下文限制

```c
// ✗ 中斷處理中不能做：
void irq_handler() {
    kmalloc(..., GFP_KERNEL);  // 可能睡眠
    mutex_lock(&lock);          // 可能睡眠
    copy_to_user(...);          // 訪問用戶空間
    schedule();                 // 調度
}

// ✓ 只能做：
void irq_handler() {
    kmalloc(..., GFP_ATOMIC);   // 原子分配
    spin_lock(&lock);           // 自旋鎖
    // 訪問內核數據
}
```

### 7. 中斷處理優化

#### 中斷聚合（Interrupt Coalescing）

```
不聚合：每個數據包觸發一次中斷
[包1中斷][包2中斷][包3中斷]...

聚合：多個數據包觸發一次中斷
[包1][包2][包3]...[中斷]

優勢：減少中斷開銷
劣勢：增加延遲
```

**網卡配置**：
```bash
ethtool -C eth0 rx-usecs 50
```

#### NAPI（New API）

```
傳統方式：
每個包 → 中斷 → 處理

NAPI：
第一個包 → 中斷 → 關閉中斷 → 輪詢接收剩餘包 → 開啟中斷

適用：高流量網絡
```

#### 中斷親和性（IRQ Affinity）

```bash
# 綁定中斷到特定 CPU
echo 2 > /proc/irq/45/smp_affinity

# 優勢：
# - 提高緩存命中率
# - 減少 CPU 間遷移
```

### 8. 查看中斷統計

```bash
# 查看中斷計數
cat /proc/interrupts

# 示例輸出：
           CPU0       CPU1
  0:    1234567    1234568   IO-APIC   2-edge      timer
  8:          1          0   IO-APIC   8-edge      rtc0
 16:      45678      45679   IO-APIC  16-fasteoi   ehci_hcd
```

## 實際應用場景

### 1. 網絡處理
- 網卡接收：硬中斷 + softirq
- 高性能：NAPI + 中斷聚合

### 2. 磁盤 I/O
- DMA 完成：觸發中斷
- 上半部：ACK，調度下半部
- 下半部：處理數據

### 3. 實時系統
- 快速中斷響應
- 最小化中斷延遲

## 總結

### 關鍵概念

- **硬中斷**：硬件觸發，異步
- **軟中斷**：軟件觸發，同步
- **上半部**：快速處理
- **下半部**：延遲處理（softirq、tasklet、workqueue）
- **中斷上下文**：不能睡眠

### 性能優化

- 中斷聚合減少中斷次數
- NAPI 混合中斷與輪詢
- 中斷親和性提高緩存命中
- 最小化上半部執行時間

### 資深工程師需掌握

- 理解中斷處理的完整流程
- 編寫中斷安全的代碼
- 分析中斷開銷（/proc/interrupts）
- 調優中斷性能
- 處理中斷相關的並發問題
