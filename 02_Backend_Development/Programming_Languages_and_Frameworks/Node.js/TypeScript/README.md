# TypeScript 與 Node.js

TypeScript 已成為 Node.js 開發的事實標準，本節涵蓋 TypeScript 在後端開發中的應用。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [TypeScript 基礎與型別系統](./typescript_basics.md) | 6 | 5 | `TypeScript`, `Type System` |
| [泛型與高級類型](./generics_and_advanced_types.md) | 8 | 5 | `Generics`, `Advanced` |
| [裝飾器（Decorators）](./decorators_explained.md) | 7 | 4 | `Decorators`, `Metaprogramming` |
| [tsconfig.json 配置](./tsconfig_configuration.md) | 5 | 5 | `Configuration`, `Compiler` |
| [與 Node.js 整合](./typescript_nodejs_integration.md) | 6 | 5 | `Integration`, `Setup` |
| [類型定義檔案](./type_definitions.md) | 6 | 4 | `@types`, `DefinitelyTyped` |
| [TypeScript 最佳實踐](./typescript_best_practices.md) | 7 | 5 | `Best Practices`, `Patterns` |

## 核心概念

### 型別系統
- **基本類型**：string、number、boolean、null、undefined
- **複合類型**：Array、Tuple、Enum、Object
- **特殊類型**：any、unknown、never、void
- **類型別名**：type 關鍵字
- **接口**：interface 關鍵字

### 高級類型
- **聯合類型**：A | B
- **交集類型**：A & B
- **條件類型**：T extends U ? X : Y
- **映射類型**：Partial、Required、Readonly、Pick、Omit
- **模板字面量類型**：類型級別的字串操作

### 泛型
- **泛型函數**：函數參數化類型
- **泛型類別**：類別參數化類型
- **泛型約束**：extends 關鍵字
- **默認泛型**：設置默認類型參數

### 裝飾器
- **類別裝飾器**：修改類別定義
- **方法裝飾器**：修改方法行為
- **屬性裝飾器**：修改屬性定義
- **參數裝飾器**：修改參數元數據

## TypeScript 配置

### tsconfig.json 關鍵選項
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 嚴格模式選項
- **strict**：啟用所有嚴格檢查
- **strictNullChecks**：null 和 undefined 檢查
- **strictFunctionTypes**：函數參數雙向協變檢查
- **strictBindCallApply**：bind、call、apply 檢查
- **noImplicitAny**：禁止隱式 any
- **noImplicitThis**：禁止隱式 this

## 與 Node.js 整合

### 開發環境
```bash
npm install -D typescript @types/node
npm install -D ts-node nodemon
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 運行方式
- **ts-node**：直接運行 TypeScript
- **tsx**：更快的 TypeScript 運行器
- **編譯**：tsc 編譯後運行

### 專案結構
```
project/
├── src/
│   ├── index.ts
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── types/
├── dist/          # 編譯輸出
├── tests/
├── tsconfig.json
└── package.json
```

## 最佳實踐

### 型別設計
- 優先使用 interface 而不是 type（除非需要聯合類型）
- 使用 readonly 保護不可變數據
- 避免使用 any，使用 unknown 代替
- 使用泛型提高代碼重用性
- 為第三方庫創建類型定義

### 程式碼組織
- 將類型定義放在專門的 types/ 目錄
- 使用 index.ts 導出公共 API
- 分離接口和實現
- 使用命名空間組織大型類型定義

### 性能優化
- 啟用 skipLibCheck 跳過庫檢查
- 使用項目引用（Project References）
- 使用增量編譯（incremental）
- 合理配置 include 和 exclude

### 與框架整合
- **Express**：使用 @types/express
- **NestJS**：內建 TypeScript 支持
- **Fastify**：原生 TypeScript 支持
- **TypeORM**：TypeScript ORM

## 常見問題

### 類型定義
- 使用 DefinitelyTyped（@types）
- 自定義 .d.ts 聲明文件
- 使用 declare module 擴展模組

### 構建優化
- 使用 esbuild 或 swc 加快編譯
- 配置 watch 模式進行開發
- 使用 path mapping 簡化導入

### 除錯
- 啟用 sourceMap 支持
- 使用 VS Code 內建除錯器
- 配置 launch.json
