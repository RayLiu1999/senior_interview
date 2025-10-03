# Node.js 版本與 LTS 策略

- **難度**: 4
- **重要程度**: 3
- **標籤**: `Node.js`, `LTS`, `Version Management`, `Release Cycle`

## 問題詳述

請解釋 Node.js 的版本發佈策略、LTS（Long Term Support）機制、版本選擇原則以及版本管理工具的使用。

## 核心理論與詳解

### 1. Node.js 版本編號

**語義化版本（Semantic Versioning）**：

```
主版本.次版本.修訂版本
MAJOR.MINOR.PATCH

例如：18.19.0
```

**版本號含義**：
- **MAJOR（主版本）**：不兼容的 API 變更
- **MINOR（次版本）**：向後兼容的功能新增
- **PATCH（修訂版本）**：向後兼容的問題修正

### 2. 發佈週期

```
Node.js 發佈時間線
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

偶數版本（LTS）：
┌────────────────────────────────────────────┐
│ Current (6個月) → Active LTS (18個月)      │
│                 → Maintenance (12個月)     │
│                 總計：36個月支援            │
└────────────────────────────────────────────┘

奇數版本（非LTS）：
┌────────────────────────────────────────────┐
│ Current (6個月) → End of Life             │
│ 總計：6個月支援                             │
└────────────────────────────────────────────┘
```

**每年發佈計劃**：
- **4 月**：發佈新的偶數版本（未來的 LTS）
- **10 月**：
  - 上次 4 月發佈的版本進入 Active LTS
  - 發佈新的奇數版本（Current Only）

### 3. LTS 版本生命週期

```
以 Node.js 20 為例（2023年發佈）：

2023-04    2023-10    2025-10    2026-04
   │          │          │          │
   ▼          ▼          ▼          ▼
Current → Active LTS → Maintenance → EOL
(6個月)   (18個月)    (12個月)

┌─────────┬──────────────┬─────────────┬──────┐
│ Current │ Active LTS   │ Maintenance │ EOL  │
├─────────┼──────────────┼─────────────┼──────┤
│ 新功能  │ 錯誤修復     │ 重大安全    │ 終止 │
│ 活躍開發│ 穩定性優先   │ 修復與關鍵  │ 支援 │
│         │ 非關鍵修復   │ 錯誤修復    │      │
└─────────┴──────────────┴─────────────┴──────┘
```

### 4. 歷史版本時間線

| 版本 | 發佈日期 | LTS 開始 | 維護結束 | EOL | 狀態 |
|------|---------|---------|---------|-----|------|
| **22** | 2024-04 | 2024-10 | 2026-10 | 2027-04 | Active LTS |
| **21** | 2023-10 | - | - | 2024-06 | EOL |
| **20** | 2023-04 | 2023-10 | 2025-10 | 2026-04 | Active LTS |
| **18** | 2022-04 | 2022-10 | 2024-10 | 2025-04 | Maintenance |
| **16** | 2021-04 | 2021-10 | 2023-10 | 2024-09 | EOL |
| **14** | 2020-04 | 2020-10 | 2022-10 | 2023-04 | EOL |
| **12** | 2019-04 | 2019-10 | 2021-10 | 2022-04 | EOL |

### 5. 各版本重要特性

#### Node.js 22 (2024, Active LTS)

```javascript
// 1. require() 支援 ES Modules
const { readFile } = require('node:fs/promises')

// 2. Watch 模式改進
// node --watch app.js

// 3. WebSocket 客戶端原生支援
const ws = new WebSocket('ws://localhost:8080')

// 4. 改進的 Test Runner
import { test, describe } from 'node:test'

describe('API Tests', () => {
  test('should return 200', async () => {
    // ...
  })
})
```

**主要特性**：
- 原生 WebSocket 客戶端
- require() ES Modules 支援
- V8 12.4
- 改進的 Test Runner
- 更快的啟動時間

#### Node.js 20 (2023, Active LTS)

```javascript
// 1. 實驗性 Permission Model
// node --experimental-permission --allow-fs-read=/path app.js

// 2. 穩定的 Test Runner
import test from 'node:test'
import assert from 'node:assert'

test('sync test', (t) => {
  assert.strictEqual(1 + 1, 2)
})

// 3. 改進的 fetch API
const response = await fetch('https://api.example.com/data')
const data = await response.json()

// 4. 單一可執行檔案（實驗性）
// node --experimental-sea-config sea-config.json
```

