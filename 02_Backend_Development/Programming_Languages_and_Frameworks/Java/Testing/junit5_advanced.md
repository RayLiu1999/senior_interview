# JUnit 5 高級特性

- **難度**: 6
- **重要程度**: 5
- **標籤**: `JUnit 5`, `Testing`, `Mockito`, `Unit Test`, `Java`

## 問題詳述

JUnit 5 是 Java 生態系統中最主流的單元測試框架，搭配 Mockito 進行 Mock，構成 Java 後端測試的標準工具組合。理解 JUnit 5 的架構、核心注解和 Mockito 的使用是資深 Java 工程師必備的測試素養。

## 核心理論與詳解

### JUnit 5 架構：三個子項目

JUnit 5 不同於 JUnit 4 是一個單一 JAR，它由三個子項目組成：

| 子項目 | 功能 |
| :--- | :--- |
| **JUnit Platform** | 測試執行引擎的基礎平台（Launcher API），IDE 和構建工具通過此 API 執行測試 |
| **JUnit Jupiter** | JUnit 5 的核心：新的注解 API（`@Test`, `@ParameterizedTest` 等）和 Extension API |
| **JUnit Vintage** | 相容層，允許在 JUnit 5 Platform 上執行 JUnit 3/4 的舊測試 |

### 核心注解速查

```java
@Test                   // 標記測試方法
@BeforeEach             // 每個測試方法前執行（對應 JUnit 4 的 @Before）
@AfterEach              // 每個測試方法後執行
@BeforeAll              // 所有測試方法前執行一次（需為 static 方法）
@AfterAll               // 所有測試方法後執行一次（需為 static 方法）
@Disabled               // 停用測試（對應 JUnit 4 的 @Ignore）
@DisplayName("...")     // 自定義測試名稱（支援中文、空格）
@Tag("integration")     // 標記測試類型，用於過濾執行
@Nested                 // 巢狀測試類別，組織相關測試
@TestMethodOrder(...)   // 控制測試方法執行順序（通常不推薦依賴順序）
```

### 進階特性：參數化測試

參數化測試（Parameterized Test）是 JUnit 5 最重要的特性之一，避免重複測試程式碼：

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, -1, Integer.MAX_VALUE})
void testIsPositive(int number) {
    // 每個值都會獨立執行一次此測試
    assertTrue(number > 0 || number == Integer.MAX_VALUE);
}

@ParameterizedTest
@CsvSource({
    "Alice, 25, true",   // name, age, expectedAdult
    "Bob, 17, false",
    "Charlie, 18, true"
})
void testIsAdult(String name, int age, boolean expectedAdult) {
    assertEquals(expectedAdult, userService.isAdult(age));
}

@ParameterizedTest
@MethodSource("provideTestUsers")  // 來自靜態方法的數據
void testCreateUser(String email, String expectedError) { ... }

static Stream<Arguments> provideTestUsers() {
    return Stream.of(
        Arguments.of("valid@email.com", null),
        Arguments.of("invalid-email", "Invalid email format"),
        Arguments.of("", "Email is required")
    );
}
```

### Mockito 核心用法

```java
// 引入依賴
// testImplementation 'org.mockito:mockito-core:5.+'
// testImplementation 'org.mockito:mockito-junit-jupiter:5.+'

@ExtendWith(MockitoExtension.class)  // JUnit 5 整合 Mockito
class UserServiceTest {

    @Mock
    private UserRepository userRepository;  // 自動創建 Mock 對象

    @InjectMocks
    private UserService userService;  // 自動注入 @Mock 和 @Spy 到此對象

    @Test
    @DisplayName("根據 ID 查找用戶 - 成功情境")
    void findById_whenUserExists_returnsUser() {
        // Arrange（準備）: 定義 Mock 行為
        User mockUser = new User(1L, "Alice", "alice@example.com");
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(mockUser));

        // Act（執行）: 呼叫被測程式碼
        User result = userService.findById(1L);

