import { expect, test, type Page } from '@playwright/test'

async function openFirstArticle(page: Page) {
  await page.goto('/catalog')
  await expect(page.getByRole('heading', { name: '瀏覽全部主題' })).toBeVisible()
  const articleLink = page.locator('.article-card h3 a').first()
  await expect(articleLink).toBeVisible()
  const title = (await articleLink.textContent())?.trim() ?? ''
  await articleLink.click()
  await expect(page.locator('article h1')).toHaveText(title)
  await expect(page.getByText('Learning objectives', { exact: true })).toBeVisible()
}

test('category to article to Quick Quiz result and dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '把面試知識，練成可以說清楚、做正確的能力。' })).toBeVisible()
  await page.getByRole('link', { name: '開始探索內容' }).click()
  await expect(page).toHaveURL(/\/catalog$/)

  await openFirstArticle(page)
  const quickQuizLink = page.locator('aside .practice-link').filter({ hasText: 'Quick Quiz' }).first()
  await expect(quickQuizLink).toBeVisible()
  await quickQuizLink.click()
  await expect(page).toHaveURL(/\/quiz\//)
  await expect(page.getByText(/Quick Quiz · Q\d+/)).toBeVisible()

  const answerOptions = page.locator('fieldset.quiz-options input')
  if (await answerOptions.count()) {
    await answerOptions.first().check()
  } else {
    await page.locator('fieldset.reflection-options input').first().check()
  }
  await page.getByRole('button', { name: '提交答案' }).click()
  await expect(page.getByRole('status')).toContainText(/回答正確|需要回讀|理解|部分理解/)

  await page.getByRole('link', { name: '學習儀表板', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: '看見自己真正不熟的概念。' })).toBeVisible()
  await expect(page.locator('.attempt-row').first()).toBeVisible()
})

test('article to Hard Assessment result and weak-objective dashboard', async ({ page }) => {
  await openFirstArticle(page)
  const assessmentLink = page.locator('aside .assessment-links .practice-link').first()
  await expect(assessmentLink).toBeVisible()
  await assessmentLink.click()
  await expect(page).toHaveURL(/\/assessment\//)
  await expect(page.getByRole('heading', { name: '逐項完成作答' })).toBeVisible()

  const answerFields = page.locator('textarea.assessment-answer')
  for (let index = 0; index < await answerFields.count(); index += 1) {
    await answerFields.nth(index).fill('我會先說明假設，再用可觀測指標驗證方案，並清楚交代一致性、延遲與成本取捨。')
  }
  await page.locator('input[name="assessment-score"][value="0"]').check()
  await page.getByRole('button', { name: '提交 Hard Assessment' }).click()
  await expect(page.getByRole('status')).toContainText('0/4')
  await expect(page.getByText('參考答案與詳解', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: '學習儀表板', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: '優先處理的弱點' })).toBeVisible()
  await expect(page.locator('.weakness-card').first()).toBeVisible()
})

test('restores catalog filters after returning from an article', async ({ page }) => {
  await page.goto('/catalog')
  await expect(page.getByRole('heading', { name: '瀏覽全部主題' })).toBeVisible()

  await page.getByLabel('分類').selectOption('01_Computer_Science_Fundamentals')
  await page.getByLabel('最低難度').selectOption('7')
  await expect.poll(async () => new URL(page.url()).searchParams.get('category'))
    .toBe('01_Computer_Science_Fundamentals')
  await expect.poll(async () => new URL(page.url()).searchParams.get('difficulty'))
    .toBe('7')

  const articleLink = page.locator('.article-card h3 a').first()
  await expect(articleLink).toBeVisible()
  await articleLink.click()
  await expect(page).toHaveURL(/\/articles\//)

  await page.goBack()
  await expect(page).toHaveURL(/\/catalog\?/)
  await expect(page.getByLabel('分類')).toHaveValue('01_Computer_Science_Fundamentals')
  await expect(page.getByLabel('最低難度')).toHaveValue('7')
})
