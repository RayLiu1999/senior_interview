# 中介軟體管線

- **難度**: 7
- **標籤**: `Middleware`, `Pipeline`, `Request`

## 問題詳述

中介軟體（Middleware）是 ASP.NET Core 處理 HTTP 請求的核心機制。請求經過一系列中介軟體組成的管線，每個中介軟體可以在請求前後執行邏輯，或終止請求。理解中介軟體的運作原理和執行順序，是開發 ASP.NET Core 應用的關鍵。

## 核心理論與詳解

### 中介軟體管線概念

中介軟體以「洋蔥模型」方式運作，請求從外層進入，響應從內層返回：

```
請求 → [中介軟體 A] → [中介軟體 B] → [中介軟體 C] → 端點
                                                     ↓
響應 ← [中介軟體 A] ← [中介軟體 B] ← [中介軟體 C] ← 結果
```

每個中介軟體可以：
1. 執行請求前的邏輯
2. 呼叫 `next()` 傳遞給下一個中介軟體
3. 執行請求後的邏輯
4. 短路請求（不呼叫 next）

### 中介軟體委派

中介軟體的核心是 `RequestDelegate`：

```csharp
public delegate Task RequestDelegate(HttpContext context);
```

### 使用內建中介軟體

ASP.NET Core 提供許多內建中介軟體：

```csharp
var app = builder.Build();

// 順序很重要！
app.UseExceptionHandler("/error");  // 1. 異常處理（最外層）
app.UseHsts();                       // 2. HSTS
app.UseHttpsRedirection();           // 3. HTTPS 重定向
app.UseStaticFiles();                // 4. 靜態檔案
app.UseRouting();                    // 5. 路由
app.UseCors();                       // 6. CORS
app.UseAuthentication();             // 7. 認證
app.UseAuthorization();              // 8. 授權
app.MapControllers();                // 9. 端點
```

### 建立自訂中介軟體

**方式 1：使用 Use 擴充方法（內聯）**：
```csharp
app.Use(async (context, next) =>
{
    // 請求前邏輯
    var stopwatch = Stopwatch.StartNew();
    
    await next(context); // 呼叫下一個中介軟體
    
    // 請求後邏輯
    stopwatch.Stop();
    context.Response.Headers.Add("X-Response-Time", 
        $"{stopwatch.ElapsedMilliseconds}ms");
});
```

**方式 2：使用類別（推薦）**：
```csharp
public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;
    
    public RequestTimingMiddleware(
        RequestDelegate next,
        ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            _logger.LogInformation(
                "Request {Method} {Path} completed in {Elapsed}ms",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds);
        }
    }
}

// 擴充方法
public static class RequestTimingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestTiming(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestTimingMiddleware>();
    }
}

// 使用
app.UseRequestTiming();
```

### 短路管線

某些情況下需要終止請求，不繼續往下傳遞：

```csharp
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/blocked"))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Access Denied");
        return; // 不呼叫 next，短路管線
    }
    
    await next(context);
});
```

### Map 和 MapWhen

根據條件分支管線：

**Map**：根據路徑分支
```csharp
app.Map("/api", apiApp =>
{
    apiApp.UseAuthentication();
    apiApp.UseAuthorization();
    // API 專用中介軟體
});

app.Map("/health", healthApp =>
{
    healthApp.Run(async context =>
    {
        await context.Response.WriteAsync("Healthy");
    });
});
```

**MapWhen**：根據條件分支
```csharp
app.MapWhen(
    context => context.Request.Headers.ContainsKey("X-Custom-Header"),
    customApp =>
    {
        customApp.UseMiddleware<CustomMiddleware>();
    });
```

### 中介軟體順序的重要性

錯誤的順序會導致問題：

```csharp
// ❌ 錯誤順序
app.UseAuthorization();  // 授權需要認證資訊
app.UseAuthentication(); // 太晚了

// ✅ 正確順序
app.UseAuthentication(); // 先認證
app.UseAuthorization();  // 再授權
```

### 終端中介軟體

使用 `Run` 建立終端中介軟體（不會呼叫後續中介軟體）：

```csharp
app.Run(async context =>
{
    await context.Response.WriteAsync("Hello World!");
});
```

### 中介軟體 vs 篩選器

| 特性 | 中介軟體 | 篩選器 |
|------|----------|--------|
| 作用範圍 | 所有請求 | 僅 MVC/Razor Pages |
| 執行時機 | 管線早期 | MVC 管線內 |
| 存取 | HttpContext | ActionContext |
| 適用場景 | 跨切面關注點 | Controller 邏輯 |

### 常見的中介軟體實作

**異常處理中介軟體**：
```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            
            await context.Response.WriteAsJsonAsync(new
            {
                error = "An error occurred",
                requestId = Activity.Current?.Id ?? context.TraceIdentifier
            });
        }
    }
}
```

## 程式碼範例 (可選)

```csharp
// 完整的請求日誌中介軟體
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;
    
    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = Guid.NewGuid().ToString("N")[..8];
        
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
            ["Path"] = context.Request.Path
        }))
        {
            _logger.LogInformation(
                "Request started: {Method} {Path}",
                context.Request.Method,
                context.Request.Path);
            
            var sw = Stopwatch.StartNew();
            
            try
            {
                await _next(context);
            }
            finally
            {
                sw.Stop();
                _logger.LogInformation(
                    "Request completed: {StatusCode} in {Elapsed}ms",
                    context.Response.StatusCode,
                    sw.ElapsedMilliseconds);
            }
        }
    }
}
```
