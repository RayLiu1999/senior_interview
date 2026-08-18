import { describe, expect, it } from 'vitest'

import {
  filtersFromQuery,
  filtersToQuery,
  sameFilterState,
  sortArticles,
  sortFromQuery,
  sortToQuery,
} from '../web/utils/catalog-filters'
import type { ArticleSummary } from '../web/types/content'

function article(id: string, difficulty: number, importance: number): ArticleSummary {
  return {
    id,
    slug: id,
    path: `${id}.md`,
    title: `Article ${id}`,
    categoryId: 'category',
    categoryLabel: 'Category',
    difficulty,
    importance,
    tags: [],
    prerequisites: [],
    conceptId: id,
    learningObjectives: [],
    contentHash: id,
    quickQuizPath: '',
    assessmentPath: '',
    quickQuizIds: [],
    assessmentIds: [],
  }
}

describe('catalog filter URL state', () => {
  it('reads supported filters from query parameters', () => {
    expect(filtersFromQuery({
      q: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
      sort: 'importance-desc',
    })).toEqual({
      search: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
      sort: 'importance-desc',
    })
  })

  it('normalizes unsupported choices and omits default values from the URL', () => {
    expect(filtersFromQuery({ importance: '2', difficulty: '10', sort: 'unknown' })).toEqual({
      search: '',
      category: 'all',
      importance: 'all',
      difficulty: 'all',
      sort: 'default',
    })

    expect(filtersToQuery({
      search: '  array  ',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
      sort: 'importance-desc',
    })).toEqual({
      q: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
      sort: 'importance-desc',
    })
  })

  it('reads and writes sort-only query state for category pages', () => {
    expect(sortFromQuery({ sort: 'difficulty-desc' })).toBe('difficulty-desc')
    expect(sortFromQuery({ sort: 'not-supported' })).toBe('default')
    expect(sortToQuery('importance-asc')).toEqual({ sort: 'importance-asc' })
    expect(sortToQuery('default')).toEqual({})
  })

  it('compares filter state without considering URL key order', () => {
    expect(sameFilterState(
      filtersFromQuery({ q: 'array', category: '01_Computer_Science_Fundamentals', sort: 'difficulty-desc' }),
      filtersFromQuery({ q: 'array', category: '01_Computer_Science_Fundamentals', sort: 'difficulty-desc' }),
    )).toBe(true)

    expect(sameFilterState(
      filtersFromQuery({ sort: 'difficulty-asc' }),
      filtersFromQuery({ sort: 'difficulty-desc' }),
    )).toBe(false)
  })

  it('sorts articles by difficulty and importance without mutating the source list', () => {
    const articles = [
      article('easy', 2, 5),
      article('hard', 9, 3),
      article('medium', 5, 4),
    ]

    expect(sortArticles(articles, 'difficulty-asc').map(({ id }) => id)).toEqual(['easy', 'medium', 'hard'])
    expect(sortArticles(articles, 'difficulty-desc').map(({ id }) => id)).toEqual(['hard', 'medium', 'easy'])
    expect(sortArticles(articles, 'importance-asc').map(({ id }) => id)).toEqual(['hard', 'medium', 'easy'])
    expect(sortArticles(articles, 'importance-desc').map(({ id }) => id)).toEqual(['easy', 'medium', 'hard'])
    expect(sortArticles(articles, 'default').map(({ id }) => id)).toEqual(['easy', 'hard', 'medium'])
    expect(articles.map(({ id }) => id)).toEqual(['easy', 'hard', 'medium'])
  })
})
