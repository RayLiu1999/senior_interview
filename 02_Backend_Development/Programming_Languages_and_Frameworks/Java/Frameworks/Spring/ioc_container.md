# Spring IoC 容器原理

- **難度**: 8
- **重要程度**: 5
- **標籤**: `IoC`, `DI`, `Spring Container`

## 問題詳述

IoC（控制反轉）是 Spring 框架的核心，實現了依賴注入（DI）。請深入解釋 Spring IoC 容器的工作原理、Bean 的創建過程和依賴注入機制。

## 核心理論與詳解

### 什麼是 IoC

#### 控制反轉（Inversion of Control）

**傳統方式**：對象自己創建依賴
```java
public class UserService {
    private UserDao userDao = new UserDaoImpl();  // 自己創建依賴
    
    public User getUser(Long id) {
        return userDao.findById(id);
    }
}
```

**問題**：
- 強耦合
- 難以測試
- 難以擴展

**IoC 方式**：由容器創建和注入依賴
```java
public class UserService {
    private UserDao userDao;  // 依賴聲明
    
    // 通過構造器注入
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
    
    public User getUser(Long id) {
        return userDao.findById(id);
    }
}
```

**優勢**：
- 低耦合
- 易於測試（可注入 Mock 對象）
- 靈活擴展

**控制反轉的含義**：
- **反轉前**：對象自己控制依賴的創建
- **反轉後**：依賴的創建由容器控制

### 依賴注入（Dependency Injection）

#### 三種注入方式

**1. 構造器注入（推薦）**：
```java
@Service
public class UserService {
    private final UserDao userDao;
    
    @Autowired  // Spring 4.3+ 單個構造器可省略
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}
```

**優點**：
- 依賴不可變（final）
- 依賴不為 null
- 易於測試

**2. Setter 注入**：
```java
@Service
public class UserService {
    private UserDao userDao;
    
    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
}
```

**優點**：
- 可選依賴
- 可重新配置

**3. 字段注入**：
```java
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
}
```

**缺點**：
- 不能使用 final
- 難以測試
- 隱藏依賴關係

### BeanFactory 與 ApplicationContext

#### BeanFactory

**基本容器**：提供基本的 IoC 功能

```java
BeanFactory factory = new XmlBeanFactory(
    new ClassPathResource("beans.xml")
);
UserService service = factory.getBean(UserService.class);
```

**特點**：
- 延遲初始化
- 基本功能

#### ApplicationContext

**高級容器**：擴展 BeanFactory，提供更多企業級功能

```java
ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
// 或
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

UserService service = context.getBean(UserService.class);
```

**擴展功能**：
1. **國際化**：MessageSource
2. **事件發布**：ApplicationEvent
3. **資源訪問**：Resource
4. **環境抽象**：Environment
5. **Bean 後置處理**：BeanPostProcessor

**常用實現**：
- **ClassPathXmlApplicationContext**：XML 配置
- **FileSystemXmlApplicationContext**：文件系統 XML
- **AnnotationConfigApplicationContext**：註解配置
- **WebApplicationContext**：Web 應用

### Bean 定義

#### Bean 的配置方式

**1. XML 配置**：
```xml
<bean id="userDao" class="com.example.UserDaoImpl"/>

<bean id="userService" class="com.example.UserService">
    <property name="userDao" ref="userDao"/>
</bean>
```

**2. 註解配置**：
```java
@Component  // 或 @Service、@Repository、@Controller
public class UserService {
    @Autowired
    private UserDao userDao;
}
```

**3. Java 配置**：
```java
@Configuration
public class AppConfig {
    @Bean
    public UserDao userDao() {
        return new UserDaoImpl();
    }
    
    @Bean
    public UserService userService() {
        return new UserService(userDao());
    }
}
```

#### Bean 作用域

**1. singleton（默認）**：
```java
@Bean
@Scope("singleton")  // 可省略
public UserService userService() {
    return new UserService();
}
```
- 整個容器只有一個實例
- 線程不安全（需要無狀態或線程安全設計）

