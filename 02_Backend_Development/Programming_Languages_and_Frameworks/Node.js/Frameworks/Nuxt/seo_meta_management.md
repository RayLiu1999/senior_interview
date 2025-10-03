# SEO 與 Meta 管理

- **難度**: 5
- **重要程度**: 5
- **標籤**: `SEO`, `Meta Tags`, `Open Graph`, `Structured Data`, `Sitemap`

## 問題詳述

請深入解釋 Nuxt.js 中的 SEO 優化技術，包括 Meta 標籤管理、Open Graph、Twitter Cards、結構化資料、Sitemap 生成以及性能優化。

## 核心理論與詳解

### 1. useHead - 動態 Meta 管理

**特點**：
- **響應式**：Meta 資訊可以響應資料變化
- **SSR 友好**：伺服器端正確渲染
- **優先級控制**：支援多層級覆蓋

**基本用法**：

```vue
<script setup lang="ts">
useHead({
  title: '我的網站',
  meta: [
    {
      name: 'description',
      content: '這是一個使用 Nuxt 3 建構的網站'
    },
    {
      name: 'keywords',
      content: 'nuxt, vue, ssr, seo'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://example.com'
    }
  ]
})
</script>
```

**響應式 Meta**：

```vue
<script setup lang="ts">
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

// 響應式更新
useHead({
  title: computed(() => product.value?.name),
  meta: [
    {
      name: 'description',
      content: computed(() => product.value?.description)
    },
    {
      property: 'og:title',
      content: computed(() => product.value?.name)
    },
    {
      property: 'og:description',
      content: computed(() => product.value?.description)
    },
    {
      property: 'og:image',
      content: computed(() => product.value?.imageUrl)
    }
  ]
})
</script>

<template>
  <div>
    <h1>{{ product?.name }}</h1>
  </div>
</template>
```

**完整的 Head 配置**：

```typescript
useHead({
  // 基本資訊
  title: '頁面標題',
  titleTemplate: '%s | 我的網站', // %s 會被 title 替換
  
  // Meta 標籤
  meta: [
    // 基本 SEO
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '頁面描述' },
    { name: 'keywords', content: 'keyword1, keyword2' },
    { name: 'author', content: '作者名稱' },
    
    // Open Graph (Facebook)
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://example.com' },
    { property: 'og:title', content: '頁面標題' },
    { property: 'og:description', content: '頁面描述' },
    { property: 'og:image', content: 'https://example.com/og-image.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@username' },
    { name: 'twitter:creator', content: '@username' },
    { name: 'twitter:title', content: '頁面標題' },
    { name: 'twitter:description', content: '頁面描述' },
    { name: 'twitter:image', content: 'https://example.com/twitter-image.jpg' },
    
    // 其他
    { name: 'robots', content: 'index, follow' },
    { name: 'googlebot', content: 'index, follow' },
  ],
  
  // Link 標籤
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'canonical', href: 'https://example.com/page' },
    { rel: 'alternate', hreflang: 'zh-TW', href: 'https://example.com/zh-tw' },
    { rel: 'alternate', hreflang: 'en', href: 'https://example.com/en' },
  ],
  
  // Script 標籤
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '我的網站',
        url: 'https://example.com'
      })
    }
  ],
  
  // HTML 屬性
  htmlAttrs: {
    lang: 'zh-TW'
  },
  
  // Body 屬性
  bodyAttrs: {
    class: 'my-app'
  }
})
```

### 2. useSeoMeta - 簡化的 SEO Meta

**特點**：
- **類型安全**：TypeScript 支援
- **自動前綴**：自動處理 og: 和 twitter:
- **更簡潔**：專注於 SEO 相關的 Meta

```vue
<script setup lang="ts">
const { data: article } = await useFetch('/api/articles/123')

useSeoMeta({
  // 基本資訊
  title: article.value.title,
  description: article.value.summary,
  
  // Open Graph
  ogTitle: article.value.title,
  ogDescription: article.value.summary,
  ogImage: article.value.coverImage,
  ogUrl: 'https://example.com/articles/123',
  ogType: 'article',
  
  // Twitter
  twitterCard: 'summary_large_image',
  twitterTitle: article.value.title,
  twitterDescription: article.value.summary,
  twitterImage: article.value.coverImage,
  
  // 文章特定
  articlePublishedTime: article.value.publishedAt,
  articleModifiedTime: article.value.updatedAt,
  articleAuthor: article.value.author.name,
  articleTag: article.value.tags,
})
</script>
```

**響應式 SEO Meta**：

