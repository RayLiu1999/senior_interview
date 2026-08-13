import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { ContentCatalog } from '../web/types/content'

const catalogPath = resolve(process.cwd(), 'public/content/catalog.json')
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as ContentCatalog

describe('generated web content catalog', () => {
  it('contains the complete governed content set', () => {
    expect(catalog.articles).toHaveLength(553)
    expect(catalog.quizzes).toHaveLength(567)
    expect(catalog.assessments).toHaveLength(52)
  })

  it('keeps every article connected to a concept and learning objectives', () => {
    expect(catalog.articles.every((article) => article.conceptId && article.learningObjectives.length >= 3)).toBe(true)
    expect(new Set(catalog.articles.map((article) => article.id)).size).toBe(catalog.articles.length)
  })

  it('retains theory content after an in-article quiz mapping section', () => {
    const article = catalog.articles.find((item) => item.id === '01-computer-science-fundamentals__data-structures-and-algorithms__array-and-dynamic-array')

    expect(article?.contentMarkdown).toContain('## 核心理論與詳解')
    expect(article?.contentMarkdown).toContain('### 1. 靜態陣列')
    expect(article?.contentMarkdown).not.toContain('### 測驗對應')
    expect(article?.contentMarkdown.length).toBeGreaterThan(1_000)
  })

  it('connects nearly every quiz to an article and preserves explicit pending items', () => {
    expect(catalog.quizzes.filter((quiz) => quiz.articleId === null)).toHaveLength(2)
    expect(catalog.quizzes.filter((quiz) => quiz.type !== 'reflection')).toHaveLength(3)
  })

  it('connects every assessment to at least one article', () => {
    expect(catalog.assessments.every((assessment) => assessment.articleIds.length > 0)).toBe(true)
    expect(new Set(catalog.assessments.map((assessment) => assessment.assessmentId)).size).toBe(catalog.assessments.length)
  })
})