**2. prototype**：
```java
@Bean
@Scope("prototype")
public UserService userService() {
    return new UserService();
}
```
- 每次獲取創建新實例
- 容器不管理生命週期（不會調用銷毀方法）

**3. request**：
```java
@Bean
@Scope("request")
public UserContext userContext() {
    return new UserContext();
}
```
- 每個 HTTP 請求一個實例
- 僅 Web 應用

**4. session**：
```java
@Bean
@Scope("session")
public ShoppingCart shoppingCart() {
    return new ShoppingCart();
}
```
- 每個 HTTP Session 一個實例
- 僅 Web 應用

**5. application**：
- 整個 ServletContext 一個實例
- 類似 singleton，但限於 Web 應用

### IoC 容器初始化過程

#### 三個階段

**1. Resource 定位**：
- 查找 Bean 定義資源（XML、註解、Java Config）

**2. BeanDefinition 載入**：
- 解析資源，創建 BeanDefinition 對象
- BeanDefinition 包含 Bean 的元信息（類名、作用域、依賴等）

**3. BeanDefinition 註冊**：
- 將 BeanDefinition 註冊到容器（BeanDefinitionRegistry）

```java
// 簡化的過程
public void refresh() {
    // 1. 準備工作
    prepareRefresh();
    
    // 2. 創建 BeanFactory
    ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
    
    // 3. BeanFactory 預處理
    prepareBeanFactory(beanFactory);
    
    // 4. 後置處理（子類擴展）
    postProcessBeanFactory(beanFactory);
    
    // 5. 執行 BeanFactoryPostProcessor
    invokeBeanFactoryPostProcessors(beanFactory);
    
    // 6. 註冊 BeanPostProcessor
    registerBeanPostProcessors(beanFactory);
    
    // 7. 初始化 MessageSource
    initMessageSource();
    
    // 8. 初始化事件多播器
    initApplicationEventMulticaster();
    
    // 9. 子類擴展
    onRefresh();
    
    // 10. 註冊監聽器
    registerListeners();
    
    // 11. 實例化單例 Bean
    finishBeanFactoryInitialization(beanFactory);
    
    // 12. 完成刷新
    finishRefresh();
}
```

### Bean 的創建過程

#### 完整流程

```
getBean()
  ↓
getSingleton() (檢查緩存)
  ↓
markBeanAsCreated() (標記為創建中)
  ↓
createBean()
  ↓
doCreateBean()
  ├─> createBeanInstance() (實例化)
  ├─> populateBean() (屬性填充)
  └─> initializeBean() (初始化)
      ├─> applyBeanPostProcessorsBeforeInitialization()
      ├─> invokeInitMethods()
      └─> applyBeanPostProcessorsAfterInitialization()
```

#### 詳細步驟

**1. 實例化（Instantiation）**：
```java
// 通過反射創建對象
BeanWrapper instanceWrapper = createBeanInstance(beanName, mbd, args);
Object bean = instanceWrapper.getWrappedInstance();
```

**2. 屬性賦值（Population）**：
```java
// 注入依賴
populateBean(beanName, mbd, instanceWrapper);
```

**3. 初始化（Initialization）**：

**a. Aware 接口回調**：
```java
if (bean instanceof BeanNameAware) {
    ((BeanNameAware) bean).setBeanName(beanName);
}
if (bean instanceof BeanFactoryAware) {
    ((BeanFactoryAware) bean).setBeanFactory(this);
}
if (bean instanceof ApplicationContextAware) {
    ((ApplicationContextAware) bean).setApplicationContext(this.applicationContext);
}
```

**b. BeanPostProcessor.postProcessBeforeInitialization()**：
```java
for (BeanPostProcessor processor : getBeanPostProcessors()) {
    Object result = processor.postProcessBeforeInitialization(bean, beanName);
    if (result == null) {
        return result;
    }
    bean = result;
}
```

