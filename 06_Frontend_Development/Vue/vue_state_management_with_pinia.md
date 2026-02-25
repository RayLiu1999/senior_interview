# Vue 狀態管理 (Pinia)

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Vue`, `State Management`, `Pinia`, `Store`

## 問題詳述

解釋為什麼需要狀態管理，並深入說明 Pinia（Vue 的官方推薦狀態管理庫）的核心概念，包括 Store、State、Getters、Actions，以及它與 Vuex 的主要區別和優勢。

## 核心理論與詳解

### 1. 為什麼需要狀態管理？

在簡單的應用中，可以通過 `props` 和 `emit` 來管理組件間的數據流。但隨著應用程式規模的擴大，會出現以下問題：

- **組件間通信複雜**: 兄弟組件、祖孫組件之間的通信會變得非常繁瑣，導致 "prop drilling"（屬性逐層傳遞）。
- **數據流混亂**: 數據散落在各個組件中，狀態的變化難以追蹤和調試。
- **狀態不一致**: 多個組件可能擁有同一份數據的不同副本，導致狀態不一致。

**狀態管理庫**通過建立一個集中的、全域的 "Store" 來解決這些問題，將共享狀態從組件中抽離出來。

- **Store**: 一個包含應用程式大部分**狀態 (state)** 的容器。
- **集中式**: 所有組件都可以從 Store 中讀取狀態或觸發狀態變更。
- **可預測**: 狀態的變更遵循一定的規則，使得數據流變得清晰、可預測。

### 2. Pinia 核心概念

Pinia 是 Vue 3 的官方推薦狀態管理庫，它極其輕量、簡單且易於擴展。

#### 2.1 `defineStore`

使用 `defineStore` 來定義一個 Store。它接受兩個參數：

1. Store 的唯一 ID。
2. 一個包含 `state`、`getters` 和 `actions` 的選項物件。

```go
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  // State
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  // Getters
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  // Actions
  actions: {
    increment() {
      this.count++;
    },
    randomizeCounter() {
      this.count = Math.round(100 * Math.random());
    }
  }
});
```

#### 2.2 State

- **定義**: `state` 是一個函式，它返回 Store 的初始狀態。這確保了每個 Store 實例都有自己獨立的狀態。
- **訪問**: 在組件中，可以通過 `store.count` 直接讀取和修改狀態。
- **修改**:
  - 直接修改: `store.count++`
  - 使用 `$patch`: `store.$patch({ count: store.count + 1 })`，用於批量更新。
  - 使用 `actions`: 推薦將所有業務邏輯封裝在 `actions` 中。

#### 2.3 Getters

- **定義**: `getters` 相當於 Store 的計算屬性 (`computed`)。它們會快取計算結果，只有當依賴的 `state` 變化時才會重新計算。
- **訪問**: 和 `state` 一樣，可以直接通過 `store.doubleCount` 訪問。

#### 2.4 Actions

- **定義**: `actions` 相當於 Store 的方法 (`methods`)。它們用於封裝業務邏輯，並且可以是**異步**的。
- **調用**: 在組件中，直接調用 `store.increment()`。
- **最佳實踐**: 所有對 `state` 的複雜修改都應該在 `actions` 中進行。

### 3. 在組件中使用 Store

```go
<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">Increment</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>
```

**解構 Store**:
如果直接解構，會失去響應性。需要使用 `storeToRefs` 來保持響應性。

```go
import { storeToRefs } from 'pinia';

