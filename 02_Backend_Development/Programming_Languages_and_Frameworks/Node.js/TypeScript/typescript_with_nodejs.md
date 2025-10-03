# TypeScript 與 Node.js 整合

- **難度**: 5
- **重要程度**: 5
- **標籤**: `TypeScript`, `Node.js`, `ts-node`, `tsconfig`, `Type Safety`

## 問題詳述

請深入解釋如何在 Node.js 專案中整合 TypeScript，包括設定、編譯策略、開發工作流程以及生產環境部署。

## 核心理論與詳解

### 1. 為什麼在 Node.js 中使用 TypeScript

**優勢**：
- **類型安全**：編譯時捕獲錯誤
- **IDE 支援**：自動完成、重構、導航
- **可維護性**：大型專案易於維護
- **文檔化**：類型即文檔
- **現代語法**：支援最新 ECMAScript 特性

**代價**：
- 編譯步驟
- 學習曲線
- 第三方套件可能缺少類型定義

### 2. 專案初始化

```bash
# 創建專案
mkdir my-node-app
cd my-node-app
npm init -y

# 安裝 TypeScript
npm install --save-dev typescript @types/node

# 初始化 tsconfig.json
npx tsc --init
```

### 3. tsconfig.json 詳解

```json
{
  "compilerOptions": {
    /* 基本選項 */
    "target": "ES2022",                    // 編譯目標（ES2022 for Node 18+）
    "module": "CommonJS",                  // 模組系統（CommonJS for Node）
    "lib": ["ES2022"],                     // 標準庫
    "outDir": "./dist",                    // 輸出目錄
    "rootDir": "./src",                    // 源碼根目錄
    
    /* 模組解析 */
    "moduleResolution": "node",            // Node.js 模組解析
    "baseUrl": "./",                       // 路徑基準
    "paths": {                             // 路徑別名
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@utils/*": ["src/utils/*"]
    },
    "resolveJsonModule": true,             // 允許導入 JSON
    "esModuleInterop": true,               // CommonJS/ESM 互操作
    "allowSyntheticDefaultImports": true,  // 允許默認導入
    
    /* 嚴格檢查 */
    "strict": true,                        // 啟用所有嚴格檢查
    "noImplicitAny": true,                 // 禁止隱式 any
    "strictNullChecks": true,              // 嚴格 null 檢查
    "strictFunctionTypes": true,           // 嚴格函數類型
    "strictBindCallApply": true,           // 嚴格 bind/call/apply
    "strictPropertyInitialization": true,  // 嚴格屬性初始化
    "noImplicitThis": true,                // 禁止隱式 this
    "alwaysStrict": true,                  // 總是使用嚴格模式
    
    /* 額外檢查 */
    "noUnusedLocals": true,                // 檢查未使用的局部變量
    "noUnusedParameters": true,            // 檢查未使用的參數
    "noImplicitReturns": true,             // 檢查隱式返回
    "noFallthroughCasesInSwitch": true,    // 檢查 switch 穿透
    "noUncheckedIndexedAccess": true,      // 檢查索引訪問
    
    /* 輸出 */
    "declaration": true,                   // 生成 .d.ts 文件
    "declarationMap": true,                // 生成 .d.ts.map
    "sourceMap": true,                     // 生成 source map
    "removeComments": true,                // 移除註釋
    
    /* 其他 */
    "skipLibCheck": true,                  // 跳過庫文件檢查（加速編譯）
    "forceConsistentCasingInFileNames": true,  // 強制文件名大小寫一致
    "incremental": true,                   // 增量編譯
    "tsBuildInfoFile": "./dist/.tsbuildinfo"   // 增量編譯信息
  },
  "include": ["src/**/*"],                 // 包含的文件
  "exclude": [                             // 排除的文件
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

**關鍵配置解釋**：

#### target & module

```json
// Node.js 18+ (支援 ES2022)
{
  "target": "ES2022",
  "module": "CommonJS"  // Node 預設使用 CommonJS
}

