# Java 泛型機制詳解

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Generics`, `Type System`, `Type Erasure`

## 問題詳述

Java 泛型是 JDK 5 引入的重要特性，提供了編譯時類型安全。請深入解釋泛型的原理、類型擦除機制、通配符使用和常見限制。

## 核心理論與詳解

### 泛型概述

#### 為什麼需要泛型

**沒有泛型的問題**：
```java
// JDK 1.5 之前
List list = new ArrayList();
list.add("string");
list.add(123);

// 需要強制轉換，可能出現 ClassCastException
String str = (String) list.get(0);
Integer num = (Integer) list.get(1);
```

**泛型的優勢**：
1. **類型安全**：編譯時檢查類型
2. **消除強制轉換**：自動類型轉換
3. **代碼重用**：一個類型可處理多種類型

```java
// 使用泛型
List<String> list = new ArrayList<>();
list.add("string");
// list.add(123);  // 編譯錯誤
String str = list.get(0);  // 不需要強制轉換
```

### 泛型類

#### 定義泛型類

```java
public class Box<T> {
    private T value;
    
    public void set(T value) {
        this.value = value;
    }
    
    public T get() {
        return value;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String value = stringBox.get();

Box<Integer> intBox = new Box<>();
intBox.set(123);
Integer num = intBox.get();
```

#### 多個類型參數

```java
public class Pair<K, V> {
    private K key;
    private V value;
    
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
    
    public K getKey() { return key; }
    public V getValue() { return value; }
}

// 使用
Pair<String, Integer> pair = new Pair<>("age", 25);
```

#### 類型參數命名約定

- **E** - Element（集合元素）
- **K** - Key（鍵）
- **V** - Value（值）
- **N** - Number（數字）
- **T** - Type（類型）
- **S, U, V** - 第 2、3、4 個類型

### 泛型方法

#### 定義泛型方法

```java
public class Utils {
    // 泛型方法
    public static <T> T getMiddle(T... args) {
        return args[args.length / 2];
    }
    
    // 使用
    public static void main(String[] args) {
        String middle = Utils.<String>getMiddle("a", "b", "c");
        // 類型推斷，可省略類型參數
        String mid = Utils.getMiddle("a", "b", "c");
        Integer num = Utils.getMiddle(1, 2, 3);
    }
}
```

#### 泛型方法與泛型類

```java
// 泛型類中的泛型方法
public class Box<T> {
    private T value;
    
    // 使用類的類型參數
    public void set(T value) {
        this.value = value;
    }
    
    // 獨立的泛型方法
    public <U> void inspect(U u) {
        System.out.println("T: " + value.getClass().getName());
        System.out.println("U: " + u.getClass().getName());
    }
}
```

### 類型擦除（Type Erasure）

#### 什麼是類型擦除

Java 泛型是通過類型擦除實現的：
- **編譯時**：有完整的類型信息，進行類型檢查
- **運行時**：類型信息被擦除，泛型類型變為原始類型

```java
// 編譯前
List<String> stringList = new ArrayList<>();
List<Integer> intList = new ArrayList<>();

// 編譯後（類型擦除）
List stringList = new ArrayList();
List intList = new ArrayList();

// 運行時，兩者是同一個類型
System.out.println(stringList.getClass() == intList.getClass());  // true
```

#### 擦除規則

**無界類型參數**：擦除為 Object
```java
// 擦除前
public class Box<T> {
    private T value;
    public T get() { return value; }
}

// 擦除後
public class Box {
    private Object value;
    public Object get() { return value; }
}
```

**有界類型參數**：擦除為第一個邊界
```java
// 擦除前
public class NumberBox<T extends Number> {
    private T value;
    public T get() { return value; }
}

// 擦除後
public class NumberBox {
    private Number value;
    public Number get() { return value; }
}
```

**多個邊界**：擦除為第一個邊界
```java
// 擦除前
public class Box<T extends Comparable<T> & Serializable> {
    private T value;
}

// 擦除後
public class Box {
    private Comparable value;  // 第一個邊界
}
```

#### 類型擦除的影響

**1. 不能使用基本類型**：
```java
// 錯誤
List<int> list = new ArrayList<>();

// 正確：使用包裝類
List<Integer> list = new ArrayList<>();
```

**2. 不能創建泛型陣列**：
```java
// 錯誤
T[] array = new T[10];
List<String>[] arrays = new ArrayList<String>[10];

// 正確：使用集合或通配符
List<String>[] arrays = new ArrayList<?>[10];
@SuppressWarnings("unchecked")
List<String>[] arrays = (List<String>[]) new ArrayList[10];
```

**3. 不能使用 instanceof**：
```java
// 錯誤
if (obj instanceof List<String>) { }

// 正確
if (obj instanceof List<?>) { }
if (obj instanceof List) { }
```

**4. 不能在靜態上下文中使用類型參數**：
```java
public class Box<T> {
    // 錯誤：靜態字段不能使用類型參數
    private static T value;
    
    // 錯誤：靜態方法不能使用類的類型參數
    public static T getValue() { return value; }
    
    // 正確：靜態泛型方法有自己的類型參數
    public static <U> U getStaticValue(U u) { return u; }
}
```

### 通配符（Wildcards）

#### 無界通配符（Unbounded Wildcard）

```java
// ? 表示任何類型
public static void printList(List<?> list) {
    for (Object obj : list) {
        System.out.println(obj);
    }
}

// 可以接受任何類型的 List
printList(new ArrayList<String>());
printList(new ArrayList<Integer>());
```

**限制**：不能添加元素（null 除外）
```java
List<?> list = new ArrayList<String>();
// list.add("test");  // 編譯錯誤
list.add(null);  // 可以
Object obj = list.get(0);  // 可以讀取為 Object
```

#### 上界通配符（Upper Bounded Wildcard）

```java
// <? extends T> 表示 T 或 T 的子類
public static double sum(List<? extends Number> list) {
    double sum = 0.0;
    for (Number num : list) {
        sum += num.doubleValue();
    }
    return sum;
}

// 可以接受 Number 及其子類的 List
sum(new ArrayList<Integer>());
sum(new ArrayList<Double>());
sum(new ArrayList<Number>());
```

**特點**：
- 可以讀取為邊界類型
- 不能添加元素（null 除外）

```java
List<? extends Number> list = new ArrayList<Integer>();
Number num = list.get(0);  // 可以讀取
// list.add(123);  // 編譯錯誤：不知道具體類型
// list.add(new Integer(123));  // 編譯錯誤
list.add(null);  // 可以
```

**原因**：編譯器不知道具體是哪個子類型，無法保證類型安全

#### 下界通配符（Lower Bounded Wildcard）

```java
// <? super T> 表示 T 或 T 的父類
public static void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}

// 可以接受 Integer 及其父類的 List
addNumbers(new ArrayList<Integer>());
addNumbers(new ArrayList<Number>());
addNumbers(new ArrayList<Object>());
```

**特點**：
- 可以添加元素
- 讀取只能為 Object

```java
List<? super Integer> list = new ArrayList<Number>();
list.add(123);  // 可以添加 Integer
list.add(new Integer(456));  // 可以
// list.add(3.14);  // 編譯錯誤：不是 Integer 或其子類

Object obj = list.get(0);  // 只能讀取為 Object
// Integer num = list.get(0);  // 編譯錯誤
```

#### PECS 原則

**Producer Extends, Consumer Super**

- **Producer（生產者）- 讀取數據**：使用 `<? extends T>`
- **Consumer（消費者）- 寫入數據**：使用 `<? super T>`

```java
// Producer：從 src 讀取數據
public static <T> void copy(
    List<? super T> dest,     // Consumer：寫入 dest
    List<? extends T> src     // Producer：讀取 src
) {
    for (T item : src) {
        dest.add(item);
    }
}

// 使用
List<Number> dest = new ArrayList<>();
List<Integer> src = Arrays.asList(1, 2, 3);
copy(dest, src);
```

**實際應用**：Collections.copy()
```java
public static <T> void copy(
    List<? super T> dest, 
    List<? extends T> src
) {
    // ...
}
```

### 類型邊界

#### 單個邊界

```java
// T 必須是 Comparable 或其子類
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}

