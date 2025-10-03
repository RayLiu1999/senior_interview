# Nuxt.js 架構與渲染模式

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Nuxt 3`, `SSR`, `SSG`, `Architecture`, `Rendering Modes`

## 問題詳述

請深入解釋 Nuxt.js 的架構設計、不同渲染模式（SSR、SSG、SPA、ISR）的原理、優缺點以及選擇標準。

## 核心理論與詳解

### Nuxt.js 是什麼？

**定義**：
Nuxt.js 是一個基於 Vue.js 的直觀的 Web 應用框架，提供伺服器端渲染（SSR）、靜態站點生成（SSG）等功能，簡化了 Vue 應用的開發。

**核心特性**：
- **多種渲染模式**：SSR、SSG、SPA、ISR
- **約定優於配置**：基於目錄結構的自動路由
- **自動導入**：組件、Composables 自動導入
- **TypeScript**：原生 TypeScript 支援
- **Nitro Engine**：高性能的伺服器引擎
- **Hybrid Rendering**：每個路由可選擇不同的渲染策略

### Nuxt 3 架構

```
┌─────────────────────────────────────────────────────────┐
│                   Nuxt 3 Application                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Client Side (Browser)                  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Vue 3 Application                       │  │   │
│  │  │  - Composition API                       │  │   │
│  │  │  - Reactivity System                     │  │   │
│  │  │  - Virtual DOM                           │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Nuxt Client                             │  │   │
│  │  │  - Router (vue-router)                   │  │   │
│  │  │  - State Management (useState)           │  │   │
│  │  │  - Data Fetching (useFetch)              │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Server Side (Nitro)                    │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Nitro Server Engine                     │  │   │
│  │  │  - H3 (HTTP Server)                      │  │   │
│  │  │  - Server Routes (/server/api/*)         │  │   │
│  │  │  - Server Middleware                     │  │   │
│  │  │  - SSR Renderer                          │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Build Tools                             │  │   │
│  │  │  - Vite (Development)                    │  │   │
│  │  │  - Rollup (Production)                   │  │   │
│  │  │  - esbuild (Transpilation)               │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Universal Layer                        │   │
│  │  - Auto Imports                                │   │
│  │  - Modules System                              │   │
│  │  - Plugins                                     │   │
│  │  - Layouts                                     │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 渲染模式對比

#### 1. SSR（Server-Side Rendering）

**原理**：
每次請求時在伺服器端渲染 HTML，然後發送到客戶端。

**流程**：
```
Client Request
      ↓
Nitro Server
      ↓
執行 Vue SSR
      ↓
生成 HTML
      ↓
返回 HTML + JS
      ↓
Client Hydration（水合）
      ↓
變成 SPA
```

**配置**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // 預設值
  
  // 或使用 routeRules 針對特定路由
  routeRules: {
    '/': { ssr: true },
    '/dashboard': { ssr: true },
  }
})
```

**實際範例**：

```vue
<!-- pages/products/[id].vue -->
<script setup lang="ts">
// 在伺服器端執行，獲取資料
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

// SEO Meta
useHead({
  title: product.value?.name,
  meta: [
    { name: 'description', content: product.value?.description }
  ]
})
</script>

<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <p>價格: {{ product.price }}</p>
  </div>
</template>
```

**優點**：
- ✅ **SEO 友好**：搜尋引擎可以爬取完整 HTML
- ✅ **首屏速度快**：用戶立即看到內容
- ✅ **社交分享**：可以正確顯示 OG 圖片和描述
- ✅ **動態內容**：適合經常變化的內容

**缺點**：
- ❌ **伺服器負載**：每次請求都要渲染
- ❌ **TTFB 較慢**：需要等待伺服器渲染
- ❌ **成本較高**：需要 Node.js 伺服器

**適用場景**：
- 電商網站（產品頁面）
- 新聞網站
- 部落格
- 需要 SEO 的動態內容

#### 2. SSG（Static Site Generation）

**原理**：
在**構建時**預渲染所有頁面為靜態 HTML 文件。

**流程**：
```
Build Time
      ↓
預渲染所有路由
      ↓
生成靜態 HTML 文件
      ↓
部署到 CDN
      ↓
Client Request
      ↓
直接返回靜態 HTML
      ↓
Client Hydration
```

**配置**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/blog/**': { prerender: true }, // 預渲染所有部落格頁面
  },
  
  // 或使用 nitro 配置
  nitro: {
    prerender: {
      routes: ['/', '/about', '/blog'],
      // 動態路由
      crawlLinks: true, // 自動爬取連結
    }
  }
})
```

**動態路由預渲染**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    async 'nitro:config'(nitroConfig) {
      // 從 API 獲取所有產品 ID
      const products = await fetch('https://api.example.com/products')
        .then(res => res.json())
      
      // 生成所有產品頁面路由
      nitroConfig.prerender.routes = [
        ...nitroConfig.prerender.routes || [],
        ...products.map(p => `/products/${p.id}`)
      ]
    }
  }
})
```

**優點**：
- ✅ **極快的速度**：純靜態文件，CDN 分發
- ✅ **SEO 優秀**：完整的 HTML
- ✅ **成本低**：可部署到靜態託管（Netlify、Vercel）
- ✅ **安全性高**：沒有伺服器端代碼
- ✅ **可離線**：可以配合 PWA

**缺點**：
- ❌ **構建時間長**：頁面多時構建很慢
- ❌ **內容更新慢**：需要重新構建
- ❌ **不適合動態內容**：無法顯示用戶特定內容

**適用場景**：
- 文檔網站
- 個人部落格
- 行銷網站
- 公司官網
- 不常更新的內容

#### 3. SPA（Single Page Application）

**原理**：
純客戶端渲染，伺服器只返回空白 HTML 和 JS bundle。

**配置**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // 禁用 SSR
  
  // 或針對特定路由
  routeRules: {
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },
  }
})
```

**優點**：
- ✅ **互動性強**：無頁面刷新
- ✅ **開發簡單**：無需考慮 SSR 問題
- ✅ **成本低**：可部署到靜態託管
- ✅ **無伺服器**：不需要 Node.js

**缺點**：
- ❌ **SEO 差**：搜尋引擎難以爬取
- ❌ **首屏慢**：需要下載並執行 JS
- ❌ **白屏問題**：JS 載入前什麼都看不到

**適用場景**：
- 後台管理系統
- 內部工具
- 需要登入的應用
- 不需要 SEO 的應用

#### 4. ISR（Incremental Static Regeneration）

**原理**：
結合 SSG 和 SSR，靜態頁面可以在背景更新。

**配置**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/blog/**': {
      swr: 60 * 60, // 1 小時內使用快取，之後背景重新生成
    },
    '/products/**': {
      swr: 60 * 10, // 10 分鐘
    }
  }
})
```

**工作流程**：
```
第一次請求
      ↓
伺服器渲染並快取（60 秒）
      ↓
60 秒內的請求
      ↓
直接返回快取的 HTML（極快）
      ↓
60 秒後的第一個請求
      ↓
返回舊快取（仍然快）
      ↓
背景重新生成新版本
      ↓
下次請求返回新版本
```

**優點**：
- ✅ **速度快**：大部分時間返回快取
- ✅ **內容新鮮**：定期更新
- ✅ **低成本**：減少伺服器負載

**適用場景**：
- 新聞網站（內容需要更新但不頻繁）
- 電商網站（價格庫存變動）
- 社交媒體頁面

### Hybrid Rendering（混合渲染）

**原理**：
不同路由使用不同的渲染策略。

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 首頁：SSG（快速載入）
    '/': { prerender: true },
    
    // 部落格列表：ISR（定期更新）
    '/blog': { swr: 60 * 60 },
    
    // 部落格文章：SSG
    '/blog/**': { prerender: true },
    
    // 產品頁：ISR（價格可能變動）
    '/products/**': { swr: 60 * 10 },
    
    // API 路由：SSR（動態）
    '/api/**': { cors: true },
    
    // 用戶儀表板：SPA（需要登入）
    '/dashboard/**': { ssr: false },
    
    // 管理後台：SPA
    '/admin/**': { ssr: false },
  }
})
```

### Nuxt 3 vs Nuxt 2

| 特性 | Nuxt 2 | Nuxt 3 |
|------|--------|--------|
| **核心框架** | Vue 2 | Vue 3 |
| **API** | Options API | Composition API |
| **建構工具** | Webpack | Vite + Rollup |
| **伺服器引擎** | Connect | Nitro |
| **TypeScript** | 需配置 | 原生支援 |
| **性能** | 基準 | 快 4-5 倍 |
| **Bundle 大小** | 基準 | 減少 ~75% |
| **自動導入** | 部分 | 完全自動 |
| **Server API** | serverMiddleware | server/ 目錄 |

### Nitro Server Engine

**特點**：
- **跨平台部署**：Node.js、Deno、Cloudflare Workers、Vercel Edge
- **自動優化**：Tree-shaking、Code-splitting
- **API Routes**：內建 API 開發
- **Storage Layer**：統一的存儲抽象

**Server API 範例**：

```typescript
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 從資料庫獲取產品
  const product = await getProduct(id)
  
  if (!product) {
    throw createError({
      statusCode: 404,
      message: 'Product not found'
    })
  }
  
  return product
})

// server/api/products/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 驗證
  if (!body.name || !body.price) {
    throw createError({
      statusCode: 400,
      message: 'Name and price are required'
    })
  }
  
  // 創建產品
  const product = await createProduct(body)
  
  return product
})
```

### 渲染模式選擇指南

```
需要 SEO？
├─ 是
│  ├─ 內容經常變化？
│  │  ├─ 是 → SSR
│  │  └─ 否 → SSG
│  └─ 內容偶爾更新？
│     └─ ISR
└─ 否
   ├─ 需要登入？
   │  └─ 是 → SPA
   └─ 公開內容？
      ├─ 互動性強 → SPA
      └─ 內容為主 → SSG
```

### 實際應用案例

#### 電商網站

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 首頁：SSG（快速載入，不常變）
    '/': { prerender: true },
    
    // 分類頁：ISR（商品可能增減）
    '/category/**': { swr: 60 * 30 },
    
    // 產品頁：ISR（價格庫存會變）
    '/products/**': { swr: 60 * 10 },
    
    // 購物車：SPA（用戶特定）
    '/cart': { ssr: false },
    
    // 結帳：SPA（敏感信息）
    '/checkout': { ssr: false },
    
    // 用戶中心：SPA
    '/account/**': { ssr: false },
    
    // 搜尋：SSR（SEO）
    '/search': { ssr: true },
    
    // API
    '/api/**': { cors: true },
  }
})
```

#### 部落格網站

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 所有靜態頁面預渲染
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    
    // 部落格文章：SSG
    '/blog/**': { prerender: true },
    
    // 標籤頁：ISR（文章增加時更新）
    '/tags/**': { swr: 60 * 60 },
  },
  
  nitro: {
    prerender: {
      crawlLinks: true, // 自動爬取所有連結
      routes: ['/sitemap.xml']
    }
  }
})
```

### 性能優化

#### 代碼分割

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'ui-library': ['@headlessui/vue'],
          }
        }
      }
    }
  }
})
```

#### 懶加載組件

```vue
<script setup>
// 懶加載組件
const LazyChart = defineAsyncComponent(() => 
  import('~/components/Chart.vue')
)
</script>

<template>
  <div>
    <!-- 只在需要時載入 -->
    <LazyChart v-if="showChart" />
  </div>
</template>
```

#### Payload Extraction

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true, // 將 data payload 分離
  }
})
```

## 總結

**渲染模式對比**：

| 模式 | 速度 | SEO | 成本 | 動態性 | 適用場景 |
|------|------|-----|------|--------|----------|
| **SSR** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 高 | ⭐⭐⭐⭐⭐ | 動態內容 + SEO |
| **SSG** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 低 | ⭐ | 靜態內容 |
| **SPA** | ⭐⭐ | ⭐ | 低 | ⭐⭐⭐⭐⭐ | 互動應用 |
| **ISR** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | ⭐⭐⭐ | 半動態內容 |

**最佳實踐**：
- 使用 Hybrid Rendering 針對不同頁面選擇最佳策略
- 公開內容優先考慮 SSR/SSG
- 用戶特定內容使用 SPA
- 使用 ISR 平衡性能和新鮮度

**Nuxt 3 優勢**：
- Nitro 引擎帶來極致性能
- 自動導入簡化開發
- TypeScript 原生支援
- 靈活的渲染策略

理解不同渲染模式是構建高性能 Nuxt 應用的關鍵。
