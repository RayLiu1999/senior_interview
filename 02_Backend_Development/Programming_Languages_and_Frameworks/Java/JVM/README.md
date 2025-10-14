# JVM 原理與調優

深入理解 JVM 是資深 Java 工程師的必備技能。本節涵蓋 JVM 記憶體模型、垃圾回收、類加載和性能調優等核心主題。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [JVM 記憶體結構](./memory_structure.md) | 8 | 5 | `Memory`, `Heap`, `Stack` |
| [垃圾回收機制](./garbage_collection.md) | 9 | 5 | `GC`, `Algorithm` |
| [垃圾回收器對比](./gc_collectors.md) | 8 | 5 | `Serial`, `Parallel`, `CMS`, `G1`, `ZGC` |
| [類加載機制](./class_loading.md) | 8 | 5 | `ClassLoader`, `Double Delegation` |
| [JVM 調優](./jvm_tuning.md) | 9 | 5 | `Tuning`, `Performance` |
| [記憶體洩漏排查](./memory_leak.md) | 8 | 5 | `Memory Leak`, `Debugging` |
| [字節碼與 ASM](./bytecode_and_asm.md) | 8 | 3 | `Bytecode`, `ASM` |
| [即時編譯器](./jit_compiler.md) | 8 | 4 | `JIT`, `C1`, `C2` |
| [對象記憶體佈局](./object_memory_layout.md) | 7 | 4 | `Object Layout`, `Memory` |
| [引用類型](./reference_types.md) | 7 | 4 | `Strong`, `Soft`, `Weak`, `Phantom` |

## 核心知識點

### JVM 記憶體結構

#### 運行時數據區
- **程序計數器**：當前線程執行的字節碼行號
- **虛擬機棧**：局部變量表、操作數棧、動態鏈接、方法返回地址
- **本地方法棧**：Native 方法服務
- **堆**：對象實例、陣列
- **方法區**：類信息、常量池、靜態變量（Java 8+ 改為元空間）

#### 堆結構
```
堆 (Heap)
├── 新生代 (Young Generation)
│   ├── Eden 區（80%）
│   ├── Survivor From（10%）
│   └── Survivor To（10%）
└── 老年代 (Old Generation)
```

### 垃圾回收算法

#### 標記-清除（Mark-Sweep）
- **優點**：實現簡單
- **缺點**：產生碎片、效率不穩定

#### 標記-整理（Mark-Compact）
- **優點**：無碎片
- **缺點**：需要移動對象，效率較低

#### 複製算法（Copying）
- **優點**：無碎片、效率高
- **缺點**：浪費一半空間

#### 分代收集
- **新生代**：複製算法（對象存活率低）
- **老年代**：標記-清除或標記-整理（對象存活率高）

### 垃圾回收器

#### Serial GC
- **特點**：單線程、簡單高效
- **適用**：客戶端應用、小內存
- **參數**：`-XX:+UseSerialGC`

#### Parallel GC（默認）
- **特點**：多線程、高吞吐量
- **適用**：後台計算任務
- **參數**：`-XX:+UseParallelGC`

#### CMS（Concurrent Mark Sweep）
- **特點**：並發標記、低停頓
- **缺點**：CPU 敏感、碎片問題
- **參數**：`-XX:+UseConcMarkSweepGC`

#### G1（Garbage First）
- **特點**：分區回收、可預測停頓
- **適用**：大內存、低延遲要求
- **參數**：`-XX:+UseG1GC`

#### ZGC
- **特點**：超低延遲（< 10ms）、大內存支持
- **適用**：超大堆、極低延遲要求
- **參數**：`-XX:+UseZGC`

### 類加載機制

#### 類加載過程
1. **加載（Loading）**：讀取 class 文件
2. **驗證（Verification）**：驗證字節碼安全性
3. **準備（Preparation）**：分配記憶體、設置默認值
4. **解析（Resolution）**：符號引用轉直接引用
5. **初始化（Initialization）**：執行類構造器

