# Vue Router 與導航守衛

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Vue`, `Vue Router`, `Routing`, `Navigation Guards`

## 問題詳述

解釋 Vue Router 的工作原理，包括路由模式（Hash vs. History）、動態路由、嵌套路由，並深入說明導航守衛（Navigation Guards）的種類、執行順序和它們在實現用戶認證、權限控制等功能中的應用。

## 核心理論與詳解

### 1. Vue Router 核心概念

Vue Router 是 Vue.js 的官方路由管理器。它與 Vue 的核心深度整合，讓使用者可以輕鬆地構建單頁應用 (SPA)。

- **單頁應用 (SPA)**: 應用程式只有一個 HTML 頁面，所有的內容都通過 JavaScript 動態加載和替換，頁面之間的切換不會重新加載整個頁面。
- **路由**: 建立 URL 和組件之間的映射關係。當使用者訪問某個 URL 時，Vue Router 會渲染對應的組件。

### 2. 路由模式 (History vs. Hash)

#### Hash 模式

- **URL 形式**: `https://example.com/#/user`
- **原理**: 利用 URL 中的 hash (`#`) 部分來實現路由切換。hash 的改變不會觸發瀏覽器向伺服器發送請求，但會觸發 `hashchange` 事件。Vue Router 監聽這個事件來更新視圖。
- **優點**:
  - 兼容性好，支持所有瀏覽器。
  - 無需後端伺服器額外配置。
- **缺點**:
  - URL 中帶有 `#`，不夠美觀。

#### History 模式

- **URL 形式**: `https://example.com/user`
- **原理**: 利用 HTML5 History API 中的 `pushState()` 和 `replaceState()` 方法來改變 URL 而不刷新頁面。
- **優點**:
  - URL 更美觀，和傳統網站一樣。
- **缺點**:
  - 需要後端伺服器配置支持。因為當使用者直接訪問 `https://example.com/user` 或刷新頁面時，瀏覽器會向伺服器發送請求。伺服器必須配置為對於所有未匹配到靜態資源的請求，都返回應用的 `index.html` 文件，否則會出現 404 錯誤。

### 3. 路由配置

```go
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import User from '../views/User.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // 動態路由
  {
    path: '/user/:id', // :id 是一個動態參數
    name: 'User',
    component: User,
    props: true // 將路由參數作為 props 傳遞給組件
  },
  // 嵌套路由
  {
    path: '/settings',
    component: Settings,
    children: [
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'account',
        component: UserAccount
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(), // 使用 History 模式
  routes
});

export default router;
```

- **動態路由**: 使用 `:param` 語法來匹配動態路徑，例如用戶 ID。
- **嵌套路由**: 使用 `children` 屬性來定義嵌套的視圖結構，父級路由的組件中需要包含 `<router-view>` 來渲染子路由。

### 4. 導航守衛 (Navigation Guards)

導航守衛提供了一種在路由導航過程中進行攔截和重定向的機制，是實現用戶認證和權限控制的核心。

#### 4.1 全域守衛 (Global Guards)

- **`router.beforeEach(to, from, next)`**:
  - **時機**: 在任何路由跳轉發生**之前**被調用。
  - **參數**:
    - `to`: 即將進入的目標路由物件。
    - `from`: 當前正要離開的路由物件。
    - `next`: 一個必須被調用的函式，用來解析這個鉤子。
      - `next()`: 繼續導航。
      - `next(false)`: 中斷當前的導航。
      - `next('/login')` 或 `next({ name: 'Login' })`: 重定向到一個不同的地址。
  - **場景**: 全局的用戶登入狀態檢查。

- **`router.afterEach(to, from)`**:
  - **時機**: 在所有導航**完成之後**被調用。
  - **參數**: `to`, `from`。沒有 `next` 函式，因為導航已經完成了。
  - **場景**: 頁面瀏覽分析、記錄日誌、設置頁面標題。

#### 4.2 路由獨享守衛 (Per-Route Guard)

- **`beforeEnter(to, from, next)`**:
  - **時機**: 在路由配置中直接定義，只在進入該路由時觸發。
  - **場景**: 對特定路由進行權限檢查，例如只有管理員才能訪問的頁面。

