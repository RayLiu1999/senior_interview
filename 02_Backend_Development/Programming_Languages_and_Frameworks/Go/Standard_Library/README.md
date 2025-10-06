# Go 標準庫

Go 的標準庫功能強大且設計優雅。本節涵蓋面試中常見的標準庫使用問題。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Context 套件使用](./context_package_usage.md) | 7 | 5 | `Context`, `Cancellation`, `Timeout` |

## 核心套件

### 並發控制
- **context**：請求作用域、取消、超時
- **sync**：同步原語（Mutex、WaitGroup、Once）
- **sync/atomic**：原子操作

### I/O 處理
- **io**：基本 I/O 接口
- **bufio**：緩衝 I/O
- **os**：操作系統接口
- **path/filepath**：檔案路徑操作

### 網路編程
- **net**：網路 I/O（TCP、UDP）
- **net/http**：HTTP 客戶端和伺服器
- **net/url**：URL 解析
- **encoding/json**：JSON 編解碼

### 數據處理
- **strings**：字串操作
- **bytes**：字節切片操作
- **encoding**：各種編碼（JSON、XML、Base64）
- **fmt**：格式化 I/O

### 時間與錯誤
- **time**：時間和定時器
- **errors**：錯誤處理
- **log**：日誌記錄

## Context 使用模式

### 傳遞請求作用域數據
```go
ctx := context.WithValue(context.Background(), key, value)
```

### 超時控制
```go
ctx, cancel := context.WithTimeout(parent, 5*time.Second)
defer cancel()
```

### 取消信號
```go
ctx, cancel := context.WithCancel(parent)
// 在需要時調用 cancel()
```

### 截止時間
```go
deadline := time.Now().Add(10 * time.Second)
ctx, cancel := context.WithDeadline(parent, deadline)
defer cancel()
```

## 最佳實踐

### Context
- 作為函數的第一個參數傳遞
- 不要存儲 Context，而是每次傳遞
- 使用 context.TODO() 表示尚未決定使用什麼 Context
- 使用 context.Background() 作為頂層 Context

### 錯誤處理
- 使用 errors.Is() 和 errors.As() 判斷錯誤
- 使用 fmt.Errorf() 包裝錯誤
- 定義哨兵錯誤（sentinel errors）
- 使用自定義錯誤類型

### HTTP
- 正確設置超時（Client Timeout、Server Timeout）
- 使用 http.Client 而不是默認客戶端
- 處理請求體的關閉
- 使用 context 控制請求取消
