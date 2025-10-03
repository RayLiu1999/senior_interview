# package.json 深入解析

- **難度**: 5
- **重要程度**: 4
- **標籤**: `package.json`, `Dependencies`, `Scripts`, `npm`

## 問題詳述

請深入解釋 package.json 的各個欄位、依賴管理（dependencies、devDependencies、peerDependencies 等）、版本範圍、scripts 腳本以及最佳實踐。

## 核心理論與詳解

### 1. package.json 完整結構

```json
{
  // ========== 基本資訊 ==========
  "name": "my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "keywords": ["node", "javascript"],
  "homepage": "https://github.com/user/repo#readme",
  "bugs": {
    "url": "https://github.com/user/repo/issues",
    "email": "support@example.com"
  },
  "license": "MIT",
  "author": {
    "name": "John Doe",
    "email": "john@example.com",
    "url": "https://example.com"
  },
  "contributors": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  
  // ========== 文件和目錄 ==========
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./utils": "./dist/utils.js"
  },
  "bin": {
    "my-cli": "./bin/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  // ========== 依賴管理 ==========
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "optionalDependencies": {
    "fsevents": "^2.3.0"
  },
  "bundledDependencies": [
    "my-private-pkg"
  ],
  
  // ========== Scripts ==========
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "prepublishOnly": "npm run build"
  },
  
  // ========== 引擎和環境 ==========
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "os": ["darwin", "linux"],
  "cpu": ["x64", "arm64"],
  
  // ========== 配置 ==========
  "config": {
    "port": 3000
  },
  
  // ========== 工作區（Monorepo）==========
  "workspaces": [
    "packages/*"
  ],
  
  // ========== 發布配置 ==========
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "public"
  },
  
  // ========== 其他 ==========
  "private": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  }
}
```

### 2. 依賴類型詳解

#### dependencies（生產依賴）

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0"
  }
}
```

**特點**：
- 應用運行時需要的套件
- 會被安裝到生產環境
- 當作為依賴被安裝時，這些套件也會被安裝

**使用場景**：
```javascript
// 運行時需要的套件
import express from 'express'
import mongoose from 'mongoose'

const app = express()
await mongoose.connect('mongodb://localhost/mydb')
```

#### devDependencies（開發依賴）

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@types/node": "^20.0.0"
  }
}
```

**特點**：
- 只在開發時需要
- 不會安裝到生產環境（`npm install --production`）
- 當作為依賴被安裝時，不會被安裝

