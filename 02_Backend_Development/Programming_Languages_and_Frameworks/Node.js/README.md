# Node.js 面試題目索引

本目錄包含 Node.js 相關的面試題目，涵蓋核心概念、框架、運行時和工具鏈。

## Core（核心概念）

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Event Loop 與 libuv](./Core/event_loop_and_libuv.md) | 8 | 5 | `Event Loop`, `libuv`, `異步` |
| [阻塞與非阻塞 I/O](./Core/blocking_vs_non_blocking_io.md) | 6 | 5 | `I/O`, `異步`, `性能` |
| [Stream 和 Buffer](./Core/stream_and_buffer.md) | 7 | 4 | `Stream`, `Buffer`, `I/O` |
| [EventEmitter 與觀察者模式](./Core/event_emitter_and_observer_pattern.md) | 6 | 4 | `EventEmitter`, `設計模式` |
| [模組系統](./Core/module_systems.md) | 6 | 4 | `CommonJS`, `ES Modules` |
| [Cluster 與多程序](./Core/cluster_and_worker_threads.md) | 7 | 4 | `Cluster`, `Worker Threads`, `多核` |
| [記憶體管理與垃圾回收](./Core/memory_management_and_gc.md) | 7 | 4 | `GC`, `記憶體洩漏` |
| [錯誤處理與異常](./Core/error_handling_async_patterns.md) | 6 | 5 | `Error Handling`, `Promise`, `async/await` |
| [Process 與 Child Process](./Core/process_and_child_process.md) | 6 | 3 | `Process`, `Child Process` |
| [File System 操作](./Core/file_system_operations.md) | 5 | 3 | `fs`, `File I/O` |

## Frameworks（框架）

### Express

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Express 與 Node.js](./Frameworks/Express/express_and_nodejs.md) | 4 | 4 | `Express`, `HTTP` |
| [Middleware 深入解析](./Frameworks/Express/middleware_in_depth.md) | 6 | 5 | `Middleware`, `設計模式` |
| [路由深入解析](./Frameworks/Express/routing_in_depth.md) | 5 | 4 | `Routing`, `HTTP` |
| [錯誤處理](./Frameworks/Express/error_handling.md) | 6 | 5 | `Error Handling` |

### NestJS

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [NestJS 架構與核心概念](./Frameworks/NestJS/nestjs_architecture.md) | 7 | 4 | `NestJS`, `DI`, `IoC` |
| [依賴注入與模組系統](./Frameworks/NestJS/dependency_injection_modules.md) | 7 | 4 | `DI`, `Modules` |
| [Providers 與服務](./Frameworks/NestJS/providers_and_services.md) | 6 | 4 | `Providers`, `Services` |
| [Middleware、Guards、Interceptors、Pipes](./Frameworks/NestJS/middleware_guards_interceptors_pipes.md) | 8 | 4 | `Request Lifecycle` |
| [異常處理與過濾器](./Frameworks/NestJS/exception_handling.md) | 6 | 4 | `Exception Filters` |

### Nuxt.js

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Nuxt.js 架構與渲染模式](./Frameworks/Nuxt/nuxt_architecture_rendering.md) | 6 | 5 | `Nuxt 3`, `SSR`, `SSG` |
| [目錄結構與約定](./Frameworks/Nuxt/directory_structure_conventions.md) | 4 | 5 | `Directory Structure`, `Auto Import` |
| [資料獲取與狀態管理](./Frameworks/Nuxt/data_fetching_state_management.md) | 6 | 5 | `useFetch`, `Pinia` |
| [SEO 與 Meta 管理](./Frameworks/Nuxt/seo_meta_management.md) | 5 | 5 | `SEO`, `Open Graph` |
| [部署與性能優化](./Frameworks/Nuxt/deployment_performance.md) | 7 | 5 | `Deployment`, `Performance` |

## Runtimes（運行時）

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Node.js 版本與 LTS 策略](./Runtimes/nodejs_versions_and_lts.md) | 4 | 3 | `版本管理`, `LTS` |
| [V8 引擎與性能優化](./Runtimes/v8_engine_optimization.md) | 8 | 4 | `V8`, `性能優化` |

## Tooling（工具鏈）

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [package.json 深入解析](./Tooling/package_json_deep_dive.md) | 5 | 4 | `package.json`, `依賴管理` |
| [node_modules 與模組解析](./Tooling/node_modules_and_resolution.md) | 6 | 3 | `node_modules`, `Module Resolution` |
| [測試工具與策略](./Tooling/testing_tools_strategies.md) | 6 | 4 | `測試`, `Jest`, `Vitest` |

## TypeScript

| 題目 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [TypeScript 與 Node.js 整合](./TypeScript/typescript_with_nodejs.md) | 5 | 5 | `TypeScript`, `tsconfig` |
| [進階型別系統](./TypeScript/advanced_type_system.md) | 8 | 4 | `泛型`, `型別推導` |
| [Decorator 與元編程](./TypeScript/decorators_metaprogramming.md) | 7 | 3 | `Decorator`, `Metadata` |

## 學習路徑建議

### 初級（1-3 個月）
1. 理解 Event Loop 和異步模型
2. 掌握基本的 Stream 和 Buffer 操作
3. 熟悉 Express 框架和 Middleware
4. 了解 CommonJS 和 ES Modules
5. 學習基本的錯誤處理

### 中級（3-6 個月）
1. 深入理解 Event Loop 的各個階段
2. 掌握 Cluster 和 Worker Threads
3. 理解記憶體管理和垃圾回收
4. 熟練使用 NestJS 框架
5. 掌握進階錯誤處理和異常捕獲

### 高級（6-12 個月）
1. V8 引擎優化和性能調優
2. 複雜的 Stream 處理和背壓機制
3. 深入理解依賴注入和 IoC
4. 掌握微服務架構設計
5. 理解安全性最佳實踐

## 推薦資源

### 官方文檔
- [Node.js 官方文檔](https://nodejs.org/docs/)
- [Express 官方文檔](https://expressjs.com/)
- [NestJS 官方文檔](https://docs.nestjs.com/)

### 書籍
- "Node.js Design Patterns" by Mario Casciaro
- "You Don't Know JS" by Kyle Simpson
- "Understanding ECMAScript 6" by Nicholas C. Zakas

### 在線資源
- Node.js Best Practices (GitHub)
- Node.js Weekly Newsletter
- The Node.js Collection (Medium)
