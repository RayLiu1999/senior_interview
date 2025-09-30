# HTTPS 與 TLS/SSL

- **難度**: 7
- **重要性**: 4
- **標籤**: `Security`, `HTTPS`, `TLS`, `SSL`

## 問題詳述

什麼是 HTTPS？請解釋 TLS/SSL 的工作原理以及它如何保護資料在網路傳輸中的安全。HTTPS 握手 (Handshake) 過程是怎樣的？

## 核心理論與詳解

HTTPS (Hypertext Transfer Protocol Secure) 是 HTTP 協定的安全版本,它透過 TLS (Transport Layer Security) 或其前身 SSL (Secure Sockets Layer) 來加密傳輸的資料,確保資料的機密性、完整性和身份認證。

**核心目標**:
1.  **機密性 (Confidentiality)**: 資料被加密,第三方無法竊聽。
2.  **完整性 (Integrity)**: 資料在傳輸過程中不會被篡改。
3.  **身份驗證 (Authentication)**: 確認伺服器的身份,防止中間人攻擊。

---

### TLS/SSL 的演進

-   **SSL 1.0**: 從未公開發布 (存在嚴重安全漏洞)。
-   **SSL 2.0**: 1995 年發布,已廢棄 (不安全)。
-   **SSL 3.0**: 1996 年發布,已廢棄 (存在 POODLE 攻擊漏洞)。
-   **TLS 1.0**: 1999 年發布,基於 SSL 3.0,但更安全。
-   **TLS 1.1**: 2006 年發布,修復了一些漏洞。
-   **TLS 1.2**: 2008 年發布,目前仍廣泛使用。
-   **TLS 1.3**: 2018 年發布,最新標準,性能和安全性大幅提升。

**現代系統應該使用 TLS 1.2 或 TLS 1.3,並禁用所有 SSL 版本。**

---

### HTTPS 的工作原理

HTTPS 在 HTTP 和 TCP 之間添加了一個 TLS/SSL 層:

```
應用層:   HTTP
安全層:   TLS/SSL
傳輸層:   TCP
網路層:   IP
```

所有 HTTP 資料在傳輸前會被 TLS 加密,到達目的地後再被解密。

---

### TLS 握手過程 (TLS Handshake)

TLS 握手是客戶端和伺服器在建立 HTTPS 連線時,協商加密參數和交換金鑰的過程。

#### TLS 1.2 握手流程

1.  **Client Hello**:
    -   客戶端向伺服器發送支援的 TLS 版本、加密套件列表、隨機數 (Client Random)。

2.  **Server Hello**:
    -   伺服器選擇一個加密套件,發送自己的隨機數 (Server Random)。
    -   伺服器發送 **數位憑證 (Certificate)**,其中包含伺服器的公鑰。
    -   伺服器發送 "Server Hello Done" 訊息。

3.  **憑證驗證**:
    -   客戶端驗證伺服器的憑證是否:
        -   由受信任的憑證頒發機構 (CA) 簽發。
        -   尚未過期。
        -   憑證中的域名與請求的域名一致。

4.  **金鑰交換**:
    -   客戶端生成一個 **Pre-Master Secret**,使用伺服器的公鑰加密後發送給伺服器。
    -   只有伺服器的私鑰才能解密這個 Pre-Master Secret。

5.  **生成會話金鑰**:
    -   雙方使用 Pre-Master Secret、Client Random 和 Server Random,透過相同的演算法生成 **Session Key (對稱金鑰)**。
    -   後續的所有資料都使用這個對稱金鑰進行加密/解密。

6.  **Finished 訊息**:
    -   客戶端發送 "Finished" 訊息 (已加密)。
    -   伺服器發送 "Finished" 訊息 (已加密)。
    -   握手完成,開始傳輸應用層資料。

**為什麼使用對稱加密傳輸資料?**
-   非對稱加密 (RSA) 速度很慢。
-   對稱加密 (AES) 速度快得多。
-   因此,TLS 使用非對稱加密來**交換金鑰**,用對稱加密來**傳輸資料**。

#### TLS 1.3 的改進

-   **1-RTT 握手**: 將握手縮減為 1 次往返 (Round-Trip),大幅降低延遲。
-   **0-RTT 模式**: 在某些情況下可以實現零往返,立即開始傳輸資料。
-   **移除弱加密套件**: 禁用 RSA 金鑰交換、SHA-1 等不安全演算法。
-   **強制前向保密 (Forward Secrecy)**: 即使伺服器私鑰洩露,過去的通訊仍然安全。

---

### 數位憑證與 CA (憑證頒發機構)