```vue
<script setup lang="ts">
const route = useRoute()
const productId = computed(() => route.params.id)

const { data: product } = await useFetch(() => `/api/products/${productId.value}`)

useSeoMeta({
  title: () => product.value?.name || 'Loading...',
  description: () => product.value?.description,
  ogImage: () => product.value?.imageUrl,
  ogPrice: () => product.value?.price.toString(),
  ogPriceCurrency: 'TWD',
})
</script>
```

### 3. definePageMeta - 頁面層級配置

**特點**：
- **靜態配置**：編譯時處理
- **路由整合**：與路由系統深度整合

```vue
<script setup lang="ts">
definePageMeta({
  title: '產品列表',
  meta: [
    {
      name: 'description',
      content: '瀏覽我們的產品'
    }
  ]
})
</script>
```

### 4. Open Graph 完整實作

**電商產品頁**：

```vue
<script setup lang="ts">
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

useSeoMeta({
  // 基本資訊
  title: product.value.name,
  description: product.value.description,
  
  // Open Graph 產品
  ogType: 'product',
  ogTitle: product.value.name,
  ogDescription: product.value.description,
  ogImage: product.value.images[0],
  ogUrl: `https://example.com/products/${product.value.id}`,
  
  // 產品特定資訊
  ogPriceAmount: product.value.price.toString(),
  ogPriceCurrency: 'TWD',
  ogAvailability: product.value.inStock ? 'in stock' : 'out of stock',
})

// 結構化資料
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.value.name,
        description: product.value.description,
        image: product.value.images,
        offers: {
          '@type': 'Offer',
          price: product.value.price,
          priceCurrency: 'TWD',
          availability: product.value.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: `https://example.com/products/${product.value.id}`
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.value.rating,
          reviewCount: product.value.reviewCount
        }
      })
    }
  ]
})
</script>
```

**部落格文章頁**：

```vue
<script setup lang="ts">
const route = useRoute()
const { data: article } = await useFetch(`/api/articles/${route.params.slug}`)

useSeoMeta({
  title: article.value.title,
  description: article.value.excerpt,
  
  // Open Graph 文章
  ogType: 'article',
  ogTitle: article.value.title,
  ogDescription: article.value.excerpt,
  ogImage: article.value.coverImage,
  ogUrl: `https://example.com/blog/${article.value.slug}`,
  
  // 文章資訊
  articlePublishedTime: article.value.publishedAt,
  articleModifiedTime: article.value.updatedAt,
  articleAuthor: article.value.author.name,
  articleSection: article.value.category,
  articleTag: article.value.tags,
  
  // Twitter
  twitterCard: 'summary_large_image',
  twitterTitle: article.value.title,
  twitterDescription: article.value.excerpt,
  twitterImage: article.value.coverImage,
})

// 結構化資料
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value.title,
        description: article.value.excerpt,
        image: article.value.coverImage,
        datePublished: article.value.publishedAt,
        dateModified: article.value.updatedAt,
        author: {
          '@type': 'Person',
          name: article.value.author.name,
          url: `https://example.com/authors/${article.value.author.id}`
        },
        publisher: {
          '@type': 'Organization',
          name: '我的網站',
          logo: {
            '@type': 'ImageObject',
            url: 'https://example.com/logo.png'
          }
        }
      })
    }
  ]
})
</script>
```

### 5. 結構化資料（Schema.org）

**網站資訊**：

```typescript
// app.vue 或 layouts/default.vue
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '我的網站',
        url: 'https://example.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://example.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})
```

**麵包屑導航**：

```vue
<script setup lang="ts">
const route = useRoute()

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  return paths.map((path, index) => {
    const position = index + 1
    const url = `https://example.com/${paths.slice(0, position).join('/')}`
    const name = path.charAt(0).toUpperCase() + path.slice(1)
    return { position, name, url }
  })
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.value.map(crumb => ({
          '@type': 'ListItem',
          position: crumb.position,
          name: crumb.name,
          item: crumb.url
        }))
      })
    }
  ]
})
</script>

<template>
  <nav>
    <ol>
      <li v-for="crumb in breadcrumbs" :key="crumb.url">
        <NuxtLink :to="crumb.url">{{ crumb.name }}</NuxtLink>
      </li>
    </ol>
  </nav>