#### 類加載器
- **啟動類加載器**：加載核心庫（rt.jar）
- **擴展類加載器**：加載擴展庫（ext 目錄）
- **應用程序類加載器**：加載應用類路徑
- **自定義類加載器**：實現特殊加載邏輯

#### 雙親委派模型
- 子加載器先委派給父加載器
- 父加載器無法加載才由子加載器加載
- 保證核心類不被覆蓋

### JVM 調優

#### 調優目標
1. **降低 GC 頻率**：減少 Minor GC 和 Full GC
2. **減少 GC 停頓時間**：選擇合適的 GC 器
3. **提高吞吐量**：減少 GC 時間佔比
4. **穩定性**：避免 OOM、長時間停頓

#### 關鍵參數

**堆大小設置**：
```bash
-Xms2g              # 初始堆大小
-Xmx2g              # 最大堆大小（建議與 Xms 相同）
-Xmn800m            # 新生代大小
-XX:MetaspaceSize=256m      # 元空間初始大小
-XX:MaxMetaspaceSize=512m   # 元空間最大大小
```

**GC 選擇**：
```bash
-XX:+UseG1GC                    # 使用 G1
-XX:MaxGCPauseMillis=200        # 最大停頓時間
-XX:ParallelGCThreads=8         # 並行 GC 線程數
-XX:ConcGCThreads=2             # 並發 GC 線程數
```

**GC 日誌**：
```bash
-Xlog:gc*:file=gc.log:time,level,tags
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
```

#### 調優流程
1. **監控指標**：GC 頻率、停頓時間、吞吐量
2. **分析日誌**：找出性能瓶頸
3. **調整參數**：根據應用特點調整
4. **壓力測試**：驗證調優效果
5. **持續優化**：長期監控和調整

### 記憶體洩漏排查

#### 常見原因
1. **靜態集合**：持有對象引用不釋放
2. **監聽器未移除**：事件監聽器未註銷
3. **ThreadLocal 未清理**：線程池場景
4. **資源未關閉**：連接、流未關閉
5. **內部類持有外部類引用**

#### 排查工具
- **jmap**：導出堆轉儲
- **MAT**：Eclipse Memory Analyzer
- **JProfiler**：商業分析工具
- **VisualVM**：可視化監控
- **jstack**：線程轉儲

#### 排查步驟
1. 監控記憶體增長趨勢
2. 導出堆轉儲文件
3. 使用 MAT 分析大對象
4. 找出 GC Roots 引用鏈
5. 定位代碼位置並修復

## 學習建議

### 學習路徑
1. **JVM 基礎**：記憶體模型、對象創建、GC 基礎
2. **GC 深入**：GC 算法、各種 GC 器特點
3. **類加載**：類加載過程、雙親委派
4. **調優實戰**：參數調整、日誌分析
5. **問題排查**：記憶體洩漏、CPU 飆高

### 實踐建議
- 使用 JVM 參數運行程序，觀察效果
- 閱讀 GC 日誌，理解 GC 行為
- 使用 MAT 分析堆轉儲
- 編寫測試程序模擬 OOM、記憶體洩漏
- 閱讀《深入理解 Java 虛擬機》

## 最佳實踐

### 參數配置
1. **Xms 和 Xmx 設置相同**：避免動態擴展
2. **新生代不宜過小**：頻繁 Minor GC
3. **新生代不宜過大**：Minor GC 時間長
4. **選擇合適的 GC 器**：根據應用特點
5. **啟用 GC 日誌**：生產環境必備

### 代碼優化
1. **對象復用**：減少對象創建
2. **使用基本類型**：避免自動裝箱
3. **及時清理引用**：防止記憶體洩漏
4. **合理使用緩存**：設置過期時間
5. **資源及時關閉**：使用 try-with-resources
