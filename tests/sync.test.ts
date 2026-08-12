import { describe, expect, it } from 'vitest'

import { createEmptyProgress } from '../web/utils/progress'
import { mergeProgressStates } from '../web/utils/sync'

describe('cross-device progress merge', () => {
  it('deduplicates attempts and keeps the union of read articles', () => {
    const local = createEmptyProgress()
    local.updatedAt = '2026-08-12T10:00:00Z'
    local.completedArticleIds = ['article-a']
    local.quizAttempts = [{
      id: 'attempt-shared', questionId: 'q1', conceptId: 'concept.test', learningObjectiveIds: [], answers: ['a'],
      score: 0, maxScore: 1, correct: false, selfAssessment: 'review', completedAt: '2026-08-12T09:00:00Z', contentHash: 'old',
    }]

    const remote = createEmptyProgress()
    remote.updatedAt = '2026-08-12T11:00:00Z'
    remote.completedArticleIds = ['article-b']
    remote.lastViewedArticleId = 'article-b'
    remote.quizAttempts = [{
      id: 'attempt-shared', questionId: 'q1', conceptId: 'concept.test', learningObjectiveIds: [], answers: ['b'],
      score: 1, maxScore: 1, correct: true, selfAssessment: 'understood', completedAt: '2026-08-12T12:00:00Z', contentHash: 'new',
    }]

    const merged = mergeProgressStates(local, remote)
    expect(merged.quizAttempts).toHaveLength(1)
    expect(merged.quizAttempts[0].contentHash).toBe('new')
    expect(merged.completedArticleIds).toEqual(['article-a', 'article-b'])
    expect(merged.lastViewedArticleId).toBe('article-b')
  })
})
