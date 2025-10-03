# Nuxt.js 面試題

Nuxt.js 是一個基於 Vue.js 的直觀的 Web 框架，提供服務端渲染（SSR）、靜態站點生成（SSG）和單頁應用（SPA）等多種渲染模式。

## 題目列表

### 1. Nuxt.js 架構與渲染模式
**難度**: 6 | **重要程度**: 5

深入理解 Nuxt.js 的架構設計、SSR/SSG/SPA 等渲染模式的區別以及選擇標準。

📄 [詳細內容](./nuxt_architecture_rendering.md)

---

### 2. 目錄結構與約定
**難度**: 4 | **重要程度**: 5

掌握 Nuxt.js 的約定式目錄結構、自動路由、自動導入等核心概念。

📄 [詳細內容](./directory_structure_conventions.md)

---

### 3. 數據獲取與狀態管理
**難度**: 7 | **重要程度**: 5

理解 useFetch、useAsyncData、useState 等 Composables，以及 Pinia 狀態管理。

📄 [詳細內容](./data_fetching_state_management.md)

---

### 4. SEO 優化與 Meta 管理
**難度**: 5 | **重要程度**: 4

掌握 Nuxt.js 的 SEO 最佳實踐、useHead、useSeoMeta 等 API。

📄 [詳細內容](./seo_meta_management.md)

---

### 5. 部署與性能優化
**難度**: 6 | **重要程度**: 4

學習 Nuxt.js 的部署策略、性能優化技巧和最佳實踐。

📄 [詳細內容](./deployment_performance.md)

---

## 學習路徑

### 初級（1-2 個月）
1. Nuxt.js 架構與渲染模式
2. 目錄結構與約定
3. 基本數據獲取

### 中級（2-4 個月）
4. 狀態管理與 Pinia
5. SEO 優化與 Meta 管理
6. 中介軟體與插件

### 進階（持續學習）
- Server API 與全端開發
- 性能優化與打包優化
- Nuxt Modules 開發
- 微前端架構

## 版本差異

### Nuxt 2 vs Nuxt 3

| 特性 | Nuxt 2 | Nuxt 3 |
|------|--------|--------|
| **核心** | Vue 2 + Options API | Vue 3 + Composition API |
| **引擎** | Webpack | Vite + Webpack 5 |
| **TypeScript** | 需額外配置 | 原生支援 |
| **性能** | 較慢 | 快 4-5 倍 |
| **包大小** | 較大 | 減少 ~75% |
| **Server Engine** | Connect | Nitro |

**遷移建議**: 新專案建議使用 Nuxt 3，舊專案可以逐步遷移。

## 相關資源

### 官方文檔
- [Nuxt 3 官方網站](https://nuxt.com/)
- [Nuxt 3 文檔](https://nuxt.com/docs)
- [Nuxt GitHub](https://github.com/nuxt/nuxt)

### 推薦閱讀
- Vue 3 Composition API
- Nitro Server Engine
- UnJS Ecosystem

### 線上資源
- [Nuxt Examples](https://nuxt.com/docs/examples)
- [Nuxt Modules](https://nuxt.com/modules)
- [Nuxt Discord 社群](https://discord.com/invite/ps2h6QT)

---

**注意**: 本章節主要涵蓋 Nuxt 3，因為它是目前的穩定版本且代表未來方向。
