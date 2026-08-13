export type CatalogImportanceFilter = 'all' | '3' | '4' | '5'
export type CatalogDifficultyFilter = 'all' | '4' | '7' | '9'

export interface CatalogFilters {
  search: string
  category: string
  importance: CatalogImportanceFilter
  difficulty: CatalogDifficultyFilter
}

const importanceValues = new Set<CatalogImportanceFilter>(['all', '3', '4', '5'])
const difficultyValues = new Set<CatalogDifficultyFilter>(['all', '4', '7', '9'])

function queryString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function choiceOrAll<T extends string>(value: unknown, values: Set<T>): T {
  const candidate = queryString(value) as T
  return values.has(candidate) ? candidate : 'all' as T
}

export function filtersFromQuery(query: Record<string, unknown>): CatalogFilters {
  return {
    search: queryString(query.q),
    category: queryString(query.category) || 'all',
    importance: choiceOrAll(query.importance, importanceValues),
    difficulty: choiceOrAll(query.difficulty, difficultyValues),
  }
}

export function filtersToQuery(filters: CatalogFilters): Record<string, string> {
  const query: Record<string, string> = {}
  const search = filters.search.trim()

  if (search) query.q = search
  if (filters.category !== 'all') query.category = filters.category
  if (filters.importance !== 'all') query.importance = filters.importance
  if (filters.difficulty !== 'all') query.difficulty = filters.difficulty

  return query
}

export function sameFilterState(left: CatalogFilters, right: CatalogFilters) {
  return left.search === right.search
    && left.category === right.category
    && left.importance === right.importance
    && left.difficulty === right.difficulty
}
