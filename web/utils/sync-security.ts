import type {
  AssessmentAttempt,
  ProgressState,
  QuizAttempt,
} from '../types/content'

import { normalizeProgress } from './progress'

export interface SyncLimits {
  maxStateBytes: number
  maxRequestBytes: number
  maxQuizAttempts: number
  maxAssessmentAttempts: number
  maxCompletedArticles: number
  maxObjectiveIds: number
  maxAnswerLength: number
  maxNotesLength: number
  maxIdentifierLength: number
}

export const DEFAULT_SYNC_LIMITS: SyncLimits = {
  maxStateBytes: 2 * 1024 * 1024,
  maxRequestBytes: 2 * 1024 * 1024 + 64 * 1024,
  maxQuizAttempts: 10_000,
  maxAssessmentAttempts: 2_000,
  maxCompletedArticles: 10_000,
  maxObjectiveIds: 64,
  maxAnswerLength: 25_000,
  maxNotesLength: 20_000,
  maxIdentifierLength: 512,
}

export interface SyncStateValidationSuccess {
  ok: true
  state: ProgressState
}

export interface SyncStateValidationFailure {
  ok: false
  reason: string
  statusCode: 400 | 413
}

export type SyncStateValidationResult = SyncStateValidationSuccess | SyncStateValidationFailure

export interface SyncRateLimitOptions {
  limit: number
  windowMs: number
}

export interface SyncRateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

