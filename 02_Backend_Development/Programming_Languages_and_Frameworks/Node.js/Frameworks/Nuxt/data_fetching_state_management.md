# 資料獲取與狀態管理

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Data Fetching`, `useFetch`, `useAsyncData`, `State Management`, `Pinia`

## 問題詳述

請深入解釋 Nuxt.js 中的資料獲取方式（useFetch、useAsyncData、$fetch）、SSR 資料水合、狀態管理（useState、Pinia）以及快取策略。

## 核心理論與詳解

### Nuxt 3 資料獲取概覽

```
┌─────────────────────────────────────────────────────┐
│          Nuxt 3 Data Fetching Architecture         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Server Side (SSR)                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  1. 執行 useFetch/useAsyncData               │  │
│  │  2. 發送 HTTP 請求                            │  │
│  │  3. 獲取資料                                  │  │
│  │  4. 渲染 HTML                                 │  │
│  │  5. 序列化資料到 payload                      │  │
│  └──────────────────────────────────────────────┘  │
│                     ↓                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  HTML + <script> window.__NUXT__ = {...}     │  │
│  └──────────────────────────────────────────────┘  │
│                     ↓                               │
│  Client Side (Hydration)                            │
│  ┌──────────────────────────────────────────────┐  │
│  │  1. 讀取 window.__NUXT__                      │  │
│  │  2. 恢復狀態（不再發送請求）                   │  │
│  │  3. Vue 應用接管                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1. useFetch - 便捷的資料獲取

**特點**：
- **自動 SSR 處理**：伺服器端獲取，客戶端水合
- **自動類型推斷**：TypeScript 支援
- **內建快取**：避免重複請求
- **響應式**：URL 變化自動重新請求

**基本用法**：

```typescript
// 基本使用
const { data, pending, error, refresh } = await useFetch('/api/products')

// 帶參數
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)

// Query 參數
const { data: products } = await useFetch('/api/products', {
  query: { 
    category: 'electronics',
    limit: 10,
    page: 1
  }
})

// POST 請求
const { data, error } = await useFetch('/api/products', {
  method: 'POST',
  body: {
    name: 'New Product',
    price: 1000
  }
})
```

**響應式參數**：

```vue
<script setup lang="ts">
const page = ref(1)
const category = ref('all')

// 當 page 或 category 變化時，自動重新請求
const { data: products, pending } = await useFetch('/api/products', {
  query: {
    page,
    category
  },
  // 監聽這些值的變化
  watch: [page, category]
})

const nextPage = () => {
  page.value++ // 自動觸發新請求
}
</script>

<template>
  <div>
    <select v-model="category">
      <option value="all">全部</option>
      <option value="electronics">電子產品</option>
      <option value="books">書籍</option>
    </select>
    
    <div v-if="pending">載入中...</div>
    
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>
    
    <button @click="nextPage">下一頁</button>
  </div>
</template>
```

**進階選項**：

```typescript
const { data, pending, error, refresh, clear } = await useFetch('/api/products', {
  // HTTP 選項
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token.value}`
  },
  
  // 查詢參數
  query: { page: 1 },
  
  // 請求體
  body: { name: 'Product' },
  
  // Nuxt 特定選項
  key: 'products', // 快取鍵
  lazy: false, // 是否懶加載
  server: true, // 是否在伺服器端執行
  immediate: true, // 是否立即執行
  
  // 監聽響應式值
  watch: [page, category],
  
  // 轉換響應
  transform: (data) => {
    return data.items.map(item => ({
      ...item,
      priceFormatted: formatPrice(item.price)
    }))
  },
  
  // 選取特定資料
  pick: ['id', 'name', 'price'],
  
  // 預設值
  default: () => [],
  
  // 快取控制
  getCachedData(key) {
    // 自定義快取邏輯
    return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
  },
  
  // 生命週期
  onRequest({ request, options }) {
    console.log('發送請求:', request)
  },
  
  onResponse({ request, response, options }) {
    console.log('收到響應:', response._data)
  },
  
  onRequestError({ request, options, error }) {
    console.error('請求錯誤:', error)
  },
  
  onResponseError({ request, response, options }) {
    console.error('響應錯誤:', response.status)
  }
})
```

**返回值**：

```typescript
interface UseFetchReturn<T> {
  data: Ref<T | null>           // 響應資料
  pending: Ref<boolean>          // 載入狀態
  error: Ref<Error | null>       // 錯誤對象
  refresh: () => Promise<void>   // 手動刷新
  clear: () => void              // 清除資料和錯誤
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
}
```

### 2. useAsyncData - 靈活的資料獲取

**特點**：
- **自定義邏輯**：可執行任意異步操作
- **不限於 HTTP**：可用於資料庫、檔案讀取等
- **完全控制**：更多配置選項

**基本用法**：

```typescript
// 基本使用
const { data, pending, error } = await useAsyncData('products', () => {
  return $fetch('/api/products')
})

