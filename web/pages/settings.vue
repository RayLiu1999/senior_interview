<script setup lang="ts">
import { exportProgress, importProgress } from '~/utils/progress'

const { state, ready, saving, hydrate, persist, resetProgress } = useProgress()
const fileInput = ref<HTMLInputElement | null>(null)
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const syncCode = ref('')
const { syncing, syncWithServer, deleteSyncedProgress } = useProgress()
const deletingSync = ref(false)

onMounted(async () => {
  await hydrate()
  syncCode.value = state.value.syncToken ?? ''
})

function downloadProgress() {
  const blob = new Blob([exportProgress(state.value)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `senior-interview-progress-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  status.value = { type: 'success', message: '學習紀錄已匯出。' }
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const nextState = importProgress(await file.text())
    await persist(nextState)
    status.value = { type: 'success', message: `已匯入 ${nextState.quizAttempts.length} 次 Quiz 與 ${nextState.assessmentAttempts.length} 次 Assessment。` }
  } catch {
    status.value = { type: 'error', message: '匯入失敗：檔案不是有效的學習紀錄 JSON。' }
  } finally {
    input.value = ''
  }
}

async function clearAllProgress() {
  if (!window.confirm('確定要清除這個瀏覽器的所有學習紀錄嗎？此操作前請先匯出備份。')) return
  await resetProgress()
  status.value = { type: 'success', message: '本機學習紀錄已清除。' }
  syncCode.value = ''
}

async function syncProgress() {
  try {
    const nextState = await syncWithServer(syncCode.value.trim() || null)
    syncCode.value = nextState.syncToken ?? ''
    status.value = { type: 'success', message: '同步完成；此同步碼可在其他裝置再次使用。' }
  } catch {
    status.value = { type: 'error', message: '同步失敗：請確認目前使用的是 Nuxt server build，且同步碼格式正確。' }
  }
}

async function copySyncCode() {
  if (!syncCode.value || !navigator.clipboard) return
  await navigator.clipboard.writeText(syncCode.value)
  status.value = { type: 'success', message: '同步碼已複製。請把它安全地帶到另一台裝置。' }
}

async function deleteRemoteProgress() {
  const token = syncCode.value.trim() || state.value.syncToken
  if (!token || !window.confirm('確定要刪除伺服器上的同步副本嗎？目前瀏覽器的本機紀錄不會被刪除。')) return
  deletingSync.value = true
  try {
    await deleteSyncedProgress(token)
    status.value = { type: 'success', message: '伺服器同步副本已刪除；本機紀錄仍保留。' }
  } catch {
    status.value = { type: 'error', message: '刪除同步副本失敗：請確認同步碼與 Nuxt server build。' }
  } finally {
    deletingSync.value = false
  }
}
</script>

<template>
  <main class="container page-section">
    <section class="progress-hero settings-hero">
      <div>
        <span class="eyebrow">Settings & data</span>
        <h1>你的學習紀錄，留在你手上。</h1>
        <p>紀錄預設儲存在瀏覽器 IndexedDB。你可以匯出 JSON，也可以產生匿名同步碼，將學習狀態帶到另一台裝置。</p>
      </div>
      <div class="settings-status"><span :class="{ online: ready }" />{{ ready ? '本機儲存可用' : '正在載入…' }}</div>
    </section>

    <p v-if="status" class="status-message" :class="status.type">{{ status.message }}</p>
    <section class="settings-grid">
      <article class="settings-card">
        <span class="eyebrow">Backup</span>
        <h2>匯出學習紀錄</h2>
        <p>下載包含作答結果、Learning Objective 紀錄與已讀文章的 JSON 備份。</p>
        <button class="button button-primary" type="button" :disabled="!ready" @click="downloadProgress">下載 JSON</button>
      </article>
      <article class="settings-card">
        <span class="eyebrow">Restore</span>
        <h2>匯入學習紀錄</h2>
        <p>從先前匯出的 JSON 還原到目前瀏覽器。匯入前建議先備份現有資料。</p>
        <label class="button button-secondary file-button">選擇 JSON 檔案<input ref="fileInput" type="file" accept="application/json,.json" @change="importFile" /></label>
      </article>
      <article class="settings-card danger-card">
        <span class="eyebrow">Reset</span>
        <h2>清除本機紀錄</h2>
        <p>刪除目前瀏覽器中的所有作答與閱讀紀錄，不會影響專案內容。</p>
        <button class="button danger-button" type="button" :disabled="saving" @click="clearAllProgress">清除紀錄</button>
      </article>
    </section>

    <section class="settings-sync">
      <div>
        <span class="eyebrow">Anonymous sync</span>
        <h2>跨裝置同步碼</h2>
        <p>同步碼是可攜式 bearer token；拿到它的人可以讀寫這份紀錄，請只分享給自己。此版本使用單機 file-backed adapter，部署到多台 server 前應替換成共享資料庫。</p>
      </div>
      <div class="sync-controls">
        <label class="field">同步碼
          <input v-model="syncCode" type="text" inputmode="text" autocomplete="off" placeholder="留白可產生新的同步碼" />
        </label>
        <div class="sync-actions">
          <button class="button button-primary" type="button" :disabled="syncing || !ready" @click="syncProgress">{{ syncing ? '同步中…' : syncCode ? '同步此紀錄' : '產生同步碼並同步' }}</button>
          <button v-if="syncCode" class="button button-quiet" type="button" @click="copySyncCode">複製同步碼</button>
        </div>
        <button v-if="syncCode" class="button danger-button" type="button" :disabled="deletingSync || syncing" @click="deleteRemoteProgress">{{ deletingSync ? '刪除中…' : '刪除伺服器同步副本' }}</button>
        <small v-if="state.lastSyncedAt" class="muted">上次同步：{{ new Date(state.lastSyncedAt).toLocaleString('zh-TW') }}</small>
      </div>
    </section>

    <section class="settings-note">
      <span class="eyebrow">Cross-device sync</span>
      <h2>同步採 append-only merge</h2>
      <p>作答紀錄以 attempt ID 去重、已讀文章取聯集、最近檢視文章以時間較新的狀態為準；因此不同裝置離線作答後仍可安全合併。</p>
    </section>
  </main>
</template>
