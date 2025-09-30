# Data Modeling: Embedding vs. Referencing

- **難度**: 7
- **重要性**: 5
- **標籤**: `MongoDB`, `Data Modeling`, `Schema Design`

## 問題詳述

在 MongoDB 中進行資料建模時，有兩種主要的處理關聯資料的方式：嵌入 (Embedding) 和引用 (Referencing)。請解釋這兩種方式的區別，並討論在什麼情況下應該選擇使用哪一種，它們各自的優缺點是什麼？

## 核心理論與詳解

MongoDB 的文件模型提供了極大的靈活性，但也將資料建模的複雜性從資料庫層轉移到了應用層。其中最核心的決策之一，就是如何表示實體之間的關係。與 SQL 資料庫總是使用外鍵（引用）不同，MongoDB 提供了兩種選擇：嵌入和引用。

---

### 嵌入 (Embedding / Denormalization)

**定義**: 將相關的資料直接作為子文件或子文件陣列儲存在主文件內部。這是一種**反正規化 (Denormalization)** 的設計。

**範例**: 一個部落格文章 (`post`) 和它的評論 (`comments`)。

```json
// Embedding: 將評論嵌入到文章文件中
{
  "_id": "post123",
  "title": "My First Post",
  "content": "This is the content of the post.",
  "author_id": "user456",
  "comments": [
    {
      "author": "John",
      "text": "Great article!",
      "timestamp": "2023-10-27T10:00:00Z"
    },
    {
      "author": "Jane",
      "text": "Very informative.",
      "timestamp": "2023-10-27T11:30:00Z"
    }
  ]
}
```

#### 優點

1.  **高效的讀取效能**: 由於相關資料儲存在同一個文件中，你可以在**一次資料庫查詢**中獲取到所有需要的資訊（例如，文章及其所有評論）。這完全避免了 SQL 中昂貴的 `JOIN` 操作。
2.  **資料原子性**: 對單一文件的更新是原子操作。如果你更新文章的同時新增一條評論，這個操作可以作為一個整體成功或失敗，保證了資料的一致性。

#### 缺點

1.  **文件大小限制**: MongoDB 的 BSON 文件大小上限為 **16MB**。如果嵌入的子文件陣列會無限增長（例如，一個熱門產品的所有評論），最終可能會超出這個限制。
2.  **寫入/更新開銷**: 更新嵌入式文件中的一小部分（例如，修改一條評論的文字）需要重寫整個文件。對於大型文件，這可能會帶來效能開銷。
3.  **資料冗餘**: 如果被嵌入的資料（例如，用戶資訊）在多個地方被使用，嵌入會導致資料冗餘。當需要更新這些冗餘資料時，必須找到並更新所有包含它的主文件。

#### 何時選擇嵌入？

-   當實體之間是**「一對少」(one-to-few)** 的關係時。
-   當子文件**不會**無限增長時。
-   當資料的**讀取頻率遠高於寫入頻率**時。
-   當你總是需要**同時**查詢主文件和其關聯的子文件時。

---

### 引用 (Referencing / Normalization)

**定義**: 將相關的資料儲存在不同的集合中，並在一個文件中儲存對另一個文件 `_id` 的引用。這種類似於 SQL 的**正規化 (Normalization)** 設計。

**範例**: 繼續使用部落格文章和評論的例子。

```json
// Collection: posts
{
  "_id": "post123",
  "title": "My First Post",
  "content": "This is the content of the post.",
  "author_id": "user456"
}

// Collection: comments
{
  "_id": "comment789",
  "post_id": "post123", // 引用 posts 集合的 _id
  "author": "John",
  "text": "Great article!",
  "timestamp": "2023-10-27T10:00:00Z"
},
{
  "_id": "comment790",
  "post_id": "post123",
  "author": "Jane",
  "text": "Very informative.",
  "timestamp": "2023-10-27T11:30:00Z"
}
```

#### 優點

1.  **避免文件大小限制**: 由於評論儲存在獨立的集合中，即使一篇熱門文章有數百萬條評論，也不會觸及 16MB 的文件大小限制。
2.  **減少資料冗餘**: 如果一個實體（例如，一個產品）被多個其他實體（例如，多個訂單）引用，你只需要儲存產品的 `_id`，而不是複製整個產品文件。更新產品資訊時，只需修改 `products` 集合中的一個文件。
3.  **更新效率高**: 更新一條評論只需要修改 `comments` 集合中的一個小文件，而不需要重寫整個文章文件。

#### 缺點

1.  **讀取效能較低**: 獲取文章及其所有評論需要**至少兩次**資料庫查詢：一次查詢 `posts` 集合，一次查詢 `comments` 集合。在應用程式層面，你需要執行類似「JOIN」的操作。
2.  **非原子性**: 對文章和評論的修改無法在一個原子操作中完成。你需要依賴 MongoDB 的多文件交易來保證一致性，這會增加複雜性。

#### 何時選擇引用？

-   當實體之間是**「一對多」(one-to-many)** 或 **「多對多」(many-to-many)** 的關係時。
-   當嵌入的子文件陣列可能會**無限增長**時。
-   當被引用的實體經常被**獨立查詢**時（例如，你可能只想查詢某個用戶的所有評論，而不在乎是哪篇文章的）。
-   當需要**減少資料冗餘**時。

### 混合模式 (Hybrid Approach)

在實際應用中，通常會採用混合模式來取得平衡。

**範例**: 一個產品 (`product`) 和它的評論 (`reviews`)。

```json
// Collection: products
{
  "_id": "product456",
  "name": "Super Widget",
  "price": 99.99,
  // 嵌入最新的幾條評論，用於快速預覽
  "latest_reviews": [
    { "author": "Alice", "rating": 5, "text": "Amazing!" },
    { "author": "Bob", "rating": 4, "text": "Good value." }
  ],
  // 儲存評論總數和平均評分，避免即時計算
  "review_count": 1250,
  "average_rating": 4.7
}

// Collection: reviews
{
  "_id": "review001",
  "product_id": "product456", // 引用
  "author": "Alice",
  "rating": 5,
  "text": "Amazing!"
}
```

在這個例子中：
-   我們**嵌入**了最新的幾條評論和匯總資料（`review_count`, `average_rating`），這樣在產品列表頁上可以非常快速地展示預覽資訊，無需額外查詢。
-   我們使用**引用**來儲存所有的評論，避免了文件大小問題，並允許對評論進行獨立的分頁和查詢。

### 結論

在 MongoDB 中，資料建模的核心是根據應用的**資料存取模式 (Data Access Patterns)** 來做出決策。

-   如果你的應用**讀取密集**，並且總是需要將關聯資料一併獲取，那麼**嵌入**是更好的選擇。
-   如果你的應用**寫入密集**，或者關聯資料會無限增長，或者需要被獨立存取，那麼**引用**是更合適的選擇。

通常，最佳實踐是「**先嵌入，直到有必要時再引用**」(Embed until you have a reason not to)。理解這兩種模式的權衡取捨，並結合業務場景做出明智的設計，是成功使用 MongoDB 的關鍵。
