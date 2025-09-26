# `go mod` 的主要指令有哪些？例如 `tidy`, `vendor` 的作用是什麼？

- **難度**: 3
- **重要程度**: 3
- **標籤**: `Go Modules`, `Tooling`, `Dependency Management`

## 問題詳述

本問題考察面試者對 Go 官方依賴管理工具——Go Modules 的掌握程度。`go mod` 是現代 Go 開發流程中不可或缺的一環，熟悉其常用指令是進行專案管理、構建和協作的基本要求。

## 核心理論與詳解

Go Modules 是自 Go 1.11 版本引入並在後續版本中成為預設的官方依賴管理系統。它通過 `go.mod` 和 `go.sum` 兩個核心檔案來管理專案的依賴關係。

-   **`go.mod`**: 位於專案根目錄，定義了模組路徑（module path）、專案所使用的 Go 版本以及所有的直接依賴（direct dependencies）及其版本號。
-   **`go.sum`**: 記錄了專案直接和間接依賴的每個套件特定版本的加密校驗和（cryptographic checksum）。這是一個安全機制，確保每次構建時使用的都是完全相同的依賴程式碼，防止惡意篡改。

### 主要指令詳解

以下是 `go mod` 的一些核心指令及其作用：

#### `go mod init [module-path]`
-   **作用**: 在當前目錄下初始化一個新模組，並生成一個 `go.mod` 檔案。
-   **範例**: `go mod init github.com/my-user/my-project`

#### `go mod tidy`
-   **作用**: 「整理」依賴關係，是日常開發中最常用的指令之一。它會執行兩項主要任務：
    1.  **移除無用依賴**: 掃描專案程式碼，從 `go.mod` 中移除沒有被任何程式碼 import 的依賴項。
    2.  **添加缺失依賴**: 尋找程式碼中 import 了但 `go.mod` 中沒有記錄的依賴項，並將它們（及其間接依賴）添加到 `go.mod` 和 `go.sum` 中。
-   **目的**: 確保 `go.mod` 檔案與專案的實際程式碼依賴保持同步。

#### `go get [package@version]`
-   **作用**: 用於獲取、更新或移除指定的依賴。
-   **範例**:
    -   `go get github.com/gin-gonic/gin`: 添加 `gin` 依賴或將其更新到最新的 `tag` 版本。
    -   `go get github.com/gin-gonic/gin@v1.7.4`: 將 `gin` 更新或降級到指定的 `v1.7.4` 版本。
    -   `go get .`: 更新所有現有依賴到最新的 `minor` 或 `patch` 版本（在 Go 1.16+）。

#### `go mod download`
-   **作用**: 下載 `go.mod` 檔案中記錄的所有依賴到本地的模組快取中（通常位於 `$GOPATH/pkg/mod`）。
-   **使用場景**: 在 CI/CD 環境中，可以先執行 `download` 來預先拉取所有依賴，以便後續的 `build` 或 `test` 步驟可以離線執行，加快流程。

#### `go mod vendor`
-   **作用**: 在專案根目錄下創建一個名為 `vendor` 的資料夾，並將專案的所有依賴項（包括直接和間接依賴）複製到該資料夾中。
-   **使用場景**: 創建一個完全獨立、自包含的專案構建環境。當使用 `go build -mod=vendor` 指令進行編譯時，Go 工具鏈會優先使用 `vendor` 目錄下的套件，而不是從網路或本地快取中尋找。這對於需要離線構建或有嚴格審計要求的企業環境非常有用。

#### `go mod why [package-path]`
-   **作用**: 解釋為什麼指定的套件會成為當前專案的一個依賴。它會顯示一個從主模組到該套件的最短依賴路徑。
-   **範例**: `go mod why golang.org/x/text`

#### `go mod edit`
-   **作用**: 提供一個命令列介面來編輯 `go.mod` 檔案。最常見的用途是使用 `replace` 指令將一個依賴替換為本地的另一個路徑，方便進行本地開發和調試。
-   **範例**: `go mod edit -replace=example.com/original/pkg=../local/pkg`
