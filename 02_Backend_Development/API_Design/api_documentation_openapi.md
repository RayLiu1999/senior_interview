# API 文件設計與 OpenAPI (API Documentation & OpenAPI)

- **難度**: 4
- **重要程度**: 4
- **標籤**: `OpenAPI`, `Swagger`, `API文件`, `契約優先`, `自動生成`

## 問題詳述

優質的 API 文件是 API 可用性的核心組成部分，決定了開發者整合 API 的效率。OpenAPI 規範（原 Swagger）是業界標準的 API 描述格式，支援自動生成文件、SDK 和測試代碼。

## 核心理論與詳解

### OpenAPI 規範

OpenAPI Specification（OAS）是一套機器可讀的 API 描述標準（YAML/JSON 格式），以結構化方式描述：
- API 端點和 HTTP 方法
- 請求參數和 Request Body Schema
- Response Schema 和狀態碼
- 認證授權方式
- 伺服器地址

**版本說明**：
- Swagger 2.0 = 舊版，仍廣泛使用
- OpenAPI 3.0 / 3.1 = 現行版本，更強大（支持 oneOf/anyOf、Webhook 描述等）

### 契約優先（API-First / Contract-First）

**代碼優先（Code-First）**：先寫後端代碼，從代碼生成文件（如 Go 的 swaggo/swag、Python 的 FastAPI 自動生成）。

**契約優先（API-First）**：先寫 OpenAPI 規範文件，再根據契約生成：
- 後端 Server Stub（骨架代碼）
- 前端/客戶端 SDK
- Mock Server（讓前後端並行開發）
- 測試用例骨架

**契約優先的優勢**：
- 前後端可以並行開發（前端使用 Mock Server）
- API 設計在寫代碼前就可以被 Review
- 自動保證文件與實現一致（代碼從規範生成）
- 便於 Consumer-Driven Contract Testing

### 優質 API 文件的組成

| 要素 | 說明 |
|------|------|
| **描述性** | 每個端點、參數、字段都有清晰的中英文說明 |
| **範例（Examples）** | 提供真實可用的請求/回應範例 |
| **錯誤碼說明** | 列出所有可能的錯誤碼及含義 |
| **認證說明** | 清楚說明如何獲取和使用 API 密鑰/Token |
| **Quick Start** | 提供 5 分鐘能跑通的入門示例（curl 命令） |
| **Changelog** | 記錄每個版本的變更，尤其是 Breaking Change |
| **互動式試用** | Swagger UI / ReDoc 提供在線測試 |

### 主流工具生態

**文件生成**：
- **Swagger UI / Redoc**：從 OpenAPI 規範渲染為可互動的 HTML 文件
- **swaggo/swag（Go）**：從代碼注釋生成 Swagger 文件
- **FastAPI（Python）**：框架內建，自動生成 OpenAPI + Swagger UI

**規範驗證**：
- `openapi-validator`：驗證 OpenAPI 文件格式是否正確
- `spectral`：API 規範 Linting，檢查是否符合設計規範

**Mock Server**：
- **Prism**：根據 OpenAPI 規範自動創建 Mock Server，返回範例數據
- **WireMock**：更靈活的 HTTP Mock 框架

**SDK 生成**：
- **OpenAPI Generator**：從 OpenAPI 規範生成 20+ 語言的客戶端 SDK 和服務端骨架

### 常見反模式

- ❌ **文件與代碼不同步**：代碼修改了，文件忘了更新（用契約優先或自動生成解決）
- ❌ **沒有範例**：只有字段定義，沒有真實請求/回應範例
- ❌ **錯誤碼不完整**：只文件成功回應，不文件錯誤情境
- ❌ **認證描述模糊**：「請傳入 Token」但不說 Token 如何獲取
- ❌ **文件停在某個舊版本**：新功能只有代碼沒有文件
