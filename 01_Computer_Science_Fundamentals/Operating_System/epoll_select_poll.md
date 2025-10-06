# epoll vs select vs poll

- **難度**: 7
- **重要程度**: 5
- **標籤**: `epoll`, `select`, `poll`, `事件驅動`, `I/O 多路復用`

## 問題詳述

深入對比 Linux 系統中三種 I/O 多路復用機制（select、poll、epoll）的實現原理、性能差異、適用場景，以及如何在高並發服務器中正確使用 epoll。

## 核心理論與詳解

### 1. select

#### 函數原型

```c
#include <sys/select.h>

int select(int nfds, fd_set *readfds, fd_set *writefds,
           fd_set *exceptfds, struct timeval *timeout);

// 操作 fd_set 的宏
FD_ZERO(fd_set *set);           // 清空集合
FD_SET(int fd, fd_set *set);    // 添加 fd
FD_CLR(int fd, fd_set *set);    // 移除 fd
FD_ISSET(int fd, fd_set *set);  // 檢查 fd 是否在集合中
```

#### 工作原理

```
1. 應用程序準備三個 fd_set (讀、寫、異常)
2. 調用 select，將 fd_set 從用戶空間拷貝到內核空間
3. 內核遍歷所有 fd，檢查是否就緒
4. 如果有就緒的 fd，返回就緒數量
5. 將結果拷貝回用戶空間
6. 應用程序遍歷 fd_set，找出就緒的 fd
```

#### 程式碼範例

```c
fd_set readfds;
struct timeval timeout;

while (1) {
    // 每次都要重新設置 (select 會修改 fd_set)
    FD_ZERO(&readfds);
    FD_SET(fd1, &readfds);
    FD_SET(fd2, &readfds);
    FD_SET(fd3, &readfds);
    
    int maxfd = fd3;  // 最大 fd 值
    
    // 設置超時
    timeout.tv_sec = 5;
    timeout.tv_usec = 0;
    
    // 阻塞等待，直到有 fd 就緒或超時
    int ret = select(maxfd + 1, &readfds, NULL, NULL, &timeout);
    
    if (ret < 0) {
        // 錯誤
        perror("select");
        break;
    } else if (ret == 0) {
        // 超時
        printf("timeout\n");
        continue;
    }
    
    // 遍歷所有 fd，找出就緒的
    if (FD_ISSET(fd1, &readfds)) {
        // fd1 可讀
        handle_read(fd1);
    }
    if (FD_ISSET(fd2, &readfds)) {
        // fd2 可讀
        handle_read(fd2);
    }
    if (FD_ISSET(fd3, &readfds)) {
        // fd3 可讀
        handle_read(fd3);
    }
}
```

#### 限制與問題

**1. fd 數量限制**
```c
// 預設最多 1024 個 fd (FD_SETSIZE)
#define FD_SETSIZE 1024

// 修改需要重新編譯
```

**2. 線性掃描**
```
內核: O(n) 遍歷所有 fd
應用: O(n) 遍歷 fd_set 找就緒的 fd
總複雜度: O(n)
```

**3. 每次調用需要重新設置**
```c
// select 會修改 fd_set，每次都要重新設置
FD_ZERO(&readfds);
FD_SET(fd1, &readfds);
// ...
```

**4. 用戶空間與內核空間拷貝**
```
每次 select 調用:
  用戶空間 fd_set → 內核空間 (拷貝)
  內核空間結果 → 用戶空間 (拷貝)
```

### 2. poll

#### 函數原型

```c
#include <poll.h>

int poll(struct pollfd *fds, nfds_t nfds, int timeout);

struct pollfd {
    int   fd;         // 文件描述符
    short events;     // 監聽的事件 (輸入)
    short revents;    // 實際發生的事件 (輸出)
};

// 常見事件
POLLIN      // 可讀
POLLOUT     // 可寫
POLLERR     // 錯誤
POLLHUP     // 掛斷
POLLNVAL    // 無效請求
```

#### 工作原理

```
1. 應用程序準備 pollfd 數組
2. 調用 poll，將數組從用戶空間拷貝到內核空間
3. 內核遍歷所有 fd，檢查是否就緒
4. 將就緒的 fd 的 revents 設置為對應事件
5. 返回就緒的 fd 數量
6. 應用程序遍歷數組，檢查 revents
```

