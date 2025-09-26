# Dockerfile, Image, Container, Registry：它們是什麼關係？

- **難度**: 3
- **重要性**: 5
- **標籤**: `Docker`, `Container`

## 問題詳述

請解釋 Docker 的四個核心概念：`Dockerfile`, `Image`, `Container` 和 `Registry`，並闡述它們之間的關係。

## 核心理論與詳解

這四個概念是 Docker 工作流程的基石，理解它們的關係對於掌握 Docker 至關重要。它們構成了一個從 **定義** -> **建置** -> **執行** -> **分發** 的完整生命週期。

![Docker 核心概念關係圖](https://i.imgur.com/3aGg3q6.png)

### 1. Dockerfile：藍圖 (Blueprint)

`Dockerfile` 是一個**文本文件**，它包含了使用者可以在命令列上呼叫的所有命令，用來**自動化地建置一個 Docker 映像 (Image)**。它就像是建造一棟房子的**設計藍圖**，詳細描述了如何一步步地構建出應用程式的執行環境。

- **角色**: **定義**。它定義了應用程式的環境、依賴、原始碼位置、啟動命令等。
- **內容**: 由一系列的指令（如 `FROM`, `RUN`, `COPY`, `CMD` 等）和參數組成。
- **範例**:

```dockerfile
# 使用官方的 Go 1.18 作為基礎映像
FROM golang:1.18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 go module 檔案並下載依賴
COPY go.mod ./
COPY go.sum ./
RUN go mod download

# 複製所有原始碼
COPY . .

# 編譯應用程式
RUN go build -o /main .

# 暴露 8080 埠
EXPOSE 8080

# 設定容器啟動時執行的命令
CMD [ "/main" ]
```

### 2. Image：模板 (Template)

`Image`（映像）是一個**唯讀的模板**，包含了建立 Docker 容器所需的所有指令。它是根據 `Dockerfile` 的描述**建置 (build)** 出來的產物。映像採用分層儲存的架構，每一條 `Dockerfile` 指令都會在映像上建立新的一層。

- **角色**: **建置產物**。它是應用程式及其執行環境的靜態、不可變的快照。
- **特性**:
  - **唯讀 (Read-only)**: 映像本身是不可修改的。
  - **分層 (Layered)**: 這種設計使得映像的建置和分發更有效率，因為層可以被快取和重用。
- **來源**:
  - 透過 `docker build` 命令從 `Dockerfile` 建置。
  - 從 `Registry` 中 `pull` 下來。

### 3. Container：實例 (Instance)

`Container`（容器）是 `Image` 的一個**可執行的實例**。如果說 `Image` 是類別 (Class)，那麼 `Container` 就是這個類別的實例 (Instance)。容器是真正執行應用程式的地方。

- **角色**: **執行環境**。它提供了一個獨立、隔離的環境來執行應用程式。
- **特性**:
  - **可寫 (Writable)**: 當容器從映像啟動時，Docker 會在映像的頂部新增一個**可寫層**（稱為容器層）。所有對容器的修改（如寫入檔案、修改配置）都發生在這一層。
  - **隔離 (Isolated)**: 容器之間彼此隔離，擁有自己的檔案系統、網路和進程空間。
  - **輕量級 (Lightweight)**: 容器共享主機的作業系統內核，因此非常輕量。

### 4. Registry：倉庫 (Warehouse)

`Registry`（註冊中心）是一個**集中儲存和分發 Docker 映像**的服務。它就像是存放各種映像的**程式碼倉庫**（如 GitHub）或**軟體套件庫**（如 npm）。

- **角色**: **分發與共享**。開發者可以將建置好的映像 `push` 到 Registry，其他開發者或伺服器可以從 Registry `pull` 下來使用。
- **類型**:
  - **公共 Registry**: 例如官方的 **Docker Hub**，提供了大量的官方和社群維護的映像。
  - **私有 Registry**: 企業或個人可以搭建自己的私有 Registry，用於儲存敏感或內部的映像。

### 四者之間的關係總結

- **定義**: 開發者編寫 `Dockerfile` 來**定義**應用程式的執行環境和建置步驟。
- **建置**: 使用 `docker build` 命令，根據 `Dockerfile` **建置**出一個唯讀的 `Image`。
- **執行**: 使用 `docker run` 命令，以 `Image` 為模板，**執行**並建立一個或多個可讀寫的 `Container` 實例。
- **分發**: 使用 `docker push` 命令，將本地的 `Image` **分發**到 `Registry` 中進行儲存和共享。其他團隊成員或部署伺服器可以使用 `docker pull` 從 `Registry` 獲取該 `Image` 並執行。

這個流程完美地體現了 Docker 的核心價值：**Build, Ship, and Run Any App, Anywhere**。