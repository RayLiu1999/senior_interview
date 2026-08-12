import { describe, expect, it } from 'vitest'

import { createEmptyProgress } from '../web/utils/progress'
import {
  consumeSyncRateLimit,
  extractBearerToken,
  resetSyncRateLimiter,
  validateSyncState,
} from '../web/utils/sync-security'

describe('sync security boundaries', () => {
  it('accepts a normal progress state and rejects malformed attempts', () => {
    const state = createEmptyProgress()
    expect(validateSyncState(state).ok).toBe(true)

    state.quizAttempts = [{
      id: 'quiz-1', questionId: 'question-1', conceptId: 'concept-1', learningObjectiveIds: [], answers: ['a'],
      score: 1, maxScore: 1, correct: true, selfAssessment: 'understood', completedAt: new Date().toISOString(), contentHash: 'hash',
    }]
    expect(validateSyncState(state).ok).toBe(true)

    state.quizAttempts[0].answers = [{ malicious: true } as unknown as string]
    const result = validateSyncState(state)
    expect(result).toMatchObject({ ok: false, statusCode: 400 })
  })

  it('returns a payload-too-large result before normalizing the state', () => {
    const state = createEmptyProgress()
    state.lastViewedArticleId = 'x'.repeat(100)
    const result = validateSyncState(state, {
      maxStateBytes: 64,
      maxRequestBytes: 128,
      maxQuizAttempts: 10,
      maxAssessmentAttempts: 10,
      maxCompletedArticles: 10,
      maxObjectiveIds: 4,
      maxAnswerLength: 100,
      maxNotesLength: 100,
      maxIdentifierLength: 128,
    })
    expect(result).toMatchObject({ ok: false, statusCode: 413 })
  })

  it('parses only the bearer token form', () => {
    expect(extractBearerToken('Bearer 123e4567-e89b-12d3-a456-426614174000')).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(extractBearerToken('bearer token-value')).toBe('token-value')
    expect(extractBearerToken('Basic token-value')).toBeNull()
    expect(extractBearerToken('Bearer token value')).toBeNull()
  })

  it('limits requests in a sliding window and resets after the window', () => {
    resetSyncRateLimiter()
    const options = { limit: 2, windowMs: 1_000 }
    expect(consumeSyncRateLimit('client-a', 1_000, options)).toMatchObject({ allowed: true, remaining: 1 })
    expect(consumeSyncRateLimit('client-a', 1_100, options)).toMatchObject({ allowed: true, remaining: 0 })
    expect(consumeSyncRateLimit('client-a', 1_200, options)).toMatchObject({ allowed: false, retryAfterSeconds: 1 })
    expect(consumeSyncRateLimit('client-a', 2_000, options)).toMatchObject({ allowed: true, remaining: 1 })
  })
})