// 使用
Integer maxInt = max(10, 20);
String maxStr = max("a", "b");
```

#### 多個邊界

```java
// T 必須同時實現 Comparable 和 Serializable
public class Box<T extends Comparable<T> & Serializable> {
    private T value;
    
    public void compareAndSerialize(T other) {
        int result = value.compareTo(other);  // Comparable
        // 可以序列化
    }
}
```

**注意**：
- 類必須在接口之前
- 最多一個類，多個接口

```java
// 正確
<T extends Number & Comparable<T>>

// 錯誤：類不在第一位
<T extends Comparable<T> & Number>

// 錯誤：多個類
<T extends Number & Integer>
```

### 泛型與繼承

#### 泛型不變性

```java
List<String> stringList = new ArrayList<>();
// List<Object> objectList = stringList;  // 編譯錯誤

// 為什麼？假設允許
List<Object> objectList = stringList;  // 假設允許
objectList.add(123);  // 添加 Integer
String str = stringList.get(0);  // ClassCastException！
```

**泛型是不變的**：即使 String 是 Object 的子類，`List<String>` 也不是 `List<Object>` 的子類。

#### 通配符的協變和逆變

```java
// 協變：<? extends T>
List<? extends Number> list = new ArrayList<Integer>();

// 逆變：<? super T>
List<? super Integer> list = new ArrayList<Number>();
```

### 泛型限制總結

**1. 不能實例化類型參數**：
```java
// 錯誤
T obj = new T();
T[] array = new T[10];

