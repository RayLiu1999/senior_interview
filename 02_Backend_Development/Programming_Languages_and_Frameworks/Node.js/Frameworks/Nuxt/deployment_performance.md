# 部署與性能優化

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Deployment`, `Performance`, `Optimization`, `Production`, `Lighthouse`

## 問題詳述

請深入解釋 Nuxt.js 應用的部署策略（SSR、SSG、Serverless）、性能優化技術（代碼分割、懶加載、快取）以及生產環境最佳實踐。

## 核心理論與詳解

### 1. 部署模式概覽

```
┌─────────────────────────────────────────────────────┐
│            Nuxt 3 Deployment Options               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Static Hosting (SSG)                            │
│     - Netlify, Vercel, GitHub Pages, S3            │
│     - 純靜態文件，最快最便宜                         │
│     - 適合：部落格、文檔、行銷網站                   │
│                                                     │
│  2. Node.js Server (SSR)                            │
│     - AWS EC2, DigitalOcean, Heroku                │
│     - 需要 Node.js 環境                             │
│     - 適合：動態內容、需要 SSR 的應用                │
│                                                     │
│  3. Serverless (Edge)                               │
│     - Vercel Edge, Cloudflare Workers, Netlify Edge│
│     - 自動擴展，按需付費                            │
│     - 適合：全球化應用、高流量網站                   │
│                                                     │
│  4. Docker Container                                │
│     - Kubernetes, AWS ECS, Google Cloud Run        │
│     - 完全控制環境                                  │
│     - 適合：企業級應用、微服務架構                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. 構建指令

```bash
# 開發模式
npm run dev

# 構建生產版本
npm run build

# 預覽生產構建
npm run preview

# 生成靜態網站（SSG）
npm run generate

# 分析 Bundle 大小
npx nuxi analyze
```

### 3. 靜態託管（SSG）

**生成靜態網站**：

```bash
# 生成靜態文件到 .output/public
npm run generate
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // SSR 必須啟用才能進行預渲染
  ssr: true,
  
  nitro: {
    prerender: {
      // 自動爬取所有連結
      crawlLinks: true,
      
      // 明確指定要預渲染的路由
      routes: [
        '/',
        '/about',
        '/blog',
        '/contact'
      ],
      
      // 忽略特定路由
      ignore: [
        '/admin',
        '/dashboard'
      ]
    }
  }
})
```

#### Netlify 部署

```toml
# netlify.toml
[build]
  command = "npm run generate"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404

[build.environment]
  NODE_VERSION = "18"
```

**環境變數**：

```bash
# .env
NUXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

#### Vercel 部署

```json
// vercel.json
{
  "buildCommand": "npm run generate",
  "outputDirectory": ".output/public",
  "framework": "nuxtjs"
}
```

**一鍵部署**：

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

#### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate static files
        run: npm run generate
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./.output/public
```

### 4. Node.js 伺服器（SSR）

**構建**：

```bash
# 構建生產版本
npm run build

# 啟動伺服器
node .output/server/index.mjs
```

**使用 PM2**：

```bash
# 安裝 PM2
npm i -g pm2

# 啟動應用
pm2 start .output/server/index.mjs --name "nuxt-app"

# 查看狀態
pm2 status

# 查看日誌
pm2 logs nuxt-app

# 重啟
pm2 restart nuxt-app

# 停止
pm2 stop nuxt-app
```

**PM2 配置**：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'nuxt-app',
      script: './.output/server/index.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G'
    }
  ]
}
```

```bash
# 使用配置啟動
pm2 start ecosystem.config.js
```

#### 反向代理（Nginx）

```nginx
# /etc/nginx/sites-available/nuxt-app
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 靜態資源快取
    location /_nuxt/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Docker 部署

**Dockerfile**：

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製源代碼
COPY . .

# 構建應用
RUN npm run build

# 生產階段
FROM node:18-alpine

WORKDIR /app

# 只複製必要的文件
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package*.json /app/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

**docker-compose.yml**：

```yaml
version: '3.8'

services:
  nuxt-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on:
      - db
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**構建和運行**：

```bash
# 構建 Docker 映像
docker build -t nuxt-app .

# 運行容器
docker run -p 3000:3000 nuxt-app

