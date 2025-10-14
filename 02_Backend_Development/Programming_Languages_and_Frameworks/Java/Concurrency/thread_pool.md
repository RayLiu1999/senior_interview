# Java 線程池原理

- **難度**: 8
- **重要程度**: 5
- **標籤**: `ThreadPool`, `ThreadPoolExecutor`, `Concurrency`

## 問題詳述

線程池是 Java 並發編程的核心組件，能夠有效管理和復用線程。請深入解釋 ThreadPoolExecutor 的工作原理、核心參數、拒絕策略和調優方法。

## 核心理論與詳解

### 為什麼需要線程池

#### 直接創建線程的問題

```java
// 每次創建新線程
new Thread(() -> {
    // 執行任務
}).start();
```

**問題**：
1. **創建銷毀開銷大**：頻繁創建銷毀線程消耗系統資源
2. **無法控制數量**：可能創建過多線程導致系統崩潰
3. **缺乏統一管理**：無法監控、調優線程使用

#### 線程池的優勢

1. **降低資源消耗**：復用線程，減少創建銷毀開銷
2. **提高響應速度**：任務到達時，無需等待線程創建
3. **提高可管理性**：統一分配、調優和監控
4. **提供更多功能**：定時執行、週期執行、任務隊列等

### ThreadPoolExecutor 核心參數

```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心線程數
    int maximumPoolSize,           // 最大線程數
    long keepAliveTime,            // 空閒線程存活時間
    TimeUnit unit,                 // 時間單位
    BlockingQueue<Runnable> workQueue,  // 任務隊列
    ThreadFactory threadFactory,   // 線程工廠
    RejectedExecutionHandler handler    // 拒絕策略
)
```

#### 1. corePoolSize（核心線程數）

**定義**：線程池維護的最小線程數，即使它們處於空閒狀態。

**特點**：
- 線程池創建後，不會立即創建核心線程
- 當任務提交時，如果線程數 < corePoolSize，創建新線程
- 核心線程默認不會被回收（除非設置 allowCoreThreadTimeOut）

```java
// 設置核心線程超時
threadPool.allowCoreThreadTimeOut(true);
```

#### 2. maximumPoolSize（最大線程數）

**定義**：線程池允許創建的最大線程數。

**何時創建非核心線程**：
- 核心線程全部忙碌
- 任務隊列已滿
- 線程數 < maximumPoolSize

#### 3. keepAliveTime（空閒線程存活時間）

**定義**：非核心線程空閒時的最大存活時間。

**作用**：
- 當線程數 > corePoolSize 時生效
- 空閒線程超過此時間會被回收
- 減少系統資源占用

#### 4. workQueue（任務隊列）

**定義**：用於保存等待執行的任務。

**常用隊列**：

**ArrayBlockingQueue**：有界隊列
```java
// 容量為 100
BlockingQueue<Runnable> queue = new ArrayBlockingQueue<>(100);
```
- 基於陣列的有界阻塞隊列
- FIFO 順序
- 適用於資源有限的場景

**LinkedBlockingQueue**：可選有界隊列
```java
// 無界（Integer.MAX_VALUE）
BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();

// 有界
BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>(100);
```
- 基於鏈表的阻塞隊列
- 可選有界或無界
- FixedThreadPool 和 SingleThreadExecutor 使用

**SynchronousQueue**：同步隊列
```java
BlockingQueue<Runnable> queue = new SynchronousQueue<>();
```
- 不存儲元素的阻塞隊列
- 每個 put 操作必須等待 take 操作
- CachedThreadPool 使用

**PriorityBlockingQueue**：優先級隊列
```java
BlockingQueue<Runnable> queue = new PriorityBlockingQueue<>();
```
- 支持優先級的無界隊列
- 元素必須實現 Comparable 接口

**DelayQueue**：延遲隊列
```java
BlockingQueue<Runnable> queue = new DelayQueue<>();
```
- 元素只有在延遲期滿後才能取出
- ScheduledThreadPoolExecutor 使用

#### 5. threadFactory（線程工廠）

**定義**：創建新線程的工廠。

**自定義線程工廠**：
```java
ThreadFactory threadFactory = new ThreadFactory() {
    private final AtomicInteger threadNumber = new AtomicInteger(1);
    
    @Override
    public Thread newThread(Runnable r) {
        Thread thread = new Thread(r);
        thread.setName("MyThread-" + threadNumber.getAndIncrement());
        thread.setDaemon(false);  // 非守護線程
        thread.setPriority(Thread.NORM_PRIORITY);
        return thread;
    }
};
```

