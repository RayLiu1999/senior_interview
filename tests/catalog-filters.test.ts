import { describe, expect, it } from 'vitest'

import {
  filtersFromQuery,
  filtersToQuery,
  sameFilterState,
} from '../web/utils/catalog-filters'

describe('catalog filter URL state', () => {
  it('reads supported filters from query parameters', () => {
    expect(filtersFromQuery({
      q: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
    })).toEqual({
      search: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
    })
  })

  it('normalizes unsupported choices and omits default values from the URL', () => {
    expect(filtersFromQuery({ importance: '2', difficulty: '10' })).toEqual({
      search: '',
      category: 'all',
      importance: 'all',
      difficulty: 'all',
    })

    expect(filtersToQuery({
      search: '  array  ',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
    })).toEqual({
      q: 'array',
      category: '01_Computer_Science_Fundamentals',
      importance: '5',
      difficulty: '7',
    })
  })

  it('compares filter state without considering URL key order', () => {
    expect(sameFilterState(
      filtersFromQuery({ q: 'array', category: '01_Computer_Science_Fundamentals' }),
      filtersFromQuery({ q: 'array', category: '01_Computer_Science_Fundamentals' }),
    )).toBe(true)
  })
})
