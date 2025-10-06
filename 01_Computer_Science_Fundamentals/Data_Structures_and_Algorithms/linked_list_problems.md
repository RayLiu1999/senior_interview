# 鏈結串列經典問題

- **難度**: 5
- **重要程度**: 5
- **標籤**: `鏈結串列`, `快慢指針`, `反轉`, `環檢測`, `LeetCode 高頻`

## 問題詳述

鏈結串列是面試中最常考的資料結構之一，涉及指針操作、邊界處理、空間優化等多個考點。本文總結鏈結串列的**經典題型**和**解題套路**。

## 核心理論與詳解

### 1. 鏈結串列基礎

#### 節點定義

```go
// 單向鏈結串列節點
type ListNode struct {
    Val  int
    Next *ListNode
}

// 雙向鏈結串列節點
type DoubleListNode struct {
    Val  int
    Prev *DoubleListNode
    Next *DoubleListNode
}
```

#### 基本操作時間複雜度

| 操作 | 陣列 | 鏈結串列 |
|-----|------|---------|
| **隨機訪問** | O(1) | O(n) |
| **插入（頭部）** | O(n) | O(1) |
| **插入（尾部）** | O(1) | O(n) 或 O(1)* |
| **刪除（已知位置）** | O(n) | O(1) |
| **搜尋** | O(n) | O(n) |

*需要維護尾指針

### 2. 題型一：反轉鏈結串列

#### 迭代法反轉（LeetCode 206）

```go
// 反轉整個鏈結串列
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    
    for curr != nil {
        // 保存下一個節點
        next := curr.Next
        // 反轉當前節點
        curr.Next = prev
        // 移動指針
        prev = curr
        curr = next
    }
    
    return prev
}
```

**圖解**:
```
原始: 1 → 2 → 3 → 4 → nil

步驟 1: nil ← 1   2 → 3 → 4 → nil
步驟 2: nil ← 1 ← 2   3 → 4 → nil
步驟 3: nil ← 1 ← 2 ← 3   4 → nil
步驟 4: nil ← 1 ← 2 ← 3 ← 4
```

#### 遞迴法反轉

```go
func reverseListRecursive(head *ListNode) *ListNode {
    // 基礎情況
    if head == nil || head.Next == nil {
        return head
    }
    
    // 遞迴反轉後面的節點
    newHead := reverseListRecursive(head.Next)
    
    // 反轉當前節點
    head.Next.Next = head
    head.Next = nil
    
    return newHead
}
```

#### 反轉部分鏈結串列（LeetCode 92）

```go
// 反轉從位置 left 到 right 的節點
func reverseBetween(head *ListNode, left int, right int) *ListNode {
    if head == nil || left == right {
        return head
    }
    
    // 虛擬頭節點
    dummy := &ListNode{Next: head}
    prev := dummy
    
    // 找到 left 前一個節點
    for i := 1; i < left; i++ {
        prev = prev.Next
    }
    
    // 反轉 left 到 right 之間的節點
    curr := prev.Next
    for i := left; i < right; i++ {
        next := curr.Next
        curr.Next = next.Next
        next.Next = prev.Next
        prev.Next = next
    }
    
    return dummy.Next
}
```

### 3. 題型二：環檢測

#### 環檢測（LeetCode 141）

**快慢指針法**:
```go
func hasCycle(head *ListNode) bool {
    if head == nil || head.Next == nil {
        return false
    }
    
    slow := head
    fast := head
    
    for fast != nil && fast.Next != nil {
        slow = slow.Next       // 慢指針走一步
        fast = fast.Next.Next  // 快指針走兩步
        
        if slow == fast {
            return true  // 相遇，有環
        }
    }
    
    return false  // 快指針到達末尾，無環
}
```

**原理**:
```
有環情況:
1 → 2 → 3 → 4 → 5
        ↑       ↓
        8 ← 7 ← 6

快慢指針最終會在環內相遇
```

#### 找環的起點（LeetCode 142）

