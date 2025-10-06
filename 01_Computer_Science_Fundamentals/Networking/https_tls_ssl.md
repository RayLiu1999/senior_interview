# HTTPS 與 TLS/SSL 原理

- **難度**: 7
- **重要程度**: 5
- **標籤**: `HTTPS`, `TLS`, `SSL`, `加密`, `安全`, `憑證`

## 問題詳述

深入解釋 HTTPS 的工作原理、TLS/SSL 握手過程、加密機制，以及如何確保 Web 通信的安全性。

## 核心理論與詳解

### 1. HTTPS 基本概念

**HTTPS (HTTP Secure)** 是 HTTP 協定的安全版本，透過 **TLS (Transport Layer Security)** 或其前身 **SSL (Secure Sockets Layer)** 在傳輸層提供加密保護。

#### 核心目標

- **機密性 (Confidentiality)**: 透過加密防止第三方竊聽
- **完整性 (Integrity)**: 透過訊息驗證碼 (MAC) 防止資料被竄改
- **身份驗證 (Authentication)**: 透過數位憑證驗證伺服器身份
- **不可否認性 (Non-repudiation)**: 透過數位簽章確保通信無法被否認

### 2. TLS/SSL 演進歷史

| 協定版本 | 發布年份 | 狀態 | 主要特點 |
|---------|---------|------|---------|
| **SSL 2.0** | 1995 | 已棄用 | 首個公開版本，存在嚴重安全漏洞 |
| **SSL 3.0** | 1996 | 已棄用 | 重新設計，但仍有 POODLE 攻擊漏洞 |
| **TLS 1.0** | 1999 | 不建議 | 基於 SSL 3.0，存在 BEAST 攻擊風險 |
| **TLS 1.1** | 2006 | 不建議 | 修復 BEAST，但已過時 |
| **TLS 1.2** | 2008 | **主流** | 支援 AEAD 加密、SHA-256 |
| **TLS 1.3** | 2018 | **推薦** | 簡化握手、0-RTT、更強安全性 |

> **重要**: 現代應用應至少使用 **TLS 1.2**，並優先考慮 **TLS 1.3**。

### 3. TLS 1.2 完整握手流程

TLS 1.2 握手需要 **2-RTT (Round-Trip Time)**，涉及以下步驟：

#### 第一階段：Hello 訊息交換

```
客戶端                                                伺服器
  |                                                      |
  |  ─────── (1) ClientHello ─────────────────────────> |
  |    - 支援的 TLS 版本 (如 TLS 1.2)                    |
  |    - 隨機數 (Client Random)                          |
  |    - 支援的加密套件列表 (Cipher Suites)               |
  |    - 支援的壓縮方法                                   |
  |    - 擴充功能 (SNI, ALPN 等)                         |
  |                                                      |
  |  <─────── (2) ServerHello ──────────────────────── |
  |    - 選定的 TLS 版本                                 |
  |    - 隨機數 (Server Random)                          |
  |    - 選定的加密套件                                   |
  |    - 會話 ID (Session ID)                           |
```

#### 第二階段：伺服器憑證與金鑰交換

```
  |  <─────── (3) Certificate ──────────────────────── |
  |    - 伺服器的數位憑證鏈                               |
  |    - 包含公鑰和 CA 簽章                              |
  |                                                      |
  |  <─────── (4) ServerKeyExchange ────────────────── |
  |    - DHE/ECDHE 參數 (提供前向安全性)                 |
  |    - 伺服器對參數的數位簽章                           |
  |                                                      |
  |  <─────── (5) ServerHelloDone ─────────────────── |
  |    - 表示伺服器 Hello 階段完成                       |
```

#### 第三階段：客戶端金鑰交換

```
  |  ─────── (6) ClientKeyExchange ───────────────────> |
  |    - 客戶端的 DH/ECDH 公開參數                       |
  |    - 用於計算預主密鑰 (Pre-Master Secret)            |
  |                                                      |
  |  ─────── (7) ChangeCipherSpec ────────────────────> |
  |    - 通知伺服器後續使用協商的加密                     |
  |                                                      |
  |  ─────── (8) Finished ────────────────────────────> |
  |    - 加密的握手訊息雜湊 (驗證握手完整性)              |
```

#### 第四階段：伺服器確認

```
  |  <─────── (9) ChangeCipherSpec ────────────────── |
  |    - 伺服器確認使用協商的加密                         |
  |                                                      |
  |  <─────── (10) Finished ───────────────────────── |
  |    - 加密的握手訊息雜湊                              |
  |                                                      |
  | ════════ 開始加密應用資料傳輸 ════════════════════ |
```

### 4. 金鑰生成與管理

#### 金鑰生成流程