        // Assert（驗證）: 結果斷言
        assertAll(
            () -> assertNotNull(result),
            () -> assertEquals("Alice", result.getName()),
            () -> assertEquals("alice@example.com", result.getEmail())
        );

        // 驗證 Mock 互動
        verify(userRepository, times(1)).findById(1L);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    @DisplayName("根據 ID 查找用戶 - 不存在時拋出異常")
    void findById_whenUserNotExists_throwsException() {
        // Arrange
        when(userRepository.findById(anyLong()))
            .thenReturn(Optional.empty());

        // Act & Assert: 驗證異常類型和訊息
        UserNotFoundException exception = assertThrows(
            UserNotFoundException.class,
            () -> userService.findById(99L)
        );
        assertEquals("User not found: 99", exception.getMessage());
    }

    @Test
    void createUser_shouldSaveAndReturnUser() {
        // 使用 ArgumentCaptor 捕獲傳給 Mock 的參數
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(any(User.class)))
            .thenAnswer(inv -> inv.getArgument(0)); // 回傳傳入的參數

        userService.createUser("Bob", "bob@example.com");

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("Bob", savedUser.getName());
        assertEquals("bob@example.com", savedUser.getEmail());
    }
}
```

### 斷言進階：assertAll 和 assertThrows

```java
// assertAll: 群組斷言，所有失敗都會被報告（不像 assertEquals 失敗即停止）
assertAll("用戶屬性驗證",
    () -> assertEquals("Alice", user.getName()),
    () -> assertEquals(25, user.getAge()),
    () -> assertTrue(user.isActive())
);

// assertThrows: 驗證特定異常
IllegalArgumentException ex = assertThrows(
    IllegalArgumentException.class,
    () -> userService.createUser(null, "email@test.com")
);
assertThat(ex.getMessage()).contains("name must not be null");

// assertTimeout: 驗證超時
assertTimeout(Duration.ofMillis(100), () -> {
    // 此方法必須在 100ms 內完成
    lightweightOperation();
});
```

### @Nested 測試：組織複雜測試

```java
@DisplayName("UserService 測試套件")
class UserServiceTest {

    @Nested
    @DisplayName("當用戶存在時")
    class WhenUserExists {
        @BeforeEach
        void setUp() { /* 準備存在用戶的狀態 */ }

        @Test void findById_returnsUser() { ... }
        @Test void updateUser_succeeds() { ... }
    }

    @Nested
    @DisplayName("當用戶不存在時")
    class WhenUserNotExists {
        @Test void findById_throwsException() { ... }
        @Test void updateUser_throwsException() { ... }
    }
}
```

### Mockito 高頻用法速查

```java
// Stub 行為
when(mock.method(arg)).thenReturn(value);
when(mock.method(arg)).thenThrow(new RuntimeException("error"));
when(mock.method(arg)).thenAnswer(inv -> inv.getArgument(0));

// 參數匹配
any(), anyString(), anyLong()           // 任意類型匹配
eq("exact")                             // 精確匹配
argThat(arg -> arg.startsWith("A"))     // 自定義匹配

// 驗證互動
verify(mock).method(arg);               // 驗證呼叫一次
verify(mock, times(2)).method(arg);     // 驗證呼叫指定次數
verify(mock, never()).method(arg);      // 驗證從未呼叫
verify(mock, atLeastOnce()).method();   // 驗證至少一次
verifyNoInteractions(mock);             // 驗證 Mock 完全未被呼叫
```

### Spring Boot 整合測試

```java
// 啟動完整 Spring 上下文的整合測試
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getUser_returnsUserDetails() {
        ResponseEntity<User> response = restTemplate.getForEntity("/api/users/1", User.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}

// 只測試 Web 層（Controller + Filter），不啟動完整 Spring 上下文
@WebMvcTest(UserController.class)
class UserControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean  // 使用 @MockBean 替換 Spring 容器中的 Bean
    private UserService userService;

    @Test
    void getUser_returns200() throws Exception {
        when(userService.findById(1L)).thenReturn(new User(1L, "Alice", "...")));

        mockMvc.perform(get("/api/users/1").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```
