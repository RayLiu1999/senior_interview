# Node.js 執行環境

Node.js 及其替代執行環境的特性和差異。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Node.js vs Deno vs Bun](./nodejs_vs_deno_vs_bun.md) | 7 | 4 | `Runtime`, `Comparison` |
| [V8 引擎工作原理](./v8_engine_internals.md) | 8 | 4 | `V8`, `JavaScript Engine` |
| [libuv 事件庫](./libuv_event_library.md) | 8 | 3 | `libuv`, `Event Loop` |
| [Worker Threads 使用](./worker_threads.md) | 7 | 4 | `Worker Threads`, `Parallelism` |

## 執行環境對比

### Node.js
- **特點**：最成熟、生態最大
- **引擎**：V8 JavaScript 引擎
- **事件循環**：libuv
- **套件管理**：npm、yarn、pnpm
- **適用**：所有 Node.js 項目

### Deno
- **特點**：安全優先、TypeScript 原生支持
- **引擎**：V8 + Rust
- **套件管理**：URL 導入、去中心化
- **權限系統**：明確的權限控制
- **適用**：新項目、安全性要求高

### Bun
- **特點**：極致性能、一體化工具
- **引擎**：JavaScriptCore（WebKit）
- **速度**：啟動和執行速度快
- **內建工具**：打包、測試、套件管理
- **適用**：性能敏感項目

## 對比表格

| 特性 | Node.js | Deno | Bun |
|------|---------|------|-----|
| JavaScript 引擎 | V8 | V8 | JavaScriptCore |
| TypeScript | 需要編譯 | 原生 | 原生 |
| 套件管理 | npm | URL | 內建 |
| 啟動速度 | 中等 | 中等 | 極快 |
| 運行速度 | 良好 | 良好 | 優秀 |
| 生態系統 | 龐大 | 成長中 | 新興 |
| 安全性 | 無限制 | 權限控制 | 無限制 |
| 穩定性 | 成熟 | 穩定 | 實驗性 |

## V8 引擎

### 核心組件
- **解析器（Parser）**：解析 JavaScript 代碼
- **Ignition**：字節碼解釋器
- **TurboFan**：優化編譯器
- **垃圾回收器**：自動記憶體管理

### 優化技術
- **隱藏類（Hidden Classes）**：優化屬性訪問
- **內聯快取（Inline Caching）**：加速函數調用
- **逃逸分析**：棧分配優化
- **JIT 編譯**：即時編譯熱代碼

## libuv

### 核心功能
- **事件循環**：非同步 I/O 的核心
- **檔案系統**：非同步檔案操作
- **網路**：TCP、UDP、DNS
- **子進程**：進程管理
- **執行緒池**：處理阻塞操作

### 事件循環階段
1. **timers**：執行 setTimeout 和 setInterval
2. **pending callbacks**：執行延遲的 I/O 回調
3. **idle, prepare**：內部使用
4. **poll**：檢索新的 I/O 事件
5. **check**：執行 setImmediate
6. **close callbacks**：關閉回調

## Worker Threads

### 使用場景
- CPU 密集計算
- 圖像/視頻處理
- 數據加密/解密
- 大量數據處理

### 與 Cluster 的區別
- **Worker Threads**：共享記憶體、適合 CPU 密集
- **Cluster**：獨立進程、適合 I/O 密集

### 通訊方式
- **postMessage**：發送訊息
- **SharedArrayBuffer**：共享記憶體
- **MessageChannel**：雙向通訊

## 選型建議

### 選擇 Node.js
- 需要穩定的生產環境
- 依賴龐大的 npm 生態
- 團隊熟悉 Node.js
- 長期維護的項目

### 選擇 Deno
- 新項目，不需要 npm 生態
- 安全性是首要考量
- 喜歡 TypeScript
- 希望避免 package.json 複雜性

### 選擇 Bun
- 極致性能需求
- 開發環境或工具
- 不依賴特定 npm 套件
- 願意接受實驗性技術

## 性能優化

### Node.js 優化
- 使用 Cluster 模式
- 啟用 Worker Threads
- 優化 V8 參數
- 使用 --max-old-space-size 調整記憶體

### 通用優化
- 避免阻塞事件循環
- 使用 Stream 處理大數據
- 合理使用快取
- 優化資料庫查詢
- 使用 HTTP/2
