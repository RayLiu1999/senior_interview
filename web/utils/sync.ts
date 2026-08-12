import type { AssessmentAttempt, ProgressState, QuizAttempt } from '~/types/content'

function mergeById<T extends { id: string; completedAt: string }>(first: T[], second: T[]): T[] {
  const merged = new Map<string, T>()
  for (const item of [...first, ...second]) {
    const previous = merged.get(item.id)
    if (!previous || item.completedAt >= previous.completedAt) merged.set(item.id, item)
  }
  return [...merged.values()].sort((left, right) => left.completedAt.localeCompare(right.completedAt))
}

function latestValue(left: string | null, right: string | null): string | null {
  if (!left) return right
  if (!right) return left
  return left >= right ? left : right
}

export function mergeProgressStates(left: ProgressState, right: ProgressState): ProgressState {
  const rightIsNewer = (right.updatedAt ?? '') >= (left.updatedAt ?? '')
  return {
    schemaVersion: Math.max(left.schemaVersion, right.schemaVersion, 2),
    quizAttempts: mergeById<QuizAttempt>(left.quizAttempts, right.quizAttempts),
    assessmentAttempts: mergeById<AssessmentAttempt>(left.assessmentAttempts, right.assessmentAttempts),
    completedArticleIds: [...new Set([...left.completedArticleIds, ...right.completedArticleIds])],
    lastViewedArticleId: rightIsNewer ? right.lastViewedArticleId : left.lastViewedArticleId,
    updatedAt: latestValue(left.updatedAt, right.updatedAt),
    syncToken: right.syncToken ?? left.syncToken,
    lastSyncedAt: latestValue(left.lastSyncedAt, right.lastSyncedAt),
  }
}
