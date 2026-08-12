import type { ContentCatalog } from '~/types/content'

export async function useCatalog() {
  const { data, pending, error, refresh } = await useAsyncData<ContentCatalog>(
    'content-catalog',
    () => $fetch('/content/catalog.json'),
    { deep: false },
  )

  return {
    catalog: data,
    pending,
    error,
    refresh,
  }
}