// 解決方案：使用 Class 對象
public static <T> T create(Class<T> clazz) throws Exception {
    return clazz.newInstance();
}
```

**2. 不能創建泛型陣列**：
```java
// 錯誤
List<String>[] arrays = new ArrayList<String>[10];

// 解決方案
List<?>[] arrays = new ArrayList<?>[10];
List<String>[] arrays = new ArrayList[10];  // 警告
```

**3. 泛型類不能繼承 Throwable**：
```java
// 錯誤
public class MyException<T> extends Exception { }
```

**4. 不能捕獲泛型異常**：
```java
// 錯誤
try {
    // ...
} catch (T e) {
    // ...
}
```

**5. 靜態上下文限制**：
```java
public class Box<T> {
    // 錯誤
    private static T value;
    
    // 正確：靜態泛型方法
    public static <U> void method(U u) { }
}
```

### 實際應用

#### 泛型 DAO

```java
public interface BaseDao<T, ID> {
    T findById(ID id);
    List<T> findAll();
    void save(T entity);
    void update(T entity);
    void delete(ID id);
}

public class UserDao implements BaseDao<User, Long> {
    @Override
    public User findById(Long id) {
        // 實現
        return null;
    }
    
    @Override
    public List<User> findAll() {
        // 實現
        return null;
    }
    
    // ... 其他方法實現
}
```

#### 泛型構建器

```java
public class Builder<T> {
    private final T target;
    
    public Builder(Class<T> clazz) throws Exception {
        this.target = clazz.newInstance();
    }
    
    public <V> Builder<T> with(
        BiConsumer<T, V> setter, V value
    ) {
        setter.accept(target, value);
        return this;
    }
    
    public T build() {
        return target;
    }
}

// 使用
User user = new Builder<>(User.class)
    .with(User::setName, "John")
    .with(User::setAge, 25)
    .build();
```

### 最佳實踐

**1. 優先使用泛型類型**：
```java
// 推薦
List<String> list = new ArrayList<>();

// 不推薦：原始類型
List list = new ArrayList();
```

**2. 消除未檢查警告**：
```java
@SuppressWarnings("unchecked")
List<String>[] arrays = (List<String>[]) new ArrayList[10];
```

**3. 優先使用 List 而非陣列**：
```java
// 推薦
List<String> list = new ArrayList<>();

// 不推薦
String[] array = new String[10];
```

**4. 使用有界通配符提高靈活性**：
```java
// 更靈活
public void process(List<? extends Number> list) { }

// 較死板
public void process(List<Number> list) { }
```

**5. 返回類型不要使用通配符**：
```java
// 不推薦
public List<?> getList() { return list; }

// 推薦
public <T> List<T> getList() { return list; }
public List<String> getList() { return list; }
```

## 總結

Java 泛型通過類型擦除實現，在編譯時提供類型安全檢查，運行時擦除類型信息。理解泛型的原理、通配符的使用（PECS 原則）和各種限制是掌握泛型的關鍵。泛型不僅提高了代碼的類型安全性，還增強了代碼的重用性和可讀性。掌握泛型是 Java 開發者必備的技能，也是理解 Java 集合框架和許多高級特性的基礎。
