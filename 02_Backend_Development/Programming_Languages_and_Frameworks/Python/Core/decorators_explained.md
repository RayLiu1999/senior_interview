# Python 裝飾器深入解析

- **難度**: 6
- **重要程度**: 5
- **標籤**: `Python`, `Core`, `Decorators`, `Higher-Order Functions`

## 問題詳述

什麼是 Python 的裝飾器 (Decorator)？它的語法糖 (`@`) 是如何運作的？為什麼在編寫裝飾器時，使用 `functools.wraps` 是一個好習慣？請提供一個實際的程式碼範例，例如日誌記錄或計時裝飾器。

## 核心理論與詳解

裝飾器是 Python 中一個強大而優雅的特性，它允許我們在不修改原始函數定義的情況下，為其增加額外的功能。本質上，裝飾器是一個接收函數作為參數，並返回一個新函數的高階函數 (Higher-Order Function)。

### 1. 裝飾器的本質與語法糖

裝飾器的核心思想是函數的“包裝”。假設你有一個函數 `my_func` 和一個裝飾器 `my_decorator`，以下兩種寫法是完全等價的：

**使用 `@` 語法糖:**
```python
@my_decorator
def my_func():
    print("Executing my_func")
```

**不使用語法糖的等價寫法:**
```python
def my_func():
    print("Executing my_func")

my_func = my_decorator(my_func)
```
從等價寫法中可以清晰地看出，`@my_decorator` 所做的事情就是：將被裝飾的函數 `my_func` 作為參數傳遞給 `my_decorator` 函數，然後將 `my_decorator` 的返回值重新賦值給原始的 `my_func` 變數。

一個典型的裝飾器結構如下：
```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        # 在原始函數執行前執行的代碼
        print("Something is happening before the function is called.")
        
        # 調用原始函數
        result = func(*args, **kwargs)
        
        # 在原始函數執行後執行的代碼
        print("Something is happening after the function is called.")
        
        return result
    return wrapper
```
- `my_decorator` 是外部函數，它接收被裝飾的函數 `func`。
- `wrapper` 是內部函數，它“包裝”了原始函數的調用。`*args` 和 `**kwargs` 確保 `wrapper` 函數可以接收任意參數，從而使得裝飾器可以應用於任何參數形式的函數。
- 裝飾器最終返回 `wrapper` 函數。

### 2. `functools.wraps` 的重要性

當你使用裝飾器時，原始函數 `my_func` 實際上被替換為了 `wrapper` 函數。這會導致一個問題：原始函數的元數據（如函數名 `__name__`、文檔字串 `__doc__` 等）會丟失，它們會被 `wrapper` 函數的元數據所取代。

```python
@my_decorator
def say_hello():
    """This is the docstring for say_hello."""
    print("Hello!")

print(say_hello.__name__)  # 輸出: wrapper
print(say_hello.__doc__)   # 輸出: None (或 wrapper 的文檔字串)
```
這對於除錯和內省 (introspection) 來說是非常不便的。為了解決這個問題，Python 的 `functools` 模組提供了一個裝飾器 `wraps`。

`@functools.wraps(func)` 應該被應用在內部 `wrapper` 函數上，它的作用是將被裝飾函數 `func` 的元數據複製到 `wrapper` 函數中。

**正確使用 `wraps` 的範例:**
```python
import functools

def my_decorator_with_wraps(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # ... 執行前後的邏輯 ...
        return func(*args, **kwargs)
    return wrapper

@my_decorator_with_wraps
def say_goodbye():
    """This is the docstring for say_goodbye."""
    print("Goodbye!")

print(say_goodbye.__name__)  # 輸出: say_goodbye
print(say_goodbye.__doc__)   # 輸出: This is the docstring for say_goodbye.
```
因此，**始終在你的裝飾器中使用 `functools.wraps` 是一個必須遵守的最佳實踐**。

## 程式碼範例 (可選)

以下是一個實用的計時裝飾器，用於測量函數的執行時間。

```python
import time
import functools

def timer(func):
    """一個測量函數執行時間的裝飾器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        
        # 執行原始函數
        value = func(*args, **kwargs)
        
        end_time = time.perf_counter()
        run_time = end_time - start_time
        print(f"函數 {func.__name__!r} 執行耗時: {run_time:.4f} 秒")
        return value
    return wrapper

@timer
def waste_some_time(num_times):
    """一個消耗時間的範例函數"""
    for _ in range(num_times):
        sum([i**2 for i in range(10000)])

# 調用被裝飾的函數
waste_some_time(1)
waste_some_time(100)

# --- 輸出範例 ---
# 函數 'waste_some_time' 執行耗時: 0.0028 秒
# 函數 'waste_some_time' 執行耗時: 0.2750 秒
```
這個 `timer` 裝飾器可以被應用於任何你想要測量性能的函數上，而無需修改那些函數的內部代碼，完美地體現了裝飾器的優勢。
