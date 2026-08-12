import type { ContentCatalog } from '~/types/content'

export async function useCatalog() {
  const { data, pending, error, refresh } = await useAsyncData(
    'content-catalog',
    () => $fetch<ContentCatalog>('/content/catalog.json'),
    { deep: false },
  )

  return {
    catalog: data,
    pending,
    error,
    refresh,
  }
}
