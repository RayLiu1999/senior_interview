# 二元樹遍歷與應用

- **難度**: 4
- **重要程度**: 5
- **標籤**: `前序`, `中序`, `後序`, `層序遍歷`, `DFS`, `BFS`

## 問題詳述

二元樹遍歷是樹結構操作的基礎，分為**深度優先遍歷**（前序、中序、後序）和**廣度優先遍歷**（層序）。理解各種遍歷方式的原理、遞迴與迭代實現，以及實際應用場景，是解決樹結構問題的關鍵。

## 核心理論與詳解

### 1. 深度優先遍歷 (DFS)

#### 前序遍歷 (Preorder)

**順序**: 根 → 左 → 右

**遞迴實現**
```go
func preorderTraversal(root *TreeNode) []int {
    result := []int{}
    var preorder func(*TreeNode)
    preorder = func(node *TreeNode) {
        if node == nil {
            return
        }
        result = append(result, node.Val)  // 根
        preorder(node.Left)                // 左
        preorder(node.Right)               // 右
    }
    preorder(root)
    return result
}
```

**迭代實現（用堆疊）**
```go
func preorderTraversal(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    
    result := []int{}
    stack := []*TreeNode{root}
    
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, node.Val)
        
        // 先壓右，再壓左（因為堆疊是 LIFO）
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
    }
    return result
}
```

**應用場景**:
- **複製樹**: 先建立根節點，再複製子樹
- **序列化樹**: 先儲存根節點資訊
- **表達式樹求值**: 前綴表達式

#### 中序遍歷 (Inorder)

**順序**: 左 → 根 → 右

**遞迴實現**
```go
func inorderTraversal(root *TreeNode) []int {
    result := []int{}
    var inorder func(*TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil {
            return
        }
        inorder(node.Left)                // 左
        result = append(result, node.Val) // 根
        inorder(node.Right)               // 右
    }
    inorder(root)
    return result
}
```

**迭代實現**
```go
func inorderTraversal(root *TreeNode) []int {
    result := []int{}
    stack := []*TreeNode{}
    current := root
    
    for current != nil || len(stack) > 0 {
        // 一路向左
        for current != nil {
            stack = append(stack, current)
            current = current.Left
        }
        
        // 處理節點
        current = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, current.Val)
        
        // 轉向右子樹
        current = current.Right
    }
    return result
}
```

**應用場景**:
- **BST 排序輸出**: 中序遍歷 BST 得到有序序列
- **驗證 BST**: 檢查中序遍歷是否遞增
- **找第 K 小元素**: 中序遍歷第 K 個

#### 後序遍歷 (Postorder)

**順序**: 左 → 右 → 根

**遞迴實現**
```go
func postorderTraversal(root *TreeNode) []int {
    result := []int{}
    var postorder func(*TreeNode)
    postorder = func(node *TreeNode) {
        if node == nil {
            return
        }
        postorder(node.Left)               // 左
        postorder(node.Right)              // 右
        result = append(result, node.Val)  // 根
    }
    postorder(root)
    return result
}
```

**迭代實現**
```go
func postorderTraversal(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    
    result := []int{}
    stack := []*TreeNode{root}
    
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append([]int{node.Val}, result...)  // 插入到前面
        
        // 先壓左，再壓右
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
    }
    return result
}
```

**應用場景**:
- **刪除樹**: 先刪除子節點，再刪除父節點
- **計算樹的屬性**: 高度、深度等（需先知道子樹資訊）
- **後綴表達式**: 先計算子樹，再計算根

### 2. 廣度優先遍歷 (BFS)

#### 層序遍歷 (Level Order)

**實現（用佇列）**
```go
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return [][]int{}
    }
    
    result := [][]int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)
        level := []int{}
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}
```

**應用場景**:
- **最短路徑**: 在無權樹中找最短路徑
- **分層處理**: 按層級處理節點（如組織架構）
- **完全二元樹檢查**: 判斷是否為完全二元樹

### 3. 經典應用題

#### Q1: 二元樹的最大深度

```go
func maxDepth(root *TreeNode) int {
    if root == nil {
        return 0
    }
    return max(maxDepth(root.Left), maxDepth(root.Right)) + 1
}
```

#### Q2: 對稱二元樹

```go
func isSymmetric(root *TreeNode) bool {
    if root == nil {
        return true
    }
    return isMirror(root.Left, root.Right)
}

func isMirror(left, right *TreeNode) bool {
    if left == nil && right == nil {
        return true
    }
    if left == nil || right == nil {
        return false
    }
    return left.Val == right.Val &&
           isMirror(left.Left, right.Right) &&
           isMirror(left.Right, right.Left)
}
```

#### Q3: 路徑總和

```go
func hasPathSum(root *TreeNode, targetSum int) bool {
    if root == nil {
        return false
    }
    // 葉節點
    if root.Left == nil && root.Right == nil {
        return root.Val == targetSum
    }
    return hasPathSum(root.Left, targetSum-root.Val) ||
           hasPathSum(root.Right, targetSum-root.Val)
}
```

