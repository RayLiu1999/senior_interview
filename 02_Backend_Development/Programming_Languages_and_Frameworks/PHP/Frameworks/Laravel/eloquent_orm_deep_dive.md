# Eloquent ORM 深度探討 (N+1 問題)

- **難度**: 7
- **重要性**: 5
- **標籤**: `Laravel`, `Eloquent`, `ORM`, `N+1 Problem`, `Performance`

## 問題詳述

什麼是 ORM 中的「N+1 查詢問題」？在 Laravel Eloquent 中，這個問題通常如何發生？請解釋並示範如何使用「預加載 (Eager Loading)」來解決這個問題。

## 核心理論與詳解

N+1 查詢問題是使用任何物件關係對應 (ORM) 框架時都可能遇到的一個常見效能陷阱。它會導致資料庫執行大量不必要的查詢，從而嚴重拖慢應用程式的回應速度。

### 什麼是 N+1 查詢問題？

假設我們有兩個模型：`Author` 和 `Book`，它們之間存在一對多關聯 (一個作者可以有多本書)。

```php
// Author.php
public function books()
{
    return $this->hasMany(Book::class);
}
```

現在，我們想要獲取所有作者以及他們各自的書籍列表。一個直觀的寫法可能是這樣：

```php
// 在控制器中
$authors = Author::all(); // 第 1 次查詢

foreach ($authors as $author) {
    // 在迴圈中，每次存取 $author->books 都會觸發一次新的查詢
    echo "作者: " . $author->name;
    foreach ($author->books as $book) { // 第 N 次查詢
        echo "  - 書名: " . $book->title;
    }
}
```

這段程式碼的問題在於：
1.  **第 1 次查詢**: `Author::all()` 會執行一次查詢，獲取所有作者。假設有 100 位作者。
    ```sql
    SELECT * FROM authors;
    ```
2.  **接下來的 N 次查詢**: 在 `foreach` 迴圈中，每當我們第一次存取 `$author->books` 這個關聯屬性時，Eloquent 會自動執行一次**新的**查詢來獲取該作者的所有書籍。這個特性被稱為「延遲加載 (Lazy Loading)」。
    ```sql
    SELECT * FROM books WHERE author_id = 1;
    SELECT * FROM books WHERE author_id = 2;
    SELECT * FROM books WHERE author_id = 3;
    ...
    SELECT * FROM books WHERE author_id = 100;
    ```

因此，為了獲取 100 位作者和他們的書籍，我們總共執行了 `1 + 100 = 101` 次資料庫查詢。這就是「N+1 查詢問題」。如果作者數量巨大，資料庫的壓力會急劇增加。

### 如何解決：預加載 (Eager Loading)

解決 N+1 問題的關鍵是**預加載**。它的核心思想是：**在第一次查詢時，就告訴 Eloquent 我們接下來會需要用到哪些關聯數據，讓 Eloquent 可以用更少的查詢次數把這些數據一次性取回。**

在 Laravel 中，我們使用 `with()` 方法來實現預加載。

```php
// 使用 with() 進行預加載
$authors = Author::with('books')->get(); // 現在只會有 2 次查詢

foreach ($authors as $author) {
    echo "作者: " . $author->name;
    // 再次存取 $author->books 時，不會觸發新的查詢
    // 因為書籍數據已經被預先加載並存放在記憶體中了
    foreach ($author->books as $book) {
        echo "  - 書名: " . $book->title;
    }
}
```

這段程式碼的執行過程變成了：
1.  **第 1 次查詢**: 獲取所有作者。
    ```sql
    SELECT * FROM authors;
    ```
2.  **第 2 次查詢**: Eloquent 收集所有作者的 ID，然後用一個 `IN` 子句一次性獲取所有相關的書籍。
    ```sql
    SELECT * FROM books WHERE author_id IN (1, 2, 3, ..., 100);
    ```

最終，我們只用了 **2** 次查詢就獲取了所有需要的數據，極大地提升了效能。Eloquent 會在內部將查詢到的書籍數據根據 `author_id` 匹配回對應的作者模型實例中。

### 更多預加載技巧

#### 1. 加載多個關聯

您可以傳遞一個陣列給 `with()` 來同時預加載多個關聯。

```php
$authors = Author::with(['books', 'profile'])->get();
```

#### 2. 巢狀預加載 (Nested Eager Loading)

如果您的關聯還有下一層關聯需要加載（例如，`Book` 模型有關聯到 `Publisher`），可以使用「點」語法。

```php
// 預加載作者的書籍，以及每本書的出版社
$authors = Author::with('books.publisher')->get();
```
這會執行 3 次查詢：一次查作者，一次查書籍，一次查出版社。

#### 3. 帶有約束的預加載 (Constrained Eager Loading)

有時您可能只想預加載滿足特定條件的關聯數據。

```php
// 只預加載已出版的書籍
$authors = Author::with(['books' => function ($query) {
    $query->where('published', true);
}])->get();
```

#### 4. 延遲預加載 (Lazy Eager Loading)

如果您已經獲取了一個模型集合，但忘記了預加載，您仍然可以使用 `load()` 方法來補救。

```php
$authors = Author::all(); // 忘了用 with()

// ... 程式碼 ...

// 在需要使用關聯數據之前，進行延遲預加載
$authors->load('books'); // 這裡會執行第 2 次查詢
```

### 如何發現 N+1 問題？

在開發過程中，可以使用 [Laravel Telescope](https://laravel.com/docs/telescope) 或 [Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar) 這類工具。它們可以清晰地顯示每個請求執行了多少次資料庫查詢，讓 N+1 問題無所遁形。

### 結論

N+1 查詢是 ORM 開發中常見的效能瓶頸，但 Laravel Eloquent 提供了強大且易於使用的 `with()` 和 `load()` 方法來實現預加載，從而有效地解決這個問題。養成在查詢時思考並預加載所需關聯的習慣，是每一位 Laravel 開發者都應具備的關鍵技能。