#### 程式碼範例

```c
struct pollfd fds[3];

// 設置監聽的 fd 和事件
fds[0].fd = fd1;
fds[0].events = POLLIN;  // 監聽可讀事件

fds[1].fd = fd2;
fds[1].events = POLLIN;

fds[2].fd = fd3;
fds[2].events = POLLIN | POLLOUT;  // 監聽可讀和可寫

while (1) {
    // poll 不會修改 events，無需每次重設
    int ret = poll(fds, 3, 5000);  // 5 秒超時
    
    if (ret < 0) {
        perror("poll");
        break;
    } else if (ret == 0) {
        printf("timeout\n");
        continue;
    }
    
    // 遍歷檢查哪些 fd 就緒
    for (int i = 0; i < 3; i++) {
        if (fds[i].revents & POLLIN) {
            // 可讀
            handle_read(fds[i].fd);
        }
        if (fds[i].revents & POLLOUT) {
            // 可寫
            handle_write(fds[i].fd);
        }
        if (fds[i].revents & POLLERR) {
            // 錯誤
            handle_error(fds[i].fd);
        }
    }
}
```

#### 相比 select 的改進

**1. 無 fd 數量限制**
```c
// 只受系統資源限制，沒有 FD_SETSIZE 限制
struct pollfd *fds = malloc(sizeof(struct pollfd) * n);
```

**2. 事件與返回值分離**
```c
// events: 監聽的事件 (輸入，不會被修改)
// revents: 返回的事件 (輸出)
// 無需每次重新設置
```

**3. 更豐富的事件類型**
```c
POLLIN, POLLOUT, POLLERR, POLLHUP, POLLNVAL, ...
```

#### 仍存在的問題

**1. 線性掃描**
```
內核: O(n) 遍歷所有 fd
應用: O(n) 遍歷 pollfd 找就緒的 fd
總複雜度: O(n)
```

**2. 用戶空間與內核空間拷貝**
```
每次 poll 調用仍需拷貝整個 pollfd 數組
```

### 3. epoll (Linux 2.6+)

#### 函數原型

```c
#include <sys/epoll.h>

// 創建 epoll 實例
int epoll_create(int size);  // size 參數已廢棄，傳入 > 0 即可
int epoll_create1(int flags);

// 控制 epoll (添加、修改、刪除 fd)
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);

// 等待事件
int epoll_wait(int epfd, struct epoll_event *events, 
               int maxevents, int timeout);

struct epoll_event {
    uint32_t     events;  // 事件類型
    epoll_data_t data;    // 用戶數據
};

union epoll_data {
    void        *ptr;
    int          fd;
    uint32_t     u32;
    uint64_t     u64;
};

// 操作類型
EPOLL_CTL_ADD  // 添加 fd
EPOLL_CTL_MOD  // 修改 fd 的事件
EPOLL_CTL_DEL  // 刪除 fd

// 事件類型
EPOLLIN      // 可讀
EPOLLOUT     // 可寫
EPOLLET      // 邊緣觸發 (Edge Triggered)
EPOLLLT      // 水平觸發 (Level Triggered, 預設)
EPOLLONESHOT // 一次性監聽
```

#### 工作原理

```
1. 創建 epoll 實例
   └─> 在內核中創建 eventpoll 結構
       ├─> 紅黑樹: 存儲所有監聽的 fd
       └─> 就緒列表: 存儲就緒的 fd

2. epoll_ctl 添加 fd
   └─> 將 fd 添加到紅黑樹
   └─> 向 fd 註冊回調函數
   
3. 當 fd 有事件發生
   └─> 回調函數執行
   └─> 將 fd 添加到就緒列表
   
4. epoll_wait
   └─> 檢查就緒列表
   └─> 如果為空，阻塞等待
   └─> 如果有就緒 fd，直接返回 (O(1))
```

#### 內核數據結構

```
epoll 實例 (eventpoll)
├─ 紅黑樹 (rb_tree)
│   ├─ fd1 → epitem
│   ├─ fd2 → epitem
│   └─ fd3 → epitem
│
└─ 就緒列表 (ready_list)
    ├─ fd1 (就緒)
    └─ fd3 (就緒)
```

**紅黑樹**: O(log n) 插入、刪除、查找
**就緒列表**: O(1) 獲取就緒 fd

