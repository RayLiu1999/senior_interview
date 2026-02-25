# Vue 組件間通信

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Vue`, `Component`, `Communication`, `Props`, `Emit`

## 問題詳述

總結 Vue 中組件間通信的各種方式，並解釋它們各自的適用場景、優點和缺點。包括父子、子父、兄弟、祖孫以及任意組件間的通信。

## 核心理論與詳解

### 1. 父子通信: `props`

- **方式**: 父組件通過 `props` 將數據向下傳遞給子組件。
- **單向數據流**: 數據只能從父組件流向子組件。子組件不應直接修改 `props`，而應通過觸發事件通知父組件進行修改。這是為了防止數據流變得混亂和難以追蹤。
- **適用場景**: 最常用、最核心的通信方式，用於父組件向子組件傳遞數據和配置。
- **優點**: 簡單、直觀、語義清晰。
- **缺點**: 只能單向傳遞。

```go
<!-- Parent.vue -->
<template>
  <ChildComponent :message="parentMessage" />
</template>
<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';
const parentMessage = ref('Hello from parent');
</script>

<!-- ChildComponent.vue -->
<template>
  <p>{{ message }}</p>
</template>
<script setup>
defineProps({
  message: String
});
</script>
```

### 2. 子父通信: `emit`

- **方式**: 子組件通過 `$emit` (Options API) 或 `defineEmits` (Composition API) 觸發一個自定義事件，並可選擇性地傳遞數據。父組件監聽這個事件並執行相應的回呼函式。
- **適用場景**: 子組件需要通知父組件某個動作發生了，或者需要請求父組件改變狀態。
- **優點**: 符合單向數據流原則，事件驅動，解耦。
- **缺點**: 只能向上傳遞一層。

```go
<!-- ChildComponent.vue -->
<template>
  <button @click="sendMessageToParent">Send Message</button>
</template>
<script setup>
const emit = defineEmits(['message-to-parent']);
const sendMessageToParent = () => {
  emit('message-to-parent', 'Hello from child');
};
</script>

<!-- Parent.vue -->
<template>
  <ChildComponent @message-to-parent="handleChildMessage" />
  <p>Message from child: {{ childMessage }}</p>
</template>
<script setup>
import { ref } from 'vue';
const childMessage = ref('');
const handleChildMessage = (payload) => {
  childMessage.value = payload;
};
</script>
```

### 3. 祖孫/跨級通信: `provide` / `inject`

- **方式**: 祖先組件通過 `provide` 提供數據或方法，後代組件（無論層級多深）可以通過 `inject` 來注入並使用這些數據或方法。
- **適用場景**: 用於深層嵌套的組件，避免了 `props` 的逐層傳遞（"prop drilling"）。常用於開發外掛或UI庫。
- **優點**: 解決了跨級通信的問題，使代碼更簡潔。
- **缺點**:
  - 數據來源不清晰，不像 `props` 那樣直觀。
  - `provide` 提供的數據預設不是響應式的，除非提供的是一個 `ref` 或 `reactive` 物件。

```go
<!-- Ancestor.vue -->
<script setup>
import { provide, ref } from 'vue';
const theme = ref('dark');
provide('theme', theme);
</script>

<!-- Descendant.vue -->
<script setup>
import { inject } from 'vue';
const theme = inject('theme');
</script>
<template>
  <div :class="theme">...</div>
</template>
```

### 4. 任意組件通信: 狀態管理庫 (Pinia / Vuex)

- **方式**: 將共享狀態抽取到一個全域的、集中的 "Store" 中。任何組件都可以讀取 Store 中的狀態或觸發 "Action" 來修改狀態。
- **適用場景**: 中大型應用程式中複雜的、跨越多個組件的共享狀態管理。例如使用者登入狀態、購物車內容等。
- **優點**:
  - 集中式管理，數據流清晰可追蹤。
  - 提供了強大的開發者工具（如 Vue Devtools）來調試狀態變化。
  - 解決了所有通信場景。
- **缺點**:
  - 對於簡單應用來說，會增加樣板代碼和複雜性。
  - 需要學習額外的庫和概念。

### 5. 兄弟組件通信

- **方式**:
  1. **通過共同的父組件**: 兄弟 A 通過 `emit` 通知父組件，父組件再通過 `props` 將數據傳遞給兄弟 B。這是最常見且推薦的方式。
  2. **通過狀態管理庫**: 將共享狀態提升到 Pinia/Vuex Store 中。
  3. **通過事件總線 (Event Bus)**: （**不推薦在 Vue 3 中使用**）建立一個全域的事件發射器實例，一個組件觸發事件，另一個組件監聽。這種方式在大型應用中會導致數據流混亂，難以維護，被認為是反模式。`provide`/`inject` 或狀態管理庫是更好的替代方案。

### 6. `v-model` 在組件上的使用

- **方式**: `v-model` 是一個語法糖，它本質上是 `props` 和 `emit` 的組合。
  - `v-model="data"` 等同於 `:modelValue="data" @update:modelValue="data = $event"`。
- **適用場景**: 用於建立自定義的表單輸入組件，實現雙向數據綁定。
- **優點**: 語法簡潔，符合 `v-model` 的直覺。

```go
<!-- CustomInput.vue -->
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