**使用 Guava 的 ThreadFactoryBuilder**：
```java
ThreadFactory threadFactory = new ThreadFactoryBuilder()
    .setNameFormat("MyThread-%d")
    .setDaemon(false)
    .setPriority(Thread.NORM_PRIORITY)
    .build();
```

#### 6. handler（拒絕策略）

**定義**：當隊列滿且線程數達到 maximumPoolSize 時的處理策略。

**四種內建策略**：

**AbortPolicy（默認）**：拋出異常
```java
new ThreadPoolExecutor.AbortPolicy()
```
- 拋出 RejectedExecutionException
- 調用者需要捕獲處理

**CallerRunsPolicy**：調用者執行
```java
new ThreadPoolExecutor.CallerRunsPolicy()
```
- 由提交任務的線程執行
- 提供一種降速機制
- 不會丟失任務

**DiscardPolicy**：丟棄任務
```java
new ThreadPoolExecutor.DiscardPolicy()
```
- 靜默丟棄無法處理的任務
- 不拋出異常

**DiscardOldestPolicy**：丟棄最老任務
```java
new ThreadPoolExecutor.DiscardOldestPolicy()
```
- 丟棄隊列中最早的任務
- 然後嘗試重新提交當前任務

**自定義拒絕策略**：
```java
RejectedExecutionHandler handler = new RejectedExecutionHandler() {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 記錄日誌
        logger.warn("Task rejected: {}", r);
        
        // 持久化任務（數據庫、消息隊列）
        saveTaskToDB(r);
        
        // 或阻塞等待
        try {
            executor.getQueue().put(r);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
};
```

### 工作流程

#### 任務提交流程

```
提交任務
    ↓
線程數 < corePoolSize？
    ├─ 是 → 創建核心線程執行
    └─ 否 ↓
任務隊列未滿？
    ├─ 是 → 放入隊列等待
    └─ 否 ↓
線程數 < maximumPoolSize？
    ├─ 是 → 創建非核心線程執行
    └─ 否 → 執行拒絕策略
```

**示例**：
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    2,                              // 核心線程數
    5,                              // 最大線程數
    60L, TimeUnit.SECONDS,          // 空閒線程存活時間
    new ArrayBlockingQueue<>(10),   // 隊列容量 10
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.AbortPolicy()
);

