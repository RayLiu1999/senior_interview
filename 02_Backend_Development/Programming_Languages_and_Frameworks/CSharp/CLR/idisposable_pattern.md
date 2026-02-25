# IDisposable 與資源管理

- **難度**: 6
- **標籤**: `IDisposable`, `using`, `Finalize`

## 問題詳述

IDisposable 模式是 .NET 中管理非受控資源（如檔案句柄、資料庫連線、網路連線等）的標準方式。正確實作此模式並配合 `using` 語句使用，是避免資源洩漏的關鍵。

## 核心理論與詳解

### 受控資源 vs 非受控資源

| 類型 | 說明 | 範例 |
|------|------|------|
| **受控資源** | 由 CLR 的 GC 管理 | 一般的 .NET 物件 |
| **非受控資源** | 需要手動釋放 | 檔案句柄、資料庫連線、記憶體指標 |

GC 只能管理受控記憶體，非受控資源需要顯式釋放。

### IDisposable 介面

```csharp
public interface IDisposable
{
    void Dispose();
}
```

### 標準的 Dispose 模式

Microsoft 推薦的完整實作模式：

```csharp
public class ResourceHolder : IDisposable
{
    private bool _disposed = false;
    private IntPtr _unmanagedResource; // 非受控資源
    private ManagedResource _managedResource; // 受控資源（也實作 IDisposable）
    
    // 公開的 Dispose 方法
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this); // 告訴 GC 不需要呼叫終結器
    }
    
    // 虛擬的 Dispose 方法，供衍生類別覆寫
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
            return;
        
        if (disposing)
        {
            // 釋放受控資源
            _managedResource?.Dispose();
        }
        
        // 釋放非受控資源
        if (_unmanagedResource != IntPtr.Zero)
        {
            CloseHandle(_unmanagedResource);
            _unmanagedResource = IntPtr.Zero;
        }
        
        _disposed = true;
    }
    
    // 終結器（作為安全網）
    ~ResourceHolder()
    {
        Dispose(false);
    }
    
    // 確保物件已釋放的輔助方法
    protected void ThrowIfDisposed()
    {
        if (_disposed)
            throw new ObjectDisposedException(GetType().Name);
    }
}
```

### using 語句

`using` 語句確保在離開作用域時自動呼叫 `Dispose()`：

```csharp
// 傳統 using 語句
using (var stream = new FileStream("file.txt", FileMode.Open))
{
    // 使用 stream
} // 自動呼叫 Dispose()

// C# 8.0 的 using 宣告
using var stream = new FileStream("file.txt", FileMode.Open);
// 使用 stream
// 在變數離開作用域時自動 Dispose
```

編譯器將 using 轉換為 try-finally：

```csharp
var stream = new FileStream("file.txt", FileMode.Open);
try
{
    // 使用 stream
}
finally
{
    stream?.Dispose();
}
```

### IAsyncDisposable（非同步釋放）

.NET Core 3.0+ 支援非同步釋放：

```csharp
public class AsyncResource : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        await ReleaseResourcesAsync();
        GC.SuppressFinalize(this);
    }
    
    private async Task ReleaseResourcesAsync()
    {
        // 非同步釋放資源
        await _connection.CloseAsync();
    }
}

// 使用 await using
await using var resource = new AsyncResource();
```

### 終結器的角色

終結器是 Dispose 的「安全網」，在使用者忘記呼叫 Dispose 時提供最後的清理機會：

**終結器的特點**：
- 由 GC 在另一個執行緒呼叫
- 呼叫時機不確定
- 只應用於清理非受控資源
- 有效能開銷

**何時需要終結器**：
- 直接持有非受控資源
- 作為安全網防止資源洩漏

### 不需要完整 Dispose 模式的情況

如果類別只封裝其他的 IDisposable 物件，可以使用簡化版：

```csharp
public class SimpleWrapper : IDisposable
{
    private readonly Stream _stream;
    private bool _disposed;
    
    public SimpleWrapper(Stream stream)
    {
        _stream = stream ?? throw new ArgumentNullException(nameof(stream));
    }
    
    public void Dispose()
    {
        if (!_disposed)
        {
            _stream.Dispose();
            _disposed = true;
        }
    }
}
```

### 常見錯誤

**1. 在 Dispose 後繼續使用物件**：
```csharp
using var stream = new MemoryStream();
stream.Write(data);
// stream 已 Dispose
stream.Write(moreData); // ObjectDisposedException!
```

**2. 多次 Dispose**：
```csharp
// Dispose 應該是冪等的（可以多次呼叫）
stream.Dispose();
stream.Dispose(); // 不應該拋出異常
```

**3. 在終結器中存取受控物件**：
```csharp
~BadFinalizer()
{
    _managedResource.Dispose(); // 危險！物件可能已被 GC
}
```

### 最佳實踐

1. **始終使用 using 語句**
2. **類別持有 IDisposable 成員就應該實作 IDisposable**
3. **終結器只用於非受控資源**
4. **在 Dispose 中呼叫 GC.SuppressFinalize**
5. **Dispose 應該是冪等的**
6. **在公開方法中檢查是否已 Dispose**

## 程式碼範例 (可選)

```csharp
// 實用的資料庫連線管理
public class DatabaseService : IDisposable, IAsyncDisposable
{
    private readonly DbConnection _connection;
    private bool _disposed;
    
    public DatabaseService(string connectionString)
    {
        _connection = new SqlConnection(connectionString);
    }
    
    public async Task<T> QueryAsync<T>(string sql)
    {
        ThrowIfDisposed();
        
        if (_connection.State != ConnectionState.Open)
            await _connection.OpenAsync();
        
        using var command = _connection.CreateCommand();
        command.CommandText = sql;
        // 執行查詢...
        return default;
    }
    
    public void Dispose()
    {
        if (!_disposed)
        {
            _connection.Dispose();
            _disposed = true;
        }
    }
    
    public async ValueTask DisposeAsync()
    {
        if (!_disposed)
        {
            await _connection.DisposeAsync();
            _disposed = true;
        }
    }
    
    private void ThrowIfDisposed()
    {
        if (_disposed)
            throw new ObjectDisposedException(nameof(DatabaseService));
    }
}
```
