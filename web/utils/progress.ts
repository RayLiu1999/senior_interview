import type {
  AssessmentAttempt,
  ProgressState,
  QuizAttempt,
} from '~/types/content'

const databaseName = 'senior-interview-progress'
const databaseVersion = 1
const storeName = 'progress'
const stateKey = 'current'
const progressSchemaVersion = 2

export function createEmptyProgress(): ProgressState {
  return {
    schemaVersion: progressSchemaVersion,
    quizAttempts: [],
    assessmentAttempts: [],
    completedArticleIds: [],
    lastViewedArticleId: null,
    updatedAt: null,
    syncToken: null,
    lastSyncedAt: null,
  }
}

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB is unavailable in this environment.'))
      return
    }
    const request = indexedDB.open(databaseName, databaseVersion)
    request.onerror = () => reject(request.error ?? new Error('Unable to open progress database.'))
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName)
    }
    request.onsuccess = () => resolve(request.result)
  })
}

export async function loadProgress(): Promise<ProgressState> {
  if (!hasIndexedDb()) return createEmptyProgress()
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(stateKey)
    request.onerror = () => reject(request.error ?? new Error('Unable to load progress.'))
    request.onsuccess = () => resolve(normalizeProgress(request.result))
  })
}

export async function saveProgress(state: ProgressState): Promise<void> {
  if (!hasIndexedDb()) return
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(state, stateKey)
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save progress.'))
    transaction.oncomplete = () => resolve()
  })
}

export async function clearProgress(): Promise<void> {
  if (!hasIndexedDb()) return
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(stateKey)
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to clear progress.'))
    transaction.oncomplete = () => resolve()
  })
}

export function normalizeProgress(value: unknown): ProgressState {
  if (!value || typeof value !== 'object') return createEmptyProgress()
  const candidate = value as Partial<ProgressState>
  return {
    schemaVersion: progressSchemaVersion,
    quizAttempts: Array.isArray(candidate.quizAttempts) ? candidate.quizAttempts as QuizAttempt[] : [],
    assessmentAttempts: Array.isArray(candidate.assessmentAttempts)
      ? (candidate.assessmentAttempts as AssessmentAttempt[]).map((attempt) => ({
        ...attempt,
        conceptIds: Array.isArray(attempt.conceptIds) ? attempt.conceptIds.map(String) : [],
        learningObjectiveIds: Array.isArray(attempt.learningObjectiveIds) ? attempt.learningObjectiveIds.map(String) : [],
        answers: attempt.answers && typeof attempt.answers === 'object' ? attempt.answers : {},
        rubricScores: attempt.rubricScores && typeof attempt.rubricScores === 'object' ? attempt.rubricScores : {},
      }))
      : [],
    completedArticleIds: Array.isArray(candidate.completedArticleIds) ? candidate.completedArticleIds.map(String) : [],
    lastViewedArticleId: candidate.lastViewedArticleId ? String(candidate.lastViewedArticleId) : null,
    updatedAt: candidate.updatedAt ? String(candidate.updatedAt) : null,
    syncToken: candidate.syncToken ? String(candidate.syncToken) : null,
    lastSyncedAt: candidate.lastSyncedAt ? String(candidate.lastSyncedAt) : null,
  }
}

export function exportProgress(state: ProgressState): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)
}

export function importProgress(serialized: string): ProgressState {
  const parsed: unknown = JSON.parse(serialized)
  return normalizeProgress(parsed)
}

export function createAttemptId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${random}`
}

export interface ObjectiveSummary {
  key: string
  conceptId: string
  objectiveId: string
  attempts: number
  effectiveScore: number
  latestScore: number
  needsReview: boolean
  lastAttemptAt: string | null
}

export interface ProgressMetrics {
  quizAttempts: number
  quizCorrect: number
  quizAccuracy: number | null
  assessmentAttempts: number
  assessmentPassed: number
  assessmentPassRate: number | null
  completedArticles: number
  objectiveCount: number
  reviewCount: number
}

export function calculateProgressMetrics(state: ProgressState): ProgressMetrics {
  const summaries = calculateObjectiveSummaries(state)
  const quizCorrect = state.quizAttempts.filter((attempt) => attempt.correct === true || attempt.score >= attempt.maxScore).length
  const assessmentPassed = state.assessmentAttempts.filter((attempt) => attempt.passed).length
  return {
    quizAttempts: state.quizAttempts.length,
    quizCorrect,
    quizAccuracy: state.quizAttempts.length ? quizCorrect / state.quizAttempts.length : null,
    assessmentAttempts: state.assessmentAttempts.length,
    assessmentPassed,
    assessmentPassRate: state.assessmentAttempts.length ? assessmentPassed / state.assessmentAttempts.length : null,
    completedArticles: state.completedArticleIds.length,
    objectiveCount: summaries.length,
    reviewCount: summaries.filter(isObjectiveWeak).length,
  }
}

export function isObjectiveWeak(summary: ObjectiveSummary): boolean {
  return summary.needsReview || summary.effectiveScore < 0.75
}

export function calculateObjectiveSummaries(state: ProgressState): ObjectiveSummary[] {
  const groups = new Map<string, ObjectiveSummary>()
  const attempts = [
    ...state.quizAttempts.map((attempt) => ({
      conceptId: attempt.conceptId,
      objectiveIds: attempt.learningObjectiveIds,
      score: attempt.maxScore ? attempt.score / attempt.maxScore : 0,
      needsReview: attempt.selfAssessment === 'review' || attempt.correct === false,
      completedAt: attempt.completedAt,
    })),
    ...state.assessmentAttempts.map((attempt) => ({
      conceptId: attempt.conceptIds?.[0] ?? '',
      objectiveIds: attempt.learningObjectiveIds ?? [],
      score: attempt.maxScore ? attempt.totalScore / attempt.maxScore : 0,
      needsReview: !attempt.passed,
      completedAt: attempt.completedAt,
    })),
  ]

  for (const attempt of attempts) {
    for (const objectiveId of attempt.objectiveIds) {
      const [conceptId, localObjectiveId] = objectiveId.split('/').length > 1
        ? [objectiveId.slice(0, objectiveId.lastIndexOf('/')), objectiveId.slice(objectiveId.lastIndexOf('/') + 1)]
        : [attempt.conceptId, objectiveId]
      const key = `${conceptId}/${localObjectiveId}`
      const previous = groups.get(key)
      if (!previous) {
        groups.set(key, {
          key,
          conceptId,
          objectiveId: localObjectiveId,
          attempts: 1,
          effectiveScore: attempt.score,
          latestScore: attempt.score,
          needsReview: attempt.needsReview,
          lastAttemptAt: attempt.completedAt,
        })
      } else {
        previous.attempts += 1
        previous.effectiveScore = (previous.effectiveScore * (previous.attempts - 1) + attempt.score) / previous.attempts
        if (!previous.lastAttemptAt || attempt.completedAt > previous.lastAttemptAt) {
          previous.latestScore = attempt.score
          previous.needsReview = attempt.needsReview
          previous.lastAttemptAt = attempt.completedAt
        }
      }
    }
  }
  return [...groups.values()].sort((left, right) => left.effectiveScore - right.effectiveScore || right.attempts - left.attempts)
}
