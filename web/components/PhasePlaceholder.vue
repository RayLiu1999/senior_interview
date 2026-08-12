<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="container page-section">
    <div class="state-panel phase-placeholder">
      <span class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <NuxtLink class="button button-primary" to="/catalog">先探索文章</NuxtLink>
    </div>
  </div>
</template>
