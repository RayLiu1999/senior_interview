# Java 測試

完善的測試是高質量代碼的保證。本節涵蓋單元測試、集成測試和測試最佳實踐。

## 題目列表

| 主題 | 難度 | 重要程度 | 標籤 |
|------|------|----------|------|
| [JUnit 5 高級特性](./junit5_advanced.md) | 6 | 5 | `JUnit 5`, `Testing` |
| [Mockito 使用技巧](./mockito_usage.md) | 6 | 5 | `Mockito`, `Mock` |
| [Spring Boot 測試](./spring_boot_test.md) | 7 | 5 | `Spring Boot`, `Integration Test` |
| [測試覆蓋率](./test_coverage.md) | 5 | 4 | `Coverage`, `JaCoCo` |
| [測試最佳實踐](./testing_best_practices.md) | 6 | 5 | `Best Practices`, `TDD` |
| [集成測試策略](./integration_testing.md) | 7 | 4 | `Integration`, `TestContainers` |

## 核心知識點

### JUnit 5
- **架構**：JUnit Platform、Jupiter、Vintage
- **註解**：@Test、@BeforeEach、@AfterEach、@ParameterizedTest
- **斷言**：assertEquals、assertTrue、assertThrows
- **假設**：assumeTrue、assumingThat

### Mockito
- **Mock 對象**：@Mock、mock()
- **Stub 行為**：when().thenReturn()
- **驗證調用**：verify()
- **參數匹配**：any()、eq()、argThat()

### Spring Boot 測試
- **@SpringBootTest**：加載完整上下文
- **@WebMvcTest**：只加載 Web 層
- **@DataJpaTest**：只加載 JPA 層
- **MockMvc**：模擬 HTTP 請求

### TestContainers
- **容器化測試**：使用 Docker 容器
- **數據庫測試**：真實數據庫環境
- **消息隊列測試**：Kafka、RabbitMQ 等

## 測試金字塔

```
        /\
       /  \      E2E 測試（少）
      /    \
     /------\    集成測試（適中）
    /        \
   /----------\  單元測試（多）
```

## 最佳實踐

### 單元測試
```java
@Test
@DisplayName("should return user when user exists")
void shouldReturnUserWhenUserExists() {
    // Given
    User user = new User(1L, "John");
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    
    // When
    User result = userService.getUser(1L);
    
    // Then
    assertNotNull(result);
    assertEquals("John", result.getName());
    verify(userRepository).findById(1L);
}
```

### 集成測試
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldReturnUserList() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}
```

### 測試原則
1. **F.I.R.S.T**：Fast、Independent、Repeatable、Self-validating、Timely
2. **AAA 模式**：Arrange、Act、Assert
3. **Given-When-Then**：更語義化的 AAA
4. **測試一個關注點**：每個測試只驗證一個行為
5. **測試命名清晰**：should_xxx_when_yyy
