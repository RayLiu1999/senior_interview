# Go 語言面試題索引

## Concurrency (併發)

- [什麼是 Goroutine？它與傳統的線程 (Thread) 有什麼區別？](./Concurrency/goroutine_vs_thread.md) (難度: 4)
- [談談 Go 中的 Channel，它的主要用途是什麼？以及緩衝區 Channel 和非緩衝區 Channel 的區別？](./Concurrency/channel_buffered_vs_unbuffered.md) (難度: 5)
- [Go 語言中的 `select` 關鍵字是用來做什麼的？它有哪些常見的應用場景？](./Concurrency/select_statement_and_use_cases.md) (難度: 6)
- [什麼是 `sync.Mutex` 和 `sync.RWMutex`？它們之間有什麼區別和適用場景？](./Concurrency/mutex_vs_rwmutex.md) (難度: 5)
- [什麼是 `sync.WaitGroup`？請舉例說明其使用方法。](./Concurrency/waitgroup_usage.md) (難度: 4)

## Standard Library (標準庫)

- [請解釋 Go 語言中的 `context` 套件，它的主要用途和 API 是什麼？](./Standard_Library/context_package_usage.md) (難度: 7)

## Internals (底層原理)

- [Go 的記憶體回收 (GC) 是如何運作的？三色標記法是什麼？](./Internals/go_garbage_collection.md) (難度: 8)
- [`defer` 關鍵字的執行時機是什麼？它在與返回值互動時有什麼需要注意的地方？](./Internals/defer_execution.md) (難度: 6)
- [Go 中的 `slice` 和 `array` 有什麼區別？`slice` 的底層結構是什麼？](./Internals/slice_vs_array.md) (難度: 4)

## Tooling (工具)

- [`go mod` 的主要指令有哪些？例如 `tidy`, `vendor` 的作用是什麼？](./Tooling/go_mod_commands.md) (難度: 3)
