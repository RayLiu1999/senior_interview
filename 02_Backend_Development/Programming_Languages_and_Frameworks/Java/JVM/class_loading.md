# JVM 類加載機制

- **難度**: 8
- **重要程度**: 5
- **標籤**: `ClassLoader`, `Class Loading`, `Double Delegation`

## 問題詳述

類加載是 JVM 將類加載到記憶體的過程。請深入解釋類加載的過程、雙親委派模型、類加載器和如何破壞雙親委派。

## 核心理論與詳解

### 類加載過程

#### 完整生命週期

```
加載 (Loading)
  ↓
驗證 (Verification)
  ↓
準備 (Preparation)
  ↓
解析 (Resolution)
  ↓
初始化 (Initialization)
  ↓
使用 (Using)
  ↓
卸載 (Unloading)
```

**驗證、準備、解析合稱為連接（Linking）**

#### 1. 加載（Loading）

**三件事**：
1. 通過類的全限定名獲取類的二進制字節流
2. 將字節流代表的靜態存儲結構轉化為方法區的運行時數據結構
3. 在記憶體中生成代表這個類的 `java.lang.Class` 對象

**獲取字節流的方式**：
- 從 ZIP 包讀取（JAR、WAR）
- 從網絡獲取（Applet）
- 運行時計算生成（動態代理）
- 從數據庫讀取
- 從加密文件讀取

**非陣列類加載**：
- 由類加載器完成

**陣列類加載**：
- 由 JVM 直接創建
- 元素類型由類加載器加載

#### 2. 驗證（Verification）

**目的**：確保 Class 文件的字節流符合 JVM 規範，不會危害 JVM 安全。

**四個階段**：

**a. 文件格式驗證**：
- 魔數是否為 0xCAFEBABE
- 主次版本號是否在當前 JVM 範圍內
- 常量池是否有不支持的常量類型
- 指向常量的索引是否有效

**b. 元數據驗證**：
- 是否有父類（除 Object 外）
- 父類是否繼承了不允許被繼承的類（final 類）
- 非抽象類是否實現了所有抽象方法
- 字段、方法是否與父類衝突

**c. 字節碼驗證**：
- 數據流分析和控制流分析
- 確保操作數棧與指令代碼序列配合
- 保證類型轉換有效

**d. 符號引用驗證**：
- 符號引用中的類、字段、方法是否存在
- 訪問性是否可被當前類訪問

**跳過驗證**：
```bash
-Xverify:none  # 關閉大部分驗證
```

#### 3. 準備（Preparation）

**目的**：為類變量（static 變量）分配記憶體並設置類變量初始值。

**注意**：
- 只為類變量分配記憶體，不為實例變量
- 設置的是數據類型的零值，不是代碼中的初始值
- final 的類變量在編譯時就確定值，準備階段直接賦值

**示例**：
```java
public static int value = 123;  // 準備階段：value = 0
public static final int VALUE = 123;  // 準備階段：VALUE = 123
```

**數據類型零值**：
| 類型 | 零值 |
|------|------|
| int | 0 |
| long | 0L |
| short | (short) 0 |
| char | '\u0000' |
| byte | (byte) 0 |
| boolean | false |
| float | 0.0f |
| double | 0.0d |
| reference | null |

#### 4. 解析（Resolution）

**目的**：將常量池中的符號引用替換為直接引用。

**符號引用**：用一組符號描述引用目標，與記憶體佈局無關
**直接引用**：直接指向目標的指針、相對偏移量或句柄，與記憶體佈局相關

**解析類型**：
- 類或接口的解析
- 字段解析
- 方法解析
- 接口方法解析

#### 5. 初始化（Initialization）

**目的**：執行類構造器 `<clinit>()` 方法。

**<clinit>() 方法**：
- 由編譯器自動生成
- 收集類中所有類變量的賦值動作和靜態代碼塊
- 按源文件中的順序執行
- 父類的 <clinit>() 先執行

**示例**：
```java
public class Parent {
    static {
        System.out.println("Parent static block");
    }
}

public class Child extends Parent {
    static {
        System.out.println("Child static block");
    }
    
    public static int value = 123;
    
    static {
        value = 456;  // <clinit>() 中按順序執行
    }
}

// 輸出：
// Parent static block
// Child static block
// 最終 value = 456
```

