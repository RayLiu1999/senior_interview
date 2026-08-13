import { expect, test } from '@playwright/test'

test('renders theory content for the array article', async ({ page }) => {
  await page.goto('/articles/01-computer-science-fundamentals__data-structures-and-algorithms__array-and-dynamic-array')

  await expect(page.locator('article h1')).toHaveText('陣列與動態陣列')
  await expect(page.getByRole('heading', { name: '核心理論與詳解' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /1\. 靜態陣列/ })).toBeVisible()
})
