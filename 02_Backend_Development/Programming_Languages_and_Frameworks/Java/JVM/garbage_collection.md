# JVM 垃圾回收機制

- **難度**: 9
- **重要程度**: 5
- **標籤**: `GC`, `Garbage Collection`, `Memory Management`

## 問題詳述

垃圾回收是 JVM 自動記憶體管理的核心機制。請深入解釋 GC 的工作原理、主要算法、分代回收策略和各種 GC 器的特點。

## 核心理論與詳解

### 為什麼需要垃圾回收

**自動記憶體管理的優勢**：
1. **避免記憶體洩漏**：自動回收無用對象
2. **簡化編程**：無需手動釋放記憶體
3. **提高安全性**：避免野指針、重複釋放等問題

**GC 要解決的問題**：
1. **哪些記憶體需要回收**？（對象存活判斷）
2. **什麼時候回收**？（GC 觸發時機）
3. **如何回收**？（GC 算法）

### 對象存活判斷

#### 引用計數法（Reference Counting）

**原理**：為每個對象維護一個引用計數器，被引用時 +1，引用失效時 -1，計數為 0 時回收。

**優點**：
- 實現簡單
- 判定效率高

**缺點**：
- 無法處理循環引用

**循環引用問題**：
```java
class Node {
    Node next;
}

Node a = new Node();
Node b = new Node();
a.next = b;
b.next = a;

a = null;
b = null;
// 兩個對象互相引用，引用計數都不為 0，無法回收
```

**JVM 不使用引用計數法**

#### 可達性分析算法（Reachability Analysis）

**原理**：從 GC Roots 開始向下搜索，搜索走過的路徑稱為引用鏈。當對象到 GC Roots 沒有任何引用鏈相連時，證明對象不可達。

**GC Roots 包括**：
1. **虛擬機棧**中引用的對象（局部變量表）
2. **方法區**中靜態屬性引用的對象
3. **方法區**中常量引用的對象
4. **本地方法棧**中 JNI 引用的對象
5. **Java 虛擬機內部的引用**（Class 對象、異常對象、類加載器）
6. **被同步鎖持有的對象**
7. **JMXBean、JVMTI 中註冊的回調、本地代碼緩存**等

**示例**：
```
GC Roots
  ├─> Object A
  │     └─> Object C
  └─> Object B
  
Object D (無引用鏈) → 可回收
```

### 引用類型

#### 強引用（Strong Reference）

```java
Object obj = new Object();  // 強引用
```
- 最常見的引用
- 只要強引用存在，GC 永不回收
- OOM 也不會回收

#### 軟引用（Soft Reference）

```java
SoftReference<Object> softRef = new SoftReference<>(new Object());
Object obj = softRef.get();  // 獲取對象
```
- 記憶體不足時才回收
- 適用於緩存場景

**實現緩存**：
```java
Map<String, SoftReference<byte[]>> cache = new HashMap<>();

public byte[] getData(String key) {
    SoftReference<byte[]> ref = cache.get(key);
    if (ref != null) {
        byte[] data = ref.get();
        if (data != null) {
            return data;  // 緩存命中
        }
    }
    
    // 緩存未命中，加載數據
    byte[] data = loadData(key);
    cache.put(key, new SoftReference<>(data));
    return data;
}
```

#### 弱引用（Weak Reference）

```java
WeakReference<Object> weakRef = new WeakReference<>(new Object());
Object obj = weakRef.get();
```
- 下次 GC 時必定回收
- 適用於關聯對象，不影響對象生命週期

**ThreadLocal 使用弱引用**：
```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;
    Entry(ThreadLocal<?> k, Object v) {
        super(k);  // ThreadLocal 作為弱引用
        value = v;
    }
}
```

#### 虛引用（Phantom Reference）

```java
ReferenceQueue<Object> queue = new ReferenceQueue<>();
PhantomReference<Object> phantomRef = new PhantomReference<>(obj, queue);
```
- 無法通過虛引用獲取對象
- 用於對象回收時收到通知
- 適用於資源清理

### GC 算法

#### 標記-清除算法（Mark-Sweep）

**過程**：
1. **標記階段**：標記所有可達對象
2. **清除階段**：回收未標記的對象

**優點**：
- 實現簡單