# 使用 docker-compose
docker-compose up -d
```

### 6. Serverless 部署

#### Vercel（推薦）

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel' // 自動檢測
  }
})
```

**零配置部署**：

```bash
vercel
```

#### Cloudflare Workers

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages'
  }
})
```

```bash
# 構建
npm run build

# 部署到 Cloudflare Pages
npx wrangler pages publish .output/public
```

#### AWS Lambda

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'aws-lambda'
  }
})
```

### 7. 性能優化

#### 代碼分割

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          // 手動代碼分割
          manualChunks: {
            // Vue 相關
            'vue-vendor': ['vue', 'vue-router'],
            
            // UI 組件庫
            'ui-library': ['@headlessui/vue', '@heroicons/vue'],
            
            // 工具函數
            'utils': ['lodash-es', 'dayjs'],
            
            // 圖表庫
            'charts': ['chart.js', 'vue-chartjs'],
          }
        }
      },
      
      // Chunk 大小警告限制
      chunkSizeWarningLimit: 1000
    }
  }
})
```

#### 懶加載組件

```vue
<script setup lang="ts">
// 方式 1：使用 Lazy 前綴
</script>

<template>
  <div>
    <!-- 組件懶加載 -->
    <LazyHeavyChart v-if="showChart" />
    <LazyLargeTable v-if="showTable" />
    
    <!-- 使用 ClientOnly 包裝 -->
    <ClientOnly>
      <LazyBrowserOnlyComponent />
      <template #fallback>
        <div>Loading...</div>
      </template>
    </ClientOnly>
  </div>
</template>
```

```vue
<script setup lang="ts">
// 方式 2：defineAsyncComponent
const HeavyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <HeavyComponent />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

#### 圖片優化

**使用 Nuxt Image**：

```bash
npm install @nuxt/image
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  
  image: {
    // 圖片優化選項
    formats: ['webp', 'avif'],
    
    // CDN 配置
    domains: ['cdn.example.com'],
    
    // 圖片尺寸預設
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    }
  }
})
```

```vue
<template>
  <!-- 自動優化和響應式 -->
  <NuxtImg
    src="/image.jpg"
    width="800"
    height="600"
    format="webp"
    quality="80"
    loading="lazy"
    alt="Description"
  />
  
  <!-- 響應式圖片 -->
  <NuxtPicture
    src="/hero.jpg"
    :img-attrs="{
      alt: 'Hero Image',
      loading: 'eager'
    }"
    sizes="xs:100vw sm:100vw md:50vw lg:400px"
  />
</template>
```

