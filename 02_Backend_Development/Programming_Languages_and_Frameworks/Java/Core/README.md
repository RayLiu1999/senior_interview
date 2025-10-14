# Java 核心特性

本節涵蓋 Java 語言的核心特性、集合框架和現代 Java 的重要概念。這些主題是資深 Java 開發者面試中的必考內容。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [Java 集合框架深入解析](./java_collections_framework.md) | 8 | 5 | `Collections`, `Data Structures` |
| [泛型機制詳解](./generics_explained.md) | 7 | 5 | `Generics`, `Type System` |
| [異常處理最佳實踐](./exception_handling.md) | 6 | 5 | `Exception`, `Error Handling` |
| [Java 8+ 新特性](./java8_plus_features.md) | 7 | 5 | `Lambda`, `Stream API`, `Modern Java` |
| [反射與註解](./reflection_and_annotations.md) | 8 | 4 | `Reflection`, `Annotations`, `Metaprogramming` |
| [IO 與 NIO](./io_and_nio.md) | 7 | 4 | `IO`, `NIO`, `Network` |
| [序列化機制](./serialization.md) | 6 | 4 | `Serialization`, `Persistence` |
| [內部類與匿名類](./inner_classes.md) | 6 | 3 | `Inner Classes`, `Anonymous Classes` |
| [String 與不可變性](./string_immutability.md) | 6 | 5 | `String`, `Immutability` |
| [equals 與 hashCode](./equals_and_hashcode.md) | 7 | 5 | `Object Methods`, `Hash` |
| [克隆機制](./cloning.md) | 6 | 3 | `Clone`, `Copy` |
| [枚舉類型](./enum_types.md) | 5 | 4 | `Enum`, `Type Safety` |
| [接口與抽象類](./interface_vs_abstract.md) | 6 | 5 | `OOP`, `Design` |
| [Java 模組系統](./java_module_system.md) | 7 | 3 | `JPMS`, `Modules`, `Java 9+` |
| [函數式編程](./functional_programming.md) | 7 | 5 | `Functional`, `Lambda`, `Stream` |

## 核心知識點

### 集合框架
- **List 實現**：ArrayList（動態陣列）、LinkedList（雙向鏈表）
- **Set 實現**：HashSet（哈希表）、TreeSet（紅黑樹）、LinkedHashSet（保序）
- **Map 實現**：HashMap（哈希表）、TreeMap（紅黑樹）、LinkedHashMap（保序）
- **Queue 實現**：PriorityQueue（堆）、ArrayDeque（雙端隊列）
- **並發集合**：ConcurrentHashMap、CopyOnWriteArrayList

### 泛型系統
- **類型參數**：`<T>`, `<E>`, `<K, V>`
- **通配符**：`<?>`, `<? extends T>`, `<? super T>`
- **類型擦除**：編譯時檢查、運行時擦除
- **泛型方法**：方法級別的類型參數
- **泛型限制**：不能創建泛型陣列、不能用於靜態字段

### 異常處理
- **Checked Exception**：必須捕獲或聲明拋出
- **Unchecked Exception**：RuntimeException 及其子類
- **Error**：系統級錯誤，通常不捕獲
- **try-with-resources**：自動資源管理
- **自定義異常**：異常設計原則

### Java 8+ 特性
- **Lambda 表達式**：函數式編程基礎
- **Stream API**：聲明式數據處理
- **Optional**：避免 null 檢查
- **方法引用**：更簡潔的 Lambda
- **默認方法**：接口演進
- **日期時間 API**：LocalDate、LocalDateTime

### 反射與註解
- **Class 類**：類的元數據
- **Field/Method/Constructor**：成員反射
- **動態代理**：Proxy、InvocationHandler
- **註解處理**：@Retention、@Target
- **運行時註解**：通過反射讀取

### IO 系統
- **字節流**：InputStream、OutputStream
- **字符流**：Reader、Writer
- **緩衝流**：BufferedInputStream、BufferedReader
- **NIO**：Channel、Buffer、Selector
- **文件操作**：File、Path、Files

## 學習路線

### 階段一：基礎鞏固
1. 掌握集合框架的基本使用
2. 理解泛型的基本概念
3. 學習異常處理機制
4. 熟悉常用 API

### 階段二：原理深入
1. 研究 ArrayList、HashMap 源碼
2. 理解泛型類型擦除機制
3. 學習反射 API
4. 掌握 IO 與 NIO 區別

### 階段三：實戰應用
1. 使用 Stream API 處理數據
2. 應用註解和反射
3. 實現自定義集合
4. 優化 IO 性能

## 常見面試問題

### 集合相關
- ArrayList 和 LinkedList 的區別？
- HashMap 的實現原理？
- ConcurrentHashMap 如何實現線程安全？
- 如何選擇合適的集合？

### 泛型相關
- 泛型擦除是什麼？有什麼影響？
- `<? extends T>` 和 `<? super T>` 的區別？
- 為什麼泛型陣列不能創建？

### 異常相關
- Checked 和 Unchecked Exception 的區別？
- 如何設計異常體系？
- try-with-resources 的原理？

### Java 8+ 相關
- Lambda 表達式的本質是什麼？
- Stream API 的優勢？
- Optional 如何使用？

## 最佳實踐

### 集合使用
- 優先使用接口類型聲明變量
- 根據場景選擇合適的集合
- 注意併發場景下的線程安全
- 合理設置初始容量

### 泛型設計
- 使用泛型提高類型安全
- 合理使用通配符
- 避免原始類型（Raw Type）
- 優先使用泛型方法

### 異常處理
- 不要捕獲 Throwable 或 Error
- 異常要有意義的消息
- 不要使用異常控制流程
- 正確關閉資源

### 代碼風格
- 遵循 Java 命名規範
- 使用 final 修飾不變變量
- 優先使用組合而非繼承
- 編寫簡潔的代碼
