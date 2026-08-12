<script setup lang="ts">
const route = useRoute()
const { catalog, pending, error } = await useCatalog()
const quiz = computed(() => catalog.value?.quizzes.find((item) => item.id === String(route.params.id)))
const article = computed(() => quiz.value?.articleId ? catalog.value?.articles.find((item) => item.id === quiz.value?.articleId) : undefined)
const relatedQuizzes = computed(() => quiz.value && catalog.value
  ? catalog.value.quizzes.filter((item) => item.sourceFile === quiz.value?.sourceFile).sort((left, right) => left.questionNumber - right.questionNumber)
  : [])
const nextQuiz = computed(() => {
  if (!quiz.value) return undefined
  const index = relatedQuizzes.value.findIndex((item) => item.id === quiz.value?.id)
  return relatedQuizzes.value[index + 1]
})
</script>

<template>
  <div class="container page-section">
    <div v-if="pending" class="state-panel">正在載入 Quiz…</div>
    <div v-else-if="error || !quiz" class="state-panel error-state">找不到這道題目。</div>
    <template v-else>
      <NuxtLink class="back-link" :to="quiz.articleId ? `/articles/${quiz.articleId}` : '/catalog'">← 回到文章</NuxtLink>
      <QuizPlayer :quiz="quiz" :article-title="article?.title" />
      <div v-if="nextQuiz" class="next-quiz"><span>下一題</span><NuxtLink class="text-link" :to="`/quiz/${nextQuiz.id}`">Q{{ nextQuiz.questionNumber }}：{{ nextQuiz.title }} →</NuxtLink></div>
    </template>
  </div>
</template>
