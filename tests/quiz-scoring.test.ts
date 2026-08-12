import { describe, expect, it } from 'vitest'

import type { QuizItem } from '../web/types/content'
import { isQuizComplete, scoreQuiz, scoreReflection } from '../web/utils/quiz'

const baseQuiz: QuizItem = {
  id: 'quiz.test.q1',
  sourceFile: 'QUIZ/test.md',
  questionNumber: 1,
  title: 'Test question',
  prompt: 'Choose',
  answerMarkdown: '',
  conceptId: 'concept.test.example',
  learningObjectiveIds: ['concept.test.example/LO-1'],
  difficulty: 5,
  importance: 3,
  type: 'single-choice',
  options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
  correctOptionIds: ['b'],
  explanationMarkdown: '',
  articlePath: '01_Test/article.md',
  articleId: 'article-test',
  contentHash: 'hash',
}

describe('quiz scoring', () => {
  it('scores single choice answers without depending on option order', () => {
    expect(scoreQuiz(baseQuiz, ['b'])).toEqual({ score: 1, maxScore: 1, correct: true })
    expect(scoreQuiz(baseQuiz, ['a'])).toEqual({ score: 0, maxScore: 1, correct: false })
  })

  it('requires an exact set for multiple choice answers', () => {
    const quiz = { ...baseQuiz, type: 'multiple-choice' as const, correctOptionIds: ['a', 'b'] }
    expect(scoreQuiz(quiz, ['b', 'a', 'a']).correct).toBe(true)
    expect(scoreQuiz(quiz, ['a']).correct).toBe(false)
  })

  it('keeps reflection scoring transparent', () => {
    expect(scoreReflection('understood')).toEqual({ score: 1, maxScore: 1, correct: null })
    expect(scoreReflection('partial')).toEqual({ score: 0.5, maxScore: 1, correct: null })
    expect(isQuizComplete(scoreReflection('understood'))).toBe(true)
    expect(isQuizComplete(scoreReflection('review'))).toBe(false)
  })
})
