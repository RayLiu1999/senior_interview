<script setup lang="ts">
import {
  sortArticles,
  sortFromQuery,
  sortToQuery,
  type CatalogSort,
} from '~/utils/catalog-filters'

const route = useRoute()
const router = useRouter()
const { catalog, pending, error } = await useCatalog()
const categoryId = computed(() => String(route.params.category))
const category = computed(() => catalog.value?.categories.find((item) => item.id === categoryId.value))
const sort = ref<CatalogSort>(sortFromQuery(route.query as Record<string, unknown>))
const articles = computed(() => sortArticles(
  catalog.value?.articles.filter((article) => article.categoryId === categoryId.value) ?? [],
  sort.value,
))

watch(
  () => route.query.sort,
  (value) => {
    const nextSort = sortFromQuery({ sort: value })
    if (sort.value !== nextSort) sort.value = nextSort
  },
)

watch(sort, (nextSort) => {
  const currentSort = sortFromQuery(route.query as Record<string, unknown>)
  if (nextSort !== currentSort) {
    void router.replace({ query: sortToQuery(nextSort) })
  }
})
</script>

<template>
  <div class="container page-section">
    <div v-if="pending" class="state-panel">正在載入分類…</div>
    <div v-else-if="error || !category" class="state-panel error-state">找不到這個分類。</div>
    <template v-else>
      <NuxtLink class="back-link" to="/catalog">← 回到全部內容</NuxtLink>
      <SectionHeading eyebrow="Category" :title="category.label" :description="category.description" />
      <div class="category-summary">
        <span>{{ articles.length }} 篇文章</span>
        <CatalogSortControls v-model="sort" />
      </div>
      <div class="article-grid">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
    </template>
  </div>
</template>