const counter = useCounterStore();
// `count` 和 `doubleCount` 是響應式的 ref
const { count, doubleCount } = storeToRefs(counter);
// `increment` 是一個函式，可以直接解構
const { increment } = counter;
```

### 4. Pinia vs. Vuex

Pinia 被認為是下一代的 Vuex，它在設計上進行了諸多簡化和改進。

| 特性 | Pinia | Vuex |
| :--- | :--- | :--- |
| **核心概念** | `State`, `Getters`, `Actions` | `State`, `Getters`, `Mutations`, `Actions`, `Modules` |
| **狀態變更** | 通過 `actions` 或直接修改 `state` | 必須通過 `mutations` (同步) |
| **異步操作** | `actions` 中直接支持 | 只能在 `actions` 中，然後 `commit` 一個 `mutation` |
| **TypeScript** | **完美的類型推斷**，無需額外配置 | 支持有限，需要複雜的類型定義 |
| **模組化** | **天生模組化**，每個 `defineStore` 就是一個模組 | 需要顯式定義 `modules`，有命名空間的概念 |
| **API 設計** | 更簡潔，更接近 Vue 3 Composition API | 較為繁瑣，概念較多 |
| **體積** | 極其輕量 (~1kb) | 較大 |

**Pinia 的核心優勢**:

1. **簡化 API**: 移除了 `Mutations`，將同步和異步邏輯統一在 `Actions` 中，心智負擔更小。
2. **出色的 TypeScript 支持**: 無需任何額外配置即可獲得完整的類型提示和自動完成。
3. **更直觀的模組化**: 每個 Store 都是一個獨立的模組，可以互相導入和使用，沒有複雜的命名空間問題。
4. **與 Composition API 完美契合**: `defineStore` 的設計思想與 `setup` 函式非常相似。

### 5. Store 之間的組合

一個 Store 可以導入並使用另一個 Store。

```go
import { defineStore } from 'pinia';
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    purchase() {
      const userStore = useUserStore();
      if (userStore.isAuthenticated) {
        // ... 執行購買邏輯
      }
    }
  }
});
```

### 6. 外掛 (Plugins)

Pinia 提供了簡單的外掛系統，可以用於擴展其功能，例如實現本地持久化存儲。

```go
// 簡單的本地存儲外掛
function localStoragePlugin({ store }) {
  // 當 store 初始化時，從 localStorage 加載狀態
  const savedState = localStorage.getItem(store.$id);
  if (savedState) {
    store.$patch(JSON.parse(savedState));
  }

  // 監聽狀態變化，並將其保存到 localStorage
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state));
  });
}

// 在 main.js 中使用
import { createPinia } from 'pinia';
const pinia = createPinia();
pinia.use(localStoragePlugin);
```

## 程式碼範例 (可選)

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  // State: 推薦使用箭頭函式，以確保完整的類型推斷
  state: () => ({
    count: 0,
    name: 'PiniaUser'
  }),

  // Getters: 相當於 Store 的計算屬性
  getters: {
    doubleCount: (state) => state.count * 2,
    // Getter 也可以使用其他 Getter
    doubleCountPlusOne(): number {
      return this.doubleCount + 1;
    },
  },

  // Actions: 相當於 Store 的方法，可用於同步和異步操作
  actions: {
    increment() {
      this.count++;
    },
    async randomizeCounter() {
      // 模擬一個異步操作
      const response = await new Promise<number>((resolve) =>
        setTimeout(() => {
          const newCount = Math.round(100 * Math.random());
          resolve(newCount);
        }, 500)
      );
      this.count = response;
    },
  },
});
```

這段 JavaScript 程式碼定義了一個 Pinia store，清晰地展示了其三大核心概念：

1.  **State**: `state` 函式返回了 store 的初始數據 (`count`, `name`)。
2.  **Getters**: `doubleCount` 是一個派生狀態，它根據 `count` 的值動態計算結果。
3.  **Actions**: `increment` 是一個同步 action，直接修改 state。`randomizeCounter` 是一個異步 action，它模擬了一個 API 請求，並在請求成功後更新 state。這體現了 Pinia 將同步和異步邏輯統一在 actions 中的簡潔設計。

## 總結

Pinia 作為 Vue 的新一代官方狀態管理庫，憑藉其**簡潔的 API、優秀的 TypeScript 支持和直觀的模組化設計**，已成為 Vue 3 專案的首選。

- 它解決了複雜應用中的狀態共享和通信問題。
- 相比 Vuex，它極大地降低了開發者的心智負擔和樣板代碼。

在面試中，理解 Pinia 的核心概念以及它相對於 Vuex 的改進，是衡量候選人是否跟上 Vue 生態最新發展的重要指標。
