<script setup lang="ts">
import type { ArticleRecord } from '~/types/content'

defineProps<{
  article: ArticleRecord
}>()
</script>

<template>
  <article class="article-card">
    <div class="card-topline">
      <span class="eyebrow">{{ article.categoryLabel }}</span>
      <span class="difficulty">難度 {{ article.difficulty }}/10</span>
    </div>
    <h3><NuxtLink :to="`/articles/${article.slug}`">{{ article.title }}</NuxtLink></h3>
    <p class="card-concept">{{ article.conceptId }}</p>
    <div class="tag-list" aria-label="文章標籤">
      <span v-for="tag in article.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <div class="card-footer">
      <span>重要程度 {{ article.importance }}/5</span>
      <NuxtLink class="text-link" :to="`/articles/${article.slug}`">閱讀文章 →</NuxtLink>
    </div>
  </article>
</template>
