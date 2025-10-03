# 目錄結構與約定

- **難度**: 4
- **重要程度**: 5
- **標籤**: `Directory Structure`, `Auto Import`, `File-based Routing`, `Conventions`

## 問題詳述

請深入解釋 Nuxt.js 的約定式目錄結構、基於文件的路由系統、自動導入機制以及各目錄的作用。

## 核心理論與詳解

### Nuxt 3 目錄結構

```
my-nuxt-app/
├── .nuxt/               # 自動生成的構建文件（不要修改）
├── .output/             # 生產構建輸出
├── assets/              # 需要處理的資源（CSS、圖片等）
├── components/          # Vue 組件（自動導入）
├── composables/         # Composition API（自動導入）
├── content/             # Nuxt Content 模組的內容
├── layouts/             # 應用佈局
├── middleware/          # 路由中介軟體
├── pages/               # 應用頁面（文件路由）
├── plugins/             # Vue 插件
├── public/              # 靜態資源（不處理）
├── server/              # Server API 和中介軟體
│   ├── api/            # API 端點
│   ├── routes/         # Server 路由
│   └── middleware/     # Server 中介軟體
├── utils/               # 工具函數（自動導入）
├── app.vue              # 主組件（可選）
├── error.vue            # 錯誤頁面（可選）
├── nuxt.config.ts       # Nuxt 配置文件
├── package.json         # 依賴和腳本
└── tsconfig.json        # TypeScript 配置
```

### 1. pages/ - 文件路由

**原理**：
基於文件結構自動生成路由，無需手動配置 vue-router。

#### 基本路由

```
pages/
├── index.vue           → /
├── about.vue           → /about
├── contact.vue         → /contact
└── products/
    ├── index.vue       → /products
    ├── [id].vue        → /products/:id
    └── create.vue      → /products/create
```

**範例**：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>首頁</h1>
    <NuxtLink to="/about">關於我們</NuxtLink>
  </div>
</template>

<!-- pages/about.vue -->
<template>
  <div>
    <h1>關於我們</h1>
  </div>
</template>

<!-- pages/products/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const id = route.params.id

const { data: product } = await useFetch(`/api/products/${id}`)
</script>

<template>
  <div>
    <h1>產品: {{ product.name }}</h1>
    <p>ID: {{ id }}</p>
  </div>
</template>
```

#### 動態路由

```
pages/
├── users/
│   ├── [id].vue              → /users/:id
│   └── [id]/
│       ├── posts/
│       │   └── [postId].vue  → /users/:id/posts/:postId
│       └── settings.vue      → /users/:id/settings
```

**使用參數**：

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
const route = useRoute()

// 方式 1：直接使用
console.log(route.params.id)

// 方式 2：響應式
const id = computed(() => route.params.id)

// 獲取數據
const { data: user } = await useFetch(`/api/users/${route.params.id}`)
</script>

<template>
  <div>
    <h1>用戶: {{ user.name }}</h1>
    <p>ID: {{ id }}</p>
  </div>
</template>
```

#### Catch-all 路由

```
pages/
└── [...slug].vue    → 匹配所有路徑
```

```vue
<!-- pages/[...slug].vue -->
<script setup lang="ts">
const route = useRoute()

// /a/b/c → ['a', 'b', 'c']
console.log(route.params.slug)
</script>

<template>
  <div>
    <h1>路徑: {{ route.params.slug.join('/') }}</h1>
  </div>
</template>
```

#### 嵌套路由

```
pages/
└── parent/
    ├── index.vue        → /parent
    ├── child1.vue       → /parent/child1
    └── child2.vue       → /parent/child2
```

**使用 NuxtPage**：

```vue
<!-- pages/parent.vue -->
<template>
  <div>
    <h1>父頁面</h1>
    <nav>
      <NuxtLink to="/parent">首頁</NuxtLink>
      <NuxtLink to="/parent/child1">子頁面 1</NuxtLink>
      <NuxtLink to="/parent/child2">子頁面 2</NuxtLink>
    </nav>
    <!-- 子路由渲染在這裡 -->
    <NuxtPage />
  </div>
</template>
```

#### 路由中介軟體

```vue
<!-- pages/admin/index.vue -->
<script setup lang="ts">
// 內聯中介軟體
definePageMeta({
  middleware: (to, from) => {
    const user = useState('user')
    if (!user.value?.isAdmin) {
      return navigateTo('/login')
    }
  }
})
</script>

<!-- 或使用命名中介軟體 -->
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

#### 自定義路由

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    'pages:extend'(pages) {
      // 添加自定義路由
      pages.push({
        name: 'custom',
        path: '/custom-path',
        file: '~/pages/custom.vue'
      })
      
      // 修改現有路由
      const aboutPage = pages.find(p => p.name === 'about')
      if (aboutPage) {
        aboutPage.path = '/about-us'
      }
    }
  }
})
```

