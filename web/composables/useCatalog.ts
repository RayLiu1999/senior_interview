import type { ContentCatalog } from '~/types/content'

export async function useCatalog() {
  const endpoint = import.meta.server ? '/api/content/catalog' : '/content/catalog.json'
  const { data, pending, error, refresh } = await useAsyncData(
    'content-catalog',
    () => $fetch<ContentCatalog>(endpoint),
    {
      deep: false,
      // The catalog is a multi-megabyte static asset. Do not serialize it into
      // every prerendered page; let the browser load the shared asset once.
      server: !import.meta.prerender,
    },
  )

  return {
    catalog: data,
    pending,
    error,
    refresh,
  }
}
