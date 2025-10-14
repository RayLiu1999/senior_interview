# synchronized 關鍵字詳解

- **難度**: 8
- **重要程度**: 5
- **標籤**: `synchronized`, `Monitor`, `Lock`, `Concurrency`

## 問題詳述

synchronized 是 Java 最基本的同步機制，請深入解釋其實現原理、鎖升級過程、與 Lock 的區別以及使用注意事項。

## 核心理論與詳解

### synchronized 基本使用

#### 三種使用方式

**1. 同步實例方法**：
```java
public class Counter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
}
// 鎖對象：this
```

**2. 同步靜態方法**：
```java
public class Counter {
    private static int count = 0;
    
    public static synchronized void increment() {
        count++;
    }
}
// 鎖對象：Counter.class
```

**3. 同步代碼塊**：
```java
public class Counter {
    private int count = 0;
    private final Object lock = new Object();
    
    public void increment() {
        synchronized (lock) {
            count++;
        }
    }
}
// 鎖對象：lock
```

### 實現原理

#### 字節碼層面

**同步代碼塊**：
```java
public void method() {
    synchronized (this) {
        // 臨界區代碼
    }
}
```

**對應字節碼**：
```
monitorenter     // 獲取鎖
// 臨界區代碼
monitorexit      // 釋放鎖
monitorexit      // 異常時釋放鎖
```

**同步方法**：
```java
public synchronized void method() {
    // 方法體
}
```

**對應字節碼**：
- 方法標誌中有 `ACC_SYNCHRONIZED` 標誌
- JVM 根據該標誌自動加鎖解鎖

#### Monitor（監視器鎖）

**對象頭結構**：
```
|--------------------------------------------------------------|
|                     Object Header (128 bits)                 |
|--------------------------------------------------------------|
|  Mark Word (64 bits)  |  Klass Word (64 bits)              |
|--------------------------------------------------------------|
```

**Mark Word 結構**（64 位 JVM）：
```
|-----------------------------------------------------------------------|
| 無鎖狀態                                                               |
| unused(25) | hashcode(31) | unused(1) | age(4) | biased(1) | lock(2) |
|-----------------------------------------------------------------------|
| 偏向鎖                                                                |
| thread(54) | epoch(2) | unused(1) | age(4) | biased(1) | lock(2)    |
|-----------------------------------------------------------------------|
| 輕量級鎖                                                              |
| ptr_to_lock_record(62)                        | lock(2)              |
|-----------------------------------------------------------------------|
| 重量級鎖                                                              |
| ptr_to_heavyweight_monitor(62)                | lock(2)              |
|-----------------------------------------------------------------------|
```

**鎖標誌位**：
- 01：無鎖或偏向鎖（看 biased 位）
- 00：輕量級鎖
- 10：重量級鎖
- 11：GC 標記

### 鎖升級過程

#### 無鎖 → 偏向鎖 → 輕量級鎖 → 重量級鎖

**設計思想**：大多數鎖不存在競爭，通過優化減少開銷。

#### 偏向鎖（Biased Locking）

**概念**：鎖偏向於第一個獲取它的線程，如果沒有其他線程競爭，該線程以後獲取鎖無需同步操作。

**加鎖過程**：
1. 檢查 Mark Word 是否為偏向鎖狀態
2. 如果是，檢查線程 ID 是否為當前線程
3. 如果是，直接獲取鎖
4. 如果不是，CAS 嘗試將線程 ID 設置為當前線程
5. 成功則獲取鎖，失敗則升級為輕量級鎖

**撤銷偏向**：
- 有其他線程競爭時
- 調用 wait() 方法時
- 調用 hashCode() 方法時（Mark Word 需要存儲 hashCode）

**參數控制**：
```bash
# 開啟偏向鎖（默認開啟）
-XX:+UseBiasedLocking

# 關閉偏向鎖
-XX:-UseBiasedLocking

# 偏向鎖延遲（默認 4000ms）
-XX:BiasedLockingStartupDelay=0
```

**適用場景**：
- 鎖總是由同一線程獲取
- 無競爭或極少競爭

#### 輕量級鎖（Lightweight Locking）

**概念**：通過 CAS 操作獲取鎖，避免使用互斥量的開銷。

