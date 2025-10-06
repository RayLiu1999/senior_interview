# 字典樹 (Trie) 應用

- **難度**: 6
- **重要程度**: 4
- **標籤**: `Trie`, `前綴樹`, `自動補全`, `敏感詞過濾`, `字串匹配`

## 問題詳述

字典樹（Trie，又稱前綴樹）是一種專門用於處理字串的樹狀資料結構。它能高效地插入、查找字串，特別擅長**前綴匹配**。在自動補全、拼寫檢查、敏感詞過濾等場景中廣泛應用。

## 核心理論與詳解

### 1. Trie 基本概念

#### 核心特性

- **樹狀結構**: 每個節點代表一個字符
- **共用前綴**: 相同前綴的字串共用路徑
- **路徑表示字串**: 從根到葉的路徑代表一個完整字串
- **節點標記**: 標記是否為單字結尾

#### 結構示例

```
插入: "cat", "car", "card", "dog"

        root
       /    \
      c      d
      |      |
      a      o
     / \     |
    t   r    g*
   *    |
        d*
```

- `*` 表示單字結尾
- "ca" 是 "cat" 和 "car" 的共用前綴

### 2. Go 語言實現

#### 基本結構

```go
type TrieNode struct {
    children map[rune]*TrieNode
    isEnd    bool  // 是否為單字結尾
}

type Trie struct {
    root *TrieNode
}

func NewTrie() *Trie {
    return &Trie{
        root: &TrieNode{
            children: make(map[rune]*TrieNode),
        },
    }
}
```

#### 插入操作

```go
func (t *Trie) Insert(word string) {
    node := t.root
    for _, ch := range word {
        if _, exists := node.children[ch]; !exists {
            node.children[ch] = &TrieNode{
                children: make(map[rune]*TrieNode),
            }
        }
        node = node.children[ch]
    }
    node.isEnd = true
}
```

#### 查找操作

```go
// 精確查找
func (t *Trie) Search(word string) bool {
    node := t.root
    for _, ch := range word {
        if node.children[ch] == nil {
            return false
        }
        node = node.children[ch]
    }
    return node.isEnd
}

// 前綴查找
func (t *Trie) StartsWith(prefix string) bool {
    node := t.root
    for _, ch := range prefix {
        if node.children[ch] == nil {
            return false
        }
        node = node.children[ch]
    }
    return true
}
```

#### 刪除操作

```go
func (t *Trie) Delete(word string) bool {
    return t.deleteHelper(t.root, word, 0)
}

func (t *Trie) deleteHelper(node *TrieNode, word string, index int) bool {
    if index == len(word) {
        if !node.isEnd {
            return false  // 單字不存在
        }
        node.isEnd = false
        return len(node.children) == 0  // 可以刪除此節點
    }
    
    ch := rune(word[index])
    childNode := node.children[ch]
    if childNode == nil {
        return false
    }
    
    shouldDeleteChild := t.deleteHelper(childNode, word, index+1)
    
    if shouldDeleteChild {
        delete(node.children, ch)
        return len(node.children) == 0 && !node.isEnd
    }
    return false
}
```

### 3. 時間與空間複雜度

#### 時間複雜度

| 操作 | 時間複雜度 | 說明 |
|-----|-----------|------|
| **插入** | O(m) | m 是字串長度 |
| **查找** | O(m) | m 是字串長度 |
| **前綴匹配** | O(m) | m 是前綴長度 |
| **刪除** | O(m) | m 是字串長度 |

#### 空間複雜度

- **最壞情況**: O(ALPHABET_SIZE × N × M)
  - N: 字串數量
  - M: 平均字串長度
  - ALPHABET_SIZE: 字符集大小（如26個英文字母）

- **實際情況**: 因為共用前綴，空間遠小於最壞情況

### 4. 實際應用場景

#### 應用 1: 自動補全

