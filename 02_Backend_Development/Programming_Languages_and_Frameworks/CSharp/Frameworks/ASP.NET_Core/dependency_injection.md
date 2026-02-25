# 依賴注入容器

- **難度**: 7
- **標籤**: `DI`, `IoC`, `Container`

## 問題詳述

依賴注入（Dependency Injection, DI）是 ASP.NET Core 的核心架構模式，框架內建了功能完整的 DI 容器。理解 DI 的運作機制、生命週期管理以及最佳實踐，是開發 ASP.NET Core 應用的基礎。

## 核心理論與詳解

### 依賴注入的核心概念

**控制反轉（IoC）**：將物件的建立和依賴關係的管理交給容器，而非在類別內部自行建立。

**依賴注入的優點**：
- 降低耦合度
- 提高可測試性
- 更容易替換實作
- 統一管理物件生命週期

### 服務生命週期

ASP.NET Core DI 容器支援三種生命週期：

| 生命週期 | 說明 | 適用場景 |
|----------|------|----------|
| **Transient** | 每次請求都建立新實例 | 輕量、無狀態的服務 |
| **Scoped** | 每個 HTTP 請求一個實例 | DbContext、工作單元 |
| **Singleton** | 應用程式生命週期內只有一個實例 | 快取、配置、HTTP 客戶端 |

```csharp
var builder = WebApplication.CreateBuilder(args);

// 註冊服務
builder.Services.AddTransient<ITransientService, TransientService>();
builder.Services.AddScoped<IScopedService, ScopedService>();
builder.Services.AddSingleton<ISingletonService, SingletonService>();
```

### 註冊服務的方式

**1. 介面到實作**：
```csharp
services.AddScoped<IUserService, UserService>();
```

**2. 具體類別**：
```csharp
services.AddScoped<UserService>();
```

**3. 使用工廠**：
```csharp
services.AddScoped<IUserService>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new UserService(config["ConnectionString"]);
});
```

**4. 實例註冊**（僅限 Singleton）：
```csharp
var instance = new SingletonService();
services.AddSingleton<ISingletonService>(instance);
```

### 注入方式

**1. 建構函式注入**（推薦）：
```csharp
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    
    public UserController(IUserService userService)
    {
        _userService = userService;
    }
}
```

**2. 方法注入**（使用 [FromServices]）：
```csharp
[HttpGet]
public IActionResult Get([FromServices] IUserService userService)
{
    return Ok(userService.GetUsers());
}
```

**3. 屬性注入**（不推薦，需第三方容器）

### 常見模式

**Options 模式**：
```csharp
// 配置類別
public class EmailSettings
{
    public string SmtpServer { get; set; }
    public int Port { get; set; }
}

// 註冊
services.Configure<EmailSettings>(configuration.GetSection("Email"));

// 使用
public class EmailService
{
    private readonly EmailSettings _settings;
    
    public EmailService(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }
}
```

**具名服務**（.NET 8+）：
```csharp
// 註冊
services.AddKeyedScoped<IPaymentService, CreditCardPayment>("credit");
services.AddKeyedScoped<IPaymentService, PayPalPayment>("paypal");

// 使用
public class OrderService
{
    public OrderService([FromKeyedServices("credit")] IPaymentService payment)
    {
    }
}
```

### 生命週期陷阱

**不要在 Singleton 中注入 Scoped 服務**：
```csharp
// 危險！這會導致 Scoped 服務被當作 Singleton 使用
public class SingletonService
{
    private readonly IScopedService _scoped; // ⚠️ 問題
    
    public SingletonService(IScopedService scoped)
    {
        _scoped = scoped; // DbContext 可能被多個請求共用
    }
}
```

**解決方案**：
```csharp
public class SingletonService
{
    private readonly IServiceScopeFactory _scopeFactory;
    
    public SingletonService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }
    
    public void DoWork()
    {
        using var scope = _scopeFactory.CreateScope();
        var scoped = scope.ServiceProvider.GetRequiredService<IScopedService>();
        // 使用 scoped 服務
    }
}
```

### 驗證服務註冊

ASP.NET Core 支援在啟動時驗證 DI 配置：

```csharp
var builder = WebApplication.CreateBuilder(args);

// 開發環境啟用驗證
if (builder.Environment.IsDevelopment())
{
    builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes = true;
        options.ValidateOnBuild = true;
    });
}
```

### 多重實作

一個介面可以有多個實作：

```csharp
services.AddScoped<INotificationService, EmailNotification>();
services.AddScoped<INotificationService, SmsNotification>();
services.AddScoped<INotificationService, PushNotification>();

// 注入所有實作
public class NotificationManager
{
    private readonly IEnumerable<INotificationService> _services;
    
    public NotificationManager(IEnumerable<INotificationService> services)
    {
        _services = services;
    }
    
    public async Task NotifyAll(string message)
    {
        foreach (var service in _services)
        {
            await service.SendAsync(message);
        }
    }
}
```

### 第三方 DI 容器

如需更進階功能，可以替換為第三方容器：

- **Autofac**：支援屬性注入、AOP
- **Simple Injector**：強調最佳實踐
- **Scrutor**：提供組件掃描功能

```csharp
// 使用 Autofac
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(builder =>
{
    builder.RegisterModule(new MyAutofacModule());
});
```

## 程式碼範例 (可選)

```csharp
// 完整的服務註冊範例
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // 配置
        services.Configure<DatabaseSettings>(
            configuration.GetSection("Database"));
        
        // 基礎設施
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("Default")));
        
        // 倉儲
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        
        // 應用服務
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IOrderService, OrderService>();
        
        // HTTP 客戶端
        services.AddHttpClient<IExternalApi, ExternalApiClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["ApiBaseUrl"]);
        });
        
        return services;
    }
}
```
