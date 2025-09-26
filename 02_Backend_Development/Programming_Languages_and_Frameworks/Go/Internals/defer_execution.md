# `defer` 關鍵字的執行時機是什麼？它在與返回值互動時有什麼需要注意的地方？

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Defer`, `Internals`

## 問題詳述

本問題考察面試者對 Go 語言中 `defer` 關鍵字的深入理解。`defer` 看似簡單，但其執行時機、參數的求值時機以及與命名返回值的互動是常見的混淆點和面試考點。能否準確回答這個問題，反映了開發者對 Go 函式執行模型的掌握程度。

## 核心理論與詳解

`defer` 語句用於將一個函式呼叫延遲到其所在的函式即將返回之前執行。它通常用於資源釋放、解鎖、記錄日誌等清理工作。

### `defer` 的核心規則

1.  **執行時機**: `defer` 函式呼叫在所在的函式**執行 `return` 語句之後，且在函式真正返回給呼叫者之前**執行。

2.  **參數求值時機**: `defer` 後面的函式呼叫，其**參數在 `defer` 語句被定義時就已經求值**了，而不是在函式即將退出時才求值。這是一個非常關鍵且容易出錯的特性。

3.  **LIFO 執行順序**: 如果一個函式內有多個 `defer` 語句，它們會被放入一個堆疊中。當函式返回時，這些 `defer` 函式會以**後進先出（Last-In, First-Out, LIFO）** 的順序執行。

### `defer` 與返回值的互動

`defer` 是否能修改函式的返回值，取決於該函式使用的是「匿名返回值」還是「命名返回值」。

#### 1. 匿名返回值 (Anonymous Return Values)

當函式簽名只定義了返回值的類型時，使用的是匿名返回值。

```go
func foo() int {
    var i int = 0
    defer func() {
        i++
        fmt.Println("defer 1:", i) // 輸出 defer 1: 1
    }()
    return i // 返回 0
}
```

**執行流程**:
1. `return i` 執行時，會先將返回值 `i` (值為 0) 賦給一個臨時的、即將返回給呼叫者的變數。可以想像成 `returnValue = i`。
2. 接著，執行 `defer` 函式。`defer` 內部修改了局部變數 `i`，但**無法影響**已經被賦值的 `returnValue`。
3. 函式最終將 `returnValue` (值為 0) 返回給呼叫者。

結論：對於匿名返回值，`defer` 函式無法修改最終的返回值。

#### 2. 命名返回值 (Named Return Values)

當函式簽名給返回值命名時，這個返回值就如同一個在函式頂部預先宣告的局部變數。

```go
func bar() (i int) { // i 在此處被宣告，初始值為 0
    defer func() {
        i++
        fmt.Println("defer 2:", i) // 輸出 defer 2: 1
    }()
    return i // 返回 1
}
```

**執行流程**:
1. `return i` 語句在這裡是一個「裸 `return`」。它僅僅表示函式準備返回。在 `return` 執行前，`i` 的值為 0。
2. 執行 `defer` 函式。此時 `defer` 函式訪問並修改了 `i`，使其變為 1。
3. `defer` 執行完畢後，函式將 `i` 的當前值 (值為 1) 返回給呼叫者。

結論：對於命名返回值，`defer` 函式可以存取並修改最終的返回值。

## 程式碼範例 (可選)

### 範例 1: 參數立即求值

```go
package main

import "fmt"

func main() {
	i := 0
	// defer 後面的函式參數 i 在此時就被求值為 0
	defer fmt.Println("Result:", i)

	i++
	fmt.Println("Current i:", i)
}

// 輸出:
// Current i: 1
// Result: 0
```

### 範例 2: LIFO 順序

```go
package main

import "fmt"

func main() {
	fmt.Println("main start")
	defer fmt.Println("defer 1")
	defer fmt.Println("defer 2")
	fmt.Println("main end")
}

// 輸出:
// main start
// main end
// defer 2
// defer 1
```

### 範例 3: 修改命名返回值

這個範例清晰地展示了 `defer` 如何影響命名返回值。

```go
package main

import "fmt"

func getNumber() (num int) {
	defer func() {
		// 在函式返回前，將命名返回值 num 增加 10
		num += 10
	}()

	num = 5
	return num // 1. num 被設為 5; 2. 執行 defer; 3. 返回 num
}

func main() {
	// 最終返回的值是 5 + 10 = 15
	fmt.Println(getNumber()) // 輸出: 15
}
```