// 使用 ESM（需要 package.json 設定 "type": "module"）
{
  "target": "ES2022",
  "module": "ES2022"
}
```

#### moduleResolution

```json
{
  "moduleResolution": "node"  // Node.js 風格解析
}
```

解析順序：
1. `node_modules/@types/package`
2. `node_modules/package/package.json` 的 `types` 欄位
3. `node_modules/package/index.d.ts`

#### paths（路徑別名）

```json
{
  "baseUrl": "./",
  "paths": {
    "@/*": ["src/*"],
    "@config/*": ["src/config/*"]
  }
}
```

```typescript
// 使用別名
import { config } from '@/config'           // 而非 '../../../config'
import { logger } from '@utils/logger'
```

**注意**：paths 只在編譯時有效，運行時需要額外處理（使用 `tsconfig-paths` 或打包工具）。

### 4. 開發工作流程

#### 方案 1：ts-node（開發環境）

```bash
npm install --save-dev ts-node

# 直接執行 TypeScript
npx ts-node src/index.ts

# 使用 REPL
npx ts-node
```

```json
// package.json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "dev:watch": "nodemon --exec ts-node src/index.ts"
  }
}
```

**ts-node 配置**：

```json
// tsconfig.json
{
  "ts-node": {
    "transpileOnly": true,        // 跳過類型檢查（加速）
    "files": true,                 // 使用 tsconfig 的 files
    "require": ["tsconfig-paths/register"]  // 支援路徑別名
  }
}
```

#### 方案 2：tsx（更快的替代方案）

```bash
npm install --save-dev tsx

# 執行
npx tsx src/index.ts

# watch 模式
npx tsx watch src/index.ts
```

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts"
  }
}
```

**tsx 優勢**：
- 基於 esbuild，速度極快
- 支援 ESM 和 CommonJS
- 開箱即用，無需配置

#### 方案 3：nodemon + ts-node

```bash
npm install --save-dev nodemon

# nodemon.json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}
```

```json
{
  "scripts": {
    "dev": "nodemon"
  }
}
```

### 5. 編譯策略

#### 方案 1：tsc（官方編譯器）

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch"
  }
}
```

**專案結構**：

```
project/
├── src/
│   ├── index.ts
│   └── utils.ts
├── dist/            ← tsc 輸出
│   ├── index.js
│   ├── index.d.ts
│   └── utils.js
├── tsconfig.json
└── package.json
```

**優勢**：
- 官方工具，最準確
- 生成類型聲明文件（.d.ts）

**劣勢**：
- 速度較慢（大型專案）

#### 方案 2：esbuild（極速編譯）

```bash
npm install --save-dev esbuild
```

```javascript
// build.js
const esbuild = require('esbuild')

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  sourcemap: true,
  minify: true,
  external: ['pg', 'sequelize']  // 排除 node_modules
}).catch(() => process.exit(1))
```

```json
{
  "scripts": {
    "build": "node build.js && tsc --emitDeclarationOnly"
  }
}
```

**esbuild 優勢**：
- 速度極快（比 tsc 快 10-100 倍）
- 支援打包（bundle）
- 支援 minify

**esbuild 限制**：
- 不生成 .d.ts（需要額外執行 tsc）
- 不做類型檢查（需要額外執行 tsc --noEmit）

#### 方案 3：swc（Rust 編譯器）

```bash
npm install --save-dev @swc/core @swc/cli
```

```json
// .swcrc
{
  "jsc": {
    "target": "es2022",
    "parser": {
      "syntax": "typescript",
      "decorators": true
    }
  },
  "module": {
    "type": "commonjs"
  }
}
```

```json
{
  "scripts": {
    "build": "swc src -d dist && tsc --emitDeclarationOnly"
  }
}
```

**swc 優勢**：
- 速度快（Rust 編寫）
- 支援裝飾器
- Next.js/Vite 內建

### 6. 類型定義（@types）

```bash
# 安裝 Node.js 類型定義
npm install --save-dev @types/node

# 常見第三方庫類型
npm install --save-dev @types/express
npm install --save-dev @types/jest
npm install --save-dev @types/lodash
```

**查找類型定義**：

1. **內建類型**：部分套件自帶類型（如 `axios`）
2. **@types**：DefinitelyTyped 提供（如 `@types/express`）
3. **自己編寫**：創建 `.d.ts` 文件

```typescript
// src/types/express.d.ts
import 'express'

