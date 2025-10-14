# Java 記憶體模型（JMM）

- **難度**: 9
- **重要程度**: 5
- **標籤**: `JMM`, `happens-before`, `volatile`, `Memory Model`

## 問題詳述

Java 記憶體模型（Java Memory Model，JMM）是 Java 並發編程的理論基礎。請深入解釋 JMM 的核心概念、happens-before 規則、volatile 關鍵字的作用以及如何保證並發安全。

## 核心理論與詳解

### JMM 概述

#### 為什麼需要 JMM

**硬件層面的記憶體模型**：
- CPU 有多級緩存（L1、L2、L3）
- 每個 CPU 核心有自己的緩存
- 緩存與主記憶體之間存在一致性問題
- CPU 會對指令進行重排序優化

**JMM 的作用**：
- 屏蔽硬件和操作系統的記憶體訪問差異
- 定義程序中各個變量的訪問規則
- 保證多線程環境下的記憶體可見性、原子性和有序性

### JMM 抽象結構

#### 主記憶體與工作記憶體

```
線程 A                    線程 B
  |                        |
工作記憶體 A              工作記憶體 B
  |                        |
  +--------主記憶體--------+
         (共享變量)
```

**主記憶體（Main Memory）**：
- 所有線程共享
- 存儲所有變量的主副本
- 類似於物理硬件的主記憶體

**工作記憶體（Working Memory）**：
- 每個線程私有
- 存儲該線程使用變量的副本
- 類似於 CPU 緩存

#### 記憶體交互操作

**8 種原子操作**：
1. **lock**：鎖定主記憶體變量
2. **unlock**：解鎖主記憶體變量
3. **read**：從主記憶體讀取變量
4. **load**：將 read 的值載入工作記憶體
5. **use**：傳遞工作記憶體變量給執行引擎
6. **assign**：執行引擎結果賦值給工作記憶體
7. **store**：傳遞工作記憶體變量到主記憶體
8. **write**：將 store 的值寫入主記憶體

**操作規則**：
- read 和 load、store 和 write 必須成對出現
- 不允許線程丟棄最近的 assign 操作
- 不允許線程無原因地同步數據到主記憶體
- 新變量只能在主記憶體中誕生

### 並發三大特性

#### 原子性（Atomicity）

**定義**：一個操作或一系列操作不可分割，要麼全部執行，要麼全部不執行。

**保證方式**：
- 基本數據類型的讀寫是原子的（long 和 double 除外）
- synchronized 關鍵字
- Lock 接口
- Atomic* 原子類

**非原子操作示例**：
```java
// 非原子操作
public class Counter {
    private int count = 0;
    
    // 不是原子操作：讀取 -> 計算 -> 寫入
    public void increment() {
        count++;  // count = count + 1
    }
}

// 多線程環境下會出現問題
// 線程 A 讀取 count=0，計算得 1
// 線程 B 讀取 count=0，計算得 1
// 線程 A 寫入 1
// 線程 B 寫入 1
// 最終 count=1，但期望是 2
```

**原子操作解決方案**：
```java
// 方案 1：synchronized
public synchronized void increment() {
    count++;
}

// 方案 2：AtomicInteger
private AtomicInteger count = new AtomicInteger(0);
public void increment() {
    count.incrementAndGet();
}
```

#### 可見性（Visibility）

**定義**：一個線程修改了共享變量的值，其他線程能夠立即看到修改後的值。

**可見性問題**：
```java
public class VisibilityProblem {
    private boolean stop = false;
    
    public void runTask() {
        new Thread(() -> {
            while (!stop) {
                // 執行任務
            }
            System.out.println("Stopped");
        }).start();
    }
    
    public void stopTask() {
        stop = true;  // 其他線程可能看不到這個修改
    }
}
```

**原因**：
- 線程 A 修改 stop 變量，只修改了自己的工作記憶體
- 線程 B 一直從自己的工作記憶體讀取 stop，看不到修改

