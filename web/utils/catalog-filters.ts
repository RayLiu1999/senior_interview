import type { ArticleSummary } from '../types/content'

export type CatalogImportanceFilter = 'all' | '3' | '4' | '5'
export type CatalogDifficultyFilter = 'all' | '4' | '7' | '9'
export type CatalogSort = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'importance-asc' | 'importance-desc'

export interface CatalogFilters {
  search: string
  category: string
  importance: CatalogImportanceFilter
  difficulty: CatalogDifficultyFilter
  sort: CatalogSort
}

const importanceValues = new Set<CatalogImportanceFilter>(['all', '3', '4', '5'])
const difficultyValues = new Set<CatalogDifficultyFilter>(['all', '4', '7', '9'])
const sortValues = new Set<CatalogSort>([
  'default',
  'difficulty-asc',
  'difficulty-desc',
  'importance-asc',
  'importance-desc',
])

function queryString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function choiceOrAll<T extends string>(value: unknown, values: Set<T>): T {
  const candidate = queryString(value) as T
  return values.has(candidate) ? candidate : 'all' as T
}

function choiceOrDefault<T extends string>(value: unknown, values: Set<T>, fallback: T): T {
  const candidate = queryString(value) as T
  return values.has(candidate) ? candidate : fallback
}

export function sortFromQuery(query: Record<string, unknown>): CatalogSort {
  return choiceOrDefault(query.sort, sortValues, 'default')
}

export function sortToQuery(sort: CatalogSort): Record<string, string> {
  return sort === 'default' ? {} : { sort }
}

export function filtersFromQuery(query: Record<string, unknown>): CatalogFilters {
  return {
    search: queryString(query.q),
    category: queryString(query.category) || 'all',
    importance: choiceOrAll(query.importance, importanceValues),
    difficulty: choiceOrAll(query.difficulty, difficultyValues),
    sort: sortFromQuery(query),
  }
}

export function filtersToQuery(filters: CatalogFilters): Record<string, string> {
  const query: Record<string, string> = {}
  const search = filters.search.trim()

  if (search) query.q = search
  if (filters.category !== 'all') query.category = filters.category
  if (filters.importance !== 'all') query.importance = filters.importance
  if (filters.difficulty !== 'all') query.difficulty = filters.difficulty
  Object.assign(query, sortToQuery(filters.sort))

  return query
}

export function sameFilterState(left: CatalogFilters, right: CatalogFilters) {
  return left.search === right.search
    && left.category === right.category
    && left.importance === right.importance
    && left.difficulty === right.difficulty
    && left.sort === right.sort
}

export function sortArticles(articles: ArticleSummary[], sort: CatalogSort): ArticleSummary[] {
  if (sort === 'default') return [...articles]

  const sortByDifficulty = sort.startsWith('difficulty-')
  const direction = sort.endsWith('-asc') ? 1 : -1

  return [...articles].sort((left, right) => {
    const leftValue = sortByDifficulty ? left.difficulty : left.importance
    const rightValue = sortByDifficulty ? right.difficulty : right.importance
    const difference = (leftValue - rightValue) * direction

    return difference || left.title.localeCompare(right.title, 'zh-Hant') || left.id.localeCompare(right.id)
  })
}
