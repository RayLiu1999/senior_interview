<script setup lang="ts">
const { hydrate } = useProgress()

useHead({
  link: [
    { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  ],
  meta: [
    { name: 'theme-color', content: '#172039' },
  ],
})

onMounted(() => {
  void hydrate()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="site-main">
      <NuxtPage />
    </main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <span>Senior Backend Interview Guide</span>
        <span>Article → Quick Quiz → Hard Assessment</span>
      </div>
    </footer>
  </div>
</template>