declare module 'express' {
  interface Request {
    user?: {
      id: string
      email: string
    }
  }
}
```

### 7. 路徑別名解析

**問題**：tsconfig 的 `paths` 只在編譯時有效。

```typescript
// src/index.ts
import { config } from '@/config'  // 編譯成功

// dist/index.js
const config_1 = require("@/config");  // ❌ 運行時錯誤
```

**解決方案**：

#### 方案 1：tsconfig-paths

```bash
npm install --save-dev tsconfig-paths
```

```json
{
  "scripts": {
    "dev": "node -r tsconfig-paths/register -r ts-node/register src/index.ts",
    "start": "node -r tsconfig-paths/register dist/index.js"
  }
}
```

#### 方案 2：tsc-alias

```bash
npm install --save-dev tsc-alias
```

```json
{
  "scripts": {
    "build": "tsc && tsc-alias"
  }
}
```

tsc-alias 會將編譯後的路徑別名替換為相對路徑。

#### 方案 3：module-alias

```bash
npm install module-alias
```

```typescript
// src/index.ts（入口文件開頭）
import 'module-alias/register'
```

```json
// package.json
{
  "_moduleAliases": {
    "@": "dist",
    "@config": "dist/config"
  }
}
```

#### 方案 4：使用打包工具（推薦）

使用 esbuild/webpack 等打包工具，自動解析路徑別名。

### 8. Source Maps

**啟用 Source Maps**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

**生產環境使用**：

```bash
# 安裝 source-map-support
npm install source-map-support

# 在入口文件引入
```

```typescript
// src/index.ts
import 'source-map-support/register'

// 錯誤堆疊將顯示 TypeScript 源碼位置
```

**調試**：

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/index.ts"],
      "sourceMaps": true,
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### 9. 生產環境部署

#### 步驟 1：編譯

```json
{
  "scripts": {
    "build": "tsc",
    "prebuild": "rm -rf dist",
    "postbuild": "npm run copy-assets"
  }
}
```

#### 步驟 2：部署編譯後的代碼

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 生產鏡像
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
```

#### 步驟 3：不包含 TypeScript 依賴

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0"
    // 不包含 typescript, @types/*, ts-node
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "ts-node": "^10.9.0"
  }
}
```

生產環境執行：

```bash
npm ci --production  # 不安裝 devDependencies
node dist/index.js
```

### 10. 完整專案範例

```
my-node-app/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── routes/
│   │   └── user.routes.ts
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── types/
│   │   └── express.d.ts
│   └── index.ts
├── dist/               ← 編譯輸出（不提交到 Git）
├── tests/
│   └── user.test.ts
├── .env
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

```json
// package.json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "tsx": "^4.7.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

```typescript
// src/index.ts
import express from 'express'
import dotenv from 'dotenv'
import { userRoutes } from '@/routes/user.routes'
import { errorHandler } from '@/middlewares/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api/users', userRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## 總結

**開發環境工具選擇**：

| 工具 | 速度 | 類型檢查 | 適用場景 |
|------|------|----------|----------|
| **ts-node** | 慢 | ✅ | 完整類型檢查 |
| **tsx** | 極快 | ❌ | 開發環境（推薦）|
| **ts-node-dev** | 中 | ✅ | 自動重啟 |

**編譯工具選擇**：

| 工具 | 速度 | .d.ts | 適用場景 |
|------|------|-------|----------|
| **tsc** | 慢 | ✅ | 庫開發 |
| **esbuild** | 極快 | ❌ | 應用部署 |
| **swc** | 快 | ❌ | 現代框架 |

**最佳實踐**：
- ✅ 開發環境使用 **tsx**（速度快）
- ✅ 生產環境使用 **tsc**（準確性）
- ✅ 啟用嚴格模式（`strict: true`）
- ✅ 使用路徑別名（`@/*`）並配合 tsc-alias
- ✅ 生成 Source Maps（方便調試）
- ✅ 只在生產環境部署編譯後的 JS（不包含 TS）
- ✅ 使用 `skipLibCheck: true`（加速編譯）
- ✅ 增量編譯（`incremental: true`）

**推薦配置**：
```bash
# 開發
npm run dev        # tsx watch src/index.ts

# 編譯
npm run build      # tsc

# 生產
npm start          # node dist/index.js
```

掌握 TypeScript 與 Node.js 的整合是現代後端開發的必備技能。