**保證可見性的方式**：
1. **volatile 關鍵字**
2. **synchronized 關鍵字**
3. **final 關鍵字**
4. **Lock 接口**

#### 有序性（Ordering）

**定義**：程序執行的順序按照代碼的先後順序執行。

**指令重排序**：
- **編譯器重排序**：不改變單線程語義的前提下重排
- **處理器重排序**：CPU 亂序執行優化

**重排序問題示例**：
```java
// 經典的雙檢鎖單例模式問題
public class Singleton {
    private static Singleton instance;
    
    public static Singleton getInstance() {
        if (instance == null) {  // 第一次檢查
            synchronized (Singleton.class) {
                if (instance == null) {  // 第二次檢查
                    instance = new Singleton();  // 問題所在
                }
            }
        }
        return instance;
    }
}
```

**問題原因**：
```java
instance = new Singleton();

// 實際上分為三步：
1. memory = allocate();    // 分配對象記憶體空間
2. ctorInstance(memory);   // 初始化對象
3. instance = memory;      // 設置 instance 指向記憶體空間

// 可能被重排序為：
1. memory = allocate();
3. instance = memory;      // 此時對象還未初始化！
2. ctorInstance(memory);

// 線程 A 執行到步驟 3，instance 不為 null 但未初始化
// 線程 B 執行第一次檢查，發現 instance 不為 null，直接返回
// 使用未初始化的對象，導致錯誤
```

**解決方案**：使用 volatile
```java
private static volatile Singleton instance;
```

### happens-before 規則

#### 定義

如果操作 A happens-before 操作 B，則 A 的執行結果對 B 可見，且 A 的執行順序在 B 之前。

#### 八大規則

**1. 程序順序規則（Program Order Rule）**
```java
int a = 1;  // 操作 1
int b = 2;  // 操作 2
// 操作 1 happens-before 操作 2
```

**2. 監視器鎖規則（Monitor Lock Rule）**
```java
synchronized (lock) {
    // 操作 A
}
// unlock happens-before 下一次 lock

synchronized (lock) {
    // 操作 B 能看到 A 的結果
}
```

**3. volatile 變量規則（Volatile Variable Rule）**
```java
volatile boolean flag = false;

// 線程 A
flag = true;  // 寫操作

// 線程 B
if (flag) {  // 讀操作，能看到 A 的寫入
    // ...
}
// volatile 寫 happens-before volatile 讀
```

**4. 線程啟動規則（Thread Start Rule）**
```java
Thread thread = new Thread(() -> {
    // 能看到 start() 之前的操作
    System.out.println(x);  // 能看到 x = 1
});

x = 1;
thread.start();
// start() happens-before 線程內的操作
```

**5. 線程終止規則（Thread Termination Rule）**
```java
Thread thread = new Thread(() -> {
    x = 1;
});
thread.start();
thread.join();
// 線程內的操作 happens-before join() 返回
System.out.println(x);  // 能看到 x = 1
```

**6. 線程中斷規則（Thread Interruption Rule）**
```java
thread.interrupt();
// interrupt() happens-before 檢測到中斷
```

**7. 對象終結規則（Finalizer Rule）**
```java
// 構造函數結束 happens-before finalize() 方法開始
```

**8. 傳遞性（Transitivity）**
```java
// 如果 A happens-before B，B happens-before C
// 則 A happens-before C
```

### volatile 詳解

#### volatile 的作用

**1. 保證可見性**：
- 寫 volatile 變量時，會立即刷新到主記憶體
- 讀 volatile 變量時，會從主記憶體讀取

**2. 禁止指令重排序**：
- 在 volatile 寫之前的操作不會被重排到寫之後
- 在 volatile 讀之後的操作不會被重排到讀之前

**3. 不保證原子性**：
```java
volatile int count = 0;

// 仍然不是線程安全的
count++;  // 讀-改-寫，三個操作
```

#### volatile 實現原理

**記憶體屏障（Memory Barrier）**：

