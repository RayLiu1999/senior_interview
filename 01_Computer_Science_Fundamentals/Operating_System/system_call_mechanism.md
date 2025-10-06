# 系統調用原理

- **難度**: 6
- **重要程度**: 4
- **標籤**: `系統調用`, `用戶態`, `內核態`, `中斷`, `syscall`

## 問題詳述

解釋系統調用的工作原理，包括用戶態與內核態的切換、系統調用的實現機制（中斷、syscall 指令）、參數傳遞、以及系統調用的性能開銷。

## 核心理論與詳解

### 1. 為什麼需要系統調用

**保護模式**：
- 用戶程序不能直接訪問硬件
- 防止惡意或錯誤操作破壞系統
- 需要內核提供受控的接口

**系統調用是用戶程序訪問內核服務的唯一途徑**：
- 文件操作：open、read、write
- 進程管理：fork、exec、exit
- 網絡通信：socket、send、recv
- 內存管理：mmap、brk

### 2. 用戶態 vs 內核態

#### 特權級別

```
x86 CPU 的 4 個特權級（Ring）:
Ring 0: 內核態（最高權限）
Ring 1: 未使用
Ring 2: 未使用
Ring 3: 用戶態（最低權限）

權限差異：
內核態：可執行所有指令，訪問所有內存
用戶態：受限指令集，只能訪問用戶空間
```

#### 內存空間劃分

```
虛擬地址空間（Linux x86-64）：
[0x0000000000000000 - 0x00007FFFFFFFFFFF] 用戶空間 (128TB)
[0xFFFF800000000000 - 0xFFFFFFFFFFFFFFFF] 內核空間 (128TB)

進程切換：只切換用戶空間映射
系統調用：在內核空間執行
```

### 3. 系統調用流程

#### 完整流程

```
1. 用戶程序調用 C 庫函數
   例如：read(fd, buf, size)
   
2. C 庫封裝系統調用
   ├─ 設置系統調用號（__NR_read = 0）
   ├─ 將參數放入寄存器
   └─ 執行 syscall 指令
   
3. CPU 切換到內核態
   ├─ 保存用戶態寄存器
   ├─ 切換到內核棧
   └─ 跳轉到系統調用處理程序
   
4. 內核執行系統調用
   ├─ 根據調用號查表（sys_call_table）
   ├─ 執行對應函數（sys_read）
   └─ 訪問硬件/內核數據結構
   
5. 返回用戶態
   ├─ 結果放入 rax 寄存器
   ├─ 恢復用戶態寄存器
   └─ 返回用戶程序
```

#### 參數傳遞（x86-64）

```
系統調用號 → rax
參數1      → rdi
參數2      → rsi
參數3      → rdx
參數4      → r10
參數5      → r8
參數6      → r9

返回值     ← rax
```

### 4. 實現機制

#### 傳統方式：int 0x80（x86）

```assembly
; 調用 sys_write
mov eax, 4         ; 系統調用號
mov ebx, 1         ; 文件描述符（stdout）
mov ecx, msg       ; 緩衝區地址
mov edx, len       ; 長度
int 0x80           ; 觸發軟中斷

; 內核處理中斷 0x80
; → 查系統調用表
; → 執行 sys_write
```

**缺點**：
- 中斷處理開銷大
- 需要保存/恢復大量寄存器

#### 現代方式：syscall / sysenter（快速系統調用）

```assembly
; syscall 指令（x86-64）
mov rax, 1         ; sys_write
mov rdi, 1         ; fd
mov rsi, msg       ; buf
mov rdx, len       ; count
syscall            ; 快速系統調用

; CPU 硬件自動：
; 1. 切換到內核態
; 2. 跳轉到 entry_SYSCALL_64
; 3. 切換棧指針
```

**優勢**：
- 硬件優化，延遲更低
- 減少狀態保存
- x86-64 標準方式

### 5. 系統調用表

```c
// Linux 內核
const sys_call_ptr_t sys_call_table[] = {
    [0] = sys_read,
    [1] = sys_write,
    [2] = sys_open,
    [3] = sys_close,
    // ...
    [400+] = ...
};

// 調用時：
sys_call_table[系統調用號](參數...);
```

**查看系統調用號**：
```bash
# Linux
cat /usr/include/asm/unistd_64.h

# 示例
#define __NR_read    0
#define __NR_write   1
#define __NR_open    2
```

### 6. 性能開銷

#### 開銷來源

```
總開銷 ≈ 100-300 個 CPU 週期

組成：
1. 模式切換        : 40-80 cycles
   ├─ 保存寄存器
   ├─ 切換棧
   └─ TLB 刷新（可能）
   
2. 系統調用處理    : 20-50 cycles
   ├─ 查表
   ├─ 參數驗證
   └─ 執行邏輯
   
3. 返回用戶態      : 40-80 cycles
   ├─ 恢復寄存器
   └─ 切換回用戶棧
```

#### 優化策略

**1. 批量操作**
```go
// ✗ 頻繁系統調用
for i := 0; i < 1000; i++ {
    write(fd, buf[i], 1)  // 1000 次系統調用
}

// ✓ 批量
write(fd, buf, 1000)      // 1 次系統調用
```

**2. vDSO（Virtual Dynamic Shared Object）**
```
某些系統調用無需進入內核：
- gettimeofday: 讀取內核映射的共享內存
- getcpu: 讀取 CPU 號

完全在用戶態完成，無開銷
```

**3. io_uring（批量系統調用）**
```
提交 100 個 I/O 請求 → 1 次系統調用
完成後批量獲取結果 → 1 次系統調用
```

### 7. Go 語言中的系統調用

```go
import "syscall"

// 方式1：直接系統調用
fd, err := syscall.Open("/tmp/file", syscall.O_RDWR, 0644)

// 方式2：使用封裝
file, err := os.Open("/tmp/file")

// 底層流程：
// os.Open -> syscall.Open -> 
// runtime.Syscall -> syscall 指令 -> 
// 內核 sys_open
```

**Go 的 M:N 調度**：
- 系統調用會阻塞 M（系統線程）
- 運行時自動創建新 M 繼續調度 G
- 避免阻塞其他 goroutine

## 實際應用場景

### 1. 高性能服務器
- Nginx: 使用 sendfile、splice 等高效系統調用
- 減少系統調用次數（批量、緩衝）

### 2. 容器技術
- Docker: seccomp 限制容器可用的系統調用
- 安全隔離

### 3. 系統監控
- strace: 跟踪進程的系統調用
- perf: 分析系統調用開銷

## 總結

### 關鍵要點

- 系統調用是用戶態進入內核態的唯一合法途徑
- 涉及模式切換，有性能開銷
- 現代 CPU 提供快速系統調用指令（syscall）
- 優化重點：減少調用次數、使用 vDSO

### 資深工程師需掌握

- 理解系統調用的完整流程
- 分析程序的系統調用開銷（strace、perf）
- 選擇合適的系統調用接口
- 優化系統調用頻率
- 理解安全機制（seccomp、capabilities）