1. **預主密鑰 (Pre-Master Secret)**
   - 透過 RSA 或 Diffie-Hellman 金鑰交換產生
   - 長度: 48 bytes (TLS 1.2)

2. **主密鑰 (Master Secret)**
   ```
   Master Secret = PRF(Pre-Master Secret, 
                      "master secret", 
                      Client Random + Server Random)
   ```

3. **會話金鑰 (Session Keys)**
   - 從主密鑰衍生出多個金鑰：
     - `client_write_MAC_key`: 客戶端訊息驗證
     - `server_write_MAC_key`: 伺服器訊息驗證
     - `client_write_key`: 客戶端加密金鑰
     - `server_write_key`: 伺服器加密金鑰
     - `client_write_IV`: 客戶端初始向量
     - `server_write_IV`: 伺服器初始向量

#### 為什麼需要雙向金鑰？

- **單向獨立**: 客戶端和伺服器使用不同的金鑰
- **防重放攻擊**: 攻擊者無法重放加密訊息
- **雙向驗證**: 確保雙方都參與了握手過程

### 5. 加密套件 (Cipher Suite)

#### 命名格式

```
TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
│   │     │        │       │   │
│   │     │        │       │   └─ MAC 演算法 (已被 AEAD 取代)
│   │     │        │       └───── AEAD 模式
│   │     │        └───────────── 對稱加密演算法與金鑰長度
│   │     └────────────────────── 身份驗證演算法
│   └──────────────────────────── 金鑰交換演算法
└──────────────────────────────── 協定版本
```

#### 推薦的加密套件 (TLS 1.2)

1. **TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384**
   - 提供前向安全性 (Perfect Forward Secrecy)
   - AEAD 加密模式 (認證加密)
   - 強大的 256 位元 AES 加密

2. **TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256**
   - 適用於移動裝置 (ARM 優化)
   - ChaCha20 串流加密
   - Poly1305 訊息驗證

#### 不安全的加密套件

- 包含 `RC4`: 已知存在偏差攻擊
- 包含 `3DES`: 金鑰長度不足
- 包含 `MD5` 或 `SHA1`: 雜湊碰撞風險
- 使用 `RSA` 金鑰交換: 無前向安全性
- 包含 `NULL` 或 `EXPORT`: 無加密或弱加密

### 6. TLS 1.3 的重大改進

#### 簡化握手流程 (1-RTT)

```
客戶端                                                伺服器
  |                                                      |
  |  ─────── ClientHello + KeyShare ──────────────────> |
  |    - 提前發送 DH/ECDH 公開參數                       |
  |    - 支援的加密套件                                  |
  |                                                      |
  |  <─────── ServerHello + KeyShare ──────────────── |
  |  <─────── Certificate ─────────────────────────── |
  |  <─────── Finished ────────────────────────────── |
  |    - 伺服器完成握手 (已加密)                         |
  |                                                      |
  |  ─────── Finished ─────────────────────────────────> |
  |    - 客戶端確認 (已加密)                             |
  |                                                      |
  | ════════ 立即開始應用資料傳輸 ════════════════════ |
```

**優勢**: 握手延遲從 2-RTT 降至 **1-RTT**

#### 0-RTT 模式 (會話恢復)

如果客戶端先前已與伺服器建立連接：

```
客戶端                                                伺服器
  |                                                      |
  |  ─────── ClientHello + EarlyData ──────────────────> |
  |    - 使用 PSK (Pre-Shared Key)                      |
  |    - **立即發送應用資料**                            |
  |                                                      |
  |  <─────── ServerHello + EarlyData ─────────────── |
  |    - 確認接受 0-RTT 資料                            |
```

**優勢**: 無額外握手延遲

**風險**: 0-RTT 資料可能被重放，需要應用層防護

#### 移除不安全特性

- **移除 RSA 金鑰交換**: 強制使用 (EC)DHE，確保前向安全性
- **移除靜態 RSA/DH**: 所有金鑰交換必須是臨時的
- **移除 CBC 模式**: 全面使用 AEAD 加密 (如 GCM、CCM、ChaCha20-Poly1305)
- **移除壓縮**: 防止 CRIME 攻擊
- **移除重協商**: 簡化狀態機，減少攻擊面
- **移除自定義 DHE 參數**: 強制使用已知安全的群組

#### 加密套件簡化

TLS 1.3 的加密套件僅指定 AEAD 和雜湊演算法：

- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_GCM_SHA256`

金鑰交換和簽章演算法在擴充中協商。

### 7. 數位憑證與 PKI

#### X.509 憑證結構

```
憑證內容:
├── 版本號
├── 序號 (Serial Number)
├── 簽章演算法
├── 發行者 (Issuer) - CA 的識別資訊
├── 有效期限 (Validity)
│   ├── Not Before
│   └── Not After
├── 主體 (Subject) - 網站的識別資訊
│   ├── 通用名稱 (CN): example.com
│   ├── 組織 (O)
│   └── 國家 (C)
├── 主體公鑰資訊
│   ├── 公鑰演算法 (RSA/ECDSA)
│   └── 公鑰
├── 擴充欄位
│   ├── Subject Alternative Name (SAN)
│   ├── Key Usage
│   ├── Extended Key Usage
│   └── CRL Distribution Points
└── CA 數位簽章
```

#### 憑證驗證流程

1. **檢查有效期限**: 確保憑證未過期
2. **驗證 CA 簽章**: 使用 CA 的公鑰驗證憑證簽章
3. **檢查撤銷狀態**: 透過 CRL 或 OCSP 確認憑證未被撤銷
4. **驗證主體名稱**: 確認憑證的 CN 或 SAN 與訪問的域名匹配
5. **檢查信任鏈**: 遞迴驗證到根 CA

#### 憑證鏈示例

```
根 CA 憑證 (Root CA) - 自簽署
    ├── 中繼 CA 憑證 (Intermediate CA)
    │       └── 終端實體憑證 (End-Entity Certificate)
    │               - CN: www.example.com
```

**為什麼需要中繼 CA？**

- **安全性**: 根 CA 私鑰離線保存，減少洩露風險
- **靈活性**: 可撤銷中繼 CA 而不影響根 CA
- **管理性**: 不同業務可使用不同中繼 CA

### 8. 前向安全性 (Perfect Forward Secrecy, PFS)

#### 概念

即使伺服器的私鑰在未來被洩露，**過去的通信內容仍然無法被解密**。

#### 實現方式

使用 **臨時的 Diffie-Hellman 金鑰交換** (DHE 或 ECDHE)：

1. 每次連接生成新的臨時金鑰對
2. 用於協商會話金鑰
3. 握手完成後立即銷毀臨時私鑰

#### 對比: RSA 金鑰交換

- **無前向安全性**: 客戶端用伺服器公鑰加密 Pre-Master Secret
- **風險**: 伺服器私鑰洩露 → 所有歷史流量可被解密

> **最佳實踐**: 只使用 ECDHE 加密套件，確保前向安全性。

### 9. 常見攻擊與防護

#### 中間人攻擊 (MITM)

**攻擊手法**:
- 攻擊者攔截客戶端與伺服器的通信
- 分別與雙方建立 TLS 連接
- 解密、查看、修改流量後重新加密

**防護措施**:
1. **憑證固定 (Certificate Pinning)**: 應用內建信任的憑證或公鑰
2. **HSTS (HTTP Strict Transport Security)**: 強制瀏覽器使用 HTTPS
3. **公鑰固定**: 固定伺服器或 CA 的公鑰雜湊
4. **透明度日誌 (Certificate Transparency)**: 監測惡意憑證簽發

#### 降級攻擊 (Downgrade Attack)

**攻擊手法**: 強制使用較舊、有漏洞的 TLS 版本或加密套件

**防護措施**:
1. **禁用舊協定**: 只啟用 TLS 1.2 和 1.3
2. **TLS_FALLBACK_SCSV**: 防止版本降級
3. **最低加密套件要求**: 禁用弱加密套件

#### 重放攻擊 (Replay Attack)

**攻擊手法**: 攻擊者重放先前截獲的 0-RTT 資料

**防護措施**:
1. **單次隨機數 (Nonce)**: 確保每個請求唯一
2. **時間戳驗證**: 拒絕過期的請求
3. **應用層冪等性**: 0-RTT 只用於冪等操作 (如 GET)

#### 心臟出血漏洞 (Heartbleed)

**原因**: OpenSSL 的 Heartbeat 實現存在緩衝區過讀漏洞

**影響**: 可洩露伺服器記憶體中的私鑰、會話金鑰、用戶資料

**防護措施**:
1. 升級至修復版本的 OpenSSL
2. 撤銷並重新簽發所有憑證
3. 重設所有用戶密碼

### 10. HTTPS 效能優化

#### 會話恢復 (Session Resumption)

**目的**: 跳過完整握手，降低延遲

**方法 1: Session ID**
```
首次連接:
  客戶端 ─── ClientHello ─────> 伺服器
  伺服器 ─── Session ID ──────> 客戶端
         (伺服器快取會話狀態)

恢復連接:
  客戶端 ─── ClientHello + Session ID ─> 伺服器
  伺服器 ─── 恢復會話，跳過金鑰交換 ─> 客戶端
```

**缺點**: 伺服器需維護大量會話狀態，負載均衡困難

**方法 2: Session Ticket (推薦)**
```
首次連接:
  伺服器 ─── Session Ticket ──> 客戶端
         (加密的會話狀態)

