<script setup lang="ts">
const route = useRoute()
const { catalog, pending, error } = await useCatalog()

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const category = ref(typeof route.query.category === 'string' ? route.query.category : 'all')
const importance = ref('all')
const difficulty = ref('all')

const filteredArticles = computed(() => {
  const query = search.value.trim().toLowerCase()
  return (catalog.value?.articles ?? []).filter((article) => {
    const matchesCategory = category.value === 'all' || article.categoryId === category.value
    const matchesImportance = importance.value === 'all' || article.importance === Number(importance.value)
    const matchesDifficulty = difficulty.value === 'all' || article.difficulty >= Number(difficulty.value)
    const searchable = [article.title, article.conceptId, article.categoryLabel, ...article.tags].join(' ').toLowerCase()
    return matchesCategory && matchesImportance && matchesDifficulty && (!query || searchable.includes(query))
  })
})

function clearFilters() {
  search.value = ''
  category.value = 'all'
  importance.value = 'all'
  difficulty.value = 'all'
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
          <input v-model="search" type="search" placeholder="搜尋標題、Concept 或標籤" />
        </label>
        <label class="field">
          <span>分類</span>
          <select v-model="category">
            <option value="all">全部分類</option>
            <option v-for="item in catalog.categories" :key="item.id" :value="item.id">{{ item.label }}</option>
          </select>
        </label>
        <label class="field">
          <span>重要程度</span>
          <select v-model="importance">
            <option value="all">全部</option>
            <option value="5">5 — 必備</option>
            <option value="4">4 — 非常重要</option>
            <option value="3">3 — 重要</option>
          </select>
        </label>
        <label class="field">
          <span>最低難度</span>
          <select v-model="difficulty">
            <option value="all">不限</option>
            <option value="4">4+</option>
            <option value="7">7+</option>
            <option value="9">9+</option>
          </select>
        </label>
        <button class="button button-quiet" type="button" @click="clearFilters">清除</button>
      </div>
      <div class="result-bar"><span>找到 {{ filteredArticles.length }} 篇文章</span><span v-if="search">搜尋：{{ search }}</span></div>
      <div v-if="filteredArticles.length" class="article-grid">
        <ArticleCard v-for="article in filteredArticles" :key="article.id" :article="article" />
      </div>
      <div v-else class="state-panel">沒有符合條件的文章，試著放寬篩選。</div>
    </template>
  </div>
</template>
