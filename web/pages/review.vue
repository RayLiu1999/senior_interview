<script setup lang="ts">
import type { ArticleSummary } from '~/types/content'
import { calculateObjectiveSummaries, isObjectiveWeak, type ObjectiveSummary } from '~/utils/progress'

const { catalog, pending, error } = await useCatalog()
const { state, hydrate } = useProgress()
const filter = ref<'all' | 'weak' | 'explicit'>('weak')

onMounted(() => {
  void hydrate()
})

const summaries = computed(() => calculateObjectiveSummaries(state.value))
const filteredSummaries = computed(() => summaries.value.filter((summary) => {
  if (filter.value === 'weak') return isObjectiveWeak(summary)
  if (filter.value === 'explicit') return summary.needsReview
  return true
}))
const failedAssessments = computed(() => state.value.assessmentAttempts
  .filter((attempt) => !attempt.passed)
  .slice()
  .sort((left, right) => right.completedAt.localeCompare(left.completedAt)))
const recommendedArticles = computed(() => (catalog.value?.articles ?? [])
  .filter((article) => !state.value.completedArticleIds.includes(article.id))
  .sort((left, right) => right.importance - left.importance || right.difficulty - left.difficulty)
  .slice(0, 6))

function findArticle(summary: ObjectiveSummary): ArticleSummary | undefined {
  return catalog.value?.articles.find((article) => article.conceptId === summary.conceptId
    && article.learningObjectives.some((objective) => objective.id === summary.key || objective.id.endsWith(`/${summary.objectiveId}`)))
}

function description(summary: ObjectiveSummary): string {
  return findArticle(summary)?.learningObjectives.find((objective) => objective.id === summary.key || objective.id.endsWith(`/${summary.objectiveId}`))?.description
    ?? `${summary.conceptId} · ${summary.objectiveId}`
}

function relatedQuizId(summary: ObjectiveSummary): string | undefined {
  const article = findArticle(summary)
  return catalog.value?.quizzes.find((quiz) => quiz.conceptId === summary.conceptId && quiz.learningObjectiveIds.includes(summary.key))?.id
    ?? article?.quickQuizIds[0]
}

function assessmentTitle(id: string): string {
  return catalog.value?.assessments.find((assessment) => assessment.id === id)?.title ?? id
}
</script>

<template>
  <div v-if="pending" class="container state-panel">正在載入複習佇列…</div>
  <div v-else-if="error" class="container state-panel error-state">內容索引載入失敗，請重新整理。</div>
  <main v-else class="container page-section">
    <section class="progress-hero review-hero">
      <div>
        <span class="eyebrow">Review queue</span>
        <h1>把失分變成下一次的學習順序。</h1>
        <p>先回讀弱點對應文章，再做 Quick Quiz；若已能解釋原理與取捨，就進入 Hard Assessment 驗證應用。</p>
      </div>
      <NuxtLink class="button button-secondary" to="/dashboard">回到儀表板</NuxtLink>
    </section>

    <div class="review-toolbar">
      <span>{{ filteredSummaries.length }} 個 Learning Objective</span>
      <label class="field">顯示
        <select v-model="filter">
          <option value="weak">所有弱點</option>
          <option value="explicit">明確標記需要回讀</option>
          <option value="all">全部有紀錄目標</option>
        </select>
      </label>
    </div>

    <section v-if="filteredSummaries.length" class="review-list">
      <article v-for="summary in filteredSummaries" :key="summary.key" class="review-card">
        <div class="review-card-main">
          <div class="card-topline"><span class="eyebrow">{{ summary.conceptId }}</span><span class="review-score">{{ Math.round(summary.effectiveScore * 100) }}%</span></div>
          <h2>{{ summary.objectiveId }} · {{ description(summary) }}</h2>
          <p>{{ summary.attempts }} 次嘗試 · 最近一次 {{ summary.needsReview ? '需要回讀' : '表現偏低' }}{{ summary.lastAttemptAt ? ` · ${new Date(summary.lastAttemptAt).toLocaleDateString('zh-TW')}` : '' }}</p>
        </div>
        <div class="review-card-actions">
          <NuxtLink v-if="findArticle(summary)" class="button button-primary" :to="`/articles/${findArticle(summary)?.slug}`">回讀文章</NuxtLink>
          <NuxtLink v-if="relatedQuizId(summary)" class="button button-quiet" :to="`/quiz/${relatedQuizId(summary)}`">做 Quick Quiz</NuxtLink>
        </div>
      </article>
    </section>
    <div v-else class="state-panel inline-state"><strong>目前沒有符合條件的複習目標。</strong><span>先完成幾題 Quiz，或從尚未閱讀的核心文章開始建立紀錄。</span><NuxtLink class="text-link" to="/catalog">前往內容目錄 →</NuxtLink></div>

    <section class="dashboard-section">
      <div class="section-row"><SectionHeading eyebrow="Assessment retry" title="需要重做的 Hard Assessment" description="未達通過門檻的 Assessment 會保留在這裡，方便回讀後重測。" /></div>
      <div v-if="failedAssessments.length" class="assessment-retry-grid">
        <article v-for="attempt in failedAssessments.slice(0, 6)" :key="attempt.id" class="weakness-card">
          <span class="eyebrow">{{ attempt.totalScore }}/{{ attempt.maxScore }}</span>
          <h3>{{ assessmentTitle(attempt.assessmentId) }}</h3>
          <NuxtLink class="text-link" :to="`/assessment/${attempt.assessmentId}`">重新作答 →</NuxtLink>
        </article>
      </div>
      <p v-else class="muted">目前沒有未通過的 Hard Assessment。</p>
    </section>

    <section v-if="!summaries.length" class="dashboard-section">
      <div class="section-row"><SectionHeading eyebrow="Start here" title="先從這些核心文章開始" description="依重要程度與難度挑選尚未閱讀的文章，讀完就能從文章側欄進入對應測驗。" /></div>
      <div class="article-grid"><ArticleCard v-for="article in recommendedArticles" :key="article.id" :article="article" /></div>
    </section>
  </main>
</template>