#### 數位憑證 (Digital Certificate)

數位憑證是由憑證頒發機構 (CA) 簽發的電子文件,用於證明伺服器的身份。

**憑證內容**:
-   伺服器的公鑰
-   伺服器的域名 (Common Name)
-   憑證的有效期
-   CA 的數位簽章

#### 憑證驗證鏈 (Certificate Chain)

```
根憑證 (Root CA)
    ↓ 簽名
中間憑證 (Intermediate CA)
    ↓ 簽名
伺服器憑證 (End Entity Certificate)
```

客戶端瀏覽器內建了一份受信任的根 CA 清單。當驗證伺服器憑證時,會追溯整個憑證鏈,直到找到受信任的根 CA。

#### Let's Encrypt

**Let's Encrypt** 是一個免費、自動化的 CA,大幅降低了 HTTPS 的部署成本,推動了全網 HTTPS 化。

---

### HTTPS 在 Go 中的實現

#### 啟動 HTTPS 伺服器

```go
package main

import (
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello, HTTPS!"))
}

func main() {
    http.HandleFunc("/", handler)
    
    // 使用 TLS 證書啟動 HTTPS 伺服器
    // cert.pem: 憑證檔案
    // key.pem: 私鑰檔案
    err := http.ListenAndServeTLS(":443", "cert.pem", "key.pem", nil)
    if err != nil {
        panic(err)
    }
}
```

#### 強制重新導向到 HTTPS

```go
func redirectToHTTPS(w http.ResponseWriter, r *http.Request) {
    target := "https://" + r.Host + r.URL.Path
    if len(r.URL.RawQuery) > 0 {
        target += "?" + r.URL.RawQuery
    }
    http.Redirect(w, r, target, http.StatusMovedPermanently)
}

func main() {
    // HTTP 伺服器 (僅用於重新導向)
    go func() {
        http.ListenAndServe(":80", http.HandlerFunc(redirectToHTTPS))
    }()
    
    // HTTPS 伺服器
    http.ListenAndServeTLS(":443", "cert.pem", "key.pem", nil)
}
```

---

### HTTPS 最佳實踐

1.  **使用 TLS 1.2 或 TLS 1.3**: 禁用 SSL 和 TLS 1.0/1.1。
2.  **使用強加密套件**: 優先使用 ECDHE 和 AES-GCM。
3.  **啟用 HSTS (HTTP Strict Transport Security)**:
    ```go
    w.Header().Set("Strict-Transport-Security", 
        "max-age=31536000; includeSubDomains; preload")
    ```
    這會強制瀏覽器在指定時間內只透過 HTTPS 訪問網站。

4.  **使用有效的憑證**: 確保憑證未過期,且由受信任的 CA 簽發。
5.  **實施憑證固定 (Certificate Pinning,可選)**: 防止 CA 被攻破的情況。
6.  **啟用 OCSP Stapling**: 提高憑證撤銷檢查的性能。
7.  **禁用不安全的協定和加密套件**:
    ```go
    tlsConfig := &tls.Config{
        MinVersion: tls.VersionTLS12,
        CipherSuites: []uint16{
            tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
            tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
            tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
        },
    }
    ```

---

### 常見的 HTTPS 攻擊與防禦

#### 1. 中間人攻擊 (MITM)

**攻擊**: 攻擊者攔截客戶端和伺服器之間的通訊,假冒伺服器。

**防禦**: 
-   客戶端驗證伺服器憑證。
-   使用憑證固定 (Certificate Pinning)。

#### 2. 降級攻擊 (Downgrade Attack)

**攻擊**: 強制客戶端和伺服器使用較舊、不安全的協定版本。

**防禦**: 
-   禁用舊版本協定。
-   使用 HSTS 防止協定降級。

#### 3. 憑證偽造

**攻擊**: 攻擊者偽造或盜用合法憑證。

**防禦**: 
-   使用憑證透明度 (Certificate Transparency)。
-   啟用 OCSP 檢查憑證是否被撤銷。

---

### 結論

HTTPS 是現代 Web 應用的基本要求,它透過 TLS/SSL 提供了加密、完整性和身份驗證三重保障。作為資深後端工程師,必須深入理解 TLS 握手過程、數位憑證的驗證機制,以及如何正確配置 HTTPS 伺服器。

在 2024 年,已經沒有理由不使用 HTTPS。使用 Let's Encrypt 等免費 CA 服務,部署 HTTPS 變得極其簡單。記住:HTTPS 不僅保護使用者的隱私,也是 SEO 排名和瀏覽器信任度的重要因素。
