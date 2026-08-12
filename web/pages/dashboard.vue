<script setup lang="ts">
import type { ArticleRecord } from '~/types/content'
import {
  calculateObjectiveSummaries,
  calculateProgressMetrics,
  isObjectiveWeak,
  type ObjectiveSummary,
} from '~/utils/progress'

const { catalog, pending, error } = await useCatalog()
const { state, ready, hydrate } = useProgress()

onMounted(() => {
  void hydrate()
})

const metrics = computed(() => calculateProgressMetrics(state.value))
const summaries = computed(() => calculateObjectiveSummaries(state.value))
const weakObjectives = computed(() => summaries.value.filter(isObjectiveWeak).slice(0, 8))
const recentQuizAttempts = computed(() => state.value.quizAttempts
  .slice()
  .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
  .slice(0, 5))
const recentAssessmentAttempts = computed(() => state.value.assessmentAttempts
  .slice()
  .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
  .slice(0, 5))

function formatPercent(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 100)}%`
}

function findArticle(summary: ObjectiveSummary): ArticleRecord | undefined {
  return catalog.value?.articles.find((article) => article.conceptId === summary.conceptId
    && article.learningObjectives.some((objective) => objective.id === summary.key || objective.id.endsWith(`/${summary.objectiveId}`)))
}

function objectiveDescription(summary: ObjectiveSummary): string {
  return findArticle(summary)?.learningObjectives.find((objective) => objective.id === summary.key || objective.id.endsWith(`/${summary.objectiveId}`))?.description
    ?? `${summary.conceptId} · ${summary.objectiveId}`
}

function articleLink(summary: ObjectiveSummary): string {
  return findArticle(summary)?.slug ?? '/catalog'
}

function assessmentTitle(id: string): string {
  return catalog.value?.assessments.find((assessment) => assessment.id === id)?.title ?? id
}
</script>

<template>
  <div v-if="pending" class="container state-panel">正在載入學習儀表板…</div>
  <div v-else-if="error" class="container state-panel error-state">內容索引載入失敗，請重新整理。</div>
  <main v-else class="container page-section">
    <section class="progress-hero">
      <div>
        <span class="eyebrow">Learning dashboard</span>
        <h1>看見自己真正不熟的概念。</h1>
        <p>文章閱讀、Quick Quiz 與 Hard Assessment 的結果會以 Learning Objective 聚合，幫你決定下一個該回讀什麼。</p>
      </div>
      <div class="progress-hero-actions">
        <NuxtLink class="button button-primary" to="/review">開始複習</NuxtLink>
        <NuxtLink class="button button-secondary" to="/catalog">繼續探索</NuxtLink>
      </div>
    </section>

    <p v-if="!ready" class="storage-hint">正在讀取本機學習紀錄…</p>
    <section class="progress-metric-grid" aria-label="學習統計">
      <div class="metric-card"><strong>{{ metrics.completedArticles }}</strong><span>已閱讀文章</span></div>
      <div class="metric-card"><strong>{{ metrics.quizAttempts }}</strong><span>Quiz 作答次數 · {{ formatPercent(metrics.quizAccuracy) }} 正確</span></div>
      <div class="metric-card"><strong>{{ metrics.assessmentAttempts }}</strong><span>Assessment · {{ formatPercent(metrics.assessmentPassRate) }} 通過</span></div>
      <div class="metric-card"><strong>{{ metrics.reviewCount }}</strong><span>需要複習的 Learning Objective</span></div>
    </section>

    <section class="dashboard-section">
      <div class="section-row"><SectionHeading eyebrow="Weak concepts" title="優先處理的弱點" description="低於 75% 的平均表現，或最近一次明確標記需要回讀的目標會出現在這裡。" /><NuxtLink class="text-link" to="/review">查看完整佇列 →</NuxtLink></div>
      <div v-if="weakObjectives.length" class="weakness-grid">
        <article v-for="summary in weakObjectives" :key="summary.key" class="weakness-card">
          <div class="card-topline"><span class="eyebrow">{{ summary.objectiveId }}</span><span>{{ Math.round(summary.effectiveScore * 100) }}%</span></div>
          <h3>{{ objectiveDescription(summary) }}</h3>
          <p>{{ summary.attempts }} 次紀錄 · 最近 {{ summary.needsReview ? '需要回讀' : '表現偏低' }}</p>
          <NuxtLink class="text-link" :to="`/articles/${articleLink(summary)}`">回讀文章 →</NuxtLink>
        </article>
      </div>
      <div v-else class="state-panel inline-state"><strong>目前沒有待處理弱點。</strong><span>先完成一題 Quick Quiz，儀表板就會開始累積你的學習證據。</span><NuxtLink class="text-link" to="/catalog">前往探索 →</NuxtLink></div>
    </section>

    <section class="dashboard-columns">
      <div class="dashboard-panel">
        <div class="section-row"><SectionHeading eyebrow="Quick Quiz" title="最近的 Quiz 紀錄" /></div>
        <div v-if="recentQuizAttempts.length" class="attempt-list">
          <div v-for="attempt in recentQuizAttempts" :key="attempt.id" class="attempt-row">
            <div><strong>{{ catalog?.quizzes.find((quiz) => quiz.id === attempt.questionId)?.title ?? attempt.questionId }}</strong><span>{{ attempt.selfAssessment === 'understood' ? '理解' : attempt.selfAssessment === 'partial' ? '部分理解' : '需要回讀' }}</span></div>
            <b>{{ attempt.score }}/{{ attempt.maxScore }}</b>
          </div>
        </div>
        <p v-else class="muted">尚未有 Quiz 紀錄。</p>
      </div>
      <div class="dashboard-panel">
        <div class="section-row"><SectionHeading eyebrow="Hard Assessment" title="最近的 Assessment 紀錄" /></div>
        <div v-if="recentAssessmentAttempts.length" class="attempt-list">
          <div v-for="attempt in recentAssessmentAttempts" :key="attempt.id" class="attempt-row">
            <div><strong>{{ assessmentTitle(attempt.assessmentId) }}</strong><span>{{ attempt.passed ? '已通過' : '需要補強' }}</span></div>
            <b>{{ attempt.totalScore }}/{{ attempt.maxScore }}</b>
          </div>
        </div>
        <p v-else class="muted">尚未有 Hard Assessment 紀錄。</p>
      </div>
    </section>
  </main>
</template>