// 複雜邏輯
const { data: userData } = await useAsyncData('user-with-posts', async () => {
  const user = await $fetch('/api/user')
  const posts = await $fetch(`/api/posts?userId=${user.id}`)
  
  return {
    ...user,
    posts
  }
})

// 伺服器端專用邏輯
const { data: products } = await useAsyncData('products', async () => {
  if (process.server) {
    // 伺服器端直接查詢資料庫
    return await prisma.product.findMany()
  } else {
    // 客戶端發送 HTTP 請求
    return await $fetch('/api/products')
  }
})
```

**與 useFetch 的差異**：

```typescript
// useFetch（推薦用於簡單的 API 請求）
const { data } = await useFetch('/api/products')

// 等同於
const { data } = await useAsyncData('products', () => $fetch('/api/products'))

// useAsyncData 適合複雜邏輯
const { data } = await useAsyncData('dashboard-data', async () => {
  const [user, stats, notifications] = await Promise.all([
    $fetch('/api/user'),
    $fetch('/api/stats'),
    $fetch('/api/notifications')
  ])
  
  return { user, stats, notifications }
})
```

**響應式刷新**：

```vue
<script setup lang="ts">
const route = useRoute()
const userId = computed(() => route.params.id)

const { data: user, refresh } = await useAsyncData(
  'user',
  () => $fetch(`/api/users/${userId.value}`),
  {
    // 當 userId 變化時自動刷新
    watch: [userId]
  }
)

// 手動刷新
const updateUser = async () => {
  await $fetch(`/api/users/${userId.value}`, {
    method: 'PUT',
    body: { name: 'New Name' }
  })
  
  // 刷新資料
  await refresh()
}
</script>
```

### 3. $fetch - 通用的 HTTP 客戶端

**特點**：
- **基於 ofetch**：現代化的 fetch 封裝
- **自動處理**：JSON 解析、錯誤處理
- **無狀態**：需手動管理載入和錯誤狀態

**使用場景**：

```typescript
// 1. 事件處理函數中（不需要 SSR）
const handleSubmit = async () => {
  try {
    const result = await $fetch('/api/products', {
      method: 'POST',
      body: { name: 'Product', price: 100 }
    })
    console.log('創建成功:', result)
  } catch (error) {
    console.error('創建失敗:', error)
  }
}

// 2. 組合式函數中
export const useProducts = () => {
  const products = ref([])
  const loading = ref(false)
  
  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await $fetch('/api/products')
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  return { products, loading, fetchProducts }
}

