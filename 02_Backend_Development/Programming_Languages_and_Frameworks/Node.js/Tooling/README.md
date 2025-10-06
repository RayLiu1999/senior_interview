# Node.js 工具鏈

Node.js 開發中常用的工具、套件管理器和開發環境配置。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [npm vs yarn vs pnpm](./package_managers_comparison.md) | 5 | 5 | `Package Manager`, `npm` |
| [package.json 詳解](./package_json_explained.md) | 5 | 5 | `Configuration`, `Dependencies` |
| [Node 版本管理](./node_version_management.md) | 4 | 4 | `nvm`, `Version Control` |
| [ES Lint 與程式碼規範](./eslint_configuration.md) | 5 | 5 | `Code Quality`, `Linting` |
| [Prettier 程式碼格式化](./prettier_setup.md) | 4 | 4 | `Formatting`, `Code Style` |
| [除錯技巧與工具](./debugging_nodejs.md) | 6 | 5 | `Debugging`, `DevTools` |
| [性能分析工具](./performance_profiling.md) | 7 | 4 | `Performance`, `Profiling` |

## 套件管理器

### npm（Node Package Manager）
- **特點**：官方套件管理器、生態最大
- **優勢**：兼容性好、文檔完善
- **適用**：大部分項目

### yarn
- **特點**：Facebook 開發、更快的安裝速度
- **優勢**：離線快取、工作區支援
- **適用**：Monorepo、大型項目

### pnpm
- **特點**：高效的磁碟空間使用
- **優勢**：節省空間、安裝快速、嚴格依賴
- **適用**：磁碟空間有限、Monorepo

## 開發工具

### 程式碼品質
- **ESLint**：JavaScript/TypeScript 代碼檢查
- **Prettier**：程式碼格式化
- **Husky**：Git hooks 管理
- **lint-staged**：對暫存文件執行 linter

### 測試工具
- **Jest**：全功能測試框架
- **Mocha**：靈活的測試框架
- **Chai**：斷言庫
- **Supertest**：HTTP 測試
- **nyc**：代碼覆蓋率

### 建構工具
- **Webpack**：模組打包工具
- **Rollup**：ES 模組打包
- **esbuild**：極速打包工具
- **SWC**：Rust 編寫的編譯器

### 除錯工具
- **Node.js Inspector**：內建除錯器
- **Chrome DevTools**：瀏覽器除錯
- **VS Code Debugger**：IDE 整合
- **ndb**：改進的除錯體驗

## 性能分析

### 內建工具
- **--inspect**：啟用 Chrome DevTools
- **--prof**：V8 性能分析
- **--trace-warnings**：追蹤警告來源

### 第三方工具
- **clinic.js**：性能診斷工具套件
- **0x**：火焰圖生成器
- **autocannon**：HTTP 負載測試
- **artillery**：負載和功能測試

## 版本管理

### nvm（Node Version Manager）
```bash
nvm install 18        # 安裝 Node 18
nvm use 18           # 使用 Node 18
nvm alias default 18  # 設置默認版本
```

### n
```bash
n lts                # 安裝 LTS 版本
n latest             # 安裝最新版本
n 18.0.0             # 安裝特定版本
```

### volta
```bash
volta install node@18  # 安裝並設置 Node 18
volta pin node@18      # 固定項目 Node 版本
```

## 最佳實踐

### package.json
- 使用 `^` 前綴允許次版本更新
- 使用 `~` 前綴只允許修訂版本更新
- 固定關鍵依賴版本
- 定期更新依賴（npm outdated）
- 使用 package-lock.json 鎖定版本

### 程式碼品質
- 配置 ESLint 和 Prettier
- 使用 Husky 在提交前檢查
- 編寫單元測試
- 定期運行靜態分析
- 監控代碼覆蓋率

### 性能監控
- 使用 APM 工具（New Relic、DataDog）
- 記錄關鍵指標
- 定期進行性能測試
- 監控記憶體使用
- 追蹤慢查詢和請求
