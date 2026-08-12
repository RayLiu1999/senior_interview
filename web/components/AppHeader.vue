<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink class="brand" to="/">
        <span class="brand-mark">SI</span>
        <span>
          <strong>Senior Interview</strong>
          <small>Backend learning system</small>
        </span>
      </NuxtLink>
      <nav class="main-nav" aria-label="主要導覽">
        <NuxtLink to="/catalog">探索內容</NuxtLink>
        <NuxtLink to="/dashboard">學習儀表板</NuxtLink>
        <NuxtLink to="/review">複習佇列</NuxtLink>
      </nav>
      <NuxtLink class="header-action" to="/settings">設定</NuxtLink>
    </div>
  </header>
</template>