// 提交 20 個任務
for (int i = 0; i < 20; i++) {
    try {
        executor.execute(() -> {
            System.out.println(Thread.currentThread().getName());
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    } catch (RejectedExecutionException e) {
        System.out.println("任務被拒絕");
    }
}
```

**執行過程**：
1. 前 2 個任務：創建核心線程執行
2. 第 3-12 個任務：放入隊列（隊列容量 10）
3. 第 13-17 個任務：創建非核心線程執行（最多 5 個線程）
4. 第 18-20 個任務：拒絕執行

#### 線程復用機制

**Worker 源碼邏輯**：
```java
final void runWorker(Worker w) {
    Thread wt = Thread.currentThread();
    Runnable task = w.firstTask;
    w.firstTask = null;
    
    try {
        // 循環從隊列獲取任務
        while (task != null || (task = getTask()) != null) {
            try {
                // 執行任務
                task.run();
            } finally {
                task = null;
            }
        }
    } finally {
        // 線程退出
        processWorkerExit(w);
    }
}
```

**關鍵點**：
- Worker 不斷從隊列取任務
- 沒有任務時調用 getTask() 阻塞等待
- 超時後返回 null，線程退出

### Executors 工廠類

#### FixedThreadPool

**特點**：固定線程數，無界隊列

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(
        nThreads,                    // corePoolSize = maximumPoolSize
        nThreads,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<>()  // 無界隊列
    );
}
```

**適用場景**：
- 負載穩定的場景
- 需要限制並發數

**風險**：
- 無界隊列可能導致 OOM
- 任務堆積

#### CachedThreadPool

**特點**：無核心線程，最大線程數無限，SynchronousQueue

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(
        0,                           // 無核心線程
        Integer.MAX_VALUE,           // 最大線程數無限
        60L, TimeUnit.SECONDS,
        new SynchronousQueue<>()     // 同步隊列
    );
}
```

**適用場景**：
- 任務執行時間短
- 任務數量波動大

**風險**：
- 可能創建大量線程
- 導致系統資源耗盡

#### SingleThreadExecutor

**特點**：單一線程，無界隊列

```java
public static ExecutorService newSingleThreadExecutor() {
    return new ThreadPoolExecutor(
        1, 1,                        // 單一線程
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<>()
    );
}
```

**適用場景**：
- 需要順序執行任務
- 保證任務串行

#### ScheduledThreadPool

**特點**：支持定時和週期性任務

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);

// 延遲執行
scheduler.schedule(task, 5, TimeUnit.SECONDS);

// 固定速率執行（不考慮任務執行時間）
scheduler.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS);

// 固定延遲執行（任務結束後延遲）
scheduler.scheduleWithFixedDelay(task, 0, 1, TimeUnit.SECONDS);
```

#### 為什麼不推薦使用 Executors

**阿里巴巴 Java 開發手冊明確禁止**：

1. **FixedThreadPool 和 SingleThreadExecutor**：
   - 使用無界隊列 LinkedBlockingQueue
   - 可能堆積大量請求，導致 OOM

2. **CachedThreadPool**：
   - 允許創建的線程數為 Integer.MAX_VALUE
   - 可能創建大量線程，導致 OOM

**推薦**：手動創建 ThreadPoolExecutor

### 線程池調優

#### 參數調優

**1. 核心線程數（corePoolSize）**

**CPU 密集型任務**：
```
corePoolSize = CPU 核心數 + 1
```

**IO 密集型任務**：
```
corePoolSize = CPU 核心數 * 2
或
corePoolSize = CPU 核心數 / (1 - 阻塞係數)
阻塞係數 = 阻塞時間 / (阻塞時間 + 計算時間)
```

**混合型任務**：分離 CPU 密集和 IO 密集任務

**2. 最大線程數（maximumPoolSize）**

根據系統資源和任務特性設置：
- CPU 密集：不宜過大
- IO 密集：可以較大

**3. 隊列容量**

```java
// 有界隊列，防止 OOM
new ArrayBlockingQueue<>(1000)
```

**容量計算**：
```
隊列容量 = (最大線程數 - 核心線程數) * 任務平均執行時間 / 任務提交間隔
```

#### 監控指標

```java
ThreadPoolExecutor executor = ...;

// 當前線程數
int poolSize = executor.getPoolSize();

// 活躍線程數
int activeCount = executor.getActiveCount();

// 任務總數
long taskCount = executor.getTaskCount();

// 已完成任務數
long completedTaskCount = executor.getCompletedTaskCount();

// 隊列中任務數
int queueSize = executor.getQueue().size();
```

**定時監控**：
```java
ScheduledExecutorService monitor = Executors.newScheduledThreadPool(1);
monitor.scheduleAtFixedRate(() -> {
    logger.info("Pool Size: {}, Active: {}, Queue Size: {}, Completed: {}",
        executor.getPoolSize(),
        executor.getActiveCount(),
        executor.getQueue().size(),
        executor.getCompletedTaskCount()
    );
}, 0, 5, TimeUnit.SECONDS);
```

### 最佳實踐

**1. 手動創建線程池**：
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                              // 核心線程數
    20,                              // 最大線程數
    60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),   // 有界隊列
    new ThreadFactoryBuilder()
        .setNameFormat("MyPool-%d")
        .build(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

**2. 優雅關閉**：
```java
// 不接受新任務，等待已有任務完成
executor.shutdown();

// 等待任務完成
if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
    // 強制關閉
    executor.shutdownNow();
    
    // 再次等待
    if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
        logger.error("線程池未能正常關閉");
    }
}
```

**3. 異常處理**：
```java
executor.execute(() -> {
    try {
        // 任務邏輯
    } catch (Exception e) {
        logger.error("任務執行失敗", e);
    }
});

// 或重寫 afterExecute
ThreadPoolExecutor executor = new ThreadPoolExecutor(...) {
    @Override
    protected void afterExecute(Runnable r, Throwable t) {
        super.afterExecute(r, t);
        if (t != null) {
            logger.error("任務執行異常", t);
        }
    }
};
```

**4. 任務優先級**：
```java
// 使用優先級隊列
BlockingQueue<Runnable> queue = new PriorityBlockingQueue<>();

// 任務實現 Comparable
class PriorityTask implements Runnable, Comparable<PriorityTask> {
    private int priority;
    
    @Override
    public int compareTo(PriorityTask other) {
        return Integer.compare(other.priority, this.priority);
    }
    
    @Override
    public void run() {
        // 任務邏輯
    }
}
```

## 總結

ThreadPoolExecutor 是 Java 並發編程的核心工具，通過復用線程提高系統性能。理解其核心參數（corePoolSize、maximumPoolSize、workQueue、handler）和工作流程是正確使用線程池的關鍵。應該根據任務類型（CPU 密集或 IO 密集）合理設置參數，使用有界隊列防止 OOM，選擇合適的拒絕策略，並做好監控和調優。避免使用 Executors 工廠方法，手動創建線程池以獲得更好的控制。掌握線程池是資深 Java 工程師必備的技能。
