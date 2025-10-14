# Java 集合框架深入解析

- **難度**: 8
- **重要程度**: 5
- **標籤**: `Collections`, `Data Structures`, `HashMap`, `ArrayList`

## 問題詳述

Java 集合框架是 Java 開發的基礎，請深入解釋 ArrayList、HashMap、ConcurrentHashMap 等核心集合的實現原理、性能特徵和使用場景。

## 核心理論與詳解

### 集合框架概覽

#### 集合框架層次結構

```
Collection (interface)
├── List (interface)
│   ├── ArrayList (動態陣列)
│   ├── LinkedList (雙向鏈表)
│   └── Vector (線程安全，已過時)
├── Set (interface)
│   ├── HashSet (基於 HashMap)
│   ├── LinkedHashSet (保序 HashSet)
│   └── TreeSet (基於 TreeMap)
└── Queue (interface)
    ├── PriorityQueue (堆實現)
    ├── ArrayDeque (雙端隊列)
    └── LinkedList (也實現 Queue)

Map (interface，不繼承 Collection)
├── HashMap (哈希表)
├── LinkedHashMap (保序 HashMap)
├── TreeMap (紅黑樹)
├── Hashtable (線程安全，已過時)
└── ConcurrentHashMap (並發 HashMap)
```

### ArrayList 實現原理

#### 核心特性

**底層結構**：動態陣列（Object[]）

**關鍵屬性**：
```java
// 存儲元素的陣列
transient Object[] elementData;

// 當前元素數量
private int size;

// 默認初始容量
private static final int DEFAULT_CAPACITY = 10;
```

#### 擴容機制

**擴容時機**：當 `size == elementData.length` 時需要擴容

**擴容策略**：
1. 計算新容量：`newCapacity = oldCapacity + (oldCapacity >> 1)`（1.5 倍）
2. 檢查新容量是否足夠
3. 使用 `Arrays.copyOf()` 複製到新陣列

**擴容代碼邏輯**：
```java
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    // 新容量 = 舊容量 * 1.5
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    
    if (newCapacity < minCapacity) {
        newCapacity = minCapacity;
    }
    
    // 複製到新陣列
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

#### 性能分析

**時間複雜度**：
- **隨機訪問**：O(1) - 直接通過索引訪問
- **尾部添加**：O(1) 攤銷 - 不需要擴容時 O(1)，擴容時 O(n)
- **指定位置插入**：O(n) - 需要移動元素
- **刪除**：O(n) - 需要移動元素
- **查找**：O(n) - 需要遍歷

**空間複雜度**：O(n)

**適用場景**：
- 需要頻繁隨機訪問
- 主要在尾部操作
- 讀多寫少

### HashMap 實現原理

#### 核心結構（Java 8+）

**底層結構**：陣列 + 鏈表 + 紅黑樹

**關鍵屬性**：
```java
// 存儲桶的陣列
transient Node<K,V>[] table;

// 當前元素數量
transient int size;

// 擴容閾值 = capacity * loadFactor
int threshold;

// 負載因子（默認 0.75）
final float loadFactor;

// 樹化閾值（鏈表長度超過 8 轉紅黑樹）
static final int TREEIFY_THRESHOLD = 8;

