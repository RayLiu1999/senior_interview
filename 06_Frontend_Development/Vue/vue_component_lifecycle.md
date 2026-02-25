# Vue 組件生命週期

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Vue`, `Lifecycle`, `Composition API`, `Options API`

## 問題詳述

解釋 Vue 組件的生命週期，包括 Options API 和 Composition API 中的主要鉤子函式，並說明它們的執行順序、適用場景以及常見的陷阱。

## 核心理論與詳解

### 1. 生命週期概述

Vue 組件的生命週期是指一個組件從建立、掛載、更新到銷毀的整個過程。Vue 提供了多個鉤子函式，允許開發者在特定階段執行自定義邏輯。

![Vue Lifecycle](https://vuejs.org/assets/lifecycle.16e4c08e.png)

### 2. Options API 生命週期鉤子

#### 2.1 建立階段 (Creation)

- **`beforeCreate`**:
  - **時機**: 實例被建立，但資料觀測 (data observation) 和事件/監聽器尚未設定。
  - **場景**: 適用於非響應式資料的初始化。
  - **限制**: 無法訪問 `data`、`props`、`computed` 等響應式資料。

- **`created`**:
  - **時機**: 實例已建立，資料觀測、屬性、計算屬性、方法、監聽器都已設定完成。
  - **場景**: 進行非同步操作（如 API 請求）、初始化響應式資料。
  - **限制**: DOM 尚未掛載，無法訪問 `$el`。

#### 2.2 掛載階段 (Mounting)

- **`beforeMount`**:
  - **時機**: 模板已編譯，但尚未將其掛載到 DOM。
  - **場景**: 幾乎不用，除非需要在掛載前對模板進行最後的修改（非常罕見）。

- **`mounted`**:
  - **時機**: 組件已被掛載到 DOM，模板已被渲染。
  - **場景**: 執行需要訪問 DOM 的操作（如初始化第三方庫、設定事件監聽器）、發送 API 請求。
  - **關鍵**: 這是最早可以安全操作 DOM 的地方。

#### 2.3 更新階段 (Updating)

- **`beforeUpdate`**:
  - **時機**: 當響應式資料變更，導致虛擬 DOM 重新渲染和修補 (patch) 之前。
  - **場景**: 在 DOM 更新前獲取舊的狀態，例如手動移除事件監聽器。

- **`updated`**:
  - **時機**: 虛擬 DOM 重新渲染和修補完成後。
  - **場景**: 執行依賴於 DOM 更新完成的操作。
  - **注意**: 避免在此鉤子中修改狀態，否則可能導致無限更新循環。若需修改，應使用 `nextTick`。

#### 2.4 銷毀階段 (Destruction)

- **`beforeUnmount`** (Vue 3) / `beforeDestroy` (Vue 2):
  - **時機**: 組件實例被卸載之前。
  - **場景**: 清理工作，如移除手動建立的事件監聽器、取消計時器 (`setInterval`)、取消訂閱。

- **`unmounted`** (Vue 3) / `destroyed` (Vue 2):
  - **時機**: 組件實例被完全卸載後。
  - **場景**: 執行最後的清理或日誌記錄。

### 3. Composition API 生命週期鉤子

Composition API 的鉤子函式直接在 `setup` 函式中使用，並且與 Options API 的鉤子一一對應。

- `onBeforeMount`
- `onMounted`
- `onBeforeUpdate`
- `onUpdated`
- `onBeforeUnmount`
- `onUnmounted`

**與 Options API 的對應關係**:

- `beforeCreate` -> 直接在 `setup` 中執行
- `created` -> 直接在 `setup` 中執行
- `beforeMount` -> `onBeforeMount`
- `mounted` -> `onMounted`
- `beforeUpdate` -> `onBeforeUpdate`
- `updated` -> `onUpdated`
- `beforeUnmount` -> `onBeforeUnmount`
- `unmounted` -> `onUnmounted`

```go
import { onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    // created 和 beforeCreate 的邏輯
    console.log('Component is being created')

    onMounted(() => {
      console.log('Component has been mounted')
      // 在這裡執行 DOM 相關操作
    })

    onUnmounted(() => {
      console.log('Component is being unmounted')
      // 在這裡執行清理工作
    })

    return {}
  }
}
```

### 4. 特殊生命週期鉤子

- **`onErrorCaptured`**:
  - **時機**: 捕獲來自後代組件的錯誤時觸發。
  - **場景**: 用於建立錯誤邊界 (Error Boundary)，優雅地處理和記錄錯誤，防止整個應用程式崩潰。

- **`onRenderTracked` / `onRenderTriggered`**:
  - **時機**: 開發模式下用於調試。
  - `onRenderTracked`: 當響應式依賴被追蹤時調用。
  - `onRenderTriggered`: 當依賴項變更觸發重新渲染時調用。
  - **場景**: 調試組件的渲染效能，找出不必要的更新。

### 5. 執行順序

- **父子組件掛載**:
  1. `Parent: beforeCreate`
  2. `Parent: created`
  3. `Parent: beforeMount`
  4. `Child: beforeCreate`
  5. `Child: created`
  6. `Child: beforeMount`
  7. `Child: mounted`
  8. `Parent: mounted`

- **父子組件銷毀**:
  1. `Parent: beforeUnmount`
  2. `Child: beforeUnmount`
  3. `Child: unmounted`
  4. `Parent: unmounted`

### 6. 常見陷阱與最佳實踐

- **避免在 `created` 中操作 DOM**: DOM 此時尚未存在。應在 `mounted` 中進行。
- **避免在 `updated` 中修改狀態**: 可能導致無限循環。使用 `watch` 或 `computed` 來響應狀態變化。如果必須修改，請使用 `nextTick`。
- **務必在 `beforeUnmount` 或 `onUnmounted` 中清理**: 手動新增的全域事件、計時器、第三方庫實例等，必須手動銷毀，否則會導致記憶體洩漏。
- **非同步操作的處理**: 在 `created` 或 `setup` 中發起 API 請求。如果組件在請求完成前被銷毀，需要有取消機制（如 AbortController）來避免錯誤。
- **Composition API 的優勢**: `setup` 函式本身整合了 `beforeCreate` 和 `created`，邏輯更集中。`onMounted` 等鉤子可以被封裝在可組合函式 (Composables) 中，提高了邏輯的重用性。

## 程式碼範例 (可選)

```javascript
// Composition API 範例
import { onMounted, onUnmounted, ref } from 'vue';

