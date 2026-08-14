import type { ContentCatalog } from '~/types/content'

export async function useCatalog() {
  const { data, pending, error, refresh } = await useAsyncData(
    'content-catalog',
    () => $fetch<ContentCatalog>('/content/catalog.json'),
    {
      deep: false,
      // Keep the shared index out of every SSR route payload. It is fetched once
      // in the browser and reused by the pages that need metadata.
      server: false,
      lazy: true,
    },
  )

  return {
    catalog: data,
    pending,
    error,
    refresh,
  }
}