**c. 初始化方法**：
```java
// @PostConstruct 註解的方法
// InitializingBean.afterPropertiesSet()
if (bean instanceof InitializingBean) {
    ((InitializingBean) bean).afterPropertiesSet();
}
// 自定義 init-method
invokeCustomInitMethod(beanName, bean, mbd);
```

**d. BeanPostProcessor.postProcessAfterInitialization()**：
```java
for (BeanPostProcessor processor : getBeanPostProcessors()) {
    Object result = processor.postProcessAfterInitialization(bean, beanName);
    if (result == null) {
        return result;
    }
    bean = result;
}
```

### 三級緩存解決循環依賴

#### 什麼是循環依賴

```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}
```

#### 三級緩存

```java
// 一級緩存：完成初始化的單例 Bean
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>();

// 二級緩存：提前暴露的單例 Bean（未完成初始化）
private final Map<String, Object> earlySingletonObjects = new HashMap<>();

// 三級緩存：單例 Bean 的工廠
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>();
```

#### 解決過程

```
1. A 創建 → 實例化 A → 將 A 的工廠放入三級緩存
2. A 填充屬性 → 發現依賴 B
3. B 創建 → 實例化 B → 將 B 的工廠放入三級緩存
4. B 填充屬性 → 發現依賴 A
5. 從緩存獲取 A：
   - 一級緩存（singletonObjects）無
   - 二級緩存（earlySingletonObjects）無
   - 三級緩存（singletonFactories）有
   - 調用 A 的工廠，將 A 放入二級緩存，刪除三級緩存
6. B 注入 A（半成品）
7. B 完成初始化 → 放入一級緩存
8. A 注入 B
9. A 完成初始化 → 放入一級緩存
```

**為什麼需要三級緩存**：
- 支持 AOP 代理
- 保證返回的是同一個對象（代理對象）

**構造器循環依賴無法解決**：
```java
@Service
public class ServiceA {
    private ServiceB serviceB;
    
    @Autowired
    public ServiceA(ServiceB serviceB) {  // 構造器注入
        this.serviceB = serviceB;
    }
}
// 無法解決，因為實例化時就需要依賴
```

### @Autowired 注入過程

**AutowiredAnnotationBeanPostProcessor** 處理：

1. **掃描 @Autowired 註解**
2. **獲取依賴的 Bean**
3. **注入**

**按類型注入**：
```java
@Autowired
private UserDao userDao;  // 按類型查找
```

**多個候選 Bean**：
```java
@Autowired
@Qualifier("userDaoImpl1")  // 指定名稱
private UserDao userDao;

// 或使用 @Primary
@Primary
@Repository
public class UserDaoImpl1 implements UserDao { }
```

**required 屬性**：
```java
@Autowired(required = false)  // 可選依賴
private UserDao userDao;
```

### 實際應用

#### 配置類

```java
@Configuration
@ComponentScan("com.example")
@PropertySource("classpath:application.properties")
public class AppConfig {
    
    @Bean
    public DataSource dataSource(
        @Value("${db.url}") String url,
        @Value("${db.username}") String username,
        @Value("${db.password}") String password
    ) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
    
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

#### 條件化配置

```java
@Configuration
public class ConditionalConfig {
    
    @Bean
    @ConditionalOnProperty(name = "cache.type", havingValue = "redis")
    public CacheManager redisCacheManager() {
        return new RedisCacheManager();
    }
    
    @Bean
    @ConditionalOnProperty(name = "cache.type", havingValue = "caffeine")
    public CacheManager caffeineCacheManager() {
        return new CaffeineCacheManager();
    }
}
```

## 總結

Spring IoC 容器通過控制反轉和依賴注入實現了對象的解耦和靈活配置。容器負責創建、配置和管理 Bean 的生命週期。理解 Bean 的創建過程、三級緩存解決循環依賴、@Autowired 注入機制是掌握 Spring 的關鍵。合理使用依賴注入（優先構造器注入）、合適的作用域和條件化配置，可以構建出高度解耦、易於測試和維護的應用程式。