export default {
  setup() {
    const timer = ref(null);

    console.log('Component is being created (setup)');

    onMounted(() => {
      console.log('Component has been mounted');
      // 建立一個計時器，模擬需要手動管理的資源
      timer.value = setInterval(() => {
        console.log('Timer is ticking...');
      }, 1000);
    });

    onUnmounted(() => {
      console.log('Component is being unmounted');
      // 清理計時器，防止記憶體洩漏
      clearInterval(timer.value);
      console.log('Timer cleaned up.');
    });

    return {};
  }
}
```

這段 JavaScript 程式碼展示了在 Vue Composition API 中管理生命週期的典型模式。`onMounted` 鉤子用於建立需要手動管理的資源（如此處的 `setInterval`），而 `onUnmounted` 鉤子則負責在組件銷毀時清理這些資源，這對於防止記憶體洩漏至關重要。

## 總結

理解 Vue 的生命週期是編寫健壯、高效組件的基礎。

- **Options API** 提供了清晰的、分階段的鉤子。
- **Composition API** 則提供了更靈活、更集中的方式來組織邏輯，特別是將相關的建立和清理邏輯放在一起，提高了程式碼的可讀性和可維護性。

在面試中，能夠清晰地闡述各個鉤子的用途、執行順序以及在不同場景下的最佳實踐，是展現 Vue 掌握程度的關鍵。
