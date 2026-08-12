<script setup lang="ts">
import { exportProgress, importProgress } from '~/utils/progress'

const { state, ready, saving, hydrate, persist, resetProgress } = useProgress()
const fileInput = ref<HTMLInputElement | null>(null)
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)

onMounted(() => {
  void hydrate()
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
}
</script>

<template>
  <main class="container page-section">
    <section class="progress-hero settings-hero">
      <div>
        <span class="eyebrow">Settings & data</span>
        <h1>你的學習紀錄，留在你手上。</h1>
        <p>目前紀錄只儲存在瀏覽器 IndexedDB。你可以隨時匯出 JSON，在另一台裝置匯入；後續再接上匿名同步服務。</p>
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

    <section class="settings-note">
      <span class="eyebrow">Cross-device sync</span>
      <h2>跨裝置同步會在下一階段接入</h2>
      <p>W5 會加入匿名同步碼與可替換的 server adapter；在那之前，匯出／匯入是最可靠的跨裝置轉移方式。</p>
    </section>
  </main>
</template>
