import type { AssessmentAttempt, ProgressState, QuizAttempt } from '~/types/content'
import { clearProgress, createAttemptId, createEmptyProgress, loadProgress, saveProgress } from '~/utils/progress'

export function useProgress() {
  const state = useState<ProgressState>('learning-progress', createEmptyProgress)
  const ready = useState('learning-progress-ready', () => false)
  const saving = useState('learning-progress-saving', () => false)
  const syncing = useState('learning-progress-syncing', () => false)

  async function hydrate() {
    if (!import.meta.client || ready.value) return
    try {
      state.value = await loadProgress()
    } catch {
      // Progress is a convenience feature; a blocked or unavailable browser
      // store must not prevent the content and quizzes from rendering.
      state.value = createEmptyProgress()
    } finally {
      ready.value = true
    }
  }

  async function persist(nextState: ProgressState) {
    state.value = { ...nextState, updatedAt: new Date().toISOString() }
    if (!import.meta.client) return
    saving.value = true
    try {
      await saveProgress(state.value)
    } catch {
      // Keep the in-memory result even when persistence is unavailable.
    } finally {
      saving.value = false
    }
  }

  async function recordQuizAttempt(input: Omit<QuizAttempt, 'id' | 'completedAt'>) {
    await hydrate()
    await persist({
      ...state.value,
      quizAttempts: [
        ...state.value.quizAttempts,
        { ...input, id: createAttemptId('quiz'), completedAt: new Date().toISOString() },
      ],
    })
  }

  async function recordAssessmentAttempt(input: Omit<AssessmentAttempt, 'id' | 'completedAt'>) {
    await hydrate()
    await persist({
      ...state.value,
      assessmentAttempts: [
        ...state.value.assessmentAttempts,
        { ...input, id: createAttemptId('assessment'), completedAt: new Date().toISOString() },
      ],
    })
  }

  function markArticleViewed(articleId: string) {
    const completedArticleIds = state.value.completedArticleIds.includes(articleId)
      ? state.value.completedArticleIds
      : [...state.value.completedArticleIds, articleId]
    void persist({ ...state.value, completedArticleIds, lastViewedArticleId: articleId })
  }

  async function resetProgress() {
    state.value = createEmptyProgress()
    ready.value = true
    if (!import.meta.client) return
    saving.value = true
    try {
      await clearProgress()
    } catch {
      // The in-memory state is still reset if browser storage is unavailable.
    } finally {
      saving.value = false
    }
  }

  async function syncWithServer(requestedToken?: string | null) {
    if (!import.meta.client) throw new Error('Progress sync is only available in the browser.')
    await hydrate()
    syncing.value = true
    try {
      const response = await $fetch<{
        syncToken: string
        state: ProgressState
      }>('/api/progress/sync', {
        method: 'POST',
        body: {
          syncToken: requestedToken || state.value.syncToken || undefined,
          state: state.value,
        },
      })
      const syncedAt = new Date().toISOString()
      const nextState = {
        ...response.state,
        syncToken: response.syncToken,
        lastSyncedAt: syncedAt,
      }
      await persist(nextState)
      return nextState
    } finally {
      syncing.value = false
    }
  }

  return {
    state,
    ready,
    saving,
    syncing,
    hydrate,
    persist,
    recordQuizAttempt,
    recordAssessmentAttempt,
    markArticleViewed,
    resetProgress,
    syncWithServer,
  }
}