**缺點**：
- **效率不穩定**：對象越多，標記和清除時間越長
- **產生碎片**：回收後記憶體不連續

```
標記前：  [A][B][C][D][E]
標記後：  [A*][B][C*][D][E*]  (* 表示可達)
清除後：  [A][ ][C][ ][E]    (產生碎片)
```

#### 標記-複製算法（Mark-Copy）

**過程**：
1. 將記憶體分為兩塊（From 和 To）
2. 標記 From 區的可達對象
3. 將可達對象複製到 To 區
4. 清空 From 區
5. From 和 To 角色互換

**優點**：
- **無碎片**：對象緊湊排列
- **效率高**：只需遍歷可達對象

**缺點**：
- **浪費空間**：可用記憶體只有一半
- **對象存活率高時效率低**

```
From 區：  [A][B][C][D][E]
標記後：   [A*][B][C*][D][E*]
複製到 To： [A][C][E][ ][ ]
清空 From： [ ][ ][ ][ ][ ]
```

**改進 - Appel 式回收**：
- Eden：Survivor = 8:1:1
- 每次使用 Eden + 一個 Survivor
- 回收時將存活對象複製到另一個 Survivor
- 如果 Survivor 不夠，使用老年代擔保

#### 標記-整理算法（Mark-Compact）

**過程**：
1. 標記可達對象
2. 將存活對象向一端移動
3. 清理邊界外的記憶體

**優點**：
- **無碎片**
- **不浪費空間**

**缺點**：
- **效率較低**：需要移動對象
- **STW 時間長**：移動對象需要暫停應用

```
標記前：  [A][B][C][D][E]
標記後：  [A*][B][C*][D][E*]
整理後：  [A][C][E][ ][ ]
```

### 分代收集理論

#### 為什麼分代

**弱分代假說**：大部分對象都是朝生夕滅的
**強分代假說**：熬過越多次 GC 的對象越難死亡

**分代策略**：
- 將對象按存活時間分為不同代
- 不同代使用不同的回收算法
- 集中回收存活時間短的對象

#### 堆記憶體結構

```
堆 (Heap)
├── 新生代 (Young Generation) - 1/3
│   ├── Eden 區 (80%)
│   ├── Survivor From (10%)
│   └── Survivor To (10%)
└── 老年代 (Old Generation) - 2/3
```

#### 對象分配與晉升

**對象分配**：
1. 優先在 Eden 區分配
2. 大對象直接進入老年代
3. 長期存活對象進入老年代

**晉升條件**：
1. **年齡達到閾值**：默認 15（可通過 `-XX:MaxTenuringThreshold` 設置）
2. **Survivor 空間不足**：直接進入老年代
3. **動態年齡判定**：Survivor 中相同年齡對象大小總和 > Survivor 空間一半

**示例**：
```java
// 設置晉升年齡
-XX:MaxTenuringThreshold=10

// 大對象閾值（直接進入老年代）
-XX:PretenureSizeThreshold=1048576  // 1MB
```

### GC 類型

#### Minor GC（新生代 GC）

**觸發條件**：
- Eden 區滿

**特點**：
- 頻率高
- 速度快（複製算法）
- STW 時間短

**過程**：
1. 標記 Eden 和 From Survivor 的可達對象
2. 將存活對象複製到 To Survivor
3. 清空 Eden 和 From Survivor
4. From 和 To 角色互換

#### Major GC / Full GC（老年代 GC）

**觸發條件**：
- 老年代空間不足
- System.gc() 調用
- 空間分配擔保失敗
- CMS GC 出現 Concurrent Mode Failure
- 元空間不足

**特點**：
- 頻率低
- 速度慢（標記-整理算法）
- STW 時間長

### Stop The World（STW）

**定義**：GC 時暫停所有應用線程。

**為什麼需要 STW**：
- 保證對象引用關係的一致性
- 防止並發修改導致的錯誤

**減少 STW 時間**：
- 並發標記（CMS、G1）
- 增量更新（G1）
- 原始快照（SATB）

### 安全點與安全區域

#### 安全點（Safepoint）

**定義**：程序執行時並非在所有地方都能停下來開始 GC，只有在安全點才能暫停。

**選擇標準**：
- 方法調用
- 循環跳轉
- 異常跳轉

