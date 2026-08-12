<script setup lang="ts">
const { hydrate } = useProgress()

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
