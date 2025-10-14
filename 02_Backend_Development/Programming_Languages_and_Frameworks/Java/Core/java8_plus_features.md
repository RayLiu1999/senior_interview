# Java 8+ 新特性

- **難度**: 7
- **重要程度**: 5
- **標籤**: `Java 8`, `Lambda`, `Stream API`, `Modern Java`

## 問題詳述

Java 8 是 Java 歷史上最重要的版本之一，引入了 Lambda 表達式、Stream API、Optional 等革命性特性。請詳細解釋這些新特性的使用和原理。

## 核心理論與詳解

### Lambda 表達式

#### 什麼是 Lambda

Lambda 表達式是一個匿名函數，可以作為參數傳遞或賦值給變量。

**語法**：
```
(parameters) -> expression
(parameters) -> { statements; }
```

**示例**：
```java
// 無參數
() -> System.out.println("Hello")

// 單參數（括號可省略）
x -> x * x

// 多參數
(x, y) -> x + y

// 多行語句
(x, y) -> {
    int sum = x + y;
    return sum;
}
```

#### Lambda 與函數式接口

Lambda 表達式實現函數式接口（只有一個抽象方法的接口）。

```java
// 函數式接口
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}

// 傳統寫法
Calculator add = new Calculator() {
    @Override
    public int calculate(int a, int b) {
        return a + b;
    }
};

// Lambda 寫法
Calculator add = (a, b) -> a + b;

// 使用
int result = add.calculate(10, 20);  // 30
```

#### 常用函數式接口

**java.util.function 包**：

**1. Function<T, R>**：接受一個參數，返回結果
```java
Function<String, Integer> strLength = s -> s.length();
Integer len = strLength.apply("Hello");  // 5
```

**2. Consumer<T>**：接受一個參數，無返回值
```java
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");
```

**3. Supplier<T>**：無參數，返回結果
```java
Supplier<String> supplier = () -> "Hello";
String value = supplier.get();
```

**4. Predicate<T>**：接受一個參數，返回 boolean
```java
Predicate<Integer> isEven = n -> n % 2 == 0;
boolean result = isEven.test(4);  // true
```

**5. BiFunction<T, U, R>**：接受兩個參數，返回結果
```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
Integer sum = add.apply(10, 20);  // 30
```

### 方法引用

方法引用是 Lambda 表達式的簡化寫法。

**四種類型**：

**1. 靜態方法引用**：`類名::靜態方法`
```java
// Lambda
Function<String, Integer> func = s -> Integer.parseInt(s);

// 方法引用
Function<String, Integer> func = Integer::parseInt;
```

**2. 實例方法引用**：`對象::實例方法`
```java
String str = "Hello";
Supplier<Integer> supplier = str::length;
```

**3. 類的實例方法引用**：`類名::實例方法`
```java
// Lambda
BiPredicate<String, String> pred = (s1, s2) -> s1.equals(s2);

// 方法引用
BiPredicate<String, String> pred = String::equals;
```

**4. 構造器引用**：`類名::new`
```java
// Lambda
Supplier<List<String>> supplier = () -> new ArrayList<>();

// 構造器引用
Supplier<List<String>> supplier = ArrayList::new;

// 帶參數的構造器
Function<Integer, List<String>> func = ArrayList::new;
List<String> list = func.apply(10);  // 初始容量 10
```

### Stream API

#### 什麼是 Stream

Stream 是 Java 8 引入的數據處理抽象，支持聲明式數據操作。

**特點**：
- 不存儲數據
- 不改變源數據
- 延遲執行（終端操作觸發）
- 可並行處理

**創建 Stream**：
```java
// 從集合創建
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> stream = list.stream();

// 從陣列創建
String[] array = {"a", "b", "c"};
Stream<String> stream = Arrays.stream(array);

// 使用 Stream.of()
Stream<String> stream = Stream.of("a", "b", "c");

// 無限流
Stream<Integer> stream = Stream.iterate(0, n -> n + 1);
Stream<Double> stream = Stream.generate(Math::random);
```

#### 中間操作

**filter()**：過濾
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());  // [2, 4]
```

**map()**：映射轉換
```java
List<String> words = Arrays.asList("hello", "world");
List<Integer> lengths = words.stream()
    .map(String::length)
    .collect(Collectors.toList());  // [5, 5]
```

**flatMap()**：扁平化映射
```java
List<List<Integer>> lists = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4)
);
List<Integer> flatList = lists.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());  // [1, 2, 3, 4]
```

**distinct()**：去重
```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 3);
List<Integer> distinct = numbers.stream()
    .distinct()
    .collect(Collectors.toList());  // [1, 2, 3]