```go
func detectCycle(head *ListNode) *ListNode {
    if head == nil || head.Next == nil {
        return nil
    }
    
    // 第一步：快慢指針找到相遇點
    slow := head
    fast := head
    hasCycle := false
    
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        
        if slow == fast {
            hasCycle = true
            break
        }
    }
    
    if !hasCycle {
        return nil
    }
    
    // 第二步：找環的起點
    // 一個指針從頭開始，一個從相遇點開始
    // 兩者以相同速度前進，相遇點即為環起點
    ptr1 := head
    ptr2 := slow
    
    for ptr1 != ptr2 {
        ptr1 = ptr1.Next
        ptr2 = ptr2.Next
    }
    
    return ptr1
}
```

**數學原理**:
```
設:
- 頭到環起點距離: a
- 環起點到相遇點距離: b
- 相遇點到環起點距離: c

快指針走的距離: a + b + c + b = a + 2b + c
慢指針走的距離: a + b

快指針速度是慢指針的 2 倍:
2(a + b) = a + 2b + c
2a + 2b = a + 2b + c
a = c

因此，從頭和相遇點同時出發，會在環起點相遇
```

### 4. 題型三：合併鏈結串列

#### 合併兩個有序鏈結串列（LeetCode 21）

```go
func mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    
    for l1 != nil && l2 != nil {
        if l1.Val < l2.Val {
            curr.Next = l1
            l1 = l1.Next
        } else {
            curr.Next = l2
            l2 = l2.Next
        }
        curr = curr.Next
    }
    
    // 連接剩餘節點
    if l1 != nil {
        curr.Next = l1
    }
    if l2 != nil {
        curr.Next = l2
    }
    
    return dummy.Next
}
```

#### 合併 K 個有序鏈結串列（LeetCode 23）

**方法一：優先佇列（最小堆）**

```go
import "container/heap"

type MinHeap []*ListNode

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i].Val < h[j].Val }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(*ListNode)) }
func (h *MinHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &MinHeap{}
    heap.Init(h)
    
    // 將每個鏈結串列的頭節點加入堆
    for _, list := range lists {
        if list != nil {
            heap.Push(h, list)
        }
    }
    
    dummy := &ListNode{}
    curr := dummy
    
    for h.Len() > 0 {
        // 取出最小節點
        node := heap.Pop(h).(*ListNode)
        curr.Next = node
        curr = curr.Next
        
        // 如果還有後續節點，加入堆
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    
    return dummy.Next
}
```

**時間複雜度**: O(N log K)
- N: 所有節點總數
- K: 鏈結串列數量

### 5. 題型四：刪除節點

#### 刪除倒數第 N 個節點（LeetCode 19）

**雙指針法**:
```go
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    first := dummy
    second := dummy
    
    // first 先走 n+1 步
    for i := 0; i <= n; i++ {
        first = first.Next
    }
    
    // first 和 second 一起走，直到 first 到達末尾
    for first != nil {
        first = first.Next
        second = second.Next
    }
    
    // second.Next 就是要刪除的節點
    second.Next = second.Next.Next
    
    return dummy.Next
}
```

**圖解**:
```
刪除倒數第 2 個節點 (n=2):

1 → 2 → 3 → 4 → 5 → nil

Step 1: first 先走 3 步 (n+1)
dummy → 1 → 2 → 3 → 4 → 5 → nil
↑             ↑
second        first

Step 2: 一起走到 first 到達 nil
dummy → 1 → 2 → 3 → 4 → 5 → nil
              ↑             ↑
            second        first

Step 3: 刪除 second.Next (即 4)
dummy → 1 → 2 → 3 → 5 → nil
```

#### 刪除重複元素（LeetCode 83）

```go
func deleteDuplicates(head *ListNode) *ListNode {
    if head == nil {
        return nil
    }
    
    curr := head
    
    for curr != nil && curr.Next != nil {
        if curr.Val == curr.Next.Val {
            // 刪除重複節點
            curr.Next = curr.Next.Next
        } else {
            curr = curr.Next
        }
    }
    
    return head
}
```

### 6. 題型五：尋找中間節點

#### 快慢指針找中間節點（LeetCode 876）

```go
func middleNode(head *ListNode) *ListNode {
    slow := head
    fast := head
    
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    
    // 奇數個節點: slow 指向中間
    // 偶數個節點: slow 指向中間偏右
    return slow
}
```

**圖解**:
```
奇數個節點 (5 個):
1 → 2 → 3 → 4 → 5 → nil
        ↑
      中間節點

偶數個節點 (4 個):
1 → 2 → 3 → 4 → nil
        ↑
    中間偏右
```