<!-- Parent.vue -->
<template>
  <CustomInput v-model="searchText" />
</template>
<script setup>
import { ref } from 'vue';
const searchText = ref('');
</script>
```

### 7. `$attrs` 和 `$listeners` (Vue 2) / `attrs` (Vue 3)

- **方式**:
  - `attrs` 包含父組件傳遞過來但沒有被子組件 `props` 聲明的屬性。
  - 在 Vue 3 中，事件監聽器也包含在 `attrs` 中。
- **適用場景**: 用於建立高階組件 (HOC) 或包裝組件，將屬性和事件透傳給內部的子組件。
- **優點**: 方便地將屬性向下傳遞，而無需在中間層組件中顯式聲明。

```go
<!-- WrapperComponent.vue -->
<template>
  <BaseComponent v-bind="$attrs" />
</template>
<script setup>
// 這個組件不需要知道 BaseComponent 有哪些 props
</script>
```

## 通信方式選擇總結

| 場景 | 推薦方式 | 備選方式 |
| :--- | :--- | :--- |
| **父 -> 子** | `props` | |
| **子 -> 父** | `emit` | |
| **兄弟組件** | 共同父組件 (`emit` + `props`) | 狀態管理 (Pinia) |
| **祖孫/跨級** | `provide` / `inject` | 狀態管理 (Pinia) |
| **任意組件** | 狀態管理 (Pinia) | |
| **自定義輸入** | `v-model` | |
| **組件包裝** | `attrs` | |

## 程式碼範例 (可選)

```vue
<!-- Parent.vue -->
<template>
  <ChildComponent :message="parentMessage" @message-to-parent="handleChildMessage" />
  <p>Message from child: {{ childMessage }}</p>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const parentMessage = ref('Hello from parent');
const childMessage = ref('');

const handleChildMessage = (payload) => {
  childMessage.value = payload;
  console.log(`Parent received: ${payload}`);
};
</script>

<!-- ChildComponent.vue -->
<template>
  <p>Message from parent: {{ message }}</p>
  <button @click="sendMessageToParent">Send Message to Parent</button>
</template>

<script setup>
defineProps({
  message: String
});

const emit = defineEmits(['message-to-parent']);

const sendMessageToParent = () => {
  const childMsg = 'Hello from child';
  console.log(`Child emitting: ${childMsg}`);
  emit('message-to-parent', childMsg);
};
</script>
```

這個範例展示了最核心的父子組件通信模式：

1.  **父 -> 子**: `Parent.vue` 通過 `props` (`:message="parentMessage"`) 將數據傳遞給 `ChildComponent.vue`。
2.  **子 -> 父**: `ChildComponent.vue` 在按鈕被點擊時，調用 `emit` 函式觸發一個自定義事件 `message-to-parent`，並附帶一個 payload。`Parent.vue` 則通過 `@message-to-parent` 監聽這個事件，並執行 `handleChildMessage` 方法來接收數據。

## 總結

選擇合適的組件通信方式是構建可維護、可擴展 Vue 應用的關鍵。

- **`props` 和 `emit`** 是構建組件化系統的基石，應優先考慮。
- **`provide` / `inject`** 是解決 "prop drilling" 的有效工具。
- **狀態管理庫 (Pinia)** 是處理複雜、全域共享狀態的最終解決方案。

在面試中，能夠根據具體場景權衡各種方式的利弊，是衡量候選人架構思維的重要標準。
