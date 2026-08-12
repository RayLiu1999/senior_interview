import type { AssessmentRecord, AssessmentRubricRow } from '~/types/content'

export interface AssessmentTask {
  id: string
  number: number
  title: string
  prompt: string
}

const fallbackRubricDescriptions: Record<number, string> = {
  0: '無法建立正確模型，或核心判斷與情境矛盾。',
  1: '能說出部分定義，但無法套用到題目情境。',
  2: '主要結論大致正確，但缺少關鍵機制、限制或驗證方法。',
  3: '能正確分析情境，提出可行方案，並說明主要代價。',
  4: '能完整連結原理、故障模式、驗證數據與取捨，並指出邊界條件。',
}

export function parseAssessmentTasks(markdown: string): AssessmentTask[] {
  const lines = markdown.split(/\r?\n/)
  const tasks: AssessmentTask[] = []
  let current: AssessmentTask | null = null

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)\.\s+\*\*(.+?)\*\*\s*[:：]\s*(.*)$/)
    if (match) {
      current = {
        id: `task-${match[1]}`,
        number: Number(match[1]),
        title: match[2].trim(),
        prompt: match[3].trim(),
      }
      tasks.push(current)
      continue
    }
    if (current && line.trim()) current.prompt += `\n${line.trim()}`
  }

  if (tasks.length) return tasks
  return [{ id: 'task-1', number: 1, title: '完整回答', prompt: '請根據情境、期待證據與評分規準完成分析。' }]
}

export function parseAssessmentRubric(markdown: string): AssessmentRubricRow[] {
  const rows = markdown.split(/\r?\n/)
    .map((line) => line.match(/^\|\s*([0-4])\s*\|\s*(.*?)\s*\|?\s*$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({ score: Number(match[1]), description: match[2].trim() }))

  const byScore = new Map(rows.map((row) => [row.score, row]))
  return [0, 1, 2, 3, 4].map((score) => byScore.get(score) ?? {
    score,
    description: fallbackRubricDescriptions[score],
  })
}

export function assessmentScoreLabel(score: number, passScore: number): string {
  if (score >= passScore) return '達到通過門檻'
  if (score >= 2) return '接近門檻，建議補強後重測'
  return '需要回讀文章並重新拆解情境'
}

export function assessmentScorePercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0
  return Math.round((score / maxScore) * 100)
}

export function assessmentArticleIds(assessment: AssessmentRecord): string[] {
  return [...new Set(assessment.articleIds)]
}