恢復連接:
  客戶端 ─── ClientHello + Session Ticket ─> 伺服器
  伺服器 ─── 解密 Ticket，恢復會話 ─────> 客戶端
```

**優勢**: 伺服器無狀態，易於水平擴展

#### OCSP Stapling

**問題**: 傳統 OCSP 驗證需要客戶端額外連接 CA

**解決**: 伺服器預先從 CA 獲取 OCSP 回應，在握手時提供

**優勢**:
- 減少客戶端延遲
- 保護用戶隱私 (不向 CA 洩露訪問資訊)
- 降低 CA 負載

#### TLS 1.3 的效能優勢

| 特性 | TLS 1.2 | TLS 1.3 | 改進 |
|-----|---------|---------|-----|
| **握手 RTT** | 2-RTT | 1-RTT | **延遲減半** |
| **會話恢復** | 1-RTT | 0-RTT | **零延遲** |
| **握手訊息** | 10+ 訊息 | 6 訊息 | 減少傳輸量 |
| **加密範圍** | 部分握手訊息明文 | 握手大部分加密 | 增強隱私 |

### 11. 實務配置建議

#### Nginx 配置範例

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # 憑證配置
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # 只啟用 TLS 1.2 和 1.3
    ssl_protocols TLSv1.2 TLSv1.3;

    # 優先使用伺服器的加密套件偏好
    ssl_prefer_server_ciphers on;

    # TLS 1.2 安全的加密套件
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # 啟用 Session Ticket
    ssl_session_tickets on;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;

    # DH 參數 (2048 位元以上)
    ssl_dhparam /path/to/dhparam.pem;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /path/to/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    # HSTS (強制 HTTPS)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 防止點擊劫持
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

#### 安全檢查清單

- [ ] 只啟用 TLS 1.2 和 TLS 1.3
- [ ] 禁用所有 CBC 模式加密套件
- [ ] 禁用 RSA 金鑰交換，強制使用 ECDHE
- [ ] 啟用 HSTS 並考慮加入 Preload List
- [ ] 配置 OCSP Stapling
- [ ] 使用 2048 位元以上的 RSA 金鑰或 256 位元的 ECDSA 金鑰
- [ ] 定期更新憑證 (建議使用自動化如 Let's Encrypt)
- [ ] 監控憑證到期時間
- [ ] 配置適當的 Content Security Policy (CSP)

### 12. 效能與安全的權衡

| 層面 | 高效能選擇 | 高安全選擇 | 推薦做法 |
|-----|----------|----------|---------|
| **TLS 版本** | TLS 1.2 (相容性) | TLS 1.3 | TLS 1.3 優先，1.2 後備 |
| **加密套件** | AES-128-GCM | AES-256-GCM | AES-256-GCM (硬體加速下性能差異小) |
| **金鑰長度** | 2048-bit RSA | 4096-bit RSA | 2048-bit RSA 或 256-bit ECDSA |
| **會話恢復** | Session Ticket | 無 (完整握手) | Session Ticket + 定期輪換金鑰 |
| **0-RTT** | 啟用 | 禁用 | 僅限冪等操作 |
| **OCSP** | Stapling | 實時查詢 | OCSP Stapling + Must-Staple 擴充 |

### 13. 監控與診斷

#### 關鍵指標

1. **握手延遲**
   - 測量 TLS 握手時間
   - 監控不同地區的延遲差異

2. **會話恢復率**
   - 計算成功使用 Session Ticket/ID 的比例
   - 目標: > 70%

3. **憑證錯誤率**
   - 監控憑證驗證失敗的頻率
   - 可能表示憑證過期或 MITM 攻擊

4. **加密套件分布**
   - 追蹤客戶端使用的加密套件
   - 識別仍在使用弱加密的客戶端

#### 診斷工具

- **SSL Labs Server Test**: 線上 TLS 配置評估
- **OpenSSL CLI**: `openssl s_client -connect example.com:443`
- **Wireshark**: 抓包分析 TLS 握手
- **Mozilla Observatory**: 綜合安全掃描
- **testssl.sh**: 命令行 TLS 安全掃描工具

## 總結

HTTPS 和 TLS 是現代 Web 安全的基石：

1. **TLS 1.3** 提供了更好的安全性和效能，應優先採用
2. **前向安全性** 是必須的，只使用 ECDHE 金鑰交換
3. **憑證管理** 要自動化，避免過期造成服務中斷
4. **會話恢復** 可顯著降低延遲，改善用戶體驗
5. **持續監控** 和定期安全審計是維護安全的關鍵

作為資深後端工程師，你需要：
- 深入理解 TLS 握手過程和加密原理
- 能夠配置和優化生產環境的 HTTPS 設定
- 識別和防範常見的 TLS 攻擊
- 在效能和安全之間找到適當的平衡點
