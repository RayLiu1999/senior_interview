# 進程間通信 (IPC)

- **難度**: 6
- **重要程度**: 5
- **標籤**: `IPC`, `管道`, `共享內存`, `消息隊列`, `信號`, `套接字`

## 問題詳述

解釋進程間通信（Inter-Process Communication, IPC）的各種機制，包括管道、消息隊列、共享內存、信號量、信號和套接字，對比它們的優缺點和適用場景。

## 核心理論與詳解

### 1. 為什麼需要 IPC

進程擁有**獨立的地址空間**，默認情況下無法直接訪問其他進程的內存。IPC 機制使進程能夠：

- **數據交換**：在進程間傳遞數據
- **同步協調**：協調多個進程的執行順序
- **資源共享**：共享硬件或軟件資源
- **模塊化**：將大型系統拆分為獨立進程

### 2. IPC 機制對比總覽

| 機制 | 速度 | 數據量 | 跨網絡 | 同步 | 複雜度 | 典型應用 |
|------|------|--------|--------|------|--------|----------|
| **管道 (Pipe)** | 中 | 小 | ✗ | 半雙工 | 低 | 父子進程通信 |
| **命名管道 (FIFO)** | 中 | 小 | ✗ | 半雙工 | 低 | 無親緣關係進程 |
| **消息隊列** | 中 | 中 | ✗ | 異步 | 中 | 解耦的消息傳遞 |
| **共享內存** | **最快** | 大 | ✗ | 需配合信號量 | 高 | 高性能數據交換 |
| **信號量** | 快 | 無 | ✗ | 同步 | 中 | 資源訪問控制 |
| **信號 (Signal)** | 快 | 極小 | ✗ | 異步 | 低 | 事件通知 |
| **套接字 (Socket)** | 慢 | 大 | ✓ | 全雙工 | 高 | 網絡通信 |

### 3. 管道 (Pipe)

#### 匿名管道 (Anonymous Pipe)

**特點**：
- 半雙工通信（單向數據流）
- 只能在有親緣關係的進程間使用（父子、兄弟）
- 數據先進先出（FIFO）
- 由內核管理的緩衝區

**工作原理**：
```
      寫端 fd[1]           讀端 fd[0]
進程A --------→ [ 內核緩衝區 ] --------→ 進程B
                  (通常 64KB)
```

**系統調用**：
```go
// C 語言接口
int pipe(int fd[2]);  // fd[0]: 讀端, fd[1]: 寫端

// 典型用法
pipe(fd);
if (fork() == 0) {
    // 子進程：讀取
    close(fd[1]);  // 關閉寫端
    read(fd[0], buffer, size);
} else {
    // 父進程：寫入
    close(fd[0]);  // 關閉讀端
    write(fd[1], data, size);
}
```

**侷限**：
- 單向通信（需雙向需創建兩個管道）
- 緩衝區大小有限
- 只能用於本機進程

#### 命名管道 (Named Pipe / FIFO)

**特點**：
- 存在於文件系統中（有路徑名）
- 無親緣關係的進程也可使用
- 其他特性同匿名管道

**創建與使用**：
```go
// 創建 FIFO
mkfifo("/tmp/myfifo", 0666);

// 進程 A：寫入
fd := open("/tmp/myfifo", O_WRONLY);
write(fd, data, size);

// 進程 B：讀取
fd := open("/tmp/myfifo", O_RDONLY);
read(fd, buffer, size);
```

**應用場景**：
- Shell 命令管道：`ls | grep txt`
- 父子進程通信
- 簡單的客戶端-服務器架構

### 4. 消息隊列 (Message Queue)

#### 特點

- **面向消息**：以完整消息為單位傳遞
- **異步通信**：發送和接收不需同步
- **類型標識**：每條消息可帶類型，接收時可選擇性讀取
- **持久性**：消息保存在內核中，直到被讀取
- **獨立於進程**：進程退出後消息隊列仍存在

#### 工作原理

```
進程A --> [消息1][消息2][消息3] --> 進程B
          [類型1][類型2][類型1]
                    ↓
          可按類型選擇性接收
```

#### 系統調用 (System V)

```go
// 創建或打開消息隊列
key_t key = ftok("/tmp/myqueue", 'A');
int msgid = msgget(key, 0666 | IPC_CREAT);

// 發送消息
struct msgbuf {
    long mtype;     // 消息類型
    char mtext[100]; // 消息內容
};

msgsnd(msgid, &msg, sizeof(msg.mtext), 0);

// 接收消息
msgrcv(msgid, &msg, sizeof(msg.mtext), msg_type, 0);

// 刪除消息隊列
msgctl(msgid, IPC_RMID, NULL);
```

#### 優缺點

**優點**：
- 異步通信，解耦發送和接收
- 支持消息優先級和類型過濾
- 內核管理，可靠性高

**缺點**：
- 有大小限制（系統參數 `MSGMAX`、`MSGMNB`）
- 較共享內存慢
- 需要顯式刪除，否則占用系統資源