#### 程式碼範例

```c
// 1. 創建 epoll 實例
int epfd = epoll_create1(0);
if (epfd < 0) {
    perror("epoll_create1");
    exit(1);
}

struct epoll_event ev, events[MAX_EVENTS];

// 2. 添加 fd 到 epoll
ev.events = EPOLLIN;  // 監聽可讀事件
ev.data.fd = listen_fd;

if (epoll_ctl(epfd, EPOLL_CTL_ADD, listen_fd, &ev) < 0) {
    perror("epoll_ctl");
    exit(1);
}

// 3. 事件循環
while (1) {
    // 等待事件，最多返回 MAX_EVENTS 個就緒 fd
    int nfds = epoll_wait(epfd, events, MAX_EVENTS, -1);
    
    if (nfds < 0) {
        perror("epoll_wait");
        break;
    }
    
    // 4. 處理就緒的 fd
    for (int i = 0; i < nfds; i++) {
        if (events[i].data.fd == listen_fd) {
            // 新連接
            int conn_fd = accept(listen_fd, ...);
            
            // 將新連接添加到 epoll
            ev.events = EPOLLIN | EPOLLET;  // 邊緣觸發
            ev.data.fd = conn_fd;
            epoll_ctl(epfd, EPOLL_CTL_ADD, conn_fd, &ev);
            
        } else {
            // 已連接的 fd 可讀
            handle_read(events[i].data.fd);
        }
    }
}

close(epfd);
```

#### epoll 的優勢

**1. 無 fd 數量限制**
```c
// 只受系統資源限制
// 可以輕鬆處理 10 萬+ 連接
```

**2. O(1) 性能**
```
epoll_wait 只返回就緒的 fd
無需遍歷所有 fd
時間複雜度: O(1)
```

**3. 無需重複傳遞 fd 集合**
```
fd 通過 epoll_ctl 註冊一次
內核維護在紅黑樹中
epoll_wait 只返回就緒的 fd
```

**4. 支援邊緣觸發 (ET)**
```c
// 邊緣觸發: 只在狀態變化時通知一次
ev.events = EPOLLIN | EPOLLET;

// 水平觸發: 只要條件滿足就通知 (預設)
ev.events = EPOLLIN;
```

### 4. 邊緣觸發 (ET) vs 水平觸發 (LT)

#### 水平觸發 (Level Triggered)

**特點**: 只要條件滿足，就會通知

```
假設接收緩衝區有 100 字節數據:

第 1 次 epoll_wait: 通知 fd 可讀
應用讀取 50 字節

第 2 次 epoll_wait: 仍然通知 fd 可讀 (還有 50 字節)
應用讀取 50 字節

第 3 次 epoll_wait: 不再通知 (沒有數據了)
```

**優點**:
- ✅ 編程簡單，不容易出錯
- ✅ 可以少量讀取數據

**缺點**:
- ❌ 如果不一次讀完，會重複通知

#### 邊緣觸發 (Edge Triggered)

**特點**: 只在狀態變化時通知一次

```
假設接收緩衝區有 100 字節數據:

第 1 次 epoll_wait: 通知 fd 可讀
應用讀取 50 字節

第 2 次 epoll_wait: 不再通知 (狀態沒變化)

新數據到達 (又有 100 字節):
第 3 次 epoll_wait: 再次通知 (狀態變化了)
```

**優點**:
- ✅ 效率高，減少通知次數
- ✅ 適合高並發場景

**缺點**:
- ❌ 必須一次讀完所有數據 (循環讀取直到 EAGAIN)
- ❌ 必須使用非阻塞 I/O
- ❌ 編程複雜，容易出錯

#### ET 模式正確使用

```c
// 1. 設置非阻塞
int flags = fcntl(fd, F_GETFL, 0);
fcntl(fd, F_SETFL, flags | O_NONBLOCK);

// 2. 使用 ET 模式
ev.events = EPOLLIN | EPOLLET;
epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);

// 3. 循環讀取直到 EAGAIN
while (1) {
    ssize_t n = read(fd, buffer, sizeof(buffer));
    
    if (n < 0) {
        if (errno == EAGAIN || errno == EWOULDBLOCK) {
            // 數據讀完了
            break;
        } else {
            // 錯誤
            perror("read");
            break;
        }
    } else if (n == 0) {
        // 連接關閉
        close(fd);
        break;
    } else {
        // 處理數據
        process_data(buffer, n);
    }
}
```