**加鎖過程**：
1. 在當前線程棧幀中創建 Lock Record
2. 將 Mark Word 複製到 Lock Record（Displaced Mark Word）
3. CAS 嘗試將對象 Mark Word 替換為指向 Lock Record 的指針
4. 成功則獲取鎖
5. 失敗則自旋嘗試
6. 自旋次數過多，升級為重量級鎖

**解鎖過程**：
1. CAS 將 Displaced Mark Word 替換回對象頭
2. 成功則釋放鎖
3. 失敗表示有競爭，升級為重量級鎖

**自旋優化**：
```bash
# 自旋次數（JDK 6 後自適應）
-XX:PreBlockSpin=10
```

**適用場景**：
- 線程交替執行同步塊
- 鎖持有時間短
- 輕度競爭

#### 重量級鎖（Heavyweight Locking）

**概念**：基於操作系統互斥量（Mutex）實現，線程阻塞。

**加鎖過程**：
1. 將 Mark Word 替換為指向 Monitor 的指針
2. 線程進入 Monitor 的 EntryList
3. 獲取鎖成功進入 Owner
4. 失敗則阻塞在 EntryList

**Monitor 結構**：
```
Monitor
├── Owner (當前持有鎖的線程)
├── EntryList (等待鎖的線程)
└── WaitSet (調用 wait() 的線程)
```

**適用場景**：
- 競爭激烈
- 鎖持有時間長

### 鎖升級示例

```java
public class LockUpgradeDemo {
    private static Object lock = new Object();
    
    public static void main(String[] args) throws Exception {
        // 1. 無鎖狀態
        System.out.println("無鎖：" + ClassLayout.parseInstance(lock).toPrintable());
        
        // 2. 偏向鎖（需要等待延遲）
        Thread.sleep(5000);
        synchronized (lock) {
            System.out.println("偏向鎖：" + ClassLayout.parseInstance(lock).toPrintable());
        }
        
        // 3. 輕量級鎖（其他線程競爭）
        new Thread(() -> {
            synchronized (lock) {
                System.out.println("輕量級鎖：" + ClassLayout.parseInstance(lock).toPrintable());
            }
        }).start();
        
        Thread.sleep(1000);
        
        // 4. 重量級鎖（激烈競爭）
        for (int i = 0; i < 2; i++) {
            new Thread(() -> {
                synchronized (lock) {
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println("重量級鎖：" + ClassLayout.parseInstance(lock).toPrintable());
                }
            }).start();
        }
    }
}
```

### synchronized 與 Lock 對比

| 特性 | synchronized | Lock (ReentrantLock) |
|------|--------------|----------------------|
| 實現層面 | JVM 實現 | JDK 實現 |
| 是否可中斷 | 不可中斷 | 可中斷 (lockInterruptibly) |
| 是否公平 | 非公平 | 可選公平/非公平 |
| 鎖獲取 | 自動獲取 | 手動 lock() |
| 鎖釋放 | 自動釋放 | 手動 unlock() |
| 條件變量 | 單個 (wait/notify) | 多個 (Condition) |
| 鎖狀態 | 無法判斷 | 可判斷 (tryLock) |
| 性能 | 優化後相當 | 相當 |
| 使用複雜度 | 簡單 | 較複雜 |

**synchronized 示例**：
```java
public synchronized void method() {
    // 自動加鎖解鎖
}
```

**Lock 示例**：
```java
private final Lock lock = new ReentrantLock();

public void method() {
    lock.lock();
    try {
        // 臨界區
    } finally {
        lock.unlock();  // 必須在 finally 中釋放
    }
}
```

### 可重入性

**synchronized 是可重入鎖**：
```java
public class ReentrantDemo {
    public synchronized void method1() {
        System.out.println("method1");
        method2();  // 可重入
    }
    
    public synchronized void method2() {
        System.out.println("method2");
    }
}
```

**實現原理**：
- Monitor 維護一個計數器
- 同一線程每次獲取鎖，計數器 +1
- 釋放鎖時計數器 -1
- 計數器為 0 時完全釋放

### 等待/通知機制

#### wait() / notify() / notifyAll()

