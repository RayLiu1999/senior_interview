<script setup lang="ts">
const route = useRoute()
const { catalog, pending, error } = await useCatalog()
const assessment = computed(() => catalog.value?.assessments.find((item) => item.id === String(route.params.id)))
</script>

<template>
  <div class="container page-section">
    <div v-if="pending" class="state-panel">正在載入 Hard Assessment…</div>
    <div v-else-if="error || !assessment" class="state-panel error-state">找不到這份測驗。</div>
    <div v-else class="state-panel phase-placeholder">
      <span class="eyebrow">Hard Assessment</span>
      <h1>{{ assessment.title }}</h1>
      <p>情境作答、Rubric 自評與紀錄功能將在 W3 完成；目前可以先回到文章準備。</p>
      <NuxtLink v-if="assessment.articleIds[0]" class="button button-primary" :to="`/articles/${assessment.articleIds[0]}`">閱讀相關文章</NuxtLink>
    </div>
  </div>
</template>