// 樹降級閾值（紅黑樹節點少於 6 轉鏈表）
static final int UNTREEIFY_THRESHOLD = 6;
```

**Node 結構**：
```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;      // 哈希值
    final K key;         // 鍵
    V value;             // 值
    Node<K,V> next;      // 下一個節點（鏈表）
}
```

#### 哈希計算

**hash() 方法**：
```java
static final int hash(Object key) {
    int h;
    // key 的 hashCode 與其高 16 位異或
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**為什麼要異或高 16 位**：
- 減少哈希碰撞
- 讓高位也參與索引計算
- 當陣列長度較小時，保留更多哈希信息

**索引計算**：
```java
// index = hash & (n - 1)
// n 是陣列長度，必須是 2 的冪
int index = (n - 1) & hash;
```

**為什麼陣列長度必須是 2 的冪**：
- `hash & (n - 1)` 等價於 `hash % n`，但位運算更快
- 保證索引均勻分佈
- 擴容時只需判斷一位（新增的高位）

#### put 操作流程

1. **計算哈希值**：`hash = hash(key)`
2. **計算索引**：`index = (n - 1) & hash`
3. **檢查桶位置**：
   - 如果為空，直接放入
   - 如果不為空，處理碰撞
4. **處理碰撞**：
   - 如果是鏈表，遍歷鏈表
     - 找到相同 key，更新 value
     - 未找到，插入鏈表尾部
     - 鏈表長度 ≥ 8，嘗試樹化
   - 如果是紅黑樹，插入紅黑樹
5. **檢查是否需要擴容**：`size > threshold`

#### 擴容機制

**擴容時機**：`size > threshold`（threshold = capacity * loadFactor）

**擴容過程**：
1. 創建新陣列，容量翻倍
2. 重新計算所有元素的位置
3. 將元素遷移到新陣列

**優化策略（Java 8）**：
- 不需要重新計算 hash
- 只需判斷 hash 的新增位是 0 還是 1
- 0：位置不變
- 1：位置 = 原位置 + 舊容量

```java
// 擴容後的位置計算
if ((e.hash & oldCap) == 0) {
    // 位置不變
    newTab[j] = loHead;
} else {
    // 位置 = j + oldCap
    newTab[j + oldCap] = hiHead;
}
```

#### 為什麼負載因子是 0.75

**權衡空間與時間**：
- 負載因子過小：浪費空間，但碰撞少
- 負載因子過大：節省空間，但碰撞多
- 0.75 是經過泊松分佈計算的最優值

**泊松分佈結論**：
- 當負載因子為 0.75 時
- 鏈表長度超過 8 的概率約為 0.00000006
- 這是空間和時間的最佳平衡點

#### 紅黑樹優化

**為什麼引入紅黑樹**：
- 哈希碰撞嚴重時，鏈表過長
- 查找性能從 O(n) 降低到 O(log n)

**樹化條件**：
1. 鏈表長度 ≥ 8
2. 陣列長度 ≥ 64（否則先擴容）

**降級條件**：
- 紅黑樹節點數 ≤ 6（擴容或刪除時）

### ConcurrentHashMap 實現原理

#### Java 7 vs Java 8

**Java 7 實現**：Segment 分段鎖
- 將 HashMap 分為 16 個 Segment
- 每個 Segment 是一個小 HashMap
- 鎖粒度：Segment 級別

**Java 8 實現**：CAS + synchronized
- 取消 Segment，與 HashMap 結構相同
- 使用 CAS 操作桶頭節點
- 鎖粒度：桶級別（更細）

#### Java 8 實現詳解

**put 操作**：
```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    int hash = spread(key.hashCode());
    
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        
        // 如果桶為空，使用 CAS 插入
        if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
                break;  // CAS 成功，退出
        }
        // 如果正在擴容，幫助擴容
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        // 否則鎖住桶頭節點
        else {
            synchronized (f) {
                // 插入鏈表或紅黑樹
            }
        }
    }
}
```

**並發安全保證**：
1. **桶為空**：使用 CAS 操作
2. **桶不為空**：鎖住桶頭節點
3. **擴容中**：幫助擴容

**size 計算**：
- 使用 `baseCount` + `counterCells[]`
- 降低競爭，提高並發度

### LinkedHashMap 特性

**核心特性**：維護插入順序或訪問順序

**實現方式**：
- 繼承 HashMap
- 額外維護雙向鏈表

**應用場景**：
- 需要保持插入順序
- 實現 LRU 緩存（accessOrder = true）

**LRU 實現**：
```java
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // accessOrder = true
        this.capacity = capacity;
    }
    
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;  // 超過容量時移除最老的
    }
}
```

### TreeMap 實現

**底層結構**：紅黑樹

**特性**：
- 鍵有序（自然順序或自定義 Comparator）
- 操作時間複雜度 O(log n)

**適用場景**：
- 需要有序的 Map
- 需要範圍查詢

### 集合選擇指南

#### List 選擇

| 場景 | 推薦 | 原因 |
|------|------|------|
| 隨機訪問多 | ArrayList | O(1) 訪問 |
| 頭尾操作多 | LinkedList | O(1) 頭尾插入 |
| 線程安全 | CopyOnWriteArrayList | 讀多寫少場景 |

#### Set 選擇

| 場景 | 推薦 | 原因 |
|------|------|------|
| 無序，快速查找 | HashSet | O(1) 操作 |
| 有序 | TreeSet | 紅黑樹自動排序 |
| 保持插入順序 | LinkedHashSet | 雙向鏈表 |

#### Map 選擇

| 場景 | 推薦 | 原因 |
|------|------|------|
| 一般用途 | HashMap | 性能最好 |
| 需要有序 | TreeMap | 紅黑樹排序 |
| 保持插入順序 | LinkedHashMap | 雙向鏈表 |
| 線程安全 | ConcurrentHashMap | 高並發性能好 |
| LRU 緩存 | LinkedHashMap | accessOrder 模式 |

### 性能對比

| 集合 | get | add | contains | remove | 特點 |
|------|-----|-----|----------|--------|------|
| ArrayList | O(1) | O(1)* | O(n) | O(n) | 隨機訪問快 |
| LinkedList | O(n) | O(1) | O(n) | O(1)* | 頭尾操作快 |
| HashMap | O(1) | O(1) | O(1) | O(1) | 哈希表 |
| TreeMap | O(log n) | O(log n) | O(log n) | O(log n) | 有序 |
| HashSet | - | O(1) | O(1) | O(1) | 基於 HashMap |
| TreeSet | - | O(log n) | O(log n) | O(log n) | 基於 TreeMap |

*攤銷時間複雜度

### 最佳實踐

**容量設置**：
```java
// 已知大小，設置初始容量
int expectedSize = 1000;
Map<K, V> map = new HashMap<>((int) (expectedSize / 0.75) + 1);
```

**線程安全**：
```java
// 使用 ConcurrentHashMap 而非 Hashtable
Map<K, V> map = new ConcurrentHashMap<>();

// 或使用同步包裝
Map<K, V> syncMap = Collections.synchronizedMap(new HashMap<>());
```

**遍歷優化**：
```java
// 推薦：使用 entrySet
for (Map.Entry<K, V> entry : map.entrySet()) {
    K key = entry.getKey();
    V value = entry.getValue();
}

// 不推薦：使用 keySet（需要兩次查找）
for (K key : map.keySet()) {
    V value = map.get(key);  // 額外的查找操作
}
```

**fail-fast 機制**：
```java
// 遍歷時不要直接修改集合
List<String> list = new ArrayList<>();
for (String item : list) {
    list.remove(item);  // ConcurrentModificationException
}

// 使用迭代器的 remove 方法
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String item = it.next();
    if (condition) {
        it.remove();  // 正確做法
    }
}
```

## 總結

Java 集合框架是 Java 開發的基礎，理解其實現原理對於編寫高效代碼至關重要。ArrayList 基於動態陣列，適合隨機訪問；HashMap 基於哈希表和紅黑樹，提供 O(1) 操作；ConcurrentHashMap 使用 CAS 和細粒度鎖，實現高並發。選擇合適的集合類型，設置合理的初始容量，注意線程安全，可以顯著提升應用性能。深入理解 HashMap 的哈希計算、擴容機制和紅黑樹優化，是資深 Java 工程師的必備技能。
