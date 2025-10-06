# 位運算技巧與應用

- **難度**: 5
- **重要程度**: 4
- **標籤**: `位運算`, `權限管理`, `狀態壓縮`

## 問題詳述

位運算是對整數的二進制表示進行操作的技巧,具有執行速度快、記憶體佔用少的優點。在後端開發中,位運算廣泛應用於權限管理、狀態標記、加密算法等場景。

## 核心理論與詳解

### 1. 基本位運算符

| 運算符 | 名稱 | 說明 | 範例 |
|--------|------|------|------|
| `&` | AND (與) | 兩位都為 1 時結果為 1 | `5 & 3 = 1` (0101 & 0011 = 0001) |
| `\|` | OR (或) | 任一位為 1 時結果為 1 | `5 \| 3 = 7` (0101 \| 0011 = 0111) |
| `^` | XOR (互斥或) | 兩位不同時結果為 1 | `5 ^ 3 = 6` (0101 ^ 0011 = 0110) |
| `~` | NOT (取反) | 按位取反 | `~5 = -6` (~0101 = 1010) |
| `<<` | 左移 | 向左移動 n 位 | `5 << 1 = 10` (0101 << 1 = 1010) |
| `>>` | 右移 | 向右移動 n 位 | `5 >> 1 = 2` (0101 >> 1 = 0010) |

### 2. 常用位運算技巧

#### 技巧一: 判斷奇偶數

```go
// 判斷是否為偶數
func isEven(n int) bool {
    return n & 1 == 0
}

// 判斷是否為奇數
func isOdd(n int) bool {
    return n & 1 == 1
}
```

**原理**: 奇數的二進制最低位為 1,偶數為 0

#### 技巧二: 交換兩個數

```go
// 不使用臨時變數交換
func swap(a, b int) (int, int) {
    a = a ^ b
    b = a ^ b  // b = a ^ b ^ b = a
    a = a ^ b  // a = a ^ b ^ a = b
    return a, b
}
```

**原理**: `x ^ x = 0`, `x ^ 0 = x`

#### 技巧三: 判斷二進制中 1 的個數

```go
// 方法一: 逐位檢查
func hammingWeight1(n int) int {
    count := 0
    for n != 0 {
        count += n & 1
        n >>= 1
    }
    return count
}

// 方法二: n & (n-1) 消除最右邊的 1
func hammingWeight2(n int) int {
    count := 0
    for n != 0 {
        n = n & (n - 1)  // 消除最右邊的 1
        count++
    }
    return count
}
```

**範例**:
```
n = 12 (1100)
n-1 = 11 (1011)
n & (n-1) = 8 (1000)  // 消除了最右邊的 1
```

#### 技巧四: 判斷是否為 2 的冪

```go
func isPowerOfTwo(n int) bool {
    return n > 0 && (n & (n - 1)) == 0
}
```

**原理**: 2 的冪的二進制只有一個 1
- `4: 0100`
- `8: 1000`
- `16: 10000`

#### 技巧五: 獲取/設置/清除第 n 位

```go
// 獲取第 n 位
func getBit(num, n int) int {
    return (num >> n) & 1
}

// 設置第 n 位為 1
func setBit(num, n int) int {
    return num | (1 << n)
}

// 清除第 n 位 (設為 0)
func clearBit(num, n int) int {
    return num & ^(1 << n)
}

// 切換第 n 位
func toggleBit(num, n int) int {
    return num ^ (1 << n)
}
```

#### 技巧六: 獲取最低位的 1

```go
// 獲取最低位的 1
func getLowestBit(n int) int {
    return n & (-n)
}
```

**範例**:
```
n = 12 (1100)
-n = -12 (補碼: ...11110100)
n & (-n) = 4 (0100)  // 最低位的 1
```

#### 技巧七: 消除最低位的 1

```go
func removeLowestBit(n int) int {
    return n & (n - 1)
}
```

### 3. 經典位運算問題

#### 問題一: 只出現一次的數字

**LeetCode 136. Single Number**

陣列中每個數字都出現兩次,只有一個出現一次,找出它。

```go
func singleNumber(nums []int) int {
    result := 0
    for _, num := range nums {
        result ^= num  // 相同的數字 XOR 會抵銷
    }
    return result
}
```

**原理**: `a ^ a = 0`, `a ^ 0 = a`

#### 問題二: 只出現一次的數字 II

**LeetCode 137. Single Number II**

每個數字出現三次,只有一個出現一次,找出它。

```go
func singleNumber2(nums []int) int {
    ones, twos := 0, 0
    
    for _, num := range nums {
        // ones 記錄出現 1 次的位
        // twos 記錄出現 2 次的位
        ones = (ones ^ num) & ^twos
        twos = (twos ^ num) & ^ones
    }
    
    return ones
}
```

#### 問題三: 數字範圍按位 AND

**LeetCode 201. Bitwise AND of Numbers Range**