**必須在 synchronized 塊中使用**：
```java
public class WaitNotifyDemo {
    private final Object lock = new Object();
    private boolean condition = false;
    
    public void waitMethod() {
        synchronized (lock) {
            while (!condition) {
                try {
                    lock.wait();  // 釋放鎖，等待通知
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            // 條件滿足，執行業務邏輯
        }
    }
    
    public void notifyMethod() {
        synchronized (lock) {
            condition = true;
            lock.notify();  // 或 lock.notifyAll()
        }
    }
}
```

**wait() vs sleep()**：
- wait() 釋放鎖，sleep() 不釋放
- wait() 需要 notify() 喚醒，sleep() 到時自動醒
- wait() 是 Object 方法，sleep() 是 Thread 方法

### 性能優化

#### 1. 減小鎖粒度

```java
// 不推薦：鎖粒度大
public synchronized void method() {
    // 非臨界區代碼
    // 臨界區代碼
    // 非臨界區代碼
}

// 推薦：只鎖臨界區
public void method() {
    // 非臨界區代碼
    synchronized (this) {
        // 臨界區代碼
    }
    // 非臨界區代碼
}
```

#### 2. 鎖分離

```java
// ConcurrentHashMap 的分段鎖
public class ConcurrentHashMap<K,V> {
    // Java 7：Segment 數組
    final Segment<K,V>[] segments;
    
    // Java 8：Node 數組 + CAS
    transient volatile Node<K,V>[] table;
}
```

#### 3. 鎖粗化

```java
// 不推薦：頻繁加鎖解鎖
for (int i = 0; i < 1000; i++) {
    synchronized (lock) {
        // 操作
    }
}

// 推薦：鎖粗化
synchronized (lock) {
    for (int i = 0; i < 1000; i++) {
        // 操作
    }
}
```

#### 4. 消除鎖

```java
public void method() {
    // 局部變量，不會被其他線程訪問
    StringBuffer sb = new StringBuffer();
    sb.append("a");
    sb.append("b");
    // JVM 會消除 StringBuffer 內部的鎖
}
```

### 常見問題

#### 1. 鎖對象不能為 null

```java
Object lock = null;
synchronized (lock) {  // NullPointerException
    // ...
}
```

#### 2. 不要鎖 String 常量

```java
// 錯誤：字符串常量會被緩存
private static final String LOCK = "lock";
synchronized (LOCK) {  // 可能與其他代碼衝突
    // ...
}

// 正確：使用 Object
private static final Object LOCK = new Object();
synchronized (LOCK) {
    // ...
}
```

#### 3. 避免死鎖

```java
// 可能死鎖
public void transfer(Account from, Account to, int amount) {
    synchronized (from) {
        synchronized (to) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}

// 解決：按順序加鎖
public void transfer(Account from, Account to, int amount) {
    Account first = from.id < to.id ? from : to;
    Account second = from.id < to.id ? to : from;
    
    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

### 最佳實踐

**1. 優先使用 JUC 包**：
```java
// 推薦：使用併發容器
ConcurrentHashMap<K, V> map = new ConcurrentHashMap<>();

// 不推薦：同步包裝
Map<K, V> map = Collections.synchronizedMap(new HashMap<>());
```

**2. 縮小同步範圍**：
```java
public void method() {
    // 非臨界區
    synchronized (lock) {
        // 只鎖必要的代碼
    }
    // 非臨界區
}
```

**3. 避免在鎖內調用外部方法**：
```java
// 危險：不知道 callback 做什麼
public synchronized void method(Callback callback) {
    callback.call();  // 可能長時間阻塞
}
```

**4. 使用 try-finally（Lock）**：
```java
Lock lock = new ReentrantLock();
lock.lock();
try {
    // 臨界區
} finally {
    lock.unlock();
}
```

## 總結

synchronized 是 Java 最基本的同步機制，通過鎖升級（偏向鎖、輕量級鎖、重量級鎖）優化性能。理解其實現原理（Monitor、Mark Word）、鎖升級過程和可重入性是掌握 Java 並發的基礎。合理使用 synchronized，縮小鎖粒度，避免死鎖，可以編寫出高效的並發程序。在 JDK 6 優化後，synchronized 性能已經足夠好，對於簡單場景優先使用 synchronized，複雜場景考慮 Lock。
