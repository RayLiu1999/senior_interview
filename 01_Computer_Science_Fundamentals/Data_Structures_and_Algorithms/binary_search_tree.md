# 二元搜尋樹 (BST) 原理

- **難度**: 5
- **重要程度**: 5
- **標籤**: `BST`, `平衡樹`, `紅黑樹`, `AVL`, `資料庫索引`

## 問題詳述

二元搜尋樹 (Binary Search Tree, BST) 是一種有序的樹狀資料結構，左子樹所有節點值小於根節點，右子樹所有節點值大於根節點。理解 BST 及其平衡變體（紅黑樹、AVL 樹）是掌握資料庫索引、記憶體資料庫（如 Redis）等核心技術的基礎。

## 核心理論與詳解

### 1. 二元搜尋樹基礎

#### 核心性質

```
對於任意節點 N：
- 左子樹所有節點值 < N.val
- 右子樹所有節點值 > N.val
- 左右子樹也是二元搜尋樹
```

#### 基本操作

**查找 (Search)**
```
1. 從根節點開始
2. 若目標值 = 當前節點，返回
3. 若目標值 < 當前節點，往左子樹查找
4. 若目標值 > 當前節點，往右子樹查找
```

**插入 (Insert)**
```
1. 查找插入位置（葉節點）
2. 比較目標值與當前節點
3. 往左或往右遞迴
4. 找到空位置後插入
```

**刪除 (Delete)**
```
情況1: 葉節點 → 直接刪除
情況2: 只有一個子節點 → 用子節點替換
情況3: 有兩個子節點 → 用右子樹最小節點（或左子樹最大節點）替換
```

#### Go 語言實現

```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

// 查找
func search(root *TreeNode, target int) *TreeNode {
    if root == nil || root.Val == target {
        return root
    }
    if target < root.Val {
        return search(root.Left, target)
    }
    return search(root.Right, target)
}

// 插入
func insert(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: val}
    }
    if val < root.Val {
        root.Left = insert(root.Left, val)
    } else {
        root.Right = insert(root.Right, val)
    }
    return root
}

// 刪除
func deleteNode(root *TreeNode, key int) *TreeNode {
    if root == nil {
        return nil
    }
    
    if key < root.Val {
        root.Left = deleteNode(root.Left, key)
    } else if key > root.Val {
        root.Right = deleteNode(root.Right, key)
    } else {
        // 找到目標節點
        if root.Left == nil {
            return root.Right
        }
        if root.Right == nil {
            return root.Left
        }
        
        // 有兩個子節點：找右子樹最小值
        minNode := findMin(root.Right)
        root.Val = minNode.Val
        root.Right = deleteNode(root.Right, minNode.Val)
    }
    return root
}

func findMin(node *TreeNode) *TreeNode {
    for node.Left != nil {
        node = node.Left
    }
    return node
}
```

### 2. BST 的問題：不平衡

#### 退化情況

插入有序資料 `[1, 2, 3, 4, 5]` 會導致：

```
    1
     \
      2
       \
        3
         \
          4
           \
            5
```

**結果**: 退化成鏈結串列，查找時間 O(n)

### 3. 平衡二元搜尋樹

#### AVL 樹

**定義**: 任意節點的左右子樹高度差不超過 1

**平衡操作**: 透過旋轉維持平衡
- **左旋 (Left Rotation)**
- **右旋 (Right Rotation)**
- **左右旋 (LR Rotation)**
- **右左旋 (RL Rotation)**

**優點**:
- 嚴格平衡，查找效率最高 O(log n)

**缺點**:
- 插入/刪除需要多次旋轉，開銷大
- 維護成本高

#### 紅黑樹 (Red-Black Tree)

**定義**: 一種自平衡的二元搜尋樹，具有以下性質：

1. 每個節點是紅色或黑色
2. 根節點是黑色
3. 葉節點（NIL）是黑色
4. 紅色節點的子節點必須是黑色（不能有連續的紅色節點）
5. 從任一節點到葉節點的所有路徑包含相同數量的黑色節點

**平衡標準**: 最長路徑不超過最短路徑的 2 倍

**優點**:
- 平衡性較 AVL 樹寬鬆，插入/刪除效率更高
- 旋轉次數少（最多 3 次）
- 工程上更實用

**缺點**:
- 查找效率略低於 AVL 樹（但仍是 O(log n)）

**實際應用**:
- **Linux 核心**: 程序調度（CFS）、記憶體管理
- **Java**: TreeMap、TreeSet
- **C++ STL**: map、set、multimap、multiset
- **Nginx**: Timer 管理

#### AVL vs 紅黑樹對比

| 特性 | AVL 樹 | 紅黑樹 |
|-----|-------|--------|
| **平衡性** | 嚴格平衡 | 寬鬆平衡 |
| **查找效率** | O(log n) 最優 | O(log n) 略慢 |
| **插入效率** | 較慢（多次旋轉） | 較快（最多 3 次旋轉） |
| **刪除效率** | 較慢 | 較快 |
| **適用場景** | 查找密集 | 插入/刪除頻繁 |
| **實際應用** | 資料庫（較少） | 語言標準庫、作業系統 |

### 4. 時間與空間複雜度

#### 二元搜尋樹 (未平衡)

| 操作 | 平均 | 最壞 |
|-----|------|------|
| **查找** | O(log n) | O(n) |
| **插入** | O(log n) | O(n) |
| **刪除** | O(log n) | O(n) |

