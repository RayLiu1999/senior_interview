import { describe, expect, it } from 'vitest'

import { assessmentScorePercent, parseAssessmentRubric, parseAssessmentTasks } from '../web/utils/assessment'

describe('hard assessment parsing', () => {
  it('turns numbered response requirements into answerable tasks', () => {
    const tasks = parseAssessmentTasks('1. **建立時間線**：列出證據\n2. **修復方案**：說明 rollback')
    expect(tasks).toEqual([
      { id: 'task-1', number: 1, title: '建立時間線', prompt: '列出證據' },
      { id: 'task-2', number: 2, title: '修復方案', prompt: '說明 rollback' },
    ])
  })

  it('extracts the five-point rubric and fills missing rows predictably', () => {
    const rows = parseAssessmentRubric('| 分數 | 期待表現 |\n| :---: | :--- |\n| 0 | 不及格 |\n| 3 | 通過 |')
    expect(rows[0]).toEqual({ score: 0, description: '不及格' })
    expect(rows[3]).toEqual({ score: 3, description: '通過' })
    expect(rows).toHaveLength(5)
    expect(assessmentScorePercent(3, 4)).toBe(75)
  })
})
