# Entity Framework Core

Entity Framework Core (EF Core) 是 .NET 的現代化物件關聯對映（ORM）框架，讓開發者能以物件導向的方式操作資料庫。理解 EF Core 的核心概念和效能優化技巧，是建構高效後端應用的關鍵。

## 主題列表

| 編號 | 主題 | 難度 | 重要性 | 標籤 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | [DbContext 生命週期](./dbcontext_lifecycle.md) | 6 | 5 | `DbContext`, `Lifetime`, `DI` |

---

## 學習建議

1. **DbContext 生命週期**：理解 DbContext 應該是短暫的，搭配 DI 使用 Scoped 生命週期
2. **變更追蹤**：了解 EF Core 如何追蹤實體狀態，以及何時應該關閉追蹤
3. **載入策略**：根據使用情境選擇適當的載入方式，避免 N+1 問題
4. **效能優化**：學會使用 AsNoTracking、投影查詢、原生 SQL 等技巧