**注意**：
- 接口不能有靜態代碼塊，但可以有變量初始化
- 接口初始化不需要先初始化父接口（除非使用父接口的變量）
- JVM 保證 <clinit>() 在多線程環境中正確加鎖同步

### 類初始化時機

#### 主動引用（觸發初始化）

**1. 遇到 new、getstatic、putstatic、invokestatic 字節碼指令**：
```java
// new：創建對象
User user = new User();

// getstatic/putstatic：讀取/設置靜態字段
int value = MyClass.staticField;
MyClass.staticField = 10;

// invokestatic：調用靜態方法
MyClass.staticMethod();
```

**2. 使用反射調用類**：
```java
Class.forName("com.example.MyClass");
```

**3. 初始化子類，父類先初始化**：
```java
Child child = new Child();  // Parent 先初始化
```

**4. 虛擬機啟動時的主類**：
```java
public class Main {
    public static void main(String[] args) {
        // Main 類初始化
    }
}
```

**5. JDK 7 的動態語言支持**：
```java
MethodHandle handle = ...
// REF_getStatic、REF_putStatic、REF_invokeStatic
```

**6. 接口定義了默認方法，實現類初始化時**

#### 被動引用（不觸發初始化）

**1. 通過子類引用父類的靜態字段**：
```java
System.out.println(Child.parentStatic);  // 只初始化 Parent
```

**2. 通過陣列定義引用類**：
```java
User[] users = new User[10];  // 不初始化 User
```

**3. 引用常量**：
```java
System.out.println(MyClass.CONSTANT);  // 不初始化 MyClass
// 常量在編譯階段存入常量池
```

**4. 調用 ClassLoader.loadClass()**：
```java
ClassLoader.getSystemClassLoader().loadClass("com.example.MyClass");
// 只加載，不初始化
```

### 類加載器

#### 三層類加載器

**1. 啟動類加載器（Bootstrap ClassLoader）**：
- C++ 實現，是 JVM 的一部分
- 加載 `<JAVA_HOME>/lib` 目錄或 `-Xbootclasspath` 指定路徑
- 加載核心庫：rt.jar、resources.jar

**2. 擴展類加載器（Extension ClassLoader）**：
- Java 實現：`sun.misc.Launcher$ExtClassLoader`
- 加載 `<JAVA_HOME>/lib/ext` 目錄或 `java.ext.dirs` 系統變量指定路徑

**3. 應用程序類加載器（Application ClassLoader）**：
- Java 實現：`sun.misc.Launcher$AppClassLoader`
- 加載用戶類路徑（ClassPath）上的類
- 默認的類加載器

**4. 自定義類加載器**：
- 繼承 `java.lang.ClassLoader`
- 實現特殊加載邏輯

#### 查看類加載器

```java
public class ClassLoaderTest {
    public static void main(String[] args) {
        // 應用程序類加載器
        ClassLoader appLoader = ClassLoaderTest.class.getClassLoader();
        System.out.println("AppClassLoader: " + appLoader);
        
        // 擴展類加載器
        ClassLoader extLoader = appLoader.getParent();
        System.out.println("ExtClassLoader: " + extLoader);
        
        // 啟動類加載器（null，因為是 C++ 實現）
        ClassLoader bootLoader = extLoader.getParent();
        System.out.println("BootstrapClassLoader: " + bootLoader);
        
        // 核心類的類加載器
        ClassLoader stringLoader = String.class.getClassLoader();
        System.out.println("String ClassLoader: " + stringLoader);  // null
    }
}
```

### 雙親委派模型

#### 工作流程

```
AppClassLoader
      ↓ 委派
ExtClassLoader
      ↓ 委派
BootstrapClassLoader
      ↓ 查找失敗
ExtClassLoader 查找
      ↓ 查找失敗
AppClassLoader 查找
```

**過程**：
1. 收到類加載請求，不會立即加載
2. 委派給父加載器
3. 父加載器重複此過程
4. 父加載器無法完成，子加載器才嘗試加載

