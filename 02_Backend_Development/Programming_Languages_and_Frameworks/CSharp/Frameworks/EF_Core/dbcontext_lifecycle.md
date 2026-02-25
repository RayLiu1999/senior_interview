# DbContext 生命週期

- **難度**: 6
- **標籤**: `DbContext`, `Lifetime`, `DI`

## 問題詳述

DbContext 是 Entity Framework Core 的核心類別，代表與資料庫的會話。理解 DbContext 的生命週期管理、正確的使用模式以及在不同場景下的最佳實踐，對於建構穩定、高效能的應用至關重要。

## 核心理論與詳解

### DbContext 的本質

DbContext 負責：
- 管理資料庫連線
- 追蹤實體狀態變更
- 將變更轉換為 SQL 並執行
- 提供查詢介面（DbSet&lt;T&gt;）

### DbContext 是「工作單元」

DbContext 實現了工作單元（Unit of Work）模式：
- 追蹤一組相關的變更
- 在 SaveChanges 時一次性提交
- 確保變更的原子性

### 生命週期選擇

**在 ASP.NET Core 中使用 Scoped（推薦）**：
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));
// 預設是 Scoped 生命週期
```

每個 HTTP 請求獲得一個新的 DbContext 實例，請求結束時自動 Dispose。

### 為什麼不用 Singleton？

**DbContext 不應該是 Singleton**：
- 不是執行緒安全的
- 變更追蹤會無限累積
- 記憶體會不斷增長
- 快取的資料會變得陳舊

### 為什麼不用 Transient？

**Transient 也不推薦**：
- 同一請求中多個服務無法共享同一個工作單元
- 無法跨服務維持事務一致性

```csharp
// Scoped 確保同一請求使用同一個 DbContext
public class OrderService
{
    private readonly AppDbContext _context;
    public OrderService(AppDbContext context) => _context = context;
}

public class PaymentService
{
    private readonly AppDbContext _context;
    public PaymentService(AppDbContext context) => _context = context;
    // 與 OrderService 共享同一個 DbContext 實例
}
```

### DbContext 池化

.NET 提供 DbContext 池化以提升效能：

```csharp
// 使用池化（推薦於高流量應用）
builder.Services.AddDbContextPool<AppDbContext>(options =>
    options.UseSqlServer(connectionString),
    poolSize: 128); // 預設 1024
```

**池化的好處**：
- 減少 DbContext 建立和銷毀的開銷
- 重用資料庫連線
- 降低 GC 壓力

**池化的限制**：
- 不能在建構函式中注入其他 Scoped 服務
- 狀態會被重置，但需要注意任何手動添加的狀態

### 使用 DbContextFactory

對於需要手動控制生命週期的場景：

```csharp
// 註冊
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 使用
public class BackgroundService
{
    private readonly IDbContextFactory<AppDbContext> _factory;
    
    public BackgroundService(IDbContextFactory<AppDbContext> factory)
    {
        _factory = factory;
    }
    
    public async Task ProcessAsync()
    {
        // 手動建立和管理 DbContext
        await using var context = await _factory.CreateDbContextAsync();
        
        // 使用 context
        await context.SaveChangesAsync();
    }
}
```

**適用場景**：
- 背景服務
- Blazor Server
- 多執行緒場景

### 在背景服務中使用

```csharp
public class DataProcessingService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    
    public DataProcessingService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // 每次迭代建立新的 scope
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider
                .GetRequiredService<AppDbContext>();
            
            await ProcessDataAsync(context, stoppingToken);
            
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

### 常見錯誤

**1. 在多執行緒中共享 DbContext**：
```csharp
// ❌ 危險：DbContext 不是執行緒安全的
await Task.WhenAll(
    _context.Users.ToListAsync(),
    _context.Orders.ToListAsync()
);

// ✅ 正確：使用不同的 DbContext 實例
await Task.WhenAll(
    Task.Run(async () =>
    {
        await using var context = await _factory.CreateDbContextAsync();
        return await context.Users.ToListAsync();
    }),
    Task.Run(async () =>
    {
        await using var context = await _factory.CreateDbContextAsync();
        return await context.Orders.ToListAsync();
    })
);
```

**2. 長時間持有 DbContext**：
```csharp
// ❌ 不好：DbContext 存活太久
public class CacheService
{
    private readonly AppDbContext _context; // 可能是 Singleton
}

// ✅ 好：按需建立
public class CacheService
{
    private readonly IDbContextFactory<AppDbContext> _factory;
}
```

### 最佳實踐

1. **ASP.NET Core 中使用 Scoped**
2. **高流量應用考慮池化**
3. **背景服務使用 Factory 或 ScopeFactory**
4. **不要在多執行緒中共享 DbContext**
5. **及時呼叫 SaveChanges，不要累積太多變更**

## 程式碼範例 (可選)

```csharp
// 完整的 DbContext 配置範例
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly);
    }
}

// Program.cs
builder.Services.AddDbContextPool<AppDbContext>((sp, options) =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    options.UseSqlServer(
        configuration.GetConnectionString("Default"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(3);
            sqlOptions.CommandTimeout(30);
        });
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```