```go
func (t *Trie) AutoComplete(prefix string) []string {
    results := []string{}
    node := t.root
    
    // 找到前綴節點
    for _, ch := range prefix {
        if node.children[ch] == nil {
            return results
        }
        node = node.children[ch]
    }
    
    // DFS 收集所有以此前綴開頭的單字
    t.dfs(node, prefix, &results)
    return results
}

func (t *Trie) dfs(node *TrieNode, current string, results *[]string) {
    if node.isEnd {
        *results = append(*results, current)
    }
    
    for ch, child := range node.children {
        t.dfs(child, current+string(ch), results)
    }
}

// 使用範例
func main() {
    trie := NewTrie()
    words := []string{"apple", "app", "apricot", "banana", "band"}
    for _, word := range words {
        trie.Insert(word)
    }
    
    suggestions := trie.AutoComplete("ap")
    fmt.Println(suggestions)  // [apple, app, apricot]
}
```

#### 應用 2: 敏感詞過濾

```go
type SensitiveFilter struct {
    trie *Trie
}

func NewSensitiveFilter(words []string) *SensitiveFilter {
    trie := NewTrie()
    for _, word := range words {
        trie.Insert(word)
    }
    return &SensitiveFilter{trie: trie}
}

// 檢測文本中是否包含敏感詞
func (sf *SensitiveFilter) Contains(text string) bool {
    runes := []rune(text)
    for i := 0; i < len(runes); i++ {
        node := sf.trie.root
        j := i
        
        for j < len(runes) && node.children[runes[j]] != nil {
            node = node.children[runes[j]]
            if node.isEnd {
                return true  // 找到敏感詞
            }
            j++
        }
    }
    return false
}

// 替換敏感詞為 ***
func (sf *SensitiveFilter) Filter(text string) string {
    runes := []rune(text)
    result := make([]rune, len(runes))
    copy(result, runes)
    
    for i := 0; i < len(runes); i++ {
        node := sf.trie.root
        j := i
        maxMatch := -1
        
        for j < len(runes) && node.children[runes[j]] != nil {
            node = node.children[runes[j]]
            if node.isEnd {
                maxMatch = j  // 記錄最長匹配
            }
            j++
        }
        
        if maxMatch != -1 {
            for k := i; k <= maxMatch; k++ {
                result[k] = '*'
            }
            i = maxMatch
        }
    }
    return string(result)
}

// 使用範例
func main() {
    filter := NewSensitiveFilter([]string{"fuck", "shit", "damn"})
    
    text := "This is a fucking bad damn day"
    filtered := filter.Filter(text)
    fmt.Println(filtered)  // This is a ****ing bad **** day
}
```

#### 應用 3: 拼寫檢查

```go
func (t *Trie) SpellCheck(word string) []string {
    suggestions := []string{}
    
    // 1. 精確匹配
    if t.Search(word) {
        return []string{word}
    }
    
    // 2. 編輯距離為 1 的候選詞
    candidates := t.getEditDistance1(word)
    
    // 3. 在 Trie 中查找候選詞
    for _, candidate := range candidates {
        if t.Search(candidate) {
            suggestions = append(suggestions, candidate)
        }
    }
    
    return suggestions
}

func (t *Trie) getEditDistance1(word string) []string {
    candidates := []string{}
    runes := []rune(word)
    
    // 刪除一個字符
    for i := 0; i < len(runes); i++ {
        candidate := string(runes[:i]) + string(runes[i+1:])
        candidates = append(candidates, candidate)
    }
    
    // 替換一個字符
    for i := 0; i < len(runes); i++ {
        for ch := 'a'; ch <= 'z'; ch++ {
            if ch != runes[i] {
                tmp := make([]rune, len(runes))
                copy(tmp, runes)
                tmp[i] = ch
                candidates = append(candidates, string(tmp))
            }
        }
    }
    
    // 插入一個字符
    for i := 0; i <= len(runes); i++ {
        for ch := 'a'; ch <= 'z'; ch++ {
            candidate := string(runes[:i]) + string(ch) + string(runes[i:])
            candidates = append(candidates, candidate)
        }
    }
    
    return candidates
}
```