### 2. components/ - 自動導入組件

**原理**：
`components/` 目錄中的組件會自動導入，無需手動 import。

```
components/
├── AppHeader.vue           → <AppHeader>
├── AppFooter.vue           → <AppFooter>
├── ui/
│   ├── Button.vue          → <UiButton>
│   └── Input.vue           → <UiInput>
└── base/
    └── Icon.vue            → <BaseIcon>
```

**使用**：

```vue
<template>
  <div>
    <!-- 自動導入，無需 import -->
    <AppHeader />
    <UiButton>點擊我</UiButton>
    <BaseIcon name="user" />
    <AppFooter />
  </div>
</template>

<!-- 不需要 script，直接使用 -->
```

**懶加載組件**：

```vue
<template>
  <div>
    <!-- 添加 Lazy 前綴進行懶加載 -->
    <LazyAppHeader v-if="showHeader" />
    <LazyHeavyChart v-if="showChart" />
  </div>
</template>
```

**客戶端專用組件**：

```vue
<!-- components/ClientOnly.vue -->
<template>
  <ClientOnly>
    <!-- 只在客戶端渲染 -->
    <BrowserOnlyComponent />
    <template #fallback>
      <!-- SSR 時顯示 -->
      <div>Loading...</div>
    </template>
  </ClientOnly>
</template>
```

**動態組件**：

```vue
<script setup lang="ts">
const componentName = ref('AppHeader')
</script>

<template>
  <component :is="componentName" />
</template>
```

**配置**：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    // 默認掃描 ~/components
    '~/components',
    
    // 自定義掃描目錄
    { path: '~/components/ui', prefix: 'Ui' },
    { path: '~/components/icons', prefix: 'Icon' },
    
    // 全局組件（不需要前綴）
    { path: '~/components/global', global: true },
  ]
})
```

### 3. composables/ - 自動導入組合式函數

**原理**：
`composables/` 目錄中的函數會自動導入。

```
composables/
├── useAuth.ts         → useAuth()
├── useCart.ts         → useCart()
└── api/
    └── useProducts.ts → useProducts()
```

**範例**：

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)
  const token = useCookie('auth-token')

  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    
    user.value = response.user
    token.value = response.token
  }

  const logout = () => {
    user.value = null
    token.value = null
    navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout
  }
}

// composables/useCart.ts
export const useCart = () => {
  const items = useState('cart', () => [])

  const addItem = (product: Product) => {
    const existingItem = items.value.find(i => i.id === product.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  const removeItem = (productId: string) => {
    items.value = items.value.filter(i => i.id !== productId)
  }

  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })

  return {
    items: readonly(items),
    total,
    addItem,
    removeItem
  }
}
```

**使用**：

```vue
<script setup lang="ts">
// 自動導入，無需 import
const { user, isAuthenticated, login, logout } = useAuth()
const { items, total, addItem } = useCart()

const handleLogin = async () => {
  await login('user@example.com', 'password')
}
</script>

<template>
  <div>
    <div v-if="isAuthenticated">
      <p>歡迎, {{ user.name }}</p>
      <button @click="logout">登出</button>
    </div>
    
    <div>
      <p>購物車總計: ${{ total }}</p>
      <div v-for="item in items" :key="item.id">
        {{ item.name }} x {{ item.quantity }}
      </div>
    </div>
  </div>
</template>
```

### 4. layouts/ - 佈局系統

**結構**：

```
layouts/
├── default.vue        # 默認佈局
├── custom.vue         # 自定義佈局
└── admin.vue          # 管理後台佈局
```

**範例**：

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <AppHeader />
    <main>
      <!-- 頁面內容渲染在這裡 -->
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <main>
      <slot />
    </main>
  </div>
</template>
```

**使用佈局**：

```vue
<!-- pages/index.vue（使用默認佈局）-->
<template>
  <div>首頁內容</div>
</template>

<!-- pages/admin/index.vue（使用自定義佈局）-->
<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>管理後台內容</div>
</template>

<!-- 禁用佈局 -->
<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>
```

**動態佈局**：

```vue
<script setup lang="ts">
const layout = computed(() => {
  return useAuth().isAuthenticated ? 'auth' : 'default'
})

setPageLayout(layout)
</script>
```

### 5. middleware/ - 路由中介軟體

**結構**：

```
middleware/
├── auth.ts            # 命名中介軟體
├── guest.ts           # 命名中介軟體
└── admin.global.ts    # 全域中介軟體（.global 後綴）
```

**範例**：

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})

// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})

// middleware/admin.global.ts（全域執行）
export default defineNuxtRouteMiddleware((to, from) => {
  // 對所有路由執行
  console.log('Navigating to:', to.path)
})
```

**使用**：

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>

<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
})
</script>

