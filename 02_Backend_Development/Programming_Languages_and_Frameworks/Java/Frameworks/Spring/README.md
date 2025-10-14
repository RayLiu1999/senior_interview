# Spring Framework

Spring 是 Java 企業級開發的事實標準框架。本節涵蓋 IoC 容器、AOP、事務管理等核心主題。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [IoC 容器原理](./ioc_container.md) | 8 | 5 | `IoC`, `DI`, `Container` |
| [Bean 生命週期](./bean_lifecycle.md) | 8 | 5 | `Bean`, `Lifecycle` |
| [AOP 實現原理](./aop_implementation.md) | 8 | 5 | `AOP`, `Proxy` |
| [事務管理](./transaction_management.md) | 8 | 5 | `Transaction`, `@Transactional` |
| [循環依賴](./circular_dependency.md) | 9 | 4 | `Circular Dependency` |
| [Spring MVC 流程](./spring_mvc_flow.md) | 7 | 5 | `MVC`, `DispatcherServlet` |
| [BeanPostProcessor](./bean_post_processor.md) | 7 | 4 | `Extension`, `Hook` |
| [ApplicationContext](./application_context.md) | 7 | 4 | `Context`, `Container` |
| [Spring 註解](./spring_annotations.md) | 6 | 5 | `Annotations` |
| [Spring 事件機制](./spring_events.md) | 6 | 3 | `Events`, `Observer` |

## 核心知識點

### IoC 容器
- **依賴注入**：構造器注入、Setter 注入、字段注入
- **Bean 作用域**：singleton、prototype、request、session
- **Bean 註冊**：XML、註解、Java Config
- **自動裝配**：@Autowired、@Resource、@Inject

### AOP
- **核心概念**：切面、切點、通知、連接點
- **通知類型**：Before、After、AfterReturning、AfterThrowing、Around
- **實現方式**：JDK 動態代理、CGLIB 代理
- **使用場景**：日誌、事務、權限、緩存

### 事務管理
- **聲明式事務**：@Transactional 註解
- **事務傳播行為**：REQUIRED、REQUIRES_NEW、NESTED 等
- **事務隔離級別**：讀未提交、讀已提交、可重複讀、串行化
- **事務失效場景**：非 public 方法、自調用、異常類型不匹配

### Bean 生命週期
1. 實例化（Instantiation）
2. 屬性賦值（Population）
3. 初始化前處理（BeanPostProcessor.before）
4. 初始化（Initialization）
5. 初始化後處理（BeanPostProcessor.after）
6. 使用（In Use）
7. 銷毀（Destruction）

## 常見面試問題

### IoC 相關
- Spring IoC 的實現原理？
- @Autowired 和 @Resource 的區別？
- 如何解決循環依賴？

### AOP 相關
- Spring AOP 和 AspectJ 的區別？
- JDK 動態代理和 CGLIB 代理的區別？
- AOP 的應用場景？

### 事務相關
- @Transactional 的工作原理？
- 事務失效的場景有哪些？
- 事務傳播行為的應用？

### Spring MVC 相關
- DispatcherServlet 的工作流程？
- 如何處理請求參數？
- 如何處理異常？

## 最佳實踐

### 依賴注入
```java
// 推薦：構造器注入（不可變、易測試）
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 不推薦：字段注入（難以測試）
@Autowired
private UserRepository userRepository;
```

### 事務使用
```java
// 推薦：在 Service 層使用事務
@Service
public class UserService {
    @Transactional
    public void updateUser(User user) {
        // 業務邏輯
    }
}

// 注意：避免事務過大
@Transactional
public void processLargeData() {
    // 處理大量數據，可能導致長事務
}
```

### AOP 使用
```java
// 定義切面
@Aspect
@Component
public class LoggingAspect {
    @Around("@annotation(com.example.Log)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;
        log.info("{} executed in {}ms", joinPoint.getSignature(), duration);
        return result;
    }
}
```
