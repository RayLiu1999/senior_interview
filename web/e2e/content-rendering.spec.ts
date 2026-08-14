import { expect, test } from '@playwright/test'

test('renders theory content for the array article', async ({ page }) => {
  const catalogResponsePromise = page.waitForResponse((response) => response.url().endsWith('/content/catalog.json'))
  const articleResponsePromise = page.waitForResponse((response) => response.url().includes('/content/articles/01-computer-science-fundamentals__data-structures-and-algorithms__array-and-dynamic-array.json'))
  await page.goto('/articles/01-computer-science-fundamentals__data-structures-and-algorithms__array-and-dynamic-array')

  const [catalogResponse, articleResponse] = await Promise.all([catalogResponsePromise, articleResponsePromise])
  const catalog = await catalogResponse.json()
  const article = await articleResponse.json()

  await expect(page.locator('article h1')).toHaveText('陣列與動態陣列')
  await expect(page.getByRole('heading', { name: '核心理論與詳解' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /1\. 靜態陣列/ })).toBeVisible()
  await expect(page.locator('.markdown-content pre.hljs').first()).toBeVisible()
  await expect(page.locator('.markdown-content pre.hljs code span').first()).toBeVisible()
  expect(catalog.articles[0]).not.toHaveProperty('contentMarkdown')
  expect(article.contentMarkdown).toContain('## 核心理論與詳解')
})
