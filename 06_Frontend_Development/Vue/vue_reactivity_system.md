# Vue 響應式系統原理

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Vue`, `Reactivity`, `Proxy`, `Ref`, `Reactive`

## 問題詳述

深入解釋 Vue 3 的響應式系統是如何工作的。說明 `ref` 和 `reactive` 的區別、`Proxy` 在其中扮演的角色，以及 `computed` 和 `watch` 是如何基於這個系統實現的。

## 核心理論與詳解

### 1. 響應式系統的核心目標

Vue 的響應式系統旨在實現**狀態驅動視圖**。當 JavaScript 狀態（state）發生變化時，能夠自動、高效地更新對應的 DOM。開發者只需關心狀態的管理，而無需手動操作 DOM。

### 2. Vue 2 vs. Vue 3 的響應式實現

- **Vue 2**:
  - **核心**: `Object.defineProperty()`
  - **機制**: 遍歷物件的所有屬性，並使用 `Object.defineProperty()` 將每個屬性轉換為 `getter` 和 `setter`。在 `getter` 中收集依賴，在 `setter` 中觸發更新。
  - **缺陷**:
    1. **無法偵測物件屬性的新增或刪除**: 必須使用 `Vue.set` 或 `this.$set`。
    2. **無法偵測陣列索引的直接修改或長度的變更**: 需要通過特定的陣列變異方法（如 `push`, `splice`）來觸發更新。
    3. **初始化時的遞歸遍歷**: 在組件初始化時需要遞歸遍歷所有屬性，對大型物件有性能開銷。

- **Vue 3**:
  - **核心**: ES2015 `Proxy`
  - **機制**: 使用 `Proxy` 物件來代理整個目標物件。`Proxy` 提供了 `get`, `set`, `deleteProperty` 等 13 種攔截器 (trap)，可以攔截對物件的幾乎所有操作。
  - **優勢**:
    1. **原生支持屬性的新增和刪除**: 無需額外的 API。
    2. **原生支持陣列索引和長度的修改**。
    3. **惰性代理**: `Proxy` 是對整個物件的代理，只有在訪問屬性時才會進行處理，而不是在初始化時就遍歷所有屬性，性能更好。
    4. **更廣泛的操作攔截**: `Proxy` 可以攔截更多類型的操作，功能更強大。

### 3. `Proxy` 的工作原理

`Proxy` 就像在目標物件前設定一個攔截層。當你對代理物件進行操作時，這些操作會被 `Proxy` 的處理器 (handler) 攔截。

```javascript
// 簡化版的 Proxy 實現思想
const target = { message: "hello" };