### 5. 性能對比

#### 測試場景: 監聽 10,000 個連接，100 個活躍

| 指標 | select | poll | epoll (LT) | epoll (ET) |
|-----|--------|------|-----------|-----------|
| **時間複雜度** | O(n) | O(n) | O(m) | O(m) |
| **fd 限制** | 1024 | 無限制 | 無限制 | 無限制 |
| **內存拷貝** | 每次調用 | 每次調用 | 只在註冊時 | 只在註冊時 |
| **遍歷開銷** | 10,000 | 10,000 | 100 | < 100 |
| **性能** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**注**: m = 就緒 fd 數量，n = 總 fd 數量

#### 實際測試數據

```
連接數: 10,000
活躍連接: 100

select:  ~100ms / 次
poll:    ~50ms / 次
epoll:   ~1ms / 次

epoll 比 select 快 100 倍！
```

### 6. 適用場景

#### 使用 select

- ✅ 跨平台需求 (Windows, Unix 都支援)
- ✅ 監聽 fd 數量少 (< 100)
- ❌ 不適合高並發

#### 使用 poll

- ✅ 需要監聽 > 1024 個 fd
- ✅ 跨平台 (相比 epoll)
- ❌ 仍不適合高並發 (仍是 O(n))

#### 使用 epoll

- ✅ Linux 系統
- ✅ 高並發 (10,000+ 連接)
- ✅ 活躍連接比例低
- ❌ 不跨平台 (只有 Linux)

### 7. 其他平台的 I/O 多路復用

#### kqueue (BSD, macOS)

類似 epoll，BSD 系統的高效實現：

```c
int kq = kqueue();
struct kevent changes[1];
struct kevent events[MAX_EVENTS];

// 註冊 fd
EV_SET(&changes[0], fd, EVFILT_READ, EV_ADD, 0, 0, NULL);
kevent(kq, changes, 1, NULL, 0, NULL);

// 等待事件
int nev = kevent(kq, NULL, 0, events, MAX_EVENTS, NULL);
```

#### IOCP (Windows)

Windows 的異步 I/O 完成端口：

```c
HANDLE iocp = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 0);
// 綁定 socket
CreateIoCompletionPort((HANDLE)socket, iocp, key, 0);
// 等待完成
GetQueuedCompletionStatus(iocp, ...);
```

### 8. 實務最佳實踐

#### epoll 使用建議

**1. 選擇合適的觸發模式**
```c
// 簡單場景: LT (水平觸發)
ev.events = EPOLLIN;

// 高性能場景: ET (邊緣觸發)
ev.events = EPOLLIN | EPOLLET;
// 必須配合非阻塞 I/O 和循環讀取
```

**2. 合理設置 maxevents**
```c
// 根據活躍連接比例設置
// 過小: 多次調用 epoll_wait
// 過大: 浪費記憶體
int maxevents = min(1024, active_connections * 2);
```

**3. 超時設置**
```c
// 永久阻塞
epoll_wait(epfd, events, maxevents, -1);

// 非阻塞
epoll_wait(epfd, events, maxevents, 0);

// 超時 (毫秒)
epoll_wait(epfd, events, maxevents, 1000);
```

**4. EPOLLONESHOT**
```c
// 多線程環境，避免多個線程同時處理同一 fd
ev.events = EPOLLIN | EPOLLONESHOT;
// 處理完後需要重新添加
epoll_ctl(epfd, EPOLL_CTL_MOD, fd, &ev);
```

## 總結

三種 I/O 多路復用機制各有特點：

1. **select**: 最古老，跨平台，但性能差、有限制
2. **poll**: 改進 select，無 fd 限制，但仍是 O(n)
3. **epoll**: Linux 專用，O(1) 性能，高並發首選

現代高並發服務器首選 **epoll (Linux)** 或 **kqueue (BSD)**。

作為資深後端工程師，你需要：
- 深入理解三種機制的實現原理和性能差異
- 掌握 epoll 的正確使用方法 (ET vs LT)
- 能夠設計高並發網路服務器
- 理解不同平台的 I/O 多路復用機制
- 根據場景選擇合適的技術方案