// 3. 攔截器
const apiFetch = $fetch.create({
  baseURL: '/api',
  
  onRequest({ request, options }) {
    // 添加認證 token
    const token = useCookie('auth-token')
    if (token.value) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token.value}`
      }
    }
  },
  
  onResponse({ response }) {
    // 處理響應
    if (response._data?.message) {
      console.log('API 消息:', response._data.message)
    }
  },
  
  onResponseError({ response }) {
    // 統一錯誤處理
    if (response.status === 401) {
      navigateTo('/login')
    }
  }
})
```

### 4. useState - 跨組件狀態

**特點**：
- **SSR 友好**：自動序列化和水合
- **全域共享**：不同組件共享同一狀態
- **響應式**：基於 Vue 的 ref

**基本用法**：

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  // 使用唯一鍵創建全域狀態
  const user = useState<User | null>('user', () => null)
  const token = useState<string | null>('token', () => null)
  
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
  
  return {
    user: readonly(user),
    token: readonly(token),
    login,
    logout
  }
}
```

**在多個組件中使用**：

```vue
<!-- components/Header.vue -->
<script setup lang="ts">
const { user, logout } = useAuth()
</script>

<template>
  <header>
    <div v-if="user">
      {{ user.name }}
      <button @click="logout">登出</button>
    </div>
  </header>
</template>

<!-- pages/dashboard.vue -->
<script setup lang="ts">
const { user } = useAuth()
</script>

<template>
  <div>
    <h1>歡迎, {{ user?.name }}</h1>
  </div>
</template>
```

**SSR 狀態水合**：

```typescript
// server/api/auth/session.get.ts
export default defineEventHandler((event) => {
  const user = getUserFromSession(event)
  return user
})

// app.vue 或 middleware
const { data: user } = await useFetch('/api/auth/session')

if (user.value) {
  // 設置全域狀態
  const globalUser = useState('user')
  globalUser.value = user.value
}
```

### 5. Pinia - 進階狀態管理

**安裝**：

```bash
npm install pinia @pinia/nuxt
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt']
})
```

**定義 Store**：

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  
  // Getters
  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
  })
  
  const itemCount = computed(() => {
    return items.value.reduce((count, item) => {
      return count + item.quantity
    }, 0)
  })
  
  // Actions
  const addItem = (product: Product) => {
    const existingItem = items.value.find(i => i.id === product.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        ...product,
        quantity: 1
      })
    }
  }
  
  const removeItem = (productId: string) => {
    items.value = items.value.filter(i => i.id !== productId)
  }
  
  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(i => i.id === productId)
    if (item) {
      item.quantity = quantity
    }
  }
  
  const clear = () => {
    items.value = []
  }
  
  const checkout = async () => {
    loading.value = true
    try {
      const order = await $fetch('/api/orders', {
        method: 'POST',
        body: { items: items.value }
      })
      
      clear()
      return order
    } finally {
      loading.value = false
    }
  }
  
  return {
    items: readonly(items),
    loading: readonly(loading),
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    checkout
  }
})

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = useCookie('auth-token')
  
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      user.value = await $fetch('/api/auth/me')
    } catch (error) {
      token.value = null
    }
  }
  
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
  
  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    fetchUser,
    login,
    logout
  }
})
```

**使用 Store**：

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const userStore = useUserStore()

// 響應式解構
const { items, total, itemCount } = storeToRefs(cartStore)
const { user, isAuthenticated } = storeToRefs(userStore)

// Actions 可直接解構（不需要 storeToRefs）
const { addItem, removeItem, checkout } = cartStore

const handleCheckout = async () => {
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }
  
  try {
    const order = await checkout()
    navigateTo(`/orders/${order.id}`)
  } catch (error) {
    console.error('結帳失敗:', error)
  }
}
</script>

<template>
  <div>
    <div class="cart-summary">
      <p>商品數量: {{ itemCount }}</p>
      <p>總金額: ${{ total }}</p>
    </div>
    
    <div v-for="item in items" :key="item.id">
      {{ item.name }} x {{ item.quantity }}
      <button @click="removeItem(item.id)">移除</button>
    </div>
    
    <button @click="handleCheckout">結帳</button>
  </div>
</template>
```

### 6. 快取策略

#### useFetch 內建快取

```typescript
// 預設快取行為
const { data } = await useFetch('/api/products')

// 自定義快取鍵
const { data } = await useFetch('/api/products', {
  key: 'all-products' // 使用固定鍵進行快取
})

// 禁用快取
const { data } = await useFetch('/api/products', {
  key: `products-${Date.now()}` // 每次都使用新鍵
})

// 自定義快取邏輯
const { data } = await useFetch('/api/products', {
  getCachedData(key) {
    const cached = nuxtApp.payload.data[key]
    
    // 檢查快取是否過期（5 分鐘）
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }
    
    return null
  }
})
```

#### SWR（Stale-While-Revalidate）

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/products': {
      swr: 60 * 10 // 10 分鐘
    }
  }
})
```

#### 手動快取

