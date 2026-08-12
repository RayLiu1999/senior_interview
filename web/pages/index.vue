<script setup lang="ts">
const { catalog, pending, error } = await useCatalog()

const featuredArticles = computed(() => (catalog.value?.articles ?? [])
  .slice()
  .sort((left, right) => right.importance - left.importance || right.difficulty - left.difficulty)
  .slice(0, 8))
</script>

<template>
  <div v-if="pending" class="container state-panel">正在載入內容索引…</div>
  <div v-else-if="error" class="container state-panel error-state">內容索引載入失敗，請重新整理。</div>
  <template v-else-if="catalog">
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Senior backend learning system</span>
          <h1>把面試知識，練成可以說清楚、做正確的能力。</h1>
          <p>從理論文章開始，透過 Quick Quiz 檢查理解，再用 Hard Assessment 練習故障診斷與架構取捨。</p>
          <div class="hero-actions">
            <NuxtLink class="button button-primary" to="/catalog">開始探索內容</NuxtLink>
            <NuxtLink class="button button-secondary" to="/dashboard">查看學習狀態</NuxtLink>
          </div>
        </div>
        <div class="hero-panel">
          <div class="hero-panel-label">學習閉環</div>
          <div class="learning-loop">
            <span>Article</span><i>→</i><span>Quick Quiz</span><i>→</i><span>Hard Assessment</span>
          </div>
          <p>每個 Concept 都能回到文章、測驗與弱點分析。</p>
        </div>
      </div>
    </section>

    <section class="container metric-grid" aria-label="內容規模">
      <div class="metric-card"><strong>{{ catalog.articles.length }}</strong><span>主題文章</span></div>
      <div class="metric-card"><strong>{{ catalog.quizzes.length }}</strong><span>Quick Quiz</span></div>
      <div class="metric-card"><strong>{{ catalog.assessments.length }}</strong><span>Hard Assessment</span></div>
      <div class="metric-card"><strong>{{ catalog.categories.length }}</strong><span>內容分類</span></div>
    </section>

    <section class="container page-section">
      <SectionHeading eyebrow="Explore by domain" title="依分類建立自己的學習路徑" description="先從最需要的領域開始，再沿著前置概念逐步深入。" />
      <div class="category-grid">
        <NuxtLink v-for="category in catalog.categories" :key="category.id" class="category-card" :to="`/categories/${category.id}`">
          <span class="category-count">{{ category.articleCount }} 篇</span>
          <h3>{{ category.label }}</h3>
          <p>{{ category.description }}</p>
          <span class="text-link">查看分類 →</span>
        </NuxtLink>
      </div>
    </section>

    <section class="container page-section">
      <div class="section-row">
        <SectionHeading eyebrow="Start here" title="推薦先讀的核心主題" />
        <NuxtLink class="text-link" to="/catalog">查看全部 →</NuxtLink>
      </div>
      <div class="article-grid">
        <ArticleCard v-for="article in featuredArticles" :key="article.id" :article="article" />
      </div>
    </section>
  </template>
</template>