#### Q4: 從中序與前序構造二元樹

```go
func buildTree(preorder []int, inorder []int) *TreeNode {
    if len(preorder) == 0 {
        return nil
    }
    
    root := &TreeNode{Val: preorder[0]}
    
    // 在中序中找根節點位置
    idx := 0
    for i, v := range inorder {
        if v == root.Val {
            idx = i
            break
        }
    }
    
    // 遞迴建立左右子樹
    root.Left = buildTree(preorder[1:idx+1], inorder[:idx])
    root.Right = buildTree(preorder[idx+1:], inorder[idx+1:])
    
    return root
}
```

#### Q5: 二元樹的右視圖

```go
func rightSideView(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    
    result := []int{}
    queue := []*TreeNode{root}
    
    for len(queue) > 0 {
        levelSize := len(queue)
        
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            
            // 每層最後一個節點
            if i == levelSize-1 {
                result = append(result, node.Val)
            }
            
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
    }
    return result
}
```

### 4. Morris 遍歷（O(1) 空間）

#### 核心思想

利用葉節點的空指標建立臨時連結，避免使用堆疊或遞迴。

**Morris 中序遍歷**
```go
func morrisInorder(root *TreeNode) []int {
    result := []int{}
    current := root
    
    for current != nil {
        if current.Left == nil {
            result = append(result, current.Val)
            current = current.Right
        } else {
            // 找到左子樹的最右節點
            predecessor := current.Left
            for predecessor.Right != nil && predecessor.Right != current {
                predecessor = predecessor.Right
            }
            
            if predecessor.Right == nil {
                // 建立臨時連結
                predecessor.Right = current
                current = current.Left
            } else {
                // 恢復樹結構
                predecessor.Right = nil
                result = append(result, current.Val)
                current = current.Right
            }
        }
    }
    return result
}
```

### 5. 實際應用場景

#### 檔案系統遍歷

```go
type FileNode struct {
    Name     string
    IsDir    bool
    Children []*FileNode
}

// 前序遍歷：先列出目錄，再列出內容
func listFiles(root *FileNode) {
    if root == nil {
        return
    }
    fmt.Println(root.Name)
    for _, child := range root.Children {
        listFiles(child)
    }
}
```

#### 組織架構查詢

```go
type Employee struct {
    ID          int
    Name        string
    Subordinates []*Employee
}

// 層序遍歷：按層級輸出組織架構
func printOrganization(ceo *Employee) {
    queue := []*Employee{ceo}
    level := 0
    
    for len(queue) > 0 {
        levelSize := len(queue)
        fmt.Printf("Level %d: ", level)
        
        for i := 0; i < levelSize; i++ {
            emp := queue[0]
            queue = queue[1:]
            fmt.Printf("%s ", emp.Name)
            
            queue = append(queue, emp.Subordinates...)
        }
        fmt.Println()
        level++
    }
}
```

#### JSON 序列化與反序列化

```go
// 前序遍歷序列化
func serialize(root *TreeNode) string {
    if root == nil {
        return "null"
    }
    return fmt.Sprintf("%d,%s,%s", 
        root.Val, 
        serialize(root.Left), 
        serialize(root.Right))
}

// 前序反序列化
func deserialize(data string) *TreeNode {
    nodes := strings.Split(data, ",")
    index := 0
    
    var build func() *TreeNode
    build = func() *TreeNode {
        if index >= len(nodes) || nodes[index] == "null" {
            index++
            return nil
        }
        val, _ := strconv.Atoi(nodes[index])
        index++
        node := &TreeNode{Val: val}
        node.Left = build()
        node.Right = build()
        return node
    }
    
    return build()
}
```

### 6. 時間與空間複雜度

| 遍歷方式 | 時間複雜度 | 空間複雜度（遞迴） | 空間複雜度（迭代） |
|---------|-----------|------------------|------------------|
| **前序** | O(n) | O(h) | O(h) |
| **中序** | O(n) | O(h) | O(h) |
| **後序** | O(n) | O(h) | O(h) |
| **層序** | O(n) | O(w) | O(w) |
| **Morris** | O(n) | O(1) | O(1) |

- h: 樹高度，最壞 O(n)（鏈狀樹），平衡樹 O(log n)
- w: 樹寬度，最壞 O(n)（完全二元樹最底層）

## 總結

### 核心要點

1. **前序遍歷**: 根→左→右，用於複製樹、序列化
2. **中序遍歷**: 左→根→右，BST 中得到有序序列
3. **後序遍歷**: 左→右→根，用於刪除樹、計算屬性
4. **層序遍歷**: BFS，用於最短路徑、分層處理
5. **Morris 遍歷**: O(1) 空間，但會臨時修改樹結構

### 作為資深後端工程師，你需要

- ✅ 熟練掌握四種遍歷的遞迴和迭代實現
- ✅ 理解不同遍歷方式的應用場景
- ✅ 能夠根據前序+中序或後序+中序重建二元樹
- ✅ 在檔案系統、組織架構等實際場景中應用樹遍歷
- ✅ 了解 Morris 遍歷的 O(1) 空間優化