**如何讓線程到達安全點**：
- **搶先式中斷**：先中斷所有線程，未到安全點的恢復執行到安全點
- **主動式中斷**：設置標誌，線程輪詢標誌，自己中斷

#### 安全區域（Safe Region）

**定義**：引用關係不會發生變化的代碼片段。

**用途**：解決線程處於 Sleep 或 Blocked 狀態無法響應中斷的問題。

### 記憶體分配策略

**1. 對象優先在 Eden 分配**：
```java
// 設置新生代大小
-Xmn10M
```

**2. 大對象直接進入老年代**：
```java
// 設置大對象閾值
-XX:PretenureSizeThreshold=3145728  // 3MB
```

**3. 長期存活對象進入老年代**：
```java
// 設置晉升年齡
-XX:MaxTenuringThreshold=15
```

**4. 空間分配擔保**：
- Minor GC 前，檢查老年代最大可用連續空間是否大於新生代所有對象總空間
- 如果是，Minor GC 安全
- 如果否，查看是否允許擔保失敗
- 允許，檢查老年代最大可用連續空間是否大於歷次晉升平均大小
- 大於，嘗試 Minor GC（可能失敗）
- 小於或不允許擔保，Full GC

### 實際案例

#### 案例 1：對象在 Eden 分配

```java
// VM 參數
-Xms20M -Xmx20M -Xmn10M -XX:+PrintGCDetails

public class GCTest {
    private static final int _1MB = 1024 * 1024;
    
    public static void main(String[] args) {
        byte[] a1 = new byte[2 * _1MB];
        byte[] a2 = new byte[2 * _1MB];
        byte[] a3 = new byte[2 * _1MB];
        byte[] a4 = new byte[4 * _1MB];  // 觸發 Minor GC
    }
}
```

**分析**：
- Eden 可用約 8MB
- a1、a2、a3 共 6MB，在 Eden
- a4 需要 4MB，Eden 不足，觸發 Minor GC
- a1、a2、a3 仍存活，無法放入 Survivor（1MB），直接進入老年代
- a4 在 Eden 分配

#### 案例 2：大對象直接進入老年代

```java
// VM 參數
-Xms20M -Xmx20M -Xmn10M 
-XX:+PrintGCDetails 
-XX:PretenureSizeThreshold=3145728  // 3MB

public class GCTest {
    private static final int _1MB = 1024 * 1024;
    
    public static void main(String[] args) {
        byte[] a = new byte[4 * _1MB];  // 直接進入老年代
    }
}
```

**分析**：
- 對象大小 4MB > 閾值 3MB
- 直接在老年代分配
- 不觸發 Minor GC

### 最佳實踐

**1. 減少對象創建**：
```java
// 不推薦：頻繁創建對象
for (int i = 0; i < 1000000; i++) {
    String s = new String("test");  // 每次都創建
}

// 推薦：復用對象
String s = "test";  // 字符串常量池
for (int i = 0; i < 1000000; i++) {
    // 使用 s
}
```

**2. 及時釋放引用**：
```java
List<Object> list = new ArrayList<>();
// ... 使用 list
list = null;  // 幫助 GC
```

**3. 使用對象池**：
```java
// 數據庫連接池、線程池
DataSource ds = new HikariDataSource();
```

**4. 避免創建大對象**：
```java
// 不推薦
byte[] data = new byte[10 * 1024 * 1024];  // 10MB

// 推薦：分批處理
byte[] buffer = new byte[1024 * 1024];  // 1MB
// 分批讀取數據
```

**5. 注意集合大小**：
```java
// 預估容量，減少擴容
List<String> list = new ArrayList<>(1000);
Map<String, Object> map = new HashMap<>(100);
```

## 總結

垃圾回收是 JVM 自動記憶體管理的核心，通過可達性分析判斷對象存活，使用標記-清除、標記-複製、標記-整理等算法回收記憶體。分代收集策略根據對象存活特徵，對新生代使用複製算法，對老年代使用標記-清除或標記-整理算法。理解 GC 原理、分代策略和記憶體分配規則，對於編寫高性能 Java 應用和進行 JVM 調優至關重要。合理使用對象、及時釋放引用、避免大對象創建，可以顯著減少 GC 壓力，提升應用性能。