#### 平衡樹 (AVL / 紅黑樹)

| 操作 | 時間複雜度 |
|-----|-----------|
| **查找** | O(log n) |
| **插入** | O(log n) |
| **刪除** | O(log n) |
| **空間** | O(n) |

### 5. 實際應用場景

#### 語言標準庫

**Go**
```go
// 標準庫沒有內建平衡樹，需要自行實現或使用第三方
// 常見場景使用 map（雜湊表）代替
```

**Java**
```java
// TreeMap 底層是紅黑樹
TreeMap<Integer, String> map = new TreeMap<>();
map.put(3, "three");  // O(log n)
map.get(3);           // O(log n)
map.firstKey();       // O(log n) 獲取最小鍵
map.lastKey();        // O(log n) 獲取最大鍵
```

**C++**
```cpp
// std::map 底層是紅黑樹
std::map<int, std::string> m;
m[3] = "three";       // O(log n)
m.find(3);            // O(log n)
m.lower_bound(2);     // O(log n) 查找 >= 2 的最小值
```

#### 資料庫索引

**MySQL InnoDB**
- 使用 **B+ 樹** 而非 BST
- 原因：磁碟 I/O 優化，每個節點存多個鍵（降低樹高度）

**記憶體資料庫**
- **Redis ZSet**: 使用跳躍表（Skip List）而非紅黑樹
- 原因：實現簡單，效能相近

#### 範圍查詢

```go
// 查找區間 [10, 20] 的所有元素
func rangeBST(root *TreeNode, low, high int) []int {
    result := []int{}
    var dfs func(*TreeNode)
    dfs = func(node *TreeNode) {
        if node == nil {
            return
        }
        if node.Val > low {
            dfs(node.Left)
        }
        if node.Val >= low && node.Val <= high {
            result = append(result, node.Val)
        }
        if node.Val < high {
            dfs(node.Right)
        }
    }
    dfs(root)
    return result
}
```

#### 作業系統

**Linux CFS 調度器**
- 使用紅黑樹維護可執行程序
- 鍵值：虛擬執行時間（vruntime）
- 快速找到最小 vruntime 的程序 O(log n)

### 6. BST 常見面試題

#### Q1: 驗證二元搜尋樹

```go
func isValidBST(root *TreeNode) bool {
    return validate(root, nil, nil)
}

func validate(node *TreeNode, min, max *int) bool {
    if node == nil {
        return true
    }
    if min != nil && node.Val <= *min {
        return false
    }
    if max != nil && node.Val >= *max {
        return false
    }
    return validate(node.Left, min, &node.Val) && 
           validate(node.Right, &node.Val, max)
}
```

#### Q2: BST 第 K 小元素

```go
func kthSmallest(root *TreeNode, k int) int {
    count := 0
    var result int
    var inorder func(*TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil || count >= k {
            return
        }
        inorder(node.Left)
        count++
        if count == k {
            result = node.Val
            return
        }
        inorder(node.Right)
    }
    inorder(root)
    return result
}
```

#### Q3: 兩個節點的最低公共祖先

```go
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }
    // p, q 都在左子樹
    if p.Val < root.Val && q.Val < root.Val {
        return lowestCommonAncestor(root.Left, p, q)
    }
    // p, q 都在右子樹
    if p.Val > root.Val && q.Val > root.Val {
        return lowestCommonAncestor(root.Right, p, q)
    }
    // 一個在左，一個在右，或其中一個是根
    return root
}
```

### 7. 設計選擇

#### 什麼時候用 BST（平衡樹）？

✅ **適合場景**:
- 需要有序資料
- 頻繁範圍查詢
- 需要找最大/最小值
- 插入/刪除/查找都很頻繁

❌ **不適合場景**:
- 只需要查找（用雜湊表更快）
- 資料量巨大且在磁碟（用 B 樹/B+ 樹）
- 需要極致查找效能（用雜湊表）

#### BST vs 雜湊表

| 特性 | BST (平衡樹) | 雜湊表 |
|-----|-------------|--------|
| **查找** | O(log n) | O(1) 平均 |
| **有序性** | ✅ 支援 | ❌ 無序 |
| **範圍查詢** | ✅ O(log n + k) | ❌ 不支援 |
| **最大/最小** | ✅ O(log n) | ❌ O(n) |
| **記憶體** | O(n) | O(n)，負載因子影響 |
| **穩定性** | ✅ O(log n) 穩定 | ⚠️ 最壞 O(n)（碰撞） |

## 總結

### 核心要點

1. **BST 核心性質**: 左 < 根 < 右，支援有序操作
2. **平衡性很重要**: 未平衡會退化成 O(n)
3. **AVL 嚴格平衡**: 查找最快，但維護成本高
4. **紅黑樹工程首選**: 平衡性寬鬆，插入/刪除效率高
5. **實際應用廣泛**: 語言標準庫、作業系統、資料庫

### 作為資深後端工程師，你需要

- ✅ 理解 BST 的核心性質和基本操作
- ✅ 掌握 AVL 和紅黑樹的平衡策略
- ✅ 知道什麼時候選擇 BST vs 雜湊表
- ✅ 理解紅黑樹在 Linux、Java、C++ 中的應用
- ✅ 能夠手寫 BST 的增刪查改操作
- ✅ 理解為什麼 MySQL 用 B+ 樹而非 BST
