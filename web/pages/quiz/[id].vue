<script setup lang="ts">
const route = useRoute()
const { catalog, pending, error } = await useCatalog()
const quiz = computed(() => catalog.value?.quizzes.find((item) => item.id === String(route.params.id)))
</script>

<template>
  <div class="container page-section">
    <div v-if="pending" class="state-panel">正在載入 Quiz…</div>
    <div v-else-if="error || !quiz" class="state-panel error-state">找不到這道題目。</div>
    <div v-else class="state-panel phase-placeholder">
      <span class="eyebrow">Quick Quiz</span>
      <h1>{{ quiz.title }}</h1>
      <p>互動作答與紀錄功能將在 W2 完成；目前可以先閱讀對應文章。</p>
      <NuxtLink v-if="quiz.articleId" class="button button-primary" :to="`/articles/${quiz.articleId}`">閱讀對應文章</NuxtLink>
    </div>
  </div>
</template>
