# Go 中的 `slice` 和 `array` 有什麼區別？`slice` 的底層結構是什麼？

- **難度**: 4
- **標籤**: `Slice`, `Array`, `Internals`, `Data Structures`

## 問題詳述

本問題考察面試者對 Go 語言中最常用的兩種複合類型——陣列（array）和切片（slice）的理解。這不僅包括它們在使用上的差異，更重要的是切片作為 Go 的核心資料結構之一，其底層實現原理是每位 Go 開發者都必須掌握的知識。

## 核心理論與詳解

`array` 和 `slice` 都是用來管理一系列相同型別元素的資料結構，但它們在設計哲學、靈活性和使用方式上有著本質的區別。

### Array (陣列)

1.  **定義**: 陣列是具有**固定長度**且包含相同型別元素的序列。
2.  **長度是型別的一部分**: 這是陣列最核心的特徵。`[5]int` 和 `[10]int` 是完全不同的兩種型別。你不能將一種型別的陣列賦值給另一種，也不能在函式間通用。
3.  **值型別 (Value Type)**: 在 Go 中，陣列是值型別。這意味著當一個陣列被賦值給一個新變數，或者作為參數傳遞給一個函式時，**整個陣列的內容都會被複製**。對副本的修改不會影響原始陣列。

### Slice (切片)

1.  **定義**: 切片是對其底層陣列（underlying array）的一個**連續片段的描述符（descriptor）**。它提供了對底層陣列元素序列的動態、靈活的存取方式。
2.  **引用型別的行為**: 切片本身是一個小型的結構體（描述符），它包含了指向底層陣列的指標。因此，當切片被賦值或傳遞時，僅複製這個描述符，而不是底層的資料。這使得多個切片可以**共享同一個底層陣列**，對其中一個切片的元素修改會影響到其他共享該陣列的切片。
3.  **動態長度**: 切片的長度不是固定的，可以通過內建函式 `append` 來增加元素，這可能會導致底層陣列的重新分配。

### Slice 的底層結構

理解切片的關鍵在於理解其運行時的內部結構。一個 `slice` 在底層實際上是一個包含三個欄位的結構體（`reflect.SliceHeader`）：

```go
// A SliceHeader is the runtime representation of a slice.
// It cannot be used safely or portably and is exported for use
// by runtime internals only.
//
type SliceHeader struct {
	Data uintptr // 指向底層陣列的指標
	Len  int      // 切片的長度
	Cap  int      // 切片的容量
}
```

1.  **`Data` (指標)**: 一個指向其底層陣列中某個元素的指標。這個元素是切片的第一個元素。
2.  **`Len` (長度)**: 切片中包含的元素數量。`len(s)`。
3.  **`Cap` (容量)**: 從切片的起始元素到底層陣列末尾的元素數量。`cap(s)`。容量決定了在不重新分配記憶體的情況下，切片可以增長到的最大長度。

![Slice Structure](https://blog.golang.org/go-slices-usage-and-internals/slice.png)
*(圖片來源: The Go Blog)*

### `append` 與容量擴展

當使用 `append` 函式向切片添加元素時：

-   **如果 `len < cap`**: 如果切片的容量足夠，`append` 會直接在底層陣列的現有空間中添加新元素，並增加切片的 `Len`。
-   **如果 `len == cap`**: 如果容量不足，`append` 會觸發一次**擴容**。Go 執行時會分配一個**新的、更大的底層陣列**，將舊陣列的元素複製到新陣列，然後再添加新元素。此時，切片的 `Data` 指標會指向這個新的陣列，`Len` 和 `Cap` 都會更新。這也意味著，擴容後的切片將與原始的底層陣列徹底分離。

## 程式碼範例 (可選)

### 範例 1: Array (值傳遞) vs Slice (引用傳遞)

```go
package main

import "fmt"

func modifyArray(arr [3]int) {
	arr[0] = 100 // 修改的是陣列的副本
}

func modifySlice(slice []int) {
	slice[0] = 100 // 修改的是共享的底層陣列
}

func main() {
	// Array 範例
	arr := [3]int{1, 2, 3}
	modifyArray(arr)
	fmt.Println("Array:", arr) // 輸出: Array: [1 2 3]

	// Slice 範例
	slice := []int{1, 2, 3}
	modifySlice(slice)
	fmt.Println("Slice:", slice) // 輸出: Slice: [100 2 3]
}
```

### 範例 2: Slice 的 len 和 cap

```go
package main

import "fmt"

arr := [5]int{1, 2, 3, 4, 5}

// s1 從索引 0 開始，長度 3，容量 5
s1 := arr[0:3] // [1 2 3]
fmt.Printf("s1: len=%d, cap=%d, data=%v\n", len(s1), cap(s1), s1)

// s2 從索引 2 開始，長度 3，容量 3 (5-2)
s2 := arr[2:5] // [3 4 5]
fmt.Printf("s2: len=%d, cap=%d, data=%v\n", len(s2), cap(s2), s2)

// 修改 s1 會影響 s2 和 arr，因為它們共享底層陣列
s1[2] = 99
fmt.Println("After modification:", arr, s1, s2)

// 輸出:
// s1: len=3, cap=5, data=[1 2 3]
// s2: len=3, cap=3, data=[3 4 5]
// After modification: [1 2 99 4 5] [1 2 99] [99 4 5]
```