#### 源碼實現

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // 1. 檢查類是否已加載
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            try {
                // 2. 委派給父加載器
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // 父加載器無法加載
            }
            
            if (c == null) {
                // 3. 父加載器無法加載，自己加載
                c = findClass(name);
            }
        }
        
        if (resolve) {
            resolveClass(c);
        }
        return c;
    }
}
```

#### 優勢

**1. 避免類的重複加載**：
- 父加載器已加載的類，子加載器不會再加載

**2. 保護核心 API**：
- 自定義的 `java.lang.String` 無法替換核心類庫的 String

**示例**：
```java
// 自定義 java.lang.String
package java.lang;

public class String {
    public static void main(String[] args) {
        System.out.println("My String");
    }
}

// 運行報錯：java.lang.SecurityException
// 無法替換核心類
```

### 破壞雙親委派模型

#### 第一次破壞：JDK 1.2 之前

**原因**：ClassLoader 和雙親委派模型在 JDK 1.2 引入，之前可以重寫 loadClass()。

**解決**：引入 findClass() 方法，用戶重寫 findClass() 而不是 loadClass()。

#### 第二次破壞：JNDI、JDBC

**問題**：核心類需要調用用戶代碼

**示例**：JDBC
```java
// rt.jar 中的 DriverManager（啟動類加載器加載）
Class.forName("com.mysql.cj.jdbc.Driver");  // 應用類加載器加載
```

**解決**：線程上下文類加載器（Thread Context ClassLoader）
```java
// DriverManager 使用線程上下文類加載器
ClassLoader cl = Thread.currentThread().getContextClassLoader();
Class.forName(driverClass, true, cl);
```

#### 第三次破壞：OSGi

**目的**：實現模塊熱替換

**OSGi 類加載**：
- 網狀結構，不是樹狀
- 模塊之間可以互相委派

### 自定義類加載器

```java
public class MyClassLoader extends ClassLoader {
    private String classPath;
    
    public MyClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            byte[] classData = loadClassData(name);
            if (classData == null) {
                throw new ClassNotFoundException();
            }
            return defineClass(name, classData, 0, classData.length);
        } catch (IOException e) {
            throw new ClassNotFoundException();
        }
    }
    
    private byte[] loadClassData(String name) throws IOException {
        String fileName = classPath + File.separator + 
            name.replace('.', File.separatorChar) + ".class";
        
        try (FileInputStream fis = new FileInputStream(fileName);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            return baos.toByteArray();
        }
    }
}

// 使用
MyClassLoader loader = new MyClassLoader("/path/to/classes");
Class<?> clazz = loader.loadClass("com.example.MyClass");
Object obj = clazz.newInstance();
```

### 熱部署實現

```java
public class HotSwapClassLoader extends ClassLoader {
    public HotSwapClassLoader() {
        super(HotSwapClassLoader.class.getClassLoader());
    }
    
    public Class<?> loadByte(String name, byte[] classBytes) {
        return defineClass(name, classBytes, 0, classBytes.length);
    }
}

// 使用
public class HotSwap {
    public static void main(String[] args) throws Exception {
        HotSwapClassLoader loader1 = new HotSwapClassLoader();
        Class<?> clazz1 = loader1.loadByte("com.example.MyClass", getClassBytes());
        Object obj1 = clazz1.newInstance();
        
        // 重新加載（新的類加載器實例）
        HotSwapClassLoader loader2 = new HotSwapClassLoader();
        Class<?> clazz2 = loader2.loadByte("com.example.MyClass", getClassBytes());
        Object obj2 = clazz2.newInstance();
        
        // 不同的 Class 對象
        System.out.println(clazz1 == clazz2);  // false
    }
}
```

## 總結

類加載機制是 JVM 的重要組成部分，包括加載、驗證、準備、解析、初始化五個階段。雙親委派模型保證了類加載的安全性和一致性，但在某些場景下需要破壞這個模型（如 JDBC、OSGi）。理解類加載過程、雙親委派模型和如何自定義類加載器是 Java 開發者必備的知識，對於實現熱部署、插件系統和模塊化架構非常重要。