```

**sorted()**：排序
```java
List<Integer> numbers = Arrays.asList(3, 1, 4, 1, 5);
List<Integer> sorted = numbers.stream()
    .sorted()
    .collect(Collectors.toList());  // [1, 1, 3, 4, 5]

// 自定義比較器
List<String> words = Arrays.asList("hello", "a", "world");
List<String> sorted = words.stream()
    .sorted(Comparator.comparing(String::length))
    .collect(Collectors.toList());  // [a, hello, world]
```

**limit() 和 skip()**：限制和跳過
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> limited = numbers.stream()
    .limit(3)
    .collect(Collectors.toList());  // [1, 2, 3]

List<Integer> skipped = numbers.stream()
    .skip(2)
    .collect(Collectors.toList());  // [3, 4, 5]
```

**peek()**：查看（調試用）
```java
List<Integer> numbers = Arrays.asList(1, 2, 3);
numbers.stream()
    .peek(n -> System.out.println("Original: " + n))
    .map(n -> n * 2)
    .peek(n -> System.out.println("Doubled: " + n))
    .collect(Collectors.toList());
```

#### 終端操作

**collect()**：收集結果
```java
// 轉為 List
List<String> list = stream.collect(Collectors.toList());

// 轉為 Set
Set<String> set = stream.collect(Collectors.toSet());

// 轉為 Map
Map<String, Integer> map = words.stream()
    .collect(Collectors.toMap(
        word -> word,
        String::length
    ));

// 分組
Map<Integer, List<String>> grouped = words.stream()
    .collect(Collectors.groupingBy(String::length));

// 分區
Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));
```

**forEach()**：遍歷
```java
list.stream().forEach(System.out::println);
```

**reduce()**：歸約
```java
// 求和
int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b);

// 求最大值
Optional<Integer> max = numbers.stream()
    .reduce(Integer::max);

// 連接字符串
String result = words.stream()
    .reduce("", (a, b) -> a + b);
```

**count()**：計數
```java
long count = stream.count();
```

**anyMatch(), allMatch(), noneMatch()**：匹配
```java
boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0);

boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0);

boolean noneNegative = numbers.stream()
    .noneMatch(n -> n < 0);
```

**findFirst(), findAny()**：查找
```java
Optional<Integer> first = numbers.stream()
    .filter(n -> n > 3)
    .findFirst();

Optional<Integer> any = numbers.stream()
    .filter(n -> n > 3)
    .findAny();
```

**min(), max()**：最值
```java
Optional<Integer> min = numbers.stream()
    .min(Integer::compareTo);

Optional<Integer> max = numbers.stream()
    .max(Integer::compareTo);
```

#### 並行 Stream

```java
// 並行處理
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();

// 注意：並行不一定更快，小數據集可能更慢
```

### Optional

#### 為什麼需要 Optional

避免 NullPointerException，提供更優雅的空值處理。

```java
// 傳統方式
String name = user.getName();
if (name != null) {
    System.out.println(name.toUpperCase());
}

// Optional 方式
Optional<String> name = user.getNameOptional();
name.ifPresent(n -> System.out.println(n.toUpperCase()));
```

#### Optional 創建

```java
// 創建包含值的 Optional
Optional<String> opt = Optional.of("value");

// 創建可能為空的 Optional
Optional<String> opt = Optional.ofNullable(value);

// 創建空的 Optional
Optional<String> opt = Optional.empty();
```

#### Optional 常用方法

**isPresent() 和 ifPresent()**：
```java
Optional<String> opt = Optional.of("value");

// 判斷是否有值
if (opt.isPresent()) {
    System.out.println(opt.get());
}

// 有值時執行
opt.ifPresent(System.out::println);
```

**orElse() 和 orElseGet()**：
```java
// 提供默認值
String value = opt.orElse("default");

// 延遲計算默認值
String value = opt.orElseGet(() -> computeDefault());
```

**orElseThrow()**：
```java
// 拋出異常
String value = opt.orElseThrow(
    () -> new IllegalStateException("Value not found")
);
```

**map() 和 flatMap()**：
```java
Optional<String> name = Optional.of("John");

// map：轉換值
Optional<Integer> length = name.map(String::length);

// flatMap：避免 Optional<Optional<T>>
Optional<String> upper = name.flatMap(
    n -> Optional.of(n.toUpperCase())
);
```

**filter()**：
```java
Optional<String> name = Optional.of("John");
Optional<String> longName = name.filter(n -> n.length() > 3);
```

#### Optional 最佳實踐