**主要特性**：
- Test Runner 穩定版
- Permission Model（實驗性）
- V8 11.3
- 改進的 Web Streams
- 單一可執行檔案支援

#### Node.js 18 (2022, Maintenance)

```javascript
// 1. 原生 Fetch API
const response = await fetch('https://api.example.com')

// 2. Web Streams API
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello')
    controller.close()
  }
})

// 3. Test Runner (實驗性)
import test from 'node:test'

test('basic test', (t) => {
  // ...
})

// 4. 改進的 ES Modules 支援
import { createServer } from 'node:http'
```

**主要特性**：
- 原生 Fetch API
- Web Streams API
- Test Runner（實驗性）
- V8 10.1
- 移除 `--experimental-modules` 標誌

#### Node.js 16 (2021, EOL)

```javascript
// 1. Apple Silicon 支援
// 原生支援 M1 晶片

// 2. Timers Promises API
import { setTimeout } from 'timers/promises'

await setTimeout(1000)
console.log('1 second later')

// 3. AbortController
const controller = new AbortController()
const { signal } = controller

fetch('https://api.example.com', { signal })

setTimeout(() => controller.abort(), 5000)

// 4. 穩定的 fs Promises API
import { readFile } from 'fs/promises'

const content = await readFile('./file.txt', 'utf-8')
```

**主要特性**：
- Apple Silicon（M1）原生支援
- Timers Promises API
- AbortController
- V8 9.0
- npm 7

### 6. 版本選擇策略

#### 生產環境

```bash
# 推薦：最新的 Active LTS 版本
nvm install 22  # 或 20

# 原因：
# ✅ 長期支援（36 個月）
# ✅ 穩定性高
# ✅ 安全更新保證
# ✅ 社群套件相容性好
```

**企業級應用**：
- 使用 **Active LTS** 版本（18, 20, 22）
- 避免使用奇數版本（非 LTS）
- 定期更新到最新的 LTS PATCH 版本

#### 開發環境

```bash
# 可以使用最新的 Current 版本
nvm install node  # 安裝最新版本

# 原因：
# ✅ 嘗試最新功能
# ✅ 提前發現相容性問題
# ✅ 為未來升級做準備
```

#### 新專案

```bash
# 推薦：最新的 LTS 版本
nvm install --lts

# 在 package.json 中指定：
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 7. 版本管理工具

#### nvm (Node Version Manager)

**安裝**：

```bash
# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新載入 shell
source ~/.bashrc  # 或 ~/.zshrc
```

**常用指令**：

```bash
# 列出所有可用版本
nvm ls-remote

# 列出 LTS 版本
nvm ls-remote --lts

# 安裝最新 LTS
nvm install --lts

# 安裝特定版本
nvm install 20.10.0

# 安裝最新的 20.x
nvm install 20

# 列出已安裝版本
nvm ls

# 使用特定版本
nvm use 20

# 設定預設版本
nvm alias default 20

# 查看當前版本
nvm current

# 切換到系統版本
nvm use system

# 卸載版本
nvm uninstall 18
```

**專案級版本管理**：

```bash
# .nvmrc 檔案
echo "20.10.0" > .nvmrc

# 自動使用專案版本
nvm use

# 安裝 .nvmrc 指定的版本
nvm install
```

**Shell 自動切換**：

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
```

#### fnm (Fast Node Manager)

**特點**：
- 使用 Rust 編寫，速度快
- 跨平台（Windows、macOS、Linux）
- 自動切換版本

**安裝**：

```bash
# macOS / Linux
curl -fsSL https://fnm.vercel.app/install | bash

# Windows (Scoop)
scoop install fnm
```

**使用**：

```bash
# 列出可用版本
fnm ls-remote

# 安裝版本
fnm install 20

# 使用版本
fnm use 20

# 設定預設版本
fnm default 20

# 自動切換（讀取 .nvmrc）
fnm use
```

#### n (Node version management)

**安裝**：

```bash
npm install -g n
```

**使用**：

```bash
# 安裝最新 LTS
n lts

# 安裝最新版本
n latest

# 安裝特定版本
n 20.10.0

# 列出已安裝版本
n ls

# 切換版本（互動式）
n

# 移除版本
n rm 18.0.0
```