interface RateLimitBucket {
  startedAt: number
  count: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

function environmentInteger(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = typeof process !== 'undefined' ? process.env[name] : undefined
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback
}

export function getSyncLimits(): SyncLimits {
  const maxStateBytes = environmentInteger(
    'INTERVIEW_PROGRESS_MAX_BYTES',
    DEFAULT_SYNC_LIMITS.maxStateBytes,
    16 * 1024,
    10 * 1024 * 1024,
  )
  return {
    ...DEFAULT_SYNC_LIMITS,
    maxStateBytes,
    maxRequestBytes: Math.max(
      maxStateBytes + 64 * 1024,
      environmentInteger(
        'INTERVIEW_PROGRESS_MAX_REQUEST_BYTES',
        DEFAULT_SYNC_LIMITS.maxRequestBytes,
        16 * 1024,
        12 * 1024 * 1024,
      ),
    ),
    maxQuizAttempts: environmentInteger('INTERVIEW_PROGRESS_MAX_QUIZ_ATTEMPTS', DEFAULT_SYNC_LIMITS.maxQuizAttempts, 1, 100_000),
    maxAssessmentAttempts: environmentInteger('INTERVIEW_PROGRESS_MAX_ASSESSMENT_ATTEMPTS', DEFAULT_SYNC_LIMITS.maxAssessmentAttempts, 1, 20_000),
    maxCompletedArticles: environmentInteger('INTERVIEW_PROGRESS_MAX_COMPLETED_ARTICLES', DEFAULT_SYNC_LIMITS.maxCompletedArticles, 1, 100_000),
  }
}

export function getSyncRateLimitOptions(): SyncRateLimitOptions {
  return {
    limit: environmentInteger('INTERVIEW_PROGRESS_RATE_LIMIT', 30, 1, 10_000),
    windowMs: environmentInteger('INTERVIEW_PROGRESS_RATE_WINDOW_SECONDS', 60, 1, 86_400) * 1_000,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBoundedString(value: unknown, maximum: number, allowEmpty = true): value is string {
  return typeof value === 'string' && value.length <= maximum && (allowEmpty || value.length > 0)
}

function isStringArray(value: unknown, maximumItems: number, maximumLength: number): value is string[] {
  return Array.isArray(value)
    && value.length <= maximumItems
    && value.every((item) => isBoundedString(item, maximumLength))
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isBoundedStringRecord(value: unknown, maximumEntries: number, maximumValueLength: number): value is Record<string, string> {
  return isRecord(value)
    && Object.keys(value).length <= maximumEntries
    && Object.entries(value).every(([key, item]) => isBoundedString(key, DEFAULT_SYNC_LIMITS.maxIdentifierLength, false)
      && isBoundedString(item, maximumValueLength))
}

function isRubricScoreRecord(value: unknown): value is Record<string, number> {
  return isRecord(value)
    && Object.keys(value).length <= 128
    && Object.entries(value).every(([key, score]) => isBoundedString(key, DEFAULT_SYNC_LIMITS.maxIdentifierLength, false)
      && isFiniteNumber(score)
      && score >= 0
      && score <= 4)
}

function isQuizAttempt(value: unknown, limits: SyncLimits): value is QuizAttempt {
  if (!isRecord(value)) return false
  return isBoundedString(value.id, limits.maxIdentifierLength, false)
    && isBoundedString(value.questionId, limits.maxIdentifierLength, false)
    && isBoundedString(value.conceptId, limits.maxIdentifierLength, false)
    && isStringArray(value.learningObjectiveIds, limits.maxObjectiveIds, limits.maxIdentifierLength)
    && isStringArray(value.answers, 64, limits.maxAnswerLength)
    && isFiniteNumber(value.score)
    && isFiniteNumber(value.maxScore)
    && (typeof value.correct === 'boolean' || value.correct === null)
    && (value.selfAssessment === 'understood' || value.selfAssessment === 'partial' || value.selfAssessment === 'review')
    && isBoundedString(value.completedAt, limits.maxIdentifierLength, false)
    && isBoundedString(value.contentHash, limits.maxIdentifierLength, false)
}

function isAssessmentAttempt(value: unknown, limits: SyncLimits): value is AssessmentAttempt {
  if (!isRecord(value)) return false
  return isBoundedString(value.id, limits.maxIdentifierLength, false)
    && isBoundedString(value.assessmentId, limits.maxIdentifierLength, false)
    && isStringArray(value.conceptIds, limits.maxObjectiveIds, limits.maxIdentifierLength)
    && isStringArray(value.learningObjectiveIds, limits.maxObjectiveIds, limits.maxIdentifierLength)
    && isBoundedStringRecord(value.answers, 128, limits.maxAnswerLength)
    && isRubricScoreRecord(value.rubricScores)
    && isFiniteNumber(value.totalScore)
    && isFiniteNumber(value.maxScore)
    && typeof value.passed === 'boolean'
    && isBoundedString(value.notes, limits.maxNotesLength)
    && isBoundedString(value.completedAt, limits.maxIdentifierLength, false)
    && isBoundedString(value.contentHash, limits.maxIdentifierLength, false)
}

function jsonByteLength(value: unknown): number | null {
  try {
    const serialized = JSON.stringify(value)
    if (serialized === undefined) return null
    return new TextEncoder().encode(serialized).byteLength
  } catch {
    return null
  }
}

export function validateSyncState(value: unknown, limits: SyncLimits = getSyncLimits()): SyncStateValidationResult {
  const serializedSize = jsonByteLength(value)
  if (serializedSize === null) return { ok: false, reason: 'state must be JSON-serializable.', statusCode: 400 }
  if (serializedSize > limits.maxStateBytes) {
    return { ok: false, reason: `state exceeds the ${limits.maxStateBytes}-byte limit.`, statusCode: 413 }
  }
  if (!isRecord(value)) return { ok: false, reason: 'state must be an object.', statusCode: 400 }

  if ('quizAttempts' in value && !Array.isArray(value.quizAttempts)) {
    return { ok: false, reason: 'quizAttempts must be an array.', statusCode: 400 }
  }
  if ('assessmentAttempts' in value && !Array.isArray(value.assessmentAttempts)) {
    return { ok: false, reason: 'assessmentAttempts must be an array.', statusCode: 400 }
  }
  if ('completedArticleIds' in value && !isStringArray(value.completedArticleIds, limits.maxCompletedArticles, limits.maxIdentifierLength)) {
    return { ok: false, reason: 'completedArticleIds contains invalid values or exceeds its limit.', statusCode: 400 }
  }
  if ('lastViewedArticleId' in value && value.lastViewedArticleId !== null && !isBoundedString(value.lastViewedArticleId, limits.maxIdentifierLength, false)) {
    return { ok: false, reason: 'lastViewedArticleId must be a bounded string or null.', statusCode: 400 }
  }
  if ('syncToken' in value && value.syncToken !== null && !isBoundedString(value.syncToken, limits.maxIdentifierLength, false)) {
    return { ok: false, reason: 'syncToken must be a bounded string or null.', statusCode: 400 }
  }

  if (Array.isArray(value.quizAttempts)) {
    if (value.quizAttempts.length > limits.maxQuizAttempts || !value.quizAttempts.every((attempt) => isQuizAttempt(attempt, limits))) {
      return { ok: false, reason: 'quizAttempts contains invalid values or exceeds its limit.', statusCode: 400 }
    }
  }
  if (Array.isArray(value.assessmentAttempts)) {
    if (value.assessmentAttempts.length > limits.maxAssessmentAttempts || !value.assessmentAttempts.every((attempt) => isAssessmentAttempt(attempt, limits))) {
      return { ok: false, reason: 'assessmentAttempts contains invalid values or exceeds its limit.', statusCode: 400 }
    }
  }

  return { ok: true, state: normalizeProgress(value) }
}

export function extractBearerToken(header: unknown): string | null {
  if (typeof header !== 'string' || header.trim() === '') return null
  const match = /^Bearer[ \t]+([^\s]+)$/i.exec(header.trim())
  return match?.[1] ?? null
}

export function consumeSyncRateLimit(
  key: string,
  now = Date.now(),
  options: SyncRateLimitOptions = getSyncRateLimitOptions(),
): SyncRateLimitResult {
  const bucketKey = key || 'unknown'
  const previous = rateLimitBuckets.get(bucketKey)
  const bucket = !previous || now - previous.startedAt >= options.windowMs
    ? { startedAt: now, count: 0 }
    : previous

  bucket.count += 1
  rateLimitBuckets.set(bucketKey, bucket)

  if (rateLimitBuckets.size > 10_000) {
    for (const [candidateKey, candidate] of rateLimitBuckets) {
      if (now - candidate.startedAt >= options.windowMs) rateLimitBuckets.delete(candidateKey)
    }
  }

  const allowed = bucket.count <= options.limit
  return {
    allowed,
    limit: options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.startedAt + options.windowMs - now) / 1_000)),
  }
}

export function resetSyncRateLimiter(): void {
  rateLimitBuckets.clear()
}
