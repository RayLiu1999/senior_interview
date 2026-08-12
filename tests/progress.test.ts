import { describe, expect, it } from 'vitest'

import { calculateObjectiveSummaries, createEmptyProgress, importProgress, normalizeProgress } from '../web/utils/progress'

describe('learning progress', () => {
  it('normalizes imported data without trusting malformed collections', () => {
    const state = normalizeProgress({ quizAttempts: 'bad', completedArticleIds: ['article-1'], updatedAt: 123 })
    expect(state.quizAttempts).toEqual([])
    expect(state.completedArticleIds).toEqual(['article-1'])
    expect(state.updatedAt).toBe('123')
  })

  it('calculates objective weakness from repeated attempts', () => {
    const state = createEmptyProgress()
    state.quizAttempts = [
      {
        id: 'a1', questionId: 'q1', conceptId: 'concept.cache', learningObjectiveIds: ['concept.cache/LO-1'],
        answers: ['review'], score: 0, maxScore: 1, correct: null, selfAssessment: 'review', completedAt: '2026-08-12T10:00:00Z', contentHash: 'a',
      },
      {
        id: 'a2', questionId: 'q1', conceptId: 'concept.cache', learningObjectiveIds: ['concept.cache/LO-1'],
        answers: ['partial'], score: 0.5, maxScore: 1, correct: null, selfAssessment: 'partial', completedAt: '2026-08-12T11:00:00Z', contentHash: 'b',
      },
    ]
    const [summary] = calculateObjectiveSummaries(state)
    expect(summary.key).toBe('concept.cache/LO-1')
    expect(summary.attempts).toBe(2)
    expect(summary.effectiveScore).toBe(0.25)
    expect(summary.needsReview).toBe(false)
    expect(importProgress(JSON.stringify(state)).quizAttempts).toHaveLength(2)
  })

  it('includes hard assessment results in objective summaries', () => {
    const state = createEmptyProgress()
    state.assessmentAttempts = [{
      id: 'assessment-1',
      assessmentId: 'assessment.test',
      conceptIds: ['concept.cache.consistency'],
      learningObjectiveIds: ['concept.cache.consistency/LO-2'],
      answers: { 'task-1': 'answer' },
      rubricScores: { overall: 3 },
      totalScore: 3,
      maxScore: 4,
      passed: true,
      notes: '',
      completedAt: '2026-08-12T12:00:00Z',
      contentHash: 'assessment-hash',
    }]
    const [summary] = calculateObjectiveSummaries(state)
    expect(summary.key).toBe('concept.cache.consistency/LO-2')
    expect(summary.latestScore).toBe(0.75)
    expect(summary.needsReview).toBe(false)
  })
})