### 8. Docker 中的版本管理

```dockerfile
# 使用特定版本
FROM node:20.10.0-alpine

# 使用 LTS
FROM node:20-alpine

# 使用最新版本（不推薦生產環境）
FROM node:alpine

# 多階段構建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 9. CI/CD 中的版本管理

**GitHub Actions**：

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        # 測試多個 Node.js 版本
        node-version: [18.x, 20.x, 22.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm test
```

**GitLab CI**：

```yaml
# .gitlab-ci.yml
image: node:20-alpine

stages:
  - test
  - build

test:
  stage: test
  script:
    - npm ci
    - npm test
  
  # 測試多個版本
  parallel:
    matrix:
      - NODE_VERSION: ['18', '20', '22']
  image: node:${NODE_VERSION}-alpine
```

### 10. 版本升級策略

#### 小版本升級（PATCH）

```bash
# 18.19.0 → 18.19.1
npm update

# 檢查更新
npm outdated
```

**風險**：⭐ 低
**測試**：基本冒煙測試
**頻率**：每月或有安全更新時

#### 次版本升級（MINOR）

```bash
# 20.10.0 → 20.11.0
nvm install 20.11.0
nvm use 20.11.0

# 測試應用
npm test
npm run build
```

**風險**：⭐⭐ 中低
**測試**：完整測試套件
**頻率**：季度

#### 主版本升級（MAJOR）

```bash
# Node.js 18 → 20

# 1. 檢查相容性
npx npm-check-updates -u

# 2. 安裝新版本
nvm install 20

# 3. 更新依賴
npm update

# 4. 檢查棄用警告
npm run build 2>&1 | grep -i deprecated

# 5. 完整測試
npm test
npm run e2e
```

**風險**：⭐⭐⭐⭐ 高
**測試**：全面測試（單元、整合、E2E）
**頻率**：年度或根據 LTS 週期

**升級檢查清單**：
- [ ] 閱讀 [Release Notes](https://github.com/nodejs/node/releases)
- [ ] 檢查 [Breaking Changes](https://github.com/nodejs/node/blob/main/doc/changelogs/)
- [ ] 更新 CI/CD 配置
- [ ] 更新 Dockerfile
- [ ] 更新 package.json engines
- [ ] 測試所有關鍵功能
- [ ] 檢查第三方套件相容性
- [ ] 更新文檔

### 11. 常見問題處理

#### 套件不相容

```bash
# 檢查套件相容性
npm ls

# 檢查特定套件
npm ls <package-name>

# 強制使用特定版本
npm install <package>@<version> --force

# 或使用 overrides (package.json)
{
  "overrides": {
    "package-name": "^1.0.0"
  }
}
```

#### 原生模組重建

```bash
# 切換 Node.js 版本後重建原生模組
npm rebuild

# 或重新安裝
rm -rf node_modules package-lock.json
npm install
```

#### 多專案版本管理

```bash
# 專案 A 使用 Node 18
cd project-a
echo "18" > .nvmrc
nvm use

# 專案 B 使用 Node 20
cd project-b
echo "20" > .nvmrc
nvm use
```

## 總結

**版本選擇建議**：

| 環境 | 推薦版本 | 原因 |
|------|---------|------|
| **生產環境** | Active LTS (20, 22) | 穩定、長期支援 |
| **新專案** | 最新 LTS | 最新功能 + 長期支援 |
| **維護專案** | 當前使用的 LTS | 避免不必要的升級風險 |
| **實驗/學習** | Current (23) | 嘗試最新功能 |
| **舊專案** | Maintenance LTS (18) | 保持支援直到 EOL |

**最佳實踐**：
- ✅ 生產環境使用 LTS 版本
- ✅ 使用版本管理工具（nvm、fnm）
- ✅ 在 package.json 中指定 Node.js 版本
- ✅ 定期更新到最新的 PATCH 版本
- ✅ 在 LTS 接近 EOL 前規劃升級
- ✅ 使用 CI/CD 測試多個版本
- ✅ 關注安全公告

**關鍵日期提醒**：
- 每年 **4 月**：新 LTS 版本發佈
- 每年 **10 月**：LTS 進入 Active 階段
- 定期檢查 [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)

理解 Node.js 版本策略有助於選擇合適的版本並規劃升級路徑。