**使用場景**：
- 編譯工具（TypeScript、Babel）
- 測試框架（Jest、Mocha）
- 程式碼檢查（ESLint、Prettier）
- 類型定義（@types/*）

#### peerDependencies（對等依賴）

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true
    }
  }
}
```

**特點**：
- 表示套件需要與特定版本的其他套件一起使用
- npm 7+ 會自動安裝 peerDependencies
- 用於插件或擴展套件

**使用場景**：

```javascript
// 你的 React 組件庫
// package.json
{
  "name": "my-react-components",
  "peerDependencies": {
    "react": ">=16.8.0"  // 要求使用者安裝 React
  }
}

// 使用者的專案
{
  "dependencies": {
    "react": "^18.0.0",           // 使用者提供
    "my-react-components": "^1.0.0"  // 你的套件
  }
}
```

**版本衝突範例**：

```json
// 你的專案
{
  "dependencies": {
    "plugin-a": "^1.0.0",  // peerDependencies: { "react": "^16.0.0" }
    "plugin-b": "^1.0.0",  // peerDependencies: { "react": "^18.0.0" }
    "react": "^18.0.0"
  }
}
// ⚠️ 警告：plugin-a 需要 React 16，但安裝的是 React 18
```

#### optionalDependencies（可選依賴）

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.0"  // macOS 專用
  }
}
```

**特點**：
- 安裝失敗不會導致整個安裝失敗
- 需要在代碼中處理套件不存在的情況

**使用場景**：

```javascript
// 平台特定的優化
let fsevents
try {
  fsevents = require('fsevents')  // macOS 專用
} catch (err) {
  // 使用降級方案
  fsevents = null
}

if (fsevents) {
  // 使用原生 macOS 文件監控
} else {
  // 使用跨平台的 fs.watch
}
```

#### bundledDependencies（捆綁依賴）

```json
{
  "bundledDependencies": [
    "my-private-package"
  ]
}
```

**特點**：
- 發布時會將這些套件打包在一起
- 用於私有套件或特定版本

### 3. 版本範圍（Semver）

```
語義化版本：MAJOR.MINOR.PATCH
例如：1.2.3
```

#### 版本範圍語法

```json
{
  "dependencies": {
    // 精確版本
    "pkg1": "1.2.3",
    
    // 波浪號（允許 PATCH 更新）
    "pkg2": "~1.2.3",     // >=1.2.3 <1.3.0
    "pkg3": "~1.2",       // >=1.2.0 <1.3.0
    
    // 脫字符（允許 MINOR 和 PATCH 更新）
    "pkg4": "^1.2.3",     // >=1.2.3 <2.0.0
    "pkg5": "^0.2.3",     // >=0.2.3 <0.3.0 (0.x 特殊處理)
    "pkg6": "^0.0.3",     // >=0.0.3 <0.0.4 (0.0.x 特殊處理)
    
    // 範圍
    "pkg7": ">=1.2.3 <2.0.0",
    "pkg8": "1.2.3 - 2.3.4",  // >=1.2.3 <=2.3.4
    
    // 通配符
    "pkg9": "1.2.x",      // >=1.2.0 <1.3.0
    "pkg10": "1.x",       // >=1.0.0 <2.0.0
    "pkg11": "*",         // 任意版本
    
    // 最新版本
    "pkg12": "latest",    // 最新穩定版
    "pkg13": "next",      // 下一個版本
    
    // Git 倉庫
    "pkg14": "git+https://github.com/user/repo.git",
    "pkg15": "git+https://github.com/user/repo.git#v1.0.0",
    
    // GitHub 短路徑
    "pkg16": "user/repo",
    "pkg17": "user/repo#branch",
    
    // 本地路徑
    "pkg18": "file:../local-package",
    
    // Tarball URL
    "pkg19": "https://example.com/package.tgz"
  }
}
```

#### 版本範圍對比

```bash
# 假設當前版本是 1.2.3

"1.2.3"        # 只安裝 1.2.3
"~1.2.3"       # 可升級到 1.2.9，不能升級到 1.3.0
"^1.2.3"       # 可升級到 1.9.9，不能升級到 2.0.0

# 實際例子
"~4.17.0"      # 4.17.0 到 4.17.x
"^4.17.0"      # 4.17.0 到 4.x.x
```

**選擇建議**：

```json
{
  "dependencies": {
    // ✅ 推薦：使用 ^ 允許小版本更新
    "express": "^4.18.0",
    
    // ⚠️ 謹慎：精確版本（可能錯過重要修復）
    "lodash": "4.17.21",
    
    // ❌ 避免：通配符（不穩定）
    "some-pkg": "*"
  }
}
```

### 4. package-lock.json

**作用**：
- 鎖定依賴樹的確切版本
- 確保團隊成員安裝相同版本
- 加快安裝速度（不需要解析版本）

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "": {
      "name": "my-app",
      "version": "1.0.0",
      "dependencies": {
        "express": "^4.18.0"
      }
    },
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "accepts": "~1.3.8",
        "body-parser": "1.20.1"
      }
    }
  }
}
```

**最佳實踐**：
- ✅ 提交 package-lock.json 到版本控制
- ✅ 使用 `npm ci` 在 CI/CD 中安裝
- ✅ 定期更新：`npm update`

### 5. Scripts 腳本

```json
{
  "scripts": {
    // 開發
    "dev": "nodemon src/index.ts",
    "start": "node dist/index.js",
    
    // 建構
    "build": "tsc",
    "build:prod": "tsc --build tsconfig.prod.json",
    
    // 測試
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    // Lint
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    
    // 生命週期腳本
    "preinstall": "echo '安裝前執行'",
    "postinstall": "echo '安裝後執行'",
    "prepublishOnly": "npm run build && npm test",
    
    // 組合腳本
    "ci": "npm run lint && npm run test && npm run build"
  }
}
```

#### 生命週期腳本

```
npm install 執行順序：
preinstall → install → postinstall

npm publish 執行順序：
prepublishOnly → prepack → prepare → pack → postpack → publish → postpublish

npm start 執行順序：
prestart → start → poststart
```

**常用生命週期鉤子**：

```json
{
  "scripts": {
    // 安裝相關
    "preinstall": "node scripts/check-node-version.js",
    "postinstall": "husky install",
    
    // 發布相關
    "prepublishOnly": "npm run build && npm test",
    "prepare": "husky install",  // Git clone 後執行
    
    // 測試相關
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage"
  }
}
```

#### 並行和串行執行

```json
{
  "scripts": {
    // 串行執行（&&）
    "build": "npm run clean && npm run compile",
    
    // 並行執行（需要 npm-run-all）
    "dev": "npm-run-all --parallel dev:*",
    "dev:server": "nodemon server.js",
    "dev:client": "vite",
    
    // 或使用 concurrently
    "dev2": "concurrently \"npm:dev:server\" \"npm:dev:client\""
  }
}
```

#### 傳遞參數

```bash
# 使用 -- 傳遞參數給腳本
npm test -- --watch

# 使用環境變數
NODE_ENV=production npm start

# 跨平台環境變數（使用 cross-env）
npm install -D cross-env
```

```json
{
  "scripts": {
    "start:dev": "cross-env NODE_ENV=development node server.js",
    "start:prod": "cross-env NODE_ENV=production node server.js"
  }
}
```

### 6. 條目點（Entry Points）

#### main（CommonJS）

```json
{
  "main": "dist/index.js"
}
```

```javascript
// 使用者可以這樣導入
const myPackage = require('my-package')
```

#### module（ES Modules）

```json
{
  "module": "dist/index.esm.js"
}
```

```javascript
// 打包工具（Webpack、Rollup）會優先使用 ESM
import myPackage from 'my-package'
```

#### exports（現代方式）

```json
{
  "exports": {
    // 主入口
    ".": {
      "import": "./dist/index.esm.js",  // ESM
      "require": "./dist/index.cjs",    // CommonJS
      "types": "./dist/index.d.ts"      // TypeScript
    },
    
    // 子路徑
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json",
    
    // 條件導出
    "./feature": {
      "node": "./dist/feature-node.js",
      "default": "./dist/feature-browser.js"
    }
  }
}
```

**使用**：

```javascript
// 主入口
import pkg from 'my-package'

// 子路徑
import { util } from 'my-package/utils'

// ❌ 錯誤：未在 exports 定義
import internal from 'my-package/dist/internal'  // 無法導入
```

#### types（TypeScript）

```json
{
  "types": "dist/index.d.ts",
  "typesVersions": {
    ">=4.0": {
      "*": ["dist/ts4.0/*"]
    },
    "*": {
      "*": ["dist/ts3.8/*"]
    }
  }
}
```

#### bin（CLI 工具）

```json
{
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

```javascript
#!/usr/bin/env node
// bin/cli.js

console.log('Hello from CLI!')
```

```bash
# 安裝後可用
npm install -g my-package
my-cli  # 執行 CLI
```

### 7. 引擎和平台限制

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0",
    "yarn": ">=1.22.0"
  },
  "os": ["darwin", "linux"],      // 限制作業系統
  "cpu": ["x64", "arm64"],         // 限制 CPU 架構
  "engineStrict": true             // 嚴格檢查引擎版本
}
```

**檢查版本**：

```javascript
// scripts/check-node-version.js
const { engines } = require('./package.json')
const currentNode = process.version

if (!currentNode.match(engines.node)) {
  console.error(`需要 Node.js ${engines.node}，當前版本：${currentNode}`)
  process.exit(1)
}
```

### 8. Workspaces（Monorepo）

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**目錄結構**：

```
my-monorepo/
├── package.json
├── packages/
│   ├── shared/
│   │   └── package.json
│   └── utils/
│       └── package.json
└── apps/
    ├── web/
    │   └── package.json
    └── api/
        └── package.json
```

**依賴引用**：

```json
// apps/web/package.json
{
  "name": "@myapp/web",
  "dependencies": {
    "@myapp/shared": "*",  // 引用 monorepo 內的套件
    "@myapp/utils": "*"
  }
}
```

**優勢**：
- 共享依賴（減少安裝時間）
- 版本統一管理
- 本地套件開發更方便

### 9. 發布配置

```json
{
  "name": "@myorg/my-package",
  "version": "1.0.0",
  "private": false,  // 允許發布
  
  // 指定包含的文件
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  // 發布配置
  "publishConfig": {
    "access": "public",  // 公開發布（scoped 套件預設是私有）
    "registry": "https://registry.npmjs.org"
  },
  
  // .npmignore 也可用於排除文件
}
```

**發布流程**：

```bash
# 1. 登入 npm
npm login

# 2. 更新版本
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 3. 發布
npm publish

# 發布 beta 版本
npm publish --tag beta

# 發布到 GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

### 10. 最佳實踐

```json
{
  // ✅ 使用 scoped 名稱避免衝突
  "name": "@myorg/my-package",
  
  // ✅ 遵循語義化版本
  "version": "1.0.0",
  
  // ✅ 提供清晰的描述
  "description": "A clear description of what this package does",
  
  // ✅ 指定 Node.js 版本
  "engines": {
    "node": ">=18.0.0"
  },
  
  // ✅ 明確指定入口點
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  
  // ✅ 使用 ^ 允許小版本更新
  "dependencies": {
    "express": "^4.18.0"
  },
  
  // ✅ 只包含必要的文件
  "files": [
    "dist",
    "README.md"
  ],
  
  // ✅ 添加實用的 scripts
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

**安全性檢查**：

```bash
# 檢查已知漏洞
npm audit

# 自動修復
npm audit fix

# 檢查過期套件
npm outdated

# 更新套件
npm update
```

## 總結

**核心欄位**：
- `name`, `version`：必需
- `main`, `exports`：入口點
- `dependencies`：生產依賴
- `devDependencies`：開發依賴
- `scripts`：自動化腳本

**依賴類型**：
- `dependencies`：運行時需要
- `devDependencies`：開發時需要
- `peerDependencies`：由使用者提供
- `optionalDependencies`：可選

**版本管理**：
- 使用 `^` 允許小版本更新
- 提交 `package-lock.json`
- 定期執行 `npm audit` 和 `npm update`

**Scripts 最佳實踐**：
- 使用生命週期鉤子自動化
- 使用 `npm-run-all` 並行執行
- 使用 `cross-env` 處理環境變數

理解 package.json 是管理 Node.js 專案的基礎。
