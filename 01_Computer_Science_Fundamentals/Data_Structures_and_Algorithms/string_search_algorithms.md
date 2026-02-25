# 字串搜尋算法 (String Search Algorithms)

- **難度**: 6
- **重要程度**: 4
- **標籤**: `KMP`, `Rabin-Karp`, `字串匹配`, `模式搜尋`, `滾動雜湊`

## 問題詳述

字串搜尋（模式匹配）是在**文本字串 T**（長度 n）中尋找**模式字串 P**（長度 m）所有出現位置的問題。樸素算法時間複雜度為 O(nm)，而 KMP 和 Rabin-Karp 算法能將其優化到線性時間。

## 核心理論與詳解

### 樸素算法（Brute Force）

從文本的每個位置嘗試匹配，不匹配則滑動一位重新開始。

- **時間複雜度**：O(nm)，最壞情況（如文本為 `aaaa...a`，模式為 `aaa...ab`）
- **問題**：完全沒有利用已匹配的資訊，匹配失敗時從頭再來

---

### KMP 算法（Knuth-Morris-Pratt）

KMP 的核心思想：**利用已匹配的資訊，失配時不退回文本指針**，只移動模式指針。

#### 部分匹配表（Failure Function / Next Array）

KMP 預先計算模式字串的 **next 陣列**（部分匹配值），表示「當模式在位置 i 失配時，模式指針返回的位置」。

- `next[i]` = 模式字串 `P[0..i-1]` 的**最長公共前後綴長度**
- 例如：`P = "ABCABD"` → `next = [0, 0, 0, 1, 2, 0]`
  - `P[0..3] = "ABCA"` 的最長公共前後綴是 `"A"`，長度為 1
  - `P[0..4] = "ABCAB"` 的最長公共前後綴是 `"AB"`，長度為 2

#### 匹配流程

1. 文本指針 `i`，模式指針 `j`，均從 0 開始
2. 若 `T[i] == P[j]`：`i++`，`j++`
3. 若 `T[i] != P[j]`：
   - 若 `j == 0`：`i++`（文本前進一位）
   - 否則：`j = next[j-1]`（模式指針回退，不退文本指針）
4. 若 `j == m`：找到匹配，記錄位置，`j = next[j-1]`（繼續搜下一個）

**時間複雜度**：O(n + m)，其中 O(m) 用於建構 next 陣列，O(n) 用於匹配
**空間複雜度**：O(m)

**適用場景**：單一模式字串匹配，最常用的字串搜尋算法

---

### Rabin-Karp 算法（滾動雜湊）

Rabin-Karp 使用**雜湊函數**將字串轉化為數字，通過比較雜湊值實現快速匹配。

#### 核心：滾動雜湊（Rolling Hash）

不重新計算窗口雜湊值，而是利用前一個窗口的雜湊值**滾動計算**：

```
H(T[i+1..i+m]) = (H(T[i..i+m-1]) - T[i] * base^(m-1)) * base + T[i+m]
```

每次滑動窗口計算雜湊值只需 O(1)，避免了每次從頭計算的 O(m) 開銷。

#### 哈希碰撞處理

若雜湊值相同，**不一定代表字串相同**（雜湊碰撞），需進行字元級別的逐一驗證。使用質數取模可降低碰撞概率。

| 比較項目 | KMP | Rabin-Karp |
|---------|-----|-----------|
| 預處理 | O(m)，構建 next 陣列 | O(m)，計算初始雜湊 |
| 匹配 | O(n) | 平均 O(n)，最壞 O(nm) |
| 多模式匹配 | 需多次執行，不高效 | 可同時匹配多個模式（使用集合存雜湊值） |
| 特點 | 確定性，無偽陽性 | 可能雜湊碰撞，需驗證 |

**Rabin-Karp 的優勢**：適合**多模式同時匹配**場景（如同時搜尋多個關鍵詞），時間複雜度為 O(n + k·m)，k 為模式數量。

### 其他字串算法

- **Aho-Corasick**：多模式匹配的最優算法，在 KMP 基礎上構建 Trie + 失配指針。適用於敏感詞過濾、病毒特征碼掃描。時間複雜度 O(n + m·k + r)，r 為匹配次數
- **Boyer-Moore**：實際最快的單模式匹配算法，從右向左比較，利用「壞字符規則」和「好後綴規則」大幅跳躍，平均 O(n/m)

## 程式碼範例

```go
package main

import "fmt"

// KMP 算法

func buildNext(pattern string) []int {
    m := len(pattern)
    next := make([]int, m)
    next[0] = 0
    k := 0 // 最長公共前後綴長度
    for i := 1; i < m; i++ {
        for k > 0 && pattern[k] != pattern[i] {
            k = next[k-1]
        }
        if pattern[k] == pattern[i] {
            k++
        }
        next[i] = k
    }
    return next
}

func kmpSearch(text, pattern string) []int {
    n, m := len(text), len(pattern)
    if m == 0 { return nil }
    next := buildNext(pattern)
    var result []int
    j := 0 // 模式指針
    for i := 0; i < n; i++ {
        for j > 0 && text[i] != pattern[j] {
            j = next[j-1] // 失配時，模式指針回退
        }
        if text[i] == pattern[j] {
            j++
        }
        if j == m {
            result = append(result, i-m+1) // 記錄匹配起始位置
            j = next[j-1]                   // 繼續搜尋
        }
    }
    return result
}

func main() {
    text := "AABAACAADAABAABA"
    pattern := "AABA"
    positions := kmpSearch(text, pattern)
    fmt.Println("匹配位置:", positions) // [0 9 12]
}
```
