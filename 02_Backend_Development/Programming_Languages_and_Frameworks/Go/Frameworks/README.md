# Go Web 框架

Go 擁有多個優秀的 Web 框架，本節涵蓋最流行的 Gin 和 Echo 框架。

## 框架列表

### [Gin](./Gin/)
- **難度**：4
- **重要程度**：5
- **特點**：高性能、易用、生態豐富
- **性能**：基於 httprouter，路由性能極佳

### [Echo](./Echo/)
- **難度**：4
- **重要程度**：4
- **特點**：輕量、靈活、中間件豐富
- **性能**：優秀的性能表現

## 框架對比

| 特性 | Gin | Echo |
|------|-----|------|
| 性能 | 極佳 | 優秀 |
| 學習曲線 | 平緩 | 平緩 |
| 文檔 | 優秀 | 良好 |
| 社群 | 龐大 | 活躍 |
| 中間件 | 豐富 | 豐富 |
| 路由 | httprouter | 自實現 |

## Gin 核心概念

### 路由與中間件
- **路由群組**：組織相關路由
- **中間件鏈**：請求處理流水線
- **參數綁定**：自動解析請求參數
- **驗證**：內建驗證器

### 主題列表
| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Gin 框架基礎](./Gin/gin_framework_basics.md) | 4 | 5 | `Gin`, `Basics` |
| [Gin 中間件開發](./Gin/gin_middleware_development.md) | 6 | 5 | `Middleware`, `Advanced` |
| [Gin 性能優化](./Gin/gin_performance_best_practices.md) | 7 | 4 | `Performance`, `Optimization` |

## Echo 核心概念

### 特色功能
- **自動 TLS**：Let's Encrypt 整合
- **HTTP/2**：原生支持
- **WebSocket**：內建支持
- **模板渲染**：多種模板引擎

### 主題列表
| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Echo 框架基礎](./Echo/echo_framework_basics.md) | 4 | 4 | `Echo`, `Basics` |
| [Echo 進階特性](./Echo/echo_advanced_features.md) | 6 | 4 | `Echo`, `Advanced` |

## 選型建議

### 選擇 Gin
- 需要極致的路由性能
- 社群支持和生態豐富
- 大量中間件和插件可用
- 團隊熟悉 Gin 或需要降低學習成本

### 選擇 Echo
- 需要靈活的中間件系統
- 內建功能豐富（WebSocket、HTTP/2）
- 喜歡簡潔的 API 設計
- 需要自動 TLS 功能

### 其他選擇
- **Fiber**：類似 Express.js 的 API，性能更高
- **Chi**：輕量級、標準庫風格
- **Iris**：功能最豐富，但較重
- **純 net/http**：小型項目或學習用途

## 最佳實踐

### 項目結構
```
project/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   ├── repository/
│   └── model/
├── pkg/
├── config/
└── go.mod
```

### 中間件使用
- **日誌中間件**：記錄所有請求
- **恢復中間件**：捕獲 panic
- **CORS 中間件**：處理跨域請求
- **認證中間件**：JWT 或 Session
- **限流中間件**：防止濫用

### 錯誤處理
- 統一錯誤響應格式
- 使用自定義錯誤類型
- 區分業務錯誤和系統錯誤
- 記錄詳細錯誤信息

### 性能優化
- 使用連接池（資料庫、Redis）
- 啟用 HTTP/2
- 使用 pprof 分析性能瓶頸
- 合理使用快取