#### 應用 4: IP 路由表

```go
type IPRouteTrie struct {
    root *TrieNode
}

type RouteInfo struct {
    Gateway string
    Metric  int
}

type TrieNode struct {
    children map[byte]*TrieNode
    route    *RouteInfo
}

// 插入路由
func (rt *IPRouteTrie) Insert(ipPrefix string, gateway string, metric int) {
    node := rt.root
    octets := parseIP(ipPrefix)
    
    for _, octet := range octets {
        if node.children[octet] == nil {
            node.children[octet] = &TrieNode{
                children: make(map[byte]*TrieNode),
            }
        }
        node = node.children[octet]
    }
    node.route = &RouteInfo{Gateway: gateway, Metric: metric}
}

// 最長前綴匹配
func (rt *IPRouteTrie) LongestPrefixMatch(ip string) *RouteInfo {
    node := rt.root
    var lastRoute *RouteInfo
    octets := parseIP(ip)
    
    for _, octet := range octets {
        if node.route != nil {
            lastRoute = node.route
        }
        if node.children[octet] == nil {
            break
        }
        node = node.children[octet]
    }
    
    if node.route != nil {
        return node.route
    }
    return lastRoute
}
```

### 5. Trie 的變體

#### 壓縮 Trie (Radix Tree)

**核心思想**: 壓縮只有一個子節點的路徑

```
普通 Trie:
    r-o-m-a-n-e*
           |
           c-e*

壓縮 Trie:
    roman-e*
          |
          ce*
```

**優點**: 節省空間，特別適合稀疏字串集

**應用**: Git、Redis（部分功能）

#### 後綴 Trie (Suffix Trie)

**核心思想**: 儲存字串所有後綴

```
字串 "banana" 的後綴:
banana
anana
nana
ana
na
a
```

**應用**: 字串匹配、查找子串

### 6. Trie vs 其他資料結構

| 特性 | Trie | 雜湊表 | 平衡樹 |
|-----|------|--------|--------|
| **查找** | O(m) | O(1) 平均 | O(log n) |
| **前綴匹配** | ✅ O(m) | ❌ 不支援 | ⚠️ O(k log n) |
| **排序輸出** | ✅ 字典序 | ❌ 無序 | ✅ 有序 |
| **空間** | 較大 | 中等 | 較小 |
| **適用場景** | 前綴操作 | 精確查找 | 範圍查詢 |

- m: 字串長度
- n: 資料量
- k: 前綴匹配結果數量

### 7. 效能優化

#### 優化 1: 陣列代替 Map

```go
type TrieNode struct {
    children [26]*TrieNode  // 只支援小寫字母
    isEnd    bool
}

func (t *Trie) Insert(word string) {
    node := t.root
    for _, ch := range word {
        idx := ch - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &TrieNode{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}
```

**優點**: 存取更快（陣列 vs Map）
**缺點**: 只能處理固定字符集

#### 優化 2: 位圖壓縮

對於布林標記，用位圖代替布林陣列，節省空間。

## 總結

### 核心要點

1. **前綴共用**: Trie 的核心優勢，適合前綴操作
2. **查找效率**: O(m) 與字串長度相關，與資料量無關
3. **空間換時間**: 空間占用較大，但查找極快
4. **實際應用**: 自動補全、敏感詞過濾、IP 路由、拼寫檢查
5. **變體**: 壓縮 Trie、後綴 Trie

### 作為資深後端工程師，你需要

- ✅ 理解 Trie 的樹狀結構和前綴共用原理
- ✅ 能夠手寫 Trie 的插入、查找、刪除操作
- ✅ 掌握自動補全和敏感詞過濾的實現
- ✅ 了解 Trie 與雜湊表、平衡樹的區別
- ✅ 在搜尋引擎、輸入法等場景中應用 Trie