```go
func rangeBitwiseAnd(left, right int) int {
    shift := 0
    
    // 找到公共前綴
    for left < right {
        left >>= 1
        right >>= 1
        shift++
    }
    
    return left << shift
}
```

**原理**: 範圍內的 AND 結果就是公共前綴

#### 問題四: 格雷碼

**LeetCode 89. Gray Code**

```go
func grayCode(n int) []int {
    result := make([]int, 1 << n)
    for i := 0; i < 1 << n; i++ {
        result[i] = i ^ (i >> 1)
    }
    return result
}
```

#### 問題五: 重複的 DNA 序列

**LeetCode 187. Repeated DNA Sequences**

使用位運算編碼 DNA 序列。

```go
func findRepeatedDnaSequences(s string) []string {
    if len(s) <= 10 {
        return []string{}
    }
    
    // A:00, C:01, G:10, T:11
    charToInt := map[byte]int{'A': 0, 'C': 1, 'G': 2, 'T': 3}
    
    seen := make(map[int]int)
    result := []string{}
    hash := 0
    
    for i := 0; i < len(s); i++ {
        // 編碼當前字元
        hash = (hash << 2) | charToInt[s[i]]
        
        if i >= 9 {
            // 保留 20 位 (10 個字元 * 2 位)
            hash &= (1 << 20) - 1
            
            seen[hash]++
            if seen[hash] == 2 {
                result = append(result, s[i-9:i+1])
            }
        }
    }
    
    return result
}
```

### 4. 位運算進階技巧

#### 技巧一: 狀態壓縮

使用一個整數的每一位表示一個狀態。

```go
// 旅行商問題 (TSP) 的狀態壓縮 DP
func tsp(graph [][]int) int {
    n := len(graph)
    dp := make([][]int, 1 << n)
    for i := range dp {
        dp[i] = make([]int, n)
        for j := range dp[i] {
            dp[i][j] = math.MaxInt32
        }
    }
    
    dp[1][0] = 0  // 初始狀態: 只訪問起點
    
    for state := 1; state < (1 << n); state++ {
        for last := 0; last < n; last++ {
            if (state & (1 << last)) == 0 {
                continue  // last 不在當前狀態中
            }
            
            prevState := state ^ (1 << last)
            
            for prev := 0; prev < n; prev++ {
                if (prevState & (1 << prev)) != 0 {
                    dp[state][last] = min(dp[state][last], 
                        dp[prevState][prev] + graph[prev][last])
                }
            }
        }
    }
    
    // 找到最小值
    result := math.MaxInt32
    fullState := (1 << n) - 1
    for i := 0; i < n; i++ {
        result = min(result, dp[fullState][i] + graph[i][0])
    }
    
    return result
}
```

#### 技巧二: 枚舉子集

枚舉一個集合的所有子集。

```go
// 枚舉 state 的所有子集
func enumerateSubsets(state int) []int {
    subsets := []int{}
    
    for subset := state; subset > 0; subset = (subset - 1) & state {
        subsets = append(subsets, subset)
    }
    subsets = append(subsets, 0)  // 空集
    
    return subsets
}
```

### 5. 位掩碼 (Bitmask) 技巧

```go
// 檢查第 i 位是否為 1
func hasBit(mask, i int) bool {
    return mask & (1 << i) != 0
}

// 設置第 i 位為 1
func setBit(mask, i int) int {
    return mask | (1 << i)
}

// 清除第 i 位
func clearBit(mask, i int) int {
    return mask & ^(1 << i)
}

// 切換第 i 位
func toggleBit(mask, i int) int {
    return mask ^ (1 << i)
}

// 提取最低位的 1
func lowestBit(mask int) int {
    return mask & (-mask)
}

// 移除最低位的 1
func removeLowestBit(mask int) int {
    return mask & (mask - 1)
}

// 計算 1 的個數
func popCount(mask int) int {
    count := 0
    for mask > 0 {
        mask &= mask - 1
        count++
    }
    return count
}
```

## 實際應用場景

### 1. 權限管理系統

使用位運算管理使用者權限。

```go
const (
    PermRead   = 1 << 0  // 0001
    PermWrite  = 1 << 1  // 0010
    PermDelete = 1 << 2  // 0100
    PermAdmin  = 1 << 3  // 1000
)

type Permission int

// 添加權限
func (p Permission) Add(perm Permission) Permission {
    return p | perm
}

// 移除權限
func (p Permission) Remove(perm Permission) Permission {
    return p & ^perm
}

// 檢查權限
func (p Permission) Has(perm Permission) bool {
    return p & perm == perm
}

// 切換權限
func (p Permission) Toggle(perm Permission) Permission {
    return p ^ perm
}

// 使用範例
func example() {
    var userPerm Permission = 0
    
    // 賦予讀寫權限
    userPerm = userPerm.Add(PermRead | PermWrite)
    
    // 檢查權限
    canRead := userPerm.Has(PermRead)     // true
    canDelete := userPerm.Has(PermDelete) // false
    
    // 移除寫權限
    userPerm = userPerm.Remove(PermWrite)
}
```