### 7. 題型六：回文鏈結串列

#### 判斷回文（LeetCode 234）

```go
func isPalindrome(head *ListNode) bool {
    if head == nil || head.Next == nil {
        return true
    }
    
    // 1. 找到中間節點
    slow := head
    fast := head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    
    // 2. 反轉後半部分
    var prev *ListNode
    curr := slow
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    
    // 3. 比較前半部分和反轉後的後半部分
    left := head
    right := prev
    for right != nil {
        if left.Val != right.Val {
            return false
        }
        left = left.Next
        right = right.Next
    }
    
    return true
}
```

### 8. 題型七：重排鏈結串列

#### 重排鏈結串列（LeetCode 143）

將 L0 → L1 → L2 → ... → Ln-1 → Ln 重排為:
L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ...

```go
func reorderList(head *ListNode) {
    if head == nil || head.Next == nil {
        return
    }
    
    // 1. 找到中間節點
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    
    // 2. 反轉後半部分
    var prev *ListNode
    curr := slow.Next
    slow.Next = nil  // 斷開前後兩部分
    
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    
    // 3. 合併兩部分
    first := head
    second := prev
    
    for second != nil {
        nextFirst := first.Next
        nextSecond := second.Next
        
        first.Next = second
        second.Next = nextFirst
        
        first = nextFirst
        second = nextSecond
    }
}
```

### 9. 常用技巧總結

#### 虛擬頭節點（Dummy Head）

**用途**: 簡化邊界條件處理

```go
dummy := &ListNode{Next: head}
// 操作完成後返回 dummy.Next
```

**適用場景**:
- 可能刪除頭節點
- 需要在頭部插入節點
- 合併鏈結串列

#### 快慢指針

**用途**: 找中間節點、環檢測

```go
slow := head
fast := head

for fast != nil && fast.Next != nil {
    slow = slow.Next
    fast = fast.Next.Next
}
```

#### 雙指針（前後指針）

**用途**: 刪除倒數第 N 個節點

```go
first := dummy
second := dummy

// first 先走 n+1 步
for i := 0; i <= n; i++ {
    first = first.Next
}

// 一起走
for first != nil {
    first = first.Next
    second = second.Next
}
```

### 10. 邊界條件檢查清單

在實現鏈結串列算法時，務必檢查：

- [ ] 空鏈結串列 (`head == nil`)
- [ ] 單節點鏈結串列 (`head.Next == nil`)
- [ ] 兩節點鏈結串列
- [ ] 循環鏈結串列
- [ ] 需要修改頭節點的情況

### 11. LeetCode 高頻題目列表

| 難度 | 題號 | 題目 | 考點 |
|-----|------|------|------|
| Easy | 206 | 反轉鏈結串列 | 迭代/遞迴 |
| Easy | 21 | 合併兩個有序鏈結串列 | 雙指針 |
| Easy | 141 | 環形鏈結串列 | 快慢指針 |
| Easy | 83 | 刪除排序鏈結串列中的重複元素 | 遍歷 |
| Easy | 876 | 鏈結串列的中間節點 | 快慢指針 |
| Medium | 92 | 反轉鏈結串列 II | 部分反轉 |
| Medium | 142 | 環形鏈結串列 II | 數學推導 |
| Medium | 19 | 刪除鏈結串列的倒數第 N 個節點 | 雙指針 |
| Medium | 234 | 回文鏈結串列 | 快慢指針+反轉 |
| Medium | 143 | 重排鏈結串列 | 綜合 |
| Hard | 23 | 合併 K 個升序鏈結串列 | 優先佇列 |
| Hard | 25 | K 個一組反轉鏈結串列 | 分組反轉 |

## 總結

鏈結串列是面試高頻題型，掌握以下要點：

1. **基本操作**: 插入、刪除、遍歷
2. **核心技巧**: 虛擬頭節點、快慢指針、雙指針
3. **經典題型**: 反轉、環檢測、合併、刪除
4. **邊界處理**: 空鏈結串列、單節點、修改頭節點

作為資深後端工程師，你需要：
- 能夠快速實現各種鏈結串列操作
- 熟練運用快慢指針等技巧
- 注意邊界條件和空指針檢查
- 理解時間空間複雜度的權衡
- 能夠將鏈結串列技巧應用到實際系統中（如 LRU 快取）
