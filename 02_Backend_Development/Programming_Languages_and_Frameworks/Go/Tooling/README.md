# Go 工具鏈

Go 提供了豐富的工具鏈支持開發、測試、部署的全流程。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [go mod 命令詳解](./go_mod_commands.md) | 3 | 3 | `Modules`, `Dependency Management` |

## 核心工具

### 依賴管理
- **go mod**：模組管理
- **go get**：下載依賴
- **go.mod**：模組定義檔案
- **go.sum**：校驗和檔案

### 建構與運行
- **go build**：編譯程式
- **go run**：編譯並運行
- **go install**：安裝二進制檔案
- **交叉編譯**：GOOS 和 GOARCH

### 測試
- **go test**：運行測試
- **go test -bench**：基準測試
- **go test -race**：競態檢測
- **go test -cover**：代碼覆蓋率

### 程式碼品質
- **go fmt**：格式化程式碼
- **go vet**：靜態分析
- **golint**：程式碼風格檢查
- **golangci-lint**：多個 linter 的集成

### 性能分析
- **go tool pprof**：性能分析
- **go tool trace**：執行追蹤
- **-cpuprofile**：CPU 性能分析
- **-memprofile**：記憶體分析

## 常用命令

### 模組管理
```bash
go mod init         # 初始化模組
go mod tidy         # 整理依賴
go mod download     # 下載依賴
go mod vendor       # 創建 vendor 目錄
go mod verify       # 驗證依賴
```

### 測試
```bash
go test ./...                    # 測試所有包
go test -v                       # 詳細輸出
go test -run TestName            # 運行特定測試
go test -bench=.                 # 運行基準測試
go test -race                    # 競態檢測
go test -cover                   # 代碼覆蓋率
go test -coverprofile=cover.out  # 生成覆蓋率報告
```

### 性能分析
```bash
go test -cpuprofile=cpu.prof -bench=.
go tool pprof cpu.prof

go test -memprofile=mem.prof -bench=.
go tool pprof mem.prof
```

## 最佳實踐

### 模組管理
- 使用語義化版本
- 定期運行 `go mod tidy`
- 使用 `go mod vendor` 鎖定依賴
- 避免使用 replace 指令（除了開發時）

### 測試
- 測試檔案命名為 `*_test.go`
- 使用表驅動測試
- 使用 testify 等測試框架
- 編寫基準測試衡量性能

### 程式碼品質
- 使用 `go fmt` 格式化程式碼
- 使用 `go vet` 檢查常見錯誤
- 集成 golangci-lint 到 CI/CD
- 定期運行靜態分析工具
