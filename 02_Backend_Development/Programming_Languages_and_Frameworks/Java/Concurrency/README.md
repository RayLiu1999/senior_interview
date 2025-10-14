# Java 並發編程

Java 並發編程是資深工程師必須精通的領域。本節涵蓋 Java 記憶體模型、鎖機制、線程池和並發容器等核心主題。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Java 記憶體模型](./java_memory_model.md) | 9 | 5 | `JMM`, `happens-before`, `volatile` |
| [synchronized 關鍵字](./synchronized_keyword.md) | 8 | 5 | `synchronized`, `Monitor`, `Lock` |
| [ReentrantLock 詳解](./reentrant_lock.md) | 8 | 5 | `AQS`, `Lock`, `Condition` |
| [線程池原理](./thread_pool.md) | 8 | 5 | `ThreadPoolExecutor`, `Executors` |
| [並發容器](./concurrent_collections.md) | 8 | 5 | `ConcurrentHashMap`, `CopyOnWrite` |
| [原子類](./atomic_classes.md) | 7 | 4 | `Atomic`, `CAS` |
| [CountDownLatch 與 CyclicBarrier](./synchronizers.md) | 7 | 4 | `Synchronizer`, `Coordination` |
| [ForkJoin 框架](./forkjoin_framework.md) | 7 | 3 | `ForkJoin`, `Work Stealing` |
| [CompletableFuture](./completable_future.md) | 7 | 4 | `Async`, `Future` |
| [ThreadLocal](./thread_local.md) | 7 | 4 | `ThreadLocal`, `Memory Leak` |
| [線程安全](./thread_safety.md) | 7 | 5 | `Thread Safety`, `Immutability` |
| [死鎖問題](./deadlock.md) | 7 | 5 | `Deadlock`, `Livelock` |

## 核心知識點

### Java 記憶體模型（JMM）
- **主記憶體與工作記憶體**：變量存儲與線程交互
- **happens-before 規則**：操作順序保證
- **volatile 關鍵字**：可見性與禁止重排序
- **final 關鍵字**：不可變性保證
- **記憶體屏障**：CPU 指令級別的同步

### 鎖機制
- **synchronized**：隱式鎖、對象監視器
- **ReentrantLock**：顯式鎖、更靈活的控制
- **ReadWriteLock**：讀寫分離鎖
- **鎖升級**：無鎖 → 偏向鎖 → 輕量級鎖 → 重量級鎖
- **AQS 框架**：AbstractQueuedSynchronizer

### 線程池
- **核心參數**：核心線程數、最大線程數、隊列、拒絕策略
- **工作流程**：提交任務 → 核心線程 → 隊列 → 非核心線程 → 拒絕
- **線程池類型**：FixedThreadPool、CachedThreadPool、SingleThreadExecutor
- **拒絕策略**：AbortPolicy、CallerRunsPolicy、DiscardPolicy
- **調優策略**：根據 CPU 密集或 IO 密集調整參數

### 並發容器
- **ConcurrentHashMap**：分段鎖、CAS 操作
- **CopyOnWriteArrayList**：寫時複製
- **BlockingQueue**：阻塞隊列家族
- **ConcurrentLinkedQueue**：無鎖隊列

### 原子類
- **基本類型**：AtomicInteger、AtomicLong、AtomicBoolean
- **陣列類型**：AtomicIntegerArray、AtomicLongArray
- **引用類型**：AtomicReference、AtomicStampedReference
- **字段更新器**：AtomicIntegerFieldUpdater
- **CAS 原理**：Compare And Swap

### 同步輔助類
- **CountDownLatch**：等待多個線程完成
- **CyclicBarrier**：循環柵欄，可重用
- **Semaphore**：信號量，控制並發數
- **Exchanger**：線程間交換數據
- **Phaser**：階段同步器

## 學習建議

### 學習路徑
1. **基礎概念**：線程、進程、並發、並行
2. **JMM 理論**：happens-before、volatile、final
3. **鎖機制**：synchronized、Lock、AQS
4. **線程池**：ThreadPoolExecutor、調優
5. **並發容器**：ConcurrentHashMap、BlockingQueue
6. **高級工具**：CompletableFuture、ForkJoin

### 實踐建議
- 理解並發問題的本質（可見性、原子性、有序性）
- 多寫並發代碼，積累經驗
- 學會使用 JMH 進行基準測試
- 閱讀 JDK 源碼（AQS、ConcurrentHashMap）
- 理解 CPU 緩存、記憶體屏障等底層知識

## 常見陷阱

### 可見性問題
```java
// 錯誤：stop 變量可能不可見
private boolean stop = false;

public void run() {
    while (!stop) {
        // 可能永遠不會停止
    }
}

// 正確：使用 volatile
private volatile boolean stop = false;
```

### 線程池使用
```java
// 錯誤：使用 Executors 創建線程池可能 OOM
ExecutorService executor = Executors.newFixedThreadPool(10);

// 正確：手動創建線程池，控制隊列大小
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10, 20, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),  // 有界隊列
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

### ConcurrentHashMap 誤用
```java
// 錯誤：非原子操作
if (!map.containsKey(key)) {
    map.put(key, value);  // 可能被其他線程插入
}

// 正確：使用原子方法
map.putIfAbsent(key, value);
```

## 最佳實踐

### 併發設計原則
1. **最小化同步範圍**：只鎖必要的代碼
2. **使用併發工具**：優先使用 JUC 包
3. **不可變對象**：無狀態或不可變優先
4. **避免鎖嵌套**：防止死鎖
5. **使用線程池**：不要手動創建線程

### 性能優化
1. **減少鎖競爭**：縮小鎖粒度、使用讀寫鎖
2. **無鎖編程**：使用 CAS、原子類
3. **合理使用線程池**：根據任務類型調整參數
4. **使用併發容器**：替代同步包裝
5. **異步處理**：CompletableFuture、消息隊列
