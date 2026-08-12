<script setup lang="ts">
import type { QuizItem } from '~/types/content'
import { scoreQuiz, scoreReflection, type QuizScore } from '~/utils/quiz'

const props = defineProps<{
  quiz: QuizItem
  articleTitle?: string
}>()

const selectedOptionIds = ref<string[]>([])
const reflection = ref<'understood' | 'partial' | 'review' | null>(null)
const submitted = ref(false)
const result = ref<QuizScore | null>(null)
const { recordQuizAttempt, saving } = useProgress()

const canSubmit = computed(() => props.quiz.type === 'reflection' ? reflection.value !== null : selectedOptionIds.value.length > 0)
const resultLabel = computed(() => {
  if (!result.value) return ''
  if (result.value.correct === true) return '回答正確'
  if (result.value.correct === false) return '需要回讀'
  if (result.value.score >= 1) return '已標記為理解'
  if (result.value.score > 0) return '部分理解'
  return '建議回讀文章'
})

function toggleOption(optionId: string) {
  if (props.quiz.type === 'single-choice' || props.quiz.type === 'true-false') {
    selectedOptionIds.value = [optionId]
    return
  }
  selectedOptionIds.value = selectedOptionIds.value.includes(optionId)
    ? selectedOptionIds.value.filter((id) => id !== optionId)
    : [...selectedOptionIds.value, optionId]
}

async function submit() {
  if (!canSubmit.value) return
  const score = props.quiz.type === 'reflection'
    ? scoreReflection(reflection.value as 'understood' | 'partial' | 'review')
    : scoreQuiz(props.quiz, selectedOptionIds.value)
  result.value = score
  submitted.value = true
  await recordQuizAttempt({
    questionId: props.quiz.id,
    conceptId: props.quiz.conceptId,
    learningObjectiveIds: props.quiz.learningObjectiveIds,
    answers: props.quiz.type === 'reflection' ? [reflection.value as string] : selectedOptionIds.value,
    score: score.score,
    maxScore: score.maxScore,
    correct: score.correct,
    selfAssessment: reflection.value ?? (score.correct ? 'understood' : 'review'),
    contentHash: props.quiz.contentHash,
  })
}

function reset() {
  selectedOptionIds.value = []
  reflection.value = null
  submitted.value = false
  result.value = null
}
</script>

<template>
  <section class="quiz-player">
    <div class="quiz-player-header">
      <div>
        <span class="eyebrow">Quick Quiz · Q{{ quiz.questionNumber }}</span>
        <h1>{{ quiz.title }}</h1>
        <p class="article-concept">{{ quiz.conceptId }}</p>
      </div>
      <span class="difficulty">難度 {{ quiz.difficulty }}/10</span>
    </div>
    <div class="quiz-prompt"><MarkdownContent :content="quiz.prompt" /></div>

    <fieldset v-if="quiz.type !== 'reflection'" class="quiz-options" :disabled="submitted">
      <legend>{{ quiz.type === 'multiple-choice' ? '可複選' : '請選擇一個答案' }}</legend>
      <label v-for="option in quiz.options" :key="option.id" class="quiz-option" :class="{ selected: selectedOptionIds.includes(option.id) }">
        <input :type="quiz.type === 'multiple-choice' ? 'checkbox' : 'radio'" name="quiz-option" :checked="selectedOptionIds.includes(option.id)" @change="toggleOption(option.id)" />
        <span>{{ option.label }}</span>
      </label>
    </fieldset>

    <fieldset v-else class="reflection-options" :disabled="submitted">
      <legend>先標記你目前的理解程度</legend>
      <label class="reflection-option" :class="{ selected: reflection === 'understood' }"><input v-model="reflection" type="radio" value="understood" /><span><strong>我能清楚回答</strong><small>我能說明原理、取捨與適用情境。</small></span></label>
      <label class="reflection-option" :class="{ selected: reflection === 'partial' }"><input v-model="reflection" type="radio" value="partial" /><span><strong>部分理解</strong><small>我知道方向，但還不能穩定說完整。</small></span></label>
      <label class="reflection-option" :class="{ selected: reflection === 'review' }"><input v-model="reflection" type="radio" value="review" /><span><strong>需要回讀</strong><small>我需要重新閱讀文章與答案提示。</small></span></label>
    </fieldset>

    <div class="quiz-actions">
      <button v-if="!submitted" class="button button-primary" type="button" :disabled="!canSubmit || saving" @click="submit">{{ saving ? '儲存中…' : '提交答案' }}</button>
      <button v-else class="button button-secondary" type="button" @click="reset">再做一次</button>
      <NuxtLink v-if="quiz.articleId" class="button button-quiet" :to="`/articles/${quiz.articleId}`">回讀文章</NuxtLink>
    </div>

    <div v-if="submitted && result" class="quiz-result" :class="{ success: result.correct === true || result.score >= 1, warning: result.correct === false || result.score < 1 }" role="status">
      <div class="result-heading"><strong>{{ resultLabel }}</strong><span>{{ result.score }}/{{ result.maxScore }}</span></div>
      <p v-if="articleTitle">對應文章：{{ articleTitle }}</p>
      <MarkdownContent :content="quiz.explanationMarkdown" />
    </div>
  </section>
</template>
