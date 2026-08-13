<script setup lang="ts">
import {
  filtersFromQuery,
  filtersToQuery,
  sameFilterState,
  type CatalogFilters,
} from '~/utils/catalog-filters'

const route = useRoute()
const router = useRouter()
const { catalog, pending, error } = await useCatalog()

const filters = reactive<CatalogFilters>(filtersFromQuery(route.query as Record<string, unknown>))

const filteredArticles = computed(() => {
  const query = filters.search.trim().toLowerCase()
  return (catalog.value?.articles ?? []).filter((article) => {
    const matchesCategory = filters.category === 'all' || article.categoryId === filters.category
    const matchesImportance = filters.importance === 'all' || article.importance === Number(filters.importance)
    const matchesDifficulty = filters.difficulty === 'all' || article.difficulty >= Number(filters.difficulty)
    const searchable = [article.title, article.conceptId, article.categoryLabel, ...article.tags].join(' ').toLowerCase()
    return matchesCategory && matchesImportance && matchesDifficulty && (!query || searchable.includes(query))
  })
})

watch(
  () => route.query,
  (query) => {
    const nextFilters = filtersFromQuery(query as Record<string, unknown>)
    if (!sameFilterState(filters, nextFilters)) Object.assign(filters, nextFilters)
  },
  { deep: true },
)

watch(
  filters,
  (nextFilters) => {
    const currentFilters = filtersFromQuery(route.query as Record<string, unknown>)
    if (!sameFilterState(nextFilters, currentFilters)) {
      void router.replace({ query: filtersToQuery(nextFilters) })
    }
  },
  { deep: true },
)

function clearFilters() {
  Object.assign(filters, filtersFromQuery({}))
}
</script>

<template>
  <div class="container page-section">
    <SectionHeading eyebrow="Explore" title="瀏覽全部主題" description="用分類、重要程度、難度或 Concept 找到下一篇文章。" />
    <div v-if="pending" class="state-panel">正在載入內容索引…</div>
    <div v-else-if="error" class="state-panel error-state">內容索引載入失敗。</div>
    <template v-else-if="catalog">
      <div class="filter-panel">
        <label class="field field-search">
          <span>搜尋</span>
          <input v-model="filters.search" type="search" placeholder="搜尋標題、Concept 或標籤" />
        </label>
        <label class="field">
          <span>分類</span>
          <select v-model="filters.category">
            <option value="all">全部分類</option>
            <option v-for="item in catalog.categories" :key="item.id" :value="item.id">{{ item.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>重要程度</span>
          <select v-model="filters.importance">
            <option value="all">全部</option>
            <option value="5">5 — 必備</option>
            <option value="4">4 — 非常重要</option>
            <option value="3">3 — 重要</option>
          </select>
        </label>
        <label class="field">
          <span>最低難度</span>
          <select v-model="filters.difficulty">
            <option value="all">不限</option>
            <option value="4">4+</option>
            <option value="7">7+</option>
            <option value="9">9+</option>
          </select>
        </label>
        <button class="button button-quiet" type="button" @click="clearFilters">清除</button>
      </div>
      <div class="result-bar"><span>找到 {{ filteredArticles.length }} 篇文章</span><span v-if="filters.search">搜尋：{{ filters.search }}</span></div>
      <div v-if="filteredArticles.length" class="article-grid">
        <ArticleCard v-for="article in filteredArticles" :key="article.id" :article="article" />
      </div>
      <div v-else class="state-panel">沒有符合條件的文章，試著放寬篩選。</div>
    </template>
  </div>
</template>