#### 應用場景

- 生產者-消費者模型
- 任務隊列系統
- 日誌收集系統

### 5. 共享內存 (Shared Memory)

#### 特點

- **最快的 IPC 方式**（避免數據拷貝）
- 多個進程映射同一塊物理內存
- 需要配合同步機制（如信號量）避免競爭條件
- 適合大量數據交換

#### 工作原理

```
進程A的虛擬地址空間          進程B的虛擬地址空間
    [共享內存區]                [共享內存區]
         ↓                           ↓
         └─────→ [物理內存] ←─────┘
                   (同一塊)
```

**核心優勢**：
- 管道/消息隊列：需要 4 次數據拷貝（用戶→內核→內核→用戶）
- 共享內存：0 次數據拷貝（直接訪問）

#### 系統調用 (System V)

```go
// 1. 創建共享內存
key_t key = ftok("/tmp/shm", 'A');
int shmid = shmget(key, SIZE, 0666 | IPC_CREAT);

// 2. 映射到進程地址空間
void *ptr = shmat(shmid, NULL, 0);

// 3. 使用共享內存
strcpy((char *)ptr, "Hello from process A");

// 4. 解除映射
shmdt(ptr);

// 5. 刪除共享內存
shmctl(shmid, IPC_RMID, NULL);
```

#### 同步問題

**競爭條件示例**：
```
進程A: 讀取 count=10
進程B: 讀取 count=10
進程A: 寫入 count=11
進程B: 寫入 count=11  ← 應該是 12
```

**解決方案**：配合信號量
```go
// 進程A
sem_wait(sem);    // P 操作（加鎖）
// 訪問共享內存
shm_data->count++;
sem_post(sem);    // V 操作（解鎖）
```

#### 現代實現：POSIX Shared Memory

```go
// 創建
int fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(fd, SIZE);

// 映射
void *ptr = mmap(NULL, SIZE, PROT_READ | PROT_WRITE, 
                 MAP_SHARED, fd, 0);

// 使用
strcpy((char *)ptr, "Data");

// 清理
munmap(ptr, SIZE);
shm_unlink("/myshm");
```

#### 應用場景

- 數據庫緩衝池
- 圖形處理（大量圖像數據）
- 實時系統中的高速數據交換
- 進程間的大數據集共享

### 6. 信號量 (Semaphore)

#### 特點

- 用於**進程同步**和**互斥**
- 本身不傳遞數據，只控制訪問
- 由內核維護的整數計數器

#### 類型

**二元信號量（Binary Semaphore）**：
- 取值 0 或 1
- 用於互斥（類似互斥鎖）

**計數信號量（Counting Semaphore）**：
- 取值 ≥ 0
- 用於資源計數（如連接池）

#### 基本操作

```go
// P 操作（Wait / Down / Acquire）
P(S):
    while S <= 0:
        wait()
    S = S - 1

// V 操作（Signal / Up / Release）
V(S):
    S = S + 1
    wakeup_one_waiting_process()
```

#### 系統調用 (POSIX)

```go
#include <semaphore.h>

// 初始化
sem_t sem;
sem_init(&sem, 1, 1);  // 1: 進程間共享, 1: 初始值

// 使用
sem_wait(&sem);   // P 操作
// 臨界區
sem_post(&sem);   // V 操作

// 銷毀
sem_destroy(&sem);
```

#### 經典問題：生產者-消費者

```go
sem_t mutex;      // 互斥訪問緩衝區
sem_t empty;      // 空槽位數量
sem_t full;       // 已填充槽位數量

// 初始化
sem_init(&mutex, 0, 1);
sem_init(&empty, 0, N);  // N 個空槽
sem_init(&full, 0, 0);

// 生產者
void producer() {
    while (1) {
        produce_item(&item);
        sem_wait(&empty);    // 等待空槽
        sem_wait(&mutex);    // 加鎖
        insert_item(item);
        sem_post(&mutex);    // 解鎖
        sem_post(&full);     // 增加已填充槽
    }
}

// 消費者
void consumer() {
    while (1) {
        sem_wait(&full);     // 等待已填充槽
        sem_wait(&mutex);    // 加鎖
        remove_item(&item);
        sem_post(&mutex);    // 解鎖
        sem_post(&empty);    // 增加空槽
        consume_item(item);
    }
}
```

### 7. 信號 (Signal)

#### 特點

- **異步通知機制**
- 傳遞事件，不傳遞數據
- 由內核發送，進程處理
- 可能在任何時刻到達（異步性）

#### 常見信號

```go
SIGINT  (2)   - Ctrl+C，終端中斷
SIGKILL (9)   - 強制終止（不可捕獲）
SIGTERM (15)  - 終止信號（優雅關閉）
SIGSEGV (11)  - 段錯誤
SIGCHLD (17)  - 子進程狀態改變
SIGUSR1/2     - 用戶自定義信號
SIGPIPE (13)  - 管道破裂
SIGALRM (14)  - 定時器超時
```

