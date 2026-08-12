<script setup lang="ts">
import type { ArticleRecord } from '~/types/content'

const route = useRoute()
const { catalog, pending, error } = await useCatalog()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug))
const article = computed<ArticleRecord | undefined>(() => catalog.value?.articles.find((item) => item.slug === slug.value))
const articleQuizzes = computed(() => article.value ? (catalog.value?.quizzes.filter((quiz) => article.value?.quickQuizIds.includes(quiz.id)) ?? []) : [])
const articleAssessments = computed(() => article.value ? (catalog.value?.assessments.filter((assessment) => article.value?.assessmentIds.includes(assessment.id)) ?? []) : [])
</script>

<template>
  <div class="container article-layout">
    <div v-if="pending" class="state-panel">正在載入文章…</div>
    <div v-else-if="error || !article" class="state-panel error-state">找不到這篇文章。</div>
    <template v-else>
      <article>
        <NuxtLink class="back-link" :to="`/categories/${article.categoryId}`">← {{ article.categoryLabel }}</NuxtLink>
        <div class="article-header">
          <div class="card-topline"><span class="eyebrow">{{ article.categoryLabel }}</span><span class="difficulty">難度 {{ article.difficulty }}/10</span></div>
          <h1>{{ article.title }}</h1>
          <p class="article-concept">{{ article.conceptId }}</p>
          <div class="tag-list"><span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span></div>
        </div>
        <MarkdownContent :content="article.contentMarkdown" />
      </article>
      <aside class="article-sidebar">
        <div class="side-card sticky-card">
          <span class="eyebrow">Learning objectives</span>
          <h2>讀完後應能做到</h2>
          <ol class="objective-list">
            <li v-for="objective in article.learningObjectives" :key="objective.id">
              <code>{{ objective.id.split('/').at(-1) }}</code>
              <span>{{ objective.description }}</span>
            </li>
          </ol>
          <div v-if="article.prerequisites.length" class="side-divider">
            <span class="eyebrow">Prerequisites</span>
            <p>{{ article.prerequisites.join('、') }}</p>
          </div>
        </div>
        <div class="side-card">
          <span class="eyebrow">Practice</span>
          <h2>把理解變成證據</h2>
          <div v-if="articleQuizzes.length" class="practice-list">
            <NuxtLink v-for="quiz in articleQuizzes" :key="quiz.id" :to="`/quiz/${quiz.id}`" class="practice-link">
              <span>Quick Quiz</span><strong>{{ quiz.title }}</strong>
            </NuxtLink>
          </div>
          <p v-else class="muted">這篇文章目前沒有直接可用的 Quiz 入口。</p>
          <div v-if="articleAssessments.length" class="practice-list assessment-links">
            <NuxtLink v-for="assessment in articleAssessments" :key="assessment.id" :to="`/assessment/${assessment.id}`" class="practice-link">
              <span>Hard Assessment</span><strong>{{ assessment.title }}</strong>
            </NuxtLink>
          </div>
        </div>
      </aside>
    </template>
  </div>
</template>