```java
// ✅ 推薦：鏈式調用
user.getAddress()
    .flatMap(Address::getCity)
    .map(City::getName)
    .orElse("Unknown");

// ❌ 不推薦：直接 get()
String city = user.getAddress().get()  // 可能拋出異常
    .getCity().get()
    .getName();

// ❌ 不推薦：用 Optional 作為參數
public void method(Optional<String> name) { }  // 不推薦

// ✅ 推薦：返回 Optional
public Optional<User> findById(Long id) { }
```

### 接口默認方法和靜態方法

#### 默認方法

```java
public interface Vehicle {
    // 默認方法
    default void print() {
        System.out.println("I am a vehicle");
    }
    
    // 抽象方法
    void move();
}

// 實現類可以不覆蓋默認方法
public class Car implements Vehicle {
    @Override
    public void move() {
        System.out.println("Car is moving");
    }
    // 繼承了 print() 方法
}
```

**解決衝突**：
```java
public interface InterfaceA {
    default void hello() {
        System.out.println("Hello from A");
    }
}

public interface InterfaceB {
    default void hello() {
        System.out.println("Hello from B");
    }
}

// 必須覆蓋 hello()
public class MyClass implements InterfaceA, InterfaceB {
    @Override
    public void hello() {
        // 選擇一個
        InterfaceA.super.hello();
        // 或自定義實現
    }
}
```

#### 靜態方法

```java
public interface Utils {
    static int add(int a, int b) {
        return a + b;
    }
}

// 使用
int sum = Utils.add(10, 20);
```

### 新的日期時間 API

#### LocalDate、LocalTime、LocalDateTime

```java
// 當前日期
LocalDate today = LocalDate.now();

// 指定日期
LocalDate date = LocalDate.of(2024, 12, 20);

// 當前時間
LocalTime time = LocalTime.now();

// 日期時間
LocalDateTime dateTime = LocalDateTime.now();

// 操作
LocalDate tomorrow = today.plusDays(1);
LocalDate lastWeek = today.minusWeeks(1);

// 比較
boolean isBefore = date1.isBefore(date2);
boolean isAfter = date1.isAfter(date2);
```

#### ZonedDateTime

```java
// 帶時區的日期時間
ZonedDateTime zonedDateTime = ZonedDateTime.now();

// 指定時區
ZonedDateTime tokyo = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
```

#### Period 和 Duration

```java
// Period：日期間隔
LocalDate start = LocalDate.of(2024, 1, 1);
LocalDate end = LocalDate.of(2024, 12, 31);
Period period = Period.between(start, end);
int days = period.getDays();

// Duration：時間間隔
LocalTime time1 = LocalTime.of(10, 0);
LocalTime time2 = LocalTime.of(14, 30);
Duration duration = Duration.between(time1, time2);
long hours = duration.toHours();
```

#### DateTimeFormatter

```java
// 格式化
LocalDateTime dateTime = LocalDateTime.now();
String formatted = dateTime.format(
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
);

// 解析
LocalDateTime parsed = LocalDateTime.parse(
    "2024-12-20 10:30:00",
    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
);
```

### 其他重要特性

#### 重複註解

```java
@Repeatable(Authors.class)
@interface Author {
    String name();
}

@interface Authors {
    Author[] value();
}

// 使用
@Author(name = "John")
@Author(name = "Jane")
public class Book { }
```

#### 類型註解

```java
// 可以在任何使用類型的地方使用註解
@NotNull String str;
List<@NotNull String> list;
```

#### Base64 編碼

```java
// 編碼
String encoded = Base64.getEncoder()
    .encodeToString("Hello".getBytes());

// 解碼
byte[] decoded = Base64.getDecoder().decode(encoded);
```

### 實際應用示例

#### 數據處理管道

```java
List<User> users = getUsers();

// 找出年齡大於 18 歲的用戶名稱，按名稱排序
List<String> names = users.stream()
    .filter(user -> user.getAge() > 18)
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());

// 按部門分組
Map<String, List<User>> byDept = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment));

// 計算平均年齡
double avgAge = users.stream()
    .mapToInt(User::getAge)
    .average()
    .orElse(0.0);
```

#### Optional 鏈式調用

```java
public Optional<String> getUserCityName(Long userId) {
    return userRepository.findById(userId)
        .flatMap(User::getAddress)
        .flatMap(Address::getCity)
        .map(City::getName);
}

// 使用
String cityName = getUserCityName(1L)
    .orElse("Unknown");
```

## 總結

Java 8 引入的新特性極大地改變了 Java 編程方式，使代碼更簡潔、更函數式。Lambda 表達式和 Stream API 提供了聲明式編程範式，Optional 優雅地處理空值，新的日期時間 API 解決了舊 API 的諸多問題。掌握這些特性是現代 Java 開發者的必備技能，也是面試的高頻考點。理解這些特性不僅能提高開發效率，還能編寫出更優雅、更易維護的代碼。