### 2. 狀態標記

用一個整數表示多個布林狀態。

```go
type TaskStatus int

const (
    StatusPending   = 1 << 0  // 待處理
    StatusRunning   = 1 << 1  // 執行中
    StatusCompleted = 1 << 2  // 已完成
    StatusFailed    = 1 << 3  // 失敗
    StatusCanceled  = 1 << 4  // 已取消
)

type Task struct {
    ID     string
    Status TaskStatus
}

func (t *Task) SetStatus(status TaskStatus) {
    t.Status = status
}

func (t *Task) AddStatus(status TaskStatus) {
    t.Status |= status
}

func (t *Task) RemoveStatus(status TaskStatus) {
    t.Status &= ^status
}

func (t *Task) HasStatus(status TaskStatus) bool {
    return t.Status & status != 0
}
```

### 3. IP 地址處理

```go
// IP 地址轉整數
func ipToInt(ip string) uint32 {
    parts := strings.Split(ip, ".")
    var result uint32
    
    for i := 0; i < 4; i++ {
        part, _ := strconv.Atoi(parts[i])
        result = (result << 8) | uint32(part)
    }
    
    return result
}

// 整數轉 IP 地址
func intToIP(ip uint32) string {
    return fmt.Sprintf("%d.%d.%d.%d",
        (ip >> 24) & 0xFF,
        (ip >> 16) & 0xFF,
        (ip >> 8) & 0xFF,
        ip & 0xFF)
}

// 判斷 IP 是否在子網內
func isInSubnet(ip, subnet, mask uint32) bool {
    return (ip & mask) == (subnet & mask)
}
```

### 4. Bloom Filter 實現

```go
type BloomFilter struct {
    bits   []uint64
    size   int
    hashes int
}

func NewBloomFilter(size, hashes int) *BloomFilter {
    return &BloomFilter{
        bits:   make([]uint64, (size + 63) / 64),
        size:   size,
        hashes: hashes,
    }
}

func (bf *BloomFilter) Add(item string) {
    for i := 0; i < bf.hashes; i++ {
        pos := bf.hash(item, i) % bf.size
        index := pos / 64
        bit := pos % 64
        bf.bits[index] |= 1 << bit
    }
}

func (bf *BloomFilter) Contains(item string) bool {
    for i := 0; i < bf.hashes; i++ {
        pos := bf.hash(item, i) % bf.size
        index := pos / 64
        bit := pos % 64
        if bf.bits[index] & (1 << bit) == 0 {
            return false
        }
    }
    return true
}

func (bf *BloomFilter) hash(item string, seed int) int {
    // 簡化的雜湊函數
    h := seed
    for _, c := range item {
        h = h * 31 + int(c)
    }
    return h
}
```

### 5. 特徵標記系統

用於推薦系統、廣告系統等場景。

```go
type UserFeatures uint64

const (
    FeatureMale        UserFeatures = 1 << 0
    FeatureFemale      UserFeatures = 1 << 1
    FeatureAge18_25    UserFeatures = 1 << 2
    FeatureAge26_35    UserFeatures = 1 << 3
    FeatureLikeSports  UserFeatures = 1 << 4
    FeatureLikeMusic   UserFeatures = 1 << 5
    // ... 最多 64 個特徵
)

func (f UserFeatures) Has(feature UserFeatures) bool {
    return f & feature != 0
}

func (f UserFeatures) Match(target UserFeatures) int {
    // 計算匹配度 (共同特徵數)
    common := f & target
    return popCount(uint64(common))
}

func popCount(x uint64) int {
    count := 0
    for x > 0 {
        x &= x - 1
        count++
    }
    return count
}
```

## 總結

**位運算核心要點**:
1. **基本操作**: AND, OR, XOR, NOT, 左移, 右移
2. **常用技巧**: 判斷奇偶、交換、計數 1、判斷 2 的冪
3. **進階應用**: 狀態壓縮、權限管理、特徵標記
4. **性能優勢**: 速度快、記憶體佔用小
5. **適用場景**: 權限系統、標誌位、狀態機、加密算法

**重要公式**:
- `x & (x - 1)`: 消除最低位的 1
- `x & (-x)`: 獲取最低位的 1
- `x ^ x = 0`: XOR 抵銷
- `1 << n`: 2 的 n 次方

**面試高頻題目**:
- 只出現一次的數字 (LeetCode 136, 137, 260)
- 2 的冪 (LeetCode 231)
- 位元 1 的個數 (LeetCode 191)
- 顛倒二進制位 (LeetCode 190)
- 格雷碼 (LeetCode 89)

**實際應用**:
- 權限管理 (RBAC 系統)
- 狀態標記 (任務狀態、用戶標籤)
- IP 地址處理 (網絡編程)
- Bloom Filter (去重、快取)
- 特徵工程 (推薦系統)

位運算是高效編程的重要技巧,尤其在系統級編程、性能優化、算法競賽中應用廣泛。熟練掌握位運算可以寫出更高效、更簡潔的程式碼。