```java
// volatile 寫操作
StoreStore 屏障
volatile 寫
StoreLoad 屏障

// volatile 讀操作
LoadLoad 屏障
volatile 讀
LoadStore 屏障
```

**四種屏障**：
- **LoadLoad**：Load1; LoadLoad; Load2 - 確保 Load1 先於 Load2
- **StoreStore**：Store1; StoreStore; Store2 - 確保 Store1 先於 Store2
- **LoadStore**：Load1; LoadStore; Store2 - 確保 Load1 先於 Store2
- **StoreLoad**：Store1; StoreLoad; Load2 - 確保 Store1 先於 Load2（開銷最大）

#### volatile 使用場景

**適用場景**：
1. **狀態標誌**：
```java
volatile boolean shutdown = false;

public void shutdown() {
    shutdown = true;
}

public void doWork() {
    while (!shutdown) {
        // 工作
    }
}
```

2. **雙檢鎖單例**：
```java
private static volatile Singleton instance;

public static Singleton getInstance() {
    if (instance == null) {
        synchronized (Singleton.class) {
            if (instance == null) {
                instance = new Singleton();
            }
        }
    }
    return instance;
}
```

3. **獨立觀察**：
```java
volatile long lastUpdateTime;

public void update() {
    // 更新數據
    lastUpdateTime = System.currentTimeMillis();
}

public boolean isStale() {
    return System.currentTimeMillis() - lastUpdateTime > TIMEOUT;
}
```

**不適用場景**：
- 需要原子操作（使用 Atomic* 或 synchronized）
- 複合操作（讀-改-寫）

### synchronized 與 JMM

#### synchronized 的語義

**1. 互斥性**：同一時刻只有一個線程執行同步代碼

**2. 可見性**：
- 進入 synchronized 塊前，會從主記憶體刷新變量
- 退出 synchronized 塊後，會將修改刷新到主記憶體

**3. 有序性**：
- synchronized 內部代碼不會與外部代碼重排序
- synchronized 塊內部可以重排序（不影響單線程語義）

### final 與 JMM

#### final 的特殊性

**1. 基本保證**：
- 對象構造完成前，final 字段不會被其他線程看到未初始化的值
- final 字段的寫入不會與構造函數外的操作重排序

**2. 不可變對象的線程安全**：
```java
public final class ImmutableUser {
    private final String name;
    private final int age;
    
    public ImmutableUser(String name, int age) {
        this.name = name;
        this.age = age;
    }
    // 只有 getter，沒有 setter
}
```

### 最佳實踐

**1. 優先使用不可變對象**：
```java
// 使用 final 和不可變類
public final class User {
    private final String name;
    private final List<String> roles;
    
    public User(String name, List<String> roles) {
        this.name = name;
        this.roles = Collections.unmodifiableList(new ArrayList<>(roles));
    }
}
```

**2. 正確使用 volatile**：
```java
// 狀態標誌
private volatile boolean initialized = false;

// 雙檢鎖
private static volatile Singleton instance;
```

**3. 理解 synchronized 的成本**：
```java
// 縮小同步範圍
public void method() {
    // 非同步代碼
    synchronized (lock) {
        // 只同步必要的代碼
    }
    // 非同步代碼
}
```

**4. 使用高層並發工具**：
```java
// 使用 java.util.concurrent 包
private final AtomicInteger count = new AtomicInteger(0);
private final ConcurrentHashMap<K, V> map = new ConcurrentHashMap<>();
private final CountDownLatch latch = new CountDownLatch(N);
```

## 總結

Java 記憶體模型是理解 Java 並發編程的基礎。JMM 通過主記憶體和工作記憶體的抽象模型，定義了線程之間如何通過記憶體進行通信。happens-before 規則提供了可見性和有序性的保證，volatile 關鍵字通過記憶體屏障實現可見性和禁止重排序，synchronized 提供了完整的互斥、可見性和有序性保證。深入理解 JMM 對於編寫正確的並發程序至關重要，也是資深 Java 工程師必須掌握的核心知識。
