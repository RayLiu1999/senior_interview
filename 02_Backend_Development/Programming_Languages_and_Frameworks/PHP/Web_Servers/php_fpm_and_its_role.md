# 什麼是 PHP-FPM？它在 Web 伺服器 (如 Nginx) 架構中扮演什麼角色？

- **難度**: 6
- **標籤**: `PHP`, `Web Server`, `PHP-FPM`, `Nginx`

## 問題詳述

在生產環境中部署 PHP 應用程式時，通常會看到 Nginx + PHP-FPM 的組合。請解釋 PHP-FPM 是什麼，它的全稱是什麼？為什麼我們需要它？並詳細描述在一個典型的 Web 請求中，Nginx 和 PHP-FPM 是如何協同工作的。

## 核心理論與詳解

### 1. 什麼是 PHP-FPM？

PHP-FPM 的全稱是 **PHP FastCGI Process Manager** (PHP FastCGI 處理程序管理器)。它是一個專為 PHP 設計的、實現了 FastCGI 協議的處理程序管理器。

要理解 PHP-FPM，首先需要了解 CGI 和 FastCGI：

- **CGI (Common Gateway Interface)**: 一個早期的標準，允許 Web 伺服器（如 Apache, Nginx）將動態請求轉發給外部的應用程式處理。CGI 的主要缺點是，對於每一個進來的請求，Web 伺服器都需要重新啟動一個新的應用程式處理程序，處理完畢後再銷毀它。這種模式開銷巨大，效能極低。

- **FastCGI (Fast Common Gateway Interface)**: CGI 的改良版。它的核心思想是創建一個常駐的處理程序池。Web 伺服器通過一個穩定的通訊通道（通常是 TCP Socket 或 Unix Domain Socket）將請求轉發給 FastCGI 處理程序。處理程序在完成請求後不會退出，而是繼續等待下一個請求。這大大減少了重複創建和銷毀處理程序的開銷，顯著提升了效能。

**PHP-FPM 就是 PHP 官方提供的 FastCGI 協議的實現**。它負責管理一個 PHP 處理程序的生命週期，包括啟動、停止和監控，確保有足夠的 PHP 處理程序來應對 Web 伺服器轉發過來的請求。

### 2. 為什麼需要 PHP-FPM？

Web 伺服器（如 Nginx）本身只擅長處理靜態資源（HTML, CSS, 圖片等）和處理網路連線（HTTP 請求）。它本身並不知道如何執行 PHP 程式碼。因此，需要一個「翻譯官」來執行 PHP 腳本並將結果返回給 Web 伺服器。PHP-FPM 就扮演了這個角色。

使用 PHP-FPM 的主要優點包括：

- **高效能**: 通過管理一個常駐的處理程序池，避免了 CGI 模式下重複創建處理程序的巨大開銷。
- **處理程序管理**: PHP-FPM 提供了比傳統 FastCGI 更強大的管理功能。它可以根據流量負載動態地調整處理程序的數量（`dynamic` 模式），也可以設置為固定的處理程序數量（`static` 模式）或在需要時才啟動（`ondemand` 模式）。
- **穩定性與隔離**: PHP-FPM 的處理程序池獨立於 Web 伺服器運行。即使某個 PHP 處理程序因錯誤而崩潰，PHP-FPM 會自動重啟它，而不會影響到 Web 伺服器本身。
- **平滑重啟**: 支援平滑重啟 (`graceful reload`)，可以在不中斷服務的情況下重新載入設定和 PHP 程式碼。
- **詳細的狀態監控**: PHP-FPM 可以提供一個狀態頁面，顯示當前處理程序池的詳細資訊，如活躍處理程序數、閒置處理程序數、請求佇列等，方便監控和除錯。

### 3. Nginx 與 PHP-FPM 的協同工作流程

在一個典型的 Nginx + PHP-FPM 架構中，一個動態 PHP 請求的處理流程如下：

1. **接收請求**: 使用者的瀏覽器發起一個 HTTP 請求到伺服器，例如 `https://example.com/index.php`。Nginx 作為 Web 伺服器，首先接收到這個請求。

2. **請求路由**: Nginx 根據其設定檔 (`nginx.conf`) 中的 `location` 區塊來判斷如何處理這個請求。
    - 如果請求的是靜態資源（如 `.jpg`, `.css`），Nginx 會直接從檔案系統讀取並返回給使用者。
    - 如果請求的是 PHP 檔案（如結尾是 `.php`），Nginx 會將這個請求轉發給 PHP-FPM 處理。

3. **轉發請求至 PHP-FPM**: Nginx 通過 FastCGI 協議將請求的相關資訊（如請求方法、URL、標頭、POST 內容等）打包，並通過預先設定好的通訊方式（例如 `127.0.0.1:9000` 的 TCP Socket 或 `/var/run/php-fpm.sock` 的 Unix Socket）發送給 PHP-FPM。

    一個典型的 Nginx 設定片段如下：

    ```nginx
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass   unix:/var/run/php/php8.1-fpm.sock; # 或 fastcgi_pass 127.0.0.1:9000;
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_index  index.php;
    }
    ```

4. **PHP-FPM 處理請求**:
    - PHP-FPM 的主處理程序 (master process) 接收到來自 Nginx 的請求。
    - 主處理程序從其管理的閒置處理程序池 (worker pool) 中選擇一個子處理程序 (worker process)。
    - 該子處理程序接收請求的所有資訊，初始化 PHP 執行環境，找到並執行 `index.php` 腳本。

5. **PHP 程式碼執行**: PHP 腳本開始執行。它可能會連接資料庫、讀取快取、處理業務邏輯等。所有執行結果（例如 `echo` 或 `print` 產生的 HTML 內容）都會被捕獲到輸出緩衝區。

6. **返回結果給 Nginx**: PHP 腳本執行完畢後，PHP-FPM 子處理程序將執行結果（通常是完整的 HTML 頁面）通過 FastCGI 協議回傳給 Nginx。

7. **Nginx 回應使用者**: Nginx 接收到來自 PHP-FPM 的回應內容，將其打包成一個標準的 HTTP 回應（加上 HTTP 標頭），然後發送回使用者的瀏覽器。

8. **處理程序回收**: PHP-FPM 子處理程序在完成請求後不會立即銷毀，而是將自身標記為閒置狀態，放回處理程序池，等待下一個請求的到來。

這個流程清晰地展示了 Nginx 和 PHP-FPM 之間的分工：**Nginx 負責「接客」和「傳菜」，而 PHP-FPM 則是負責「烹飪」的「廚師」**。這種分離的架構使得兩者都可以獨立擴展和優化，是現代 PHP 應用部署的標準實踐。
