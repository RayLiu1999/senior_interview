<script setup lang="ts">
const route = useRoute()
const assessmentId = computed(() => String(route.params.id))
const { assessment, pending, error } = await useAssessmentDetail(assessmentId)
</script>

<template>
  <div class="container page-section">
    <div v-if="pending" class="state-panel">正在載入 Hard Assessment…</div>
    <div v-else-if="error || !assessment" class="state-panel error-state">找不到這份測驗。</div>
    <template v-else>
      <NuxtLink class="back-link" :to="assessment.articleIds[0] ? `/articles/${assessment.articleIds[0]}` : '/catalog'">← 回到文章</NuxtLink>
      <AssessmentPlayer :assessment="assessment" />
    </template>
  </div>
</template>