#### 字體優化

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
```

**或使用本地字體**：

```css
/* assets/css/fonts.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

#### 預加載關鍵資源

```typescript
useHead({
  link: [
    // 預加載關鍵圖片
    {
      rel: 'preload',
      as: 'image',
      href: '/hero-image.jpg'
    },
    
    // 預連接到第三方域名
    {
      rel: 'preconnect',
      href: 'https://api.example.com'
    },
    
    // DNS 預解析
    {
      rel: 'dns-prefetch',
      href: 'https://analytics.google.com'
    }
  ]
})
```

#### Payload Extraction

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    // 將 data payload 提取到單獨的文件
    payloadExtraction: true,
    
    // 內聯 chunk 載入（減少請求）
    inlineSSRStyles: false,
  }
})
```

#### HTTP/2 Push

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
    
    routeRules: {
      '/**': {
        headers: {
          'Link': '</fonts/inter.woff2>; rel=preload; as=font; crossorigin',
        }
      }
    }
  }
})
```

### 8. 快取策略

#### 路由快取規則

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 首頁：SSG（構建時預渲染）
    '/': { prerender: true },
    
    // 部落格：ISR（增量靜態生成）
    '/blog/**': { swr: 60 * 60 }, // 1 小時
    
    // API：快取 10 分鐘
    '/api/products': { 
      swr: 60 * 10,
      cache: {
        maxAge: 60 * 10
      }
    },
    
    // 用戶特定頁面：不快取
    '/dashboard/**': { ssr: false },
    
    // 靜態資源：永久快取
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    
    // 重定向
    '/old-path': { redirect: '/new-path' },
  }
})
```

#### HTTP 快取標頭

```typescript
// server/middleware/cache.ts
export default defineEventHandler((event) => {
  const path = event.path
  
  if (path.startsWith('/_nuxt/')) {
    // 靜態資源永久快取
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  } else if (path.startsWith('/api/')) {
    // API 快取 5 分鐘
    setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300')
  } else {
    // 頁面快取 1 小時，但需驗證
    setHeader(event, 'Cache-Control', 'public, max-age=3600, must-revalidate')
  }
})
```

### 9. 監控與分析

#### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches:
      - main

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/about
          uploadArtifacts: true
          temporaryPublicStorage: true
```

#### 性能監控

```typescript
// plugins/performance.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
    
    // 性能觀察器
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('Performance:', entry)
          
          // 發送到分析服務
          if (entry.entryType === 'navigation') {
            // 上報導航時間
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation', 'resource'] })
    }
  }
})
```

#### 錯誤追蹤

```bash
npm install @sentry/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sentry/nuxt/module'],
  
  sentry: {
    dsn: process.env.SENTRY_DSN,
    
    // 生產環境才啟用
    enabled: process.env.NODE_ENV === 'production',
    
    // Source Maps
    sourceMapsUploadOptions: {
      org: 'my-org',
      project: 'my-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }
  }
})
```

### 10. 生產環境檢查清單

**部署前檢查**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ✅ 生產環境配置
  runtimeConfig: {
    // 私有環境變數（只在伺服器端可用）
    apiSecret: process.env.API_SECRET,
    
    // 公開環境變數（客戶端也可用）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  },
  
  // ✅ 啟用壓縮
  nitro: {
    compressPublicAssets: true
  },
  
  // ✅ 生產環境優化
  vite: {
    build: {
      // 移除 console
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  },
  
  // ✅ Source Map（只在需要時啟用）
  sourcemap: {
    server: false,
    client: false
  },
  
  // ✅ 安全標頭
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  }
})
```

**檢查清單**：

- [ ] **環境變數**：已配置所有必要的環境變數
- [ ] **API 端點**：已更新為生產環境 URL
- [ ] **分析代碼**：已添加 Google Analytics / GA4
- [ ] **錯誤追蹤**：已設置 Sentry 或其他錯誤追蹤
- [ ] **SEO**：所有頁面都有正確的 meta 標籤
- [ ] **Sitemap**：已生成並提交 sitemap.xml
- [ ] **Robots.txt**：已正確配置
- [ ] **SSL 證書**：已啟用 HTTPS
- [ ] **CDN**：靜態資源已部署到 CDN
- [ ] **快取**：已配置合適的快取策略
- [ ] **壓縮**：已啟用 Gzip / Brotli
- [ ] **圖片優化**：所有圖片已優化
- [ ] **Lighthouse**：分數達到 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] **跨瀏覽器測試**：已在主流瀏覽器測試
- [ ] **行動裝置測試**：已在不同螢幕尺寸測試
- [ ] **備份策略**：已設置資料庫和檔案備份
- [ ] **監控**：已設置性能和錯誤監控
- [ ] **日誌**：已配置日誌收集和分析

## 總結

**部署策略對比**：

| 策略 | 成本 | 擴展性 | 設置複雜度 | 適用場景 |
|------|------|--------|-----------|----------|
| **靜態託管** | 極低 | 高 | 簡單 | SSG 網站 |
| **Node.js 伺服器** | 中 | 中 | 中等 | SSR 應用 |
| **Serverless** | 彈性 | 極高 | 簡單 | 全球化應用 |
| **Docker** | 中-高 | 高 | 複雜 | 企業應用 |

**性能優化重點**：

1. **代碼分割**：減少初始 Bundle 大小
2. **懶加載**：非關鍵資源延遲載入
3. **圖片優化**：使用 WebP/AVIF，響應式圖片
4. **快取策略**：充分利用 HTTP 快取和 CDN
5. **預加載**：關鍵資源提前載入

**最佳實踐**：
- 根據應用需求選擇合適的部署策略
- 使用 Lighthouse 定期檢查性能
- 設置監控和錯誤追蹤
- 自動化部署流程（CI/CD）
- 定期檢查和優化 Bundle 大小

理解部署和性能優化是確保 Nuxt 應用成功上線的關鍵。