```go
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (isAdmin()) {
        next();
      } else {
        next({ name: 'Home' });
      }
    }
  }
];
```

#### 4.3 組件內守衛 (In-Component Guards)

- **`onBeforeRouteUpdate(to, from, next)`**:
  - **時機**: 當前路由改變，但該組件被複用時調用。例如，從 `/user/1` 導航到 `/user/2`。
  - **場景**: 在組件被複用時，根據新的路由參數重新獲取數據。

- **`onBeforeRouteLeave(to, from, next)`**:
  - **時機**: 導航離開該組件的對應路由時調用。
  - **場景**: 用於提示用戶保存未保存的表單數據。

```go
import { onBeforeRouteLeave } from 'vue-router';
import { ref } from 'vue';

const isFormDirty = ref(false);

onBeforeRouteLeave((to, from, next) => {
  if (isFormDirty.value) {
    const answer = window.confirm('Do you really want to leave? You have unsaved changes!');
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});
```

### 5. 導航守衛的完整執行流程

一個完整的導航觸發流程如下：

1. 導航被觸發。
2. 在失活的組件裡調用 `onBeforeRouteLeave` 守衛。
3. 調用全局的 `router.beforeEach` 守衛。
4. 在重用的組件裡調用 `onBeforeRouteUpdate` 守衛。
5. 在路由配置裡調用 `beforeEnter`。
6. 解析異步路由組件。
7. 在被激活的組件裡調用 `onBeforeRouteEnter` (Vue 2) / 在 `setup` 中處理。
8. 調用全局的 `router.beforeResolve` 守衛（較少使用）。
9. 導航被確認。
10. 調用全局的 `router.afterEach` 鉤子。
11. DOM 更新。
12. 在 `mounted` 鉤子中調用 `onBeforeRouteEnter` 的 `next` 回調 (Vue 2)。

**核心記憶點**: `Leave` -> `Global Each` -> `Route Enter` -> `Component Enter` -> `Global After`

### 6. 應用場景：用戶認證流程

```go
// main.js or router/index.js
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkUserToken(); // 檢查用戶是否登入
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    // 如果頁面需要認證但用戶未登入，重定向到登入頁
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.name === 'Login' && isAuthenticated) {
    // 如果用戶已登入，但試圖訪問登入頁，重定向到首頁
    next({ name: 'Home' });
  } else {
    // 其他情況，正常導航
    next();
  }
});

// 在路由配置中添加 meta 字段
const routes = [
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true } // 標記這個路由需要認證
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];
```

## 程式碼範例 (可選)

```javascript
// router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import Login from '../views/Login.vue';

// 模擬一個檢查用戶是否登入的函式
const isAuthenticated = () => {
  return !!localStorage.getItem('user-token');
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true } // 標記這個路由需要認證
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 使用全局前置守衛實現認證流程
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  console.log(`Navigating to ${to.path}, requiresAuth: ${requiresAuth}, isAuthenticated: ${isAuthenticated()}`);

  if (requiresAuth && !isAuthenticated()) {
    // 如果頁面需要認證但用戶未登入，重定向到登入頁
    console.log('Redirecting to login...');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    // 其他情況，正常導航
    next();
  }
});

export default router;
```

這段 JavaScript 程式碼展示了如何使用 `vue-router` 的全局導航守衛 `beforeEach` 來實現一個常見的用戶認證流程：

1.  在路由的 `meta` 字段中標記哪些頁面需要登入才能訪問。
2.  在 `beforeEach` 中，檢查目標路由（`to`）是否需要認證。
3.  如果需要認證，則檢查用戶的登入狀態（此處用 `localStorage` 模擬）。
4.  如果用戶未登入，則使用 `next({ name: 'Login' })` 將其重定向到登入頁面，從而保護了需要授權的頁面。

## 總結

Vue Router 是構建 SPA 的核心工具。

- **路由模式**的選擇取決於對 URL 美觀度和後端配置成本的權衡。
- **導航守衛**是實現應用程式流程控制的關鍵，特別是在**用戶認證**和**權限管理**方面。
- 理解守衛的**種類**、**執行順序**和 `next` 函式的用法，是精通 Vue Router 的標誌。在面試中，能夠設計一個完整的基於導航守衛的認證流程是一個重要的加分項。