</template>
```

**組織資訊**：

```typescript
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '我的公司',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+886-2-1234-5678',
          contactType: 'customer service',
          areaServed: 'TW',
          availableLanguage: ['zh-TW', 'en']
        },
        sameAs: [
          'https://www.facebook.com/example',
          'https://twitter.com/example',
          'https://www.instagram.com/example'
        ]
      })
    }
  ]
})
```

### 6. Sitemap 生成

**安裝 Sitemap 模組**：

```bash
npm install @nuxtjs/sitemap
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  
  site: {
    url: 'https://example.com'
  },
  
  sitemap: {
    // 靜態路由
    urls: [
      '/',
      '/about',
      '/contact',
      '/blog',
    ],
    
    // 排除路由
    exclude: [
      '/admin/**',
      '/dashboard/**',
    ],
    
    // 動態路由
    sources: [
      '/api/__sitemap__/urls'
    ]
  }
})
```

**動態 Sitemap**：

```typescript
// server/api/__sitemap__/urls.ts
export default defineEventHandler(async () => {
  // 從資料庫獲取所有頁面
  const [products, articles] = await Promise.all([
    prisma.product.findMany({ where: { published: true } }),
    prisma.article.findMany({ where: { published: true } })
  ])
  
  return [
    // 產品頁
    ...products.map(p => ({
      loc: `/products/${p.id}`,
      lastmod: p.updatedAt,
      changefreq: 'weekly',
      priority: 0.8
    })),
    
    // 文章頁
    ...articles.map(a => ({
      loc: `/blog/${a.slug}`,
      lastmod: a.updatedAt,
      changefreq: 'monthly',
      priority: 0.7
    }))
  ]
})
```

### 7. Robots.txt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  sitemap: {
    sitemaps: true
  },
  
  robots: {
    UserAgent: '*',
    Allow: '/',
    Disallow: ['/admin', '/api', '/dashboard'],
    Sitemap: 'https://example.com/sitemap.xml'
  }
})
```

**或手動創建**：

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://example.com/sitemap.xml
```

### 8. 多語言 SEO

```vue
<script setup lang="ts">
const { locale, locales } = useI18n()
const route = useRoute()

useHead({
  htmlAttrs: {
    lang: locale.value
  },
  link: locales.value.map(l => ({
    rel: 'alternate',
    hreflang: l.code,
    href: `https://example.com/${l.code}${route.path}`
  }))
})

useSeoMeta({
  ogLocale: locale.value,
  ogLocaleAlternate: locales.value
    .filter(l => l.code !== locale.value)
    .map(l => l.code)
})
</script>
```

### 9. 性能優化 SEO

**圖片優化**：

```vue
<template>
  <!-- 使用 Nuxt Image -->
  <NuxtImg
    src="/image.jpg"
    width="800"
    height="600"
    format="webp"
    loading="lazy"
    alt="描述文字"
  />
</template>
```

**預加載關鍵資源**：

```typescript
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/hero-image.jpg'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    }
  ]
})
```

**Core Web Vitals**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 啟用 Payload Extraction
  experimental: {
    payloadExtraction: true
  },
  
  // 代碼分割
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router'],
          }
        }
      }
    }
  }
})
```

### 10. SEO Composable

**可重用的 SEO 邏輯**：

```typescript
// composables/useSeo.ts
export const useSeo = (options: {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
}) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  
  const url = `${config.public.siteUrl}${route.path}`
  const image = options.image || `${config.public.siteUrl}/og-default.jpg`
  
  useSeoMeta({
    title: options.title,
    description: options.description,
    
    ogTitle: options.title,
    ogDescription: options.description,
    ogImage: image,
    ogUrl: url,
    ogType: options.type || 'website',
    
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
    
    ...(options.publishedTime && {
      articlePublishedTime: options.publishedTime
    }),
    ...(options.modifiedTime && {
      articleModifiedTime: options.modifiedTime
    })
  })
  
  useHead({
    link: [
      {
        rel: 'canonical',
        href: url
      }
    ]
  })
}

// 使用
const { data: product } = await useFetch('/api/products/123')

useSeo({
  title: product.value.name,
  description: product.value.description,
  image: product.value.imageUrl,
  type: 'product'
})
```

## 總結

**SEO 最佳實踐**：

**必做事項**：
- ✅ 每個頁面都要有唯一的 title 和 description
- ✅ 使用語義化的 HTML 標籤
- ✅ 添加 Open Graph 和 Twitter Card
- ✅ 實作結構化資料
- ✅ 生成 Sitemap 和 Robots.txt
- ✅ 使用 canonical URL
- ✅ 優化圖片（alt、尺寸、格式）
- ✅ 確保快速載入速度

**避免事項**：
- ❌ 重複的 title 和 description
- ❌ 缺少 alt 屬性
- ❌ 過度的關鍵字堆砌
- ❌ 隱藏文字或連結
- ❌ 緩慢的頁面載入
- ❌ 沒有行動裝置優化
- ❌ 破損的連結

**檢查工具**：
- Google Search Console
- Lighthouse
- PageSpeed Insights
- Schema Markup Validator
- Facebook Sharing Debugger
- Twitter Card Validator

理解 SEO 最佳實踐是提升網站可見性和流量的關鍵。