#### 信號處理

```go
#include <signal.h>

// 1. 註冊信號處理函數
void sig_handler(int signo) {
    if (signo == SIGINT) {
        printf("Caught SIGINT\n");
    }
}

signal(SIGINT, sig_handler);

// 2. 發送信號
kill(pid, SIGTERM);      // 發送給指定進程
raise(SIGABRT);          // 發送給自己
alarm(5);                // 5 秒後發送 SIGALRM

// 3. 阻塞信號
sigset_t set;
sigemptyset(&set);
sigaddset(&set, SIGINT);
sigprocmask(SIG_BLOCK, &set, NULL);  // 阻塞 SIGINT
```

#### 注意事項

- 信號處理函數需**可重入**（reentrant）
- 避免在處理函數中調用不安全的函數（如 `printf`、`malloc`）
- 使用 `volatile sig_atomic_t` 類型的全局變量

#### 應用場景

- 優雅關閉服務（處理 SIGTERM）
- 重新加載配置（SIGHUP）
- 超時控制（SIGALRM）
- 子進程管理（SIGCHLD）

### 8. 套接字 (Socket)

#### 特點

- 支持**跨網絡通信**
- 全雙工通信
- 支持多種協議（TCP、UDP）
- 既可用於本機也可用於網絡

#### Unix Domain Socket vs Internet Socket

**Unix Domain Socket（本機）**：
- 文件系統路徑標識
- 性能優於 TCP（無需協議棧處理）
- 只能本機通信

```go
// 服務端
addr := &net.UnixAddr{
    Name: "/tmp/unix.sock",
    Net:  "unix",
}
listener, _ := net.ListenUnix("unix", addr)
conn, _ := listener.Accept()
```

**Internet Socket（網絡）**：
- IP + 端口標識
- 支持跨主機通信
- TCP（可靠）或 UDP（快速）

```go
// TCP 服務端
listener, _ := net.Listen("tcp", ":8080")
conn, _ := listener.Accept()

// TCP 客戶端
conn, _ := net.Dial("tcp", "localhost:8080")
```

#### 應用場景

- 微服務間 RPC 通信
- 數據庫客戶端連接
- Docker 容器通信（Unix Socket）
- 分佈式系統通信

### 9. 選擇 IPC 機制的決策樹

```
需要跨網絡通信？
├─ 是 → Socket
└─ 否 → 數據量大？
         ├─ 是 → 共享內存 + 信號量
         └─ 否 → 需要消息邊界？
                  ├─ 是 → 消息隊列
                  └─ 否 → 僅單向通信？
                           ├─ 是 → 管道
                           └─ 否 → Socket / 兩個管道
```

### 10. 現代替代方案

#### Go 的 IPC 實踐

Go 推崇 "**通過通信來共享內存，而不是通過共享內存來通信**"

```go
// 使用 channel 替代傳統 IPC
ch := make(chan Data, 100)

// 生產者
go func() {
    ch <- data
}()

// 消費者
go func() {
    data := <-ch
}()
```

#### 高級 IPC 技術

- **D-Bus**：Linux 桌面環境的 IPC 總線
- **Binder**：Android 系統的 IPC 機制
- **gRPC**：跨語言的 RPC 框架
- **ZeroMQ**：高性能消息隊列
- **Memory-Mapped Files**：文件映射共享

## 實際應用場景

### 1. Chrome 瀏覽器多進程架構
- **共享內存**：渲染進程與 GPU 進程共享紋理數據
- **管道/Socket**：渲染進程與瀏覽器進程通信
- **信號**：進程崩潰處理

### 2. Nginx 多進程模型
- **共享內存**：進程間共享連接計數、配置數據
- **信號**：主進程管理 worker 進程（重啟、優雅關閉）
- **Unix Socket**：FastCGI 通信

### 3. Redis
- **管道**：主進程與 RDB 子進程通信
- **信號**：接收關閉信號進行優雅關機
- **Socket**：客戶端連接

### 4. 數據庫系統
- **共享內存**：緩衝池、鎖表
- **信號量**：併發控制
- **Socket**：客戶端連接

## 總結

### 性能對比
```
共享內存 > 信號量 > 管道 > 消息隊列 > Socket
(速度從快到慢)
```

### 選擇建議

| 需求 | 推薦方案 |
|------|----------|
| 高性能大數據交換 | 共享內存 + 信號量 |
| 簡單數據流 | 管道 |
| 異步消息傳遞 | 消息隊列 |
| 跨網絡通信 | Socket |
| 事件通知 | 信號 |
| 資源同步 | 信號量 |

### 資深工程師需掌握

- 各種 IPC 機制的適用場景和性能特點
- 共享內存的同步問題和解決方案
- 信號的可靠性問題和處理
- 如何在分佈式系統中選擇 IPC 方案
- 現代語言（Go/Rust）中的 IPC 最佳實踐
