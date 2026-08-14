import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

import type { ArticleRecord, AssessmentRecord, QuizItem } from '~/types/content'

interface ContentDetailResult<T> {
  data: Ref<T | null | undefined>
  pending: Ref<boolean>
  error: Ref<unknown>
  refresh: () => Promise<void>
}

async function useContentDetail<T>(
  kind: string,
  directory: string,
  identifier: MaybeRefOrGetter<string>,
): Promise<ContentDetailResult<T>> {
  const id = computed(() => toValue(identifier))
  const key = computed(() => `content-${kind}-${id.value}`)
  const result = await useAsyncData<T>(
    key,
    async () => await $fetch<T>(`/content/${directory}/${encodeURIComponent(id.value)}.json`) as T,
    {
      deep: false,
      server: false,
      lazy: true,
      watch: [id],
    },
  )

  return {
    data: result.data as Ref<T | null | undefined>,
    pending: result.pending,
    error: result.error,
    refresh: result.refresh,
  }
}

export async function useArticleDetail(slug: MaybeRefOrGetter<string>) {
  const result = await useContentDetail<ArticleRecord>('article', 'articles', slug)
  return {
    article: result.data,
    pending: result.pending,
    error: result.error,
    refresh: result.refresh,
  }
}

export async function useQuizDetail(id: MaybeRefOrGetter<string>) {
  const result = await useContentDetail<QuizItem>('quiz', 'quizzes', id)
  return {
    quiz: result.data,
    pending: result.pending,
    error: result.error,
    refresh: result.refresh,
  }
}

export async function useAssessmentDetail(id: MaybeRefOrGetter<string>) {
  const result = await useContentDetail<AssessmentRecord>('assessment', 'assessments', id)
  return {
    assessment: result.data,
    pending: result.pending,
    error: result.error,
    refresh: result.refresh,
  }
}