<!-- 多個中介軟體 -->
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verify-email']
})
</script>
```

### 6. server/ - Server API

**結構**：

```
server/
├── api/
│   ├── products/
│   │   ├── index.get.ts       # GET /api/products
│   │   ├── index.post.ts      # POST /api/products
│   │   └── [id].get.ts        # GET /api/products/:id
│   └── auth/
│       ├── login.post.ts      # POST /api/auth/login
│       └── logout.post.ts     # POST /api/auth/logout
├── routes/
│   └── sitemap.xml.ts         # GET /sitemap.xml
└── middleware/
    └── log.ts                 # Server 中介軟體
```

**API 端點範例**：

```typescript
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const products = await prisma.product.findMany({
    where: {
      category: query.category as string
    },
    take: parseInt(query.limit as string) || 10
  })
  
  return products
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
  
  const product = await prisma.product.create({
    data: body
  })
  
  return product
})

// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const product = await prisma.product.findUnique({
    where: { id }
  })
  
  if (!product) {
    throw createError({
      statusCode: 404,
      message: 'Product not found'
    })
  }
  
  return product
})
```

**Server 中介軟體**：

```typescript
// server/middleware/log.ts
export default defineEventHandler((event) => {
  console.log(`${event.node.req.method} ${event.node.req.url}`)
})

// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // 跳過公開路由
  if (event.path.startsWith('/api/public')) {
    return
  }
  
  const token = getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  try {
    const user = await verifyToken(token)
    event.context.user = user
  } catch {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    })
  }
})
```

### 7. plugins/ - 插件系統

**結構**：

```
plugins/
├── vue-query.ts              # 普通插件
├── gtag.client.ts            # 客戶端插件（.client 後綴）
└── api.server.ts             # 服務端插件（.server 後綴）
```

**範例**：

```typescript
// plugins/vue-query.ts
import { VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000
        }
      }
    }
  })
})

// plugins/gtag.client.ts（只在客戶端執行）
export default defineNuxtPlugin(() => {
  // Google Analytics
  if (process.client) {
    window.dataLayer = window.dataLayer || []
    function gtag() { dataLayer.push(arguments) }
    gtag('js', new Date())
    gtag('config', 'GA_MEASUREMENT_ID')
  }
})

// plugins/api.ts（提供全域 API）
export default defineNuxtPlugin(() => {
  const api = {
    products: {
      getAll: () => $fetch('/api/products'),
      getById: (id: string) => $fetch(`/api/products/${id}`)
    }
  }
  
  return {
    provide: {
      api
    }
  }
})
```

**使用插件**：

```vue
<script setup lang="ts">
// 使用 provide 的 API
const { $api } = useNuxtApp()

const products = await $api.products.getAll()
</script>
```

### 8. utils/ - 工具函數

**結構**：

```
utils/
├── format.ts          # 格式化函數
├── validation.ts      # 驗證函數
└── helpers.ts         # 輔助函數
```

**範例**：

```typescript
// utils/format.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(price)
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-TW').format(date)
}

// utils/validation.ts
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const re = /^09\d{8}$/
  return re.test(phone)
}
```

**使用**：

```vue
<script setup lang="ts">
// 自動導入
const price = formatPrice(1000)
const date = formatDate(new Date())

const email = ref('')
const isValid = computed(() => isValidEmail(email.value))
</script>
```

### 9. assets/ - 資源處理

**用途**：
需要經過構建處理的資源（CSS、SCSS、圖片等）。

```
assets/
├── css/
│   ├── main.css
│   └── tailwind.css
├── scss/
│   └── variables.scss
└── images/
    └── logo.png
```

**使用**：

```vue
<template>
  <img src="~/assets/images/logo.png" alt="Logo">
</template>

<style scoped>
@import '@/assets/scss/variables.scss';
</style>
```

### 10. public/ - 靜態資源

**用途**：
不需要處理的靜態資源，直接複製到輸出目錄。

```
public/
├── favicon.ico
├── robots.txt
└── images/
    └── banner.jpg
```

**使用**：

```vue
<template>
  <!-- 直接使用，從根路徑開始 -->
  <img src="/images/banner.jpg" alt="Banner">
  <link rel="icon" href="/favicon.ico">
</template>
```

## 總結

**核心約定**：
- **pages/**：文件路由
- **components/**：自動導入組件
- **composables/**：自動導入組合式函數
- **layouts/**：應用佈局
- **middleware/**：路由守衛
- **server/**：Server API
- **plugins/**：Vue 插件

**自動導入規則**：
- components/、composables/、utils/ 自動導入
- 支援嵌套目錄
- 支援 TypeScript

**命名約定**：
- `.client`：僅客戶端
- `.server`：僅服務端
- `.global`：全域中介軟體
- `[param]`：動態路由
- `[...slug]`：Catch-all 路由

**最佳實踐**：
- 使用約定目錄結構
- 充分利用自動導入
- 合理組織代碼
- 使用 TypeScript

理解目錄結構和約定是高效使用 Nuxt.js 的基礎。
