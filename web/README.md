# Interview Guide Web App

這個 Nuxt 3 應用程式是 Markdown 面試指南的使用介面。文章、Quick Quiz 與 Hard Assessment 仍以專案根目錄的 Markdown 為唯一內容來源；`scripts/generate_web_content.mjs` 只在建置時產生網站 manifest。

## 本地開發

```sh
cd web
pnpm install
pnpm dev
```

常用驗證指令：

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm e2e
```

`pnpm e2e` 會在需要時先啟動 production server；第一次執行前請以 `pnpm exec playwright install chromium` 安裝 Chromium。

`pnpm dev`、`pnpm build` 與 `pnpm generate` 都會先重新產生 `public/content/catalog.json`、各類內容的 detail JSON 與 `generated/routes.json`。`catalog.json` 只保存列表與關聯所需的摘要資料；文章、Quick Quiz、Hard Assessment 的完整 Markdown 會依路由從 `public/content/{articles,quizzes,assessments}` 延遲載入，避免每個頁面的 SSR payload 重複攜帶整份內容。生成結果包含 558 篇文章、571 題 Quick Quiz 與 53 份 Hard Assessment；內容版本以 `contentVersion` 固定，沒有內容變更時重複建置不會製造無意義 diff。

## 學習資料

- Quick Quiz 結果預設寫入瀏覽器 IndexedDB。
- Hard Assessment 保存分段回答、rubric 分數、通過狀態、筆記與內容 hash。
- Dashboard 與 Review queue 依 Learning Objective 聚合作答結果，低於 75% 或最近一次標記需要回讀時列入弱點。
- Settings 支援 JSON 匯出／匯入與清除本機資料。
- W5 提供匿名同步碼：`POST /api/progress/sync` 會以 attempt ID 去重並合併離線資料；讀寫既可使用 `Authorization: Bearer <syncToken>`，GET 也暫時相容 `?syncToken=...`。`DELETE /api/progress/sync` 可刪除伺服器上的同步副本，不會清除瀏覽器 IndexedDB。

## 同步部署注意事項

同步 API 的預設儲存位置是 `web/.data/progress.json`，也可以用 `INTERVIEW_PROGRESS_STORE` 指定持久化路徑。API 預設限制每個 client 每分鐘 30 次請求、同步 state 2 MiB，並回傳 `Cache-Control: no-store`；可用 `INTERVIEW_PROGRESS_RATE_LIMIT`、`INTERVIEW_PROGRESS_RATE_WINDOW_SECONDS`、`INTERVIEW_PROGRESS_MAX_BYTES`、`INTERVIEW_PROGRESS_MAX_REQUEST_BYTES`、`INTERVIEW_PROGRESS_RETENTION_DAYS` 與 `INTERVIEW_PROGRESS_MAX_RECORDS` 調整。紀錄會在寫入／讀取時清理超過保留期限或數量上限的資料，檔案目錄與檔案也會以較嚴格的權限建立。這是單機、可替換的 file-backed adapter；若部署到多個 instance，仍應替換成共享資料庫或持久化 KV，並加入 token 撤銷、加密與正式帳號身份。

`pnpm generate` 適合純靜態網站與 IndexedDB local-first 模式；要使用同步 API，請使用 `pnpm build` 產生的 Nuxt node server。