const handler = {
  get(target, prop, receiver) {
    console.log(`Getting property '${prop}'`);
    // 依賴收集 (Track)
    track(target, prop);
    return Reflect.get(...arguments);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting property '${prop}' to '${value}'`);
    const result = Reflect.set(...arguments);
    // 觸發更新 (Trigger)
    trigger(target, prop);
    return result;
  }
};

const proxy = new Proxy(target, handler);

proxy.message; // 觸發 get
proxy.message = "world"; // 觸發 set
```

在 Vue 中，`track` 函式負責收集當前正在執行的副作用函式（如 `computed` 的 getter 或組件的渲染函式），並將其與目標物件的屬性關聯起來。`trigger` 函式則在屬性變更時，找到所有依賴該屬性的副作用函式並重新執行它們。

### 4. `ref` vs. `reactive`

`ref` 和 `reactive` 是 Vue 3 中建立響應式狀態的兩個主要 API。

#### `reactive`

- **用途**: 用於將一個**物件**轉換為響應式物件。
- **原理**: 內部使用 `Proxy` 來代理傳入的物件。
- **返回**: 返回的是一個代理物件。
- **限制**:
  - 只能用於物件類型（`Object`, `Array`, `Map`, `Set`）。
  - 不能直接替換整個 `reactive` 物件，否則會失去響應性。
  - 當解構 `reactive` 物件的屬性時，解構出的變數會失去響應性。

```go
import { reactive } from 'vue';

const state = reactive({ count: 0 });
state.count++; // 視圖會更新

// 錯誤示範：解構會失去響應性
let { count } = state;
count++; // 視圖不會更新

// 錯誤示範：替換整個物件會失去響應性
state = reactive({ count: 10 }); // 原始的 state 代理已失效
```

#### `ref`

- **用途**: 用於將任何**值類型**（包括基本類型如 `string`, `number` 和物件類型）轉換為一個響應式的 `ref` 物件。
- **原理**: `ref` 內部將傳入的值包裝在一個物件的 `.value` 屬性中。對於物件類型，`ref` 內部會自動調用 `reactive` 來進行轉換。
- **返回**: 返回一個 `ref` 物件，其值儲存在 `.value` 屬性中。
- **優勢**:
  - 可以處理任何值類型。
  - 可以直接替換整個 `ref` 的 `.value`，保持響應性。
  - 解決了 `reactive` 解構後失去響應性的問題。

```go
import { ref } from 'vue';

const count = ref(0);
count.value++; // 必須通過 .value 訪問，視圖會更新

// ref 可以持有物件
const state = ref({ count: 0 });
state.value.count++; // 視圖會更新
```

**為什麼在模板中不需要 `.value`？**
當 `ref` 在模板中被渲染時，Vue 會自動對其進行 "unwrap"（解包），所以你可以直接使用 `{{ count }}` 而不是 `{{ count.value }}`。

**總結與選擇**:

- **優先使用 `ref`**: `ref` 的語義更清晰，它明確表示「這是一個響應式的引用」，並且可以處理所有類型，避免了 `reactive` 的一些陷阱。

- **使用 `reactive`**: 當你需要將一個複雜的、具有多層嵌套的物件整體變成響應式，並且不打算替換它時，`reactive` 是一個方便的選擇。

### 5. `computed` 和 `watch` 的實現

`computed` 和 `watch` 都是基於 Vue 的響應式系統來工作的。

#### `computed` (計算屬性)

- **原理**:
  1. `computed` 接受一個 `getter` 函式。
  2. 當第一次訪問計算屬性的值時，Vue 會執行這個 `getter` 函式。
  3. 在 `getter` 執行期間，它會訪問一些響應式依賴（如 `ref` 或 `reactive` 的屬性）。這些依賴的 `get` 攔截器會被觸發，從而**收集**到這個 `computed` 作為依賴。
  4. `computed` 會快取計算結果。只要依賴沒有變化，後續的訪問都會直接返回快取的結果。
  5. 當任何一個依賴發生變化時，其 `set` 攔截器會被觸發，從而**觸發** `computed` 的重新計算。

#### `watch` (偵聽器)

- **原理**:
  1. `watch` 偵聽一個或多個響應式數據源。
  2. 在內部，`watch` 會建立一個副作用函式 (effect)。
  3. 當第一次執行時，它會訪問被偵聽的數據源，從而**收集**依賴。
  4. 當數據源發生變化時，`watch` 的副作用函式會被重新觸發，執行你提供的回呼函式，並傳入新值和舊值。

- **`watchEffect`**:
  - `watchEffect` 是 `watch` 的一個變體。它會立即執行一次回呼函式，並在執行過程中自動追蹤所有訪問到的響應式依賴。當任何依賴變化時，它會重新執行回呼。它更關注副作用，而不需要明確指定數據源。

## 程式碼範例 (可選)

```javascript
// 使用 JavaScript 示意響應式系統中的依賴追蹤和觸發
let activeEffect = null;
const targetMap = new WeakMap();

// 追蹤依賴
function track(target, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);
        console.log(`Tracked: effect depends on '${key}'`);
    }
}

// 觸發更新
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key);
    if (dep) {
        console.log(`Triggered: '${key}' changed, running ${dep.size} effects`);
        dep.forEach(effect => effect());
    }
}

// 模擬一個響應式物件
function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            track(target, key);
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue !== value) {
                trigger(target, key);
            }
            return result;
        }
    };
    return new Proxy(target, handler);
}

// --- 範例使用 ---
const state = reactive({ count: 0 });
let doubled = 0;

const updateDoubled = () => {
    doubled = state.count * 2;
    console.log(`Effect ran: doubled is now ${doubled}`);
};

// 註冊並立即執行副作用
function watchEffect(effect) {
    activeEffect = effect;
    effect();
    activeEffect = null;
}

watchEffect(updateDoubled);

console.log("\n--- Changing state ---");
// 當狀態改變時，副作用會被自動重新執行
state.count = 5;
```

這段 JavaScript 程式碼更貼近 Vue 3 的實際實現，簡化地模擬了其響應式系統的核心思想：

1.  `track` 函式在 `get` 操作時，將當前的 `activeEffect` (副作用) 與目標物件的 `key` 關聯起來，儲存在 `WeakMap` 中。
2.  `trigger` 函式在 `set` 操作時，根據 `target` 和 `key` 找到所有依賴它的副作用並重新執行。
3.  `watchEffect` 函式設定了 `activeEffect`，並立即執行副作用，從而觸發依賴收集。
4.  `main` 函式中的 `updateDoubled` 就是一個副作用，它依賴 `state` 的 `count` 屬性。當 `state.count` 被改變時，`updateDoubled` 會被自動觸發。

## 總結

Vue 3 的響應式系統基於 `Proxy` 實現，相比 Vue 2 的 `Object.defineProperty` 更加強大和高效。

- `reactive` 用於物件，`ref` 用於所有類型，推薦優先使用 `ref`。
- `computed` 和 `watch` 都是這個響應式系統的上層建築，通過依賴收集 (track) 和觸發更新 (trigger) 的機制來實現其功能。

理解這一核心原理對於編寫高效的 Vue 應用、進行性能調優以及解決複雜的狀態問題至關重要。