```typescript
// composables/useCache.ts
export const useCache = () => {
  const cache = useState('api-cache', () => ({}))
  
  const get = (key: string) => {
    const item = cache.value[key]
    if (!item) return null
    
    // 檢查是否過期
    if (Date.now() > item.expiry) {
      delete cache.value[key]
      return null
    }
    
    return item.data
  }
  
  const set = (key: string, data: any, ttl = 60000) => {
    cache.value[key] = {
      data,
      expiry: Date.now() + ttl
    }
  }
  
  return { get, set }
}

// 使用
const { get, set } = useCache()

const fetchProducts = async () => {
  const cached = get('products')
  if (cached) return cached
  
  const products = await $fetch('/api/products')
  set('products', products, 5 * 60 * 1000) // 5 分鐘
  
  return products
}
```

### 7. 實戰模式

#### 列表 + 詳情頁

```vue
<!-- pages/products/index.vue -->
<script setup lang="ts">
const page = ref(1)
const { data: products, pending } = await useFetch('/api/products', {
  query: { page },
  watch: [page]
})
</script>

<template>
  <div>
    <div v-if="pending">載入中...</div>
    <div v-for="product in products" :key="product.id">
      <NuxtLink :to="`/products/${product.id}`">
        {{ product.name }}
      </NuxtLink>
    </div>
  </div>
</template>

<!-- pages/products/[id].vue -->
<script setup lang="ts">
const route = useRoute()

const { data: product, error } = await useFetch(`/api/products/${route.params.id}`)

if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Product not found'
  })
}

useSeoMeta({
  title: product.value.name,
  description: product.value.description
})
</script>

<template>
  <div>
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
    <p>${{ product.price }}</p>
  </div>
</template>
```

#### 無限滾動

```vue
<script setup lang="ts">
const page = ref(1)
const allProducts = ref([])

const { data: products, pending } = await useFetch('/api/products', {
  query: { page },
  watch: false // 不自動重新請求
})

// 初始資料
allProducts.value = products.value

const loadMore = async () => {
  page.value++
  
  const newProducts = await $fetch('/api/products', {
    query: { page: page.value }
  })
  
  allProducts.value.push(...newProducts)
}

// 監聽滾動
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  if (pending.value) return
  
  const scrollTop = window.scrollY
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = window.innerHeight
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore()
  }
}
</script>

<template>
  <div>
    <div v-for="product in allProducts" :key="product.id">
      {{ product.name }}
    </div>
    <div v-if="pending">載入更多...</div>
  </div>
</template>
```

#### 樂觀更新

```vue
<script setup lang="ts">
const { data: todos } = await useFetch('/api/todos')

const toggleTodo = async (id: string) => {
  // 樂觀更新 UI
  const todo = todos.value.find(t => t.id === id)
  const previousState = todo.completed
  todo.completed = !todo.completed
  
  try {
    // 發送請求
    await $fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      body: { completed: todo.completed }
    })
  } catch (error) {
    // 失敗時回滾
    todo.completed = previousState
    console.error('更新失敗:', error)
  }
}

const deleteTodo = async (id: string) => {
  // 樂觀刪除
  const previousTodos = [...todos.value]
  todos.value = todos.value.filter(t => t.id !== id)
  
  try {
    await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
  } catch (error) {
    // 失敗時恢復
    todos.value = previousTodos
    console.error('刪除失敗:', error)
  }
}
</script>
```

## 總結

**資料獲取方式對比**：

| 方式 | SSR 支援 | 自動狀態 | 適用場景 |
|------|---------|---------|----------|
| **useFetch** | ✅ | ✅ | 簡單的 API 請求 |
| **useAsyncData** | ✅ | ✅ | 複雜的異步邏輯 |
| **$fetch** | ❌ | ❌ | 事件處理、客戶端請求 |
| **useState** | ✅ | ✅ | 跨組件狀態 |
| **Pinia** | ✅ | ✅ | 複雜狀態管理 |

**最佳實踐**：
- 頁面資料獲取優先使用 `useFetch`
- 需要複雜邏輯時使用 `useAsyncData`
- 事件處理中使用 `$fetch`
- 簡單全域狀態使用 `useState`
- 複雜狀態邏輯使用 `Pinia`
- 合理設置快取策略
- 注意 SSR 和客戶端的差異

理解資料獲取和狀態管理是構建高性能 Nuxt 應用的關鍵。
