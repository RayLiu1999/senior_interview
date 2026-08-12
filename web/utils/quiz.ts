import type { QuizItem } from '~/types/content'

export interface QuizScore {
  score: number
  maxScore: number
  correct: boolean | null
}

export function scoreQuiz(item: QuizItem, selectedOptionIds: string[]): QuizScore {
  if (item.type === 'reflection') {
    return { score: 0, maxScore: 1, correct: null }
  }

  const selected = [...new Set(selectedOptionIds)].sort()
  const expected = [...new Set(item.correctOptionIds)].sort()
  const correct = selected.length === expected.length && selected.every((value, index) => value === expected[index])
  return {
    score: correct ? 1 : 0,
    maxScore: 1,
    correct,
  }
}

export function scoreReflection(level: 'understood' | 'partial' | 'review'): QuizScore {
  const score = level === 'understood' ? 1 : level === 'partial' ? 0.5 : 0
  return {
    score,
    maxScore: 1,
    correct: null,
  }
}

export function isQuizComplete(score: QuizScore): boolean {
  return score.correct === true || score.score >= score.maxScore
}
