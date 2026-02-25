# xUnit 與 NUnit：C# 測試框架

- **難度**: 4
- **重要程度**: 4
- **標籤**: `xUnit`, `NUnit`, `Testing`, `Moq`, `C#`, `.NET`

## 問題詳述

xUnit 和 NUnit 是 .NET 生態系統中最主流的單元測試框架，搭配 Moq 進行 Mock，以及 FluentAssertions 提升斷言可讀性，構成 C# 後端測試的標準工具組合。資深 .NET 工程師需要理解兩者的設計哲學差異及各自的適用場景。

## 核心理論與詳解

### 三大 .NET 測試框架比較

| 維度 | xUnit | NUnit | MSTest |
| :--- | :--- | :--- | :--- |
| **設計者** | NUnit 核心作者（改進版）| 移植自 JUnit | Microsoft |
| **Instance 模式** | 每個測試方法建立新 Instance（測試隔離佳）| 預設同一 Instance | 同一 Instance |
| **Async 支援** | 原生支援 `async Task` | 支援 | 支援 |
| **資料驅動測試** | `[Theory] + [InlineData]` | `[TestCase]` | `[DataRow]` |
| **Setup/Teardown** | 建構函式 / `IDisposable` | `[SetUp]` / `[TearDown]` | `[TestInitialize]` |
| **Microsoft 推薦** | ✅ 官方範例主要使用 | ✅ | ✅ |
| **適用場景** | .NET 核心項目首選 | 老舊項目、特定偏好者 | .NET Framework 遺留項目 |

### xUnit 基礎用法

```csharp
// 安裝: dotnet add package xunit
//       dotnet add package xunit.runner.visualstudio
//       dotnet add package Moq

public class UserServiceTests : IDisposable
{
    private readonly UserService _sut;           // sut = System Under Test
    private readonly Mock<IUserRepository> _mockRepo;

    // 建構函式替代 [SetUp]：每個測試都會建立新實例，保證隔離
    public UserServiceTests()
    {
        _mockRepo = new Mock<IUserRepository>();
        _sut = new UserService(_mockRepo.Object);
    }

    // 實作 IDisposable 替代 [TearDown]
    public void Dispose()
    {
        // 釋放測試資源
    }

    [Fact]
    [Trait("Category", "Unit")]
    public async Task GetUserById_WhenUserExists_ReturnsUser()
    {
        // Arrange
        var expected = new User(1, "Alice", "alice@example.com");
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(expected);

        // Act
        var result = await _sut.GetUserByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Alice", result.Name);
        Assert.Equal("alice@example.com", result.Email);
        _mockRepo.Verify(r => r.GetByIdAsync(1), Times.Once);
    }

    [Fact]
    public async Task GetUserById_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                 .ReturnsAsync((User?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UserNotFoundException>(
            () => _sut.GetUserByIdAsync(99)
        );
        Assert.Contains("99", exception.Message);
    }

    // [Theory]: 參數化測試 (等同 JUnit 5 的 @ParameterizedTest)
    [Theory]
    [InlineData("", false)]
    [InlineData("a", false)]
    [InlineData("alice@example.com", true)]
    [InlineData("not-an-email", false)]
    public void ValidateEmail_ReturnsExpectedResult(string email, bool expected)
    {
        var result = _sut.ValidateEmail(email);
        Assert.Equal(expected, result);
    }

    // 使用 MemberData 提供複雜測試資料
    [Theory]
    [MemberData(nameof(CreateUserTestData))]
    public async Task CreateUser_WithVariousInputs_ReturnsExpected(
        CreateUserRequest request, bool shouldSucceed)
    {
        // 測試多種輸入組合
    }

    public static IEnumerable<object[]> CreateUserTestData =>
    new List<object[]>
    {
        new object[] { new CreateUserRequest("Alice", "alice@test.com"), true },
        new object[] { new CreateUserRequest("", "alice@test.com"), false },
        new object[] { new CreateUserRequest("Bob", "invalid"), false },
    };
}
```

### Moq 完整用法

```csharp
// 設定 Mock 行為（Stub）
_mockRepo.Setup(r => r.GetByIdAsync(1))
         .ReturnsAsync(new User(1, "Alice", "..."));

// 設定根據參數動態返回
_mockRepo.Setup(r => r.GetByIdAsync(It.Is<int>(id => id > 0)))
         .ReturnsAsync((int id) => new User(id, $"User{id}", "..."));

// 設定拋出異常
_mockRepo.Setup(r => r.GetByIdAsync(-1))
         .ThrowsAsync(new ArgumentException("ID must be positive"));

// 設定回調（Callback）
_mockRepo.Setup(r => r.SaveAsync(It.IsAny<User>()))
         .Callback<User>(u => Console.WriteLine($"Saving user: {u.Name}"))
         .ReturnsAsync(true);

// 驗證互動
_mockRepo.Verify(r => r.GetByIdAsync(It.IsAny<int>()), Times.Once);
_mockRepo.Verify(r => r.SaveAsync(It.Is<User>(u => u.Name == "Alice")), Times.Once);
_mockRepo.VerifyNoOtherCalls();  // 確保沒有其他未預期的呼叫
```

### FluentAssertions：提升斷言可讀性

```csharp
// 安裝: dotnet add package FluentAssertions

// 傳統 xUnit 斷言
Assert.Equal("Alice", user.Name);
Assert.True(user.IsActive);
Assert.Throws<InvalidOperationException>(() => service.DoSomething());

// FluentAssertions（更自然的英語語法）
user.Name.Should().Be("Alice");
user.IsActive.Should().BeTrue();
user.Age.Should().BeInRange(18, 65);
user.Email.Should().EndWith("@example.com");
users.Should().HaveCount(3).And.OnlyContain(u => u.IsActive);

// 集合斷言
results.Should().BeEquivalentTo(expected);  // 深度比較，忽略順序
results.Should().ContainSingle(u => u.Name == "Alice");

// 異常斷言
Action act = () => service.InvalidOperation();
act.Should().Throw<InvalidOperationException>()
   .WithMessage("*not allowed*");
```

### ASP.NET Core 整合測試

```csharp
// 安裝: dotnet add package Microsoft.AspNetCore.Mvc.Testing

public class UserControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UserControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        // 啟動完整的應用（使用測試用記憶體 DB 等）
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // 替換生產 DB 為 InMemory DB
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.AddDbContext<AppDbContext>(opt =>
                    opt.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetUser_Returns200WithUserData()
    {
        var response = await _client.GetAsync("/api/users/1");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<User>(content);
        user.Should().NotBeNull();
        user!.Id.Should().Be(1);
    }
}
```

### NUnit 與 xUnit 的主要語法差異

```csharp
// NUnit
[TestFixture]          // vs xUnit: 不需要此注解
public class Tests
{
    [SetUp]             // vs xUnit: 建構函式
    public void Setup() { }

    [TearDown]          // vs xUnit: IDisposable.Dispose()
    public void TearDown() { }

    [Test]              // vs xUnit: [Fact]
    public void MyTest() { }

    [TestCase(1, 2, 3)] // vs xUnit: [Theory][InlineData(1, 2, 3)]
    public void TestAdd(int a, int b, int expected) { }

    [Ignore("reason")]  // vs xUnit: [Fact(Skip = "reason")]
    public void SkippedTest() { }
}
```
