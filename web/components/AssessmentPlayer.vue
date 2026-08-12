<script setup lang="ts">
import type { AssessmentRecord } from '~/types/content'
import {
  assessmentScoreLabel,
  assessmentScorePercent,
  parseAssessmentRubric,
  parseAssessmentTasks,
} from '~/utils/assessment'

const props = defineProps<{
  assessment: AssessmentRecord
}>()

const { recordAssessmentAttempt, saving } = useProgress()
const submitted = ref(false)
const selectedScore = ref<number | null>(null)
const notes = ref('')
const answers = ref<Record<string, string>>({})
const score = ref<number | null>(null)

const tasks = computed(() => parseAssessmentTasks(props.assessment.taskMarkdown))
const rubricRows = computed(() => parseAssessmentRubric(props.assessment.rubricMarkdown))
const answeredTaskCount = computed(() => tasks.value.filter((task) => Boolean(answers.value[task.id]?.trim())).length)
const canSubmit = computed(() => answeredTaskCount.value === tasks.value.length && selectedScore.value !== null)
const scoreLabel = computed(() => score.value === null ? '' : assessmentScoreLabel(score.value, props.assessment.passScore))
const scorePercent = computed(() => score.value === null ? 0 : assessmentScorePercent(score.value, 4))

async function submit() {
  if (!canSubmit.value || selectedScore.value === null) return
  score.value = selectedScore.value
  submitted.value = true
  await recordAssessmentAttempt({
    assessmentId: props.assessment.id,
    conceptIds: props.assessment.conceptIds,
    learningObjectiveIds: props.assessment.learningObjectiveIds,
    answers: { ...answers.value },
    rubricScores: { overall: selectedScore.value },
    totalScore: selectedScore.value,
    maxScore: 4,
    passed: selectedScore.value >= props.assessment.passScore,
    notes: notes.value.trim(),
    contentHash: props.assessment.contentHash,
  })
}

function reset() {
  submitted.value = false
  selectedScore.value = null
  score.value = null
  notes.value = ''
  answers.value = {}
}
</script>

<template>
  <section class="assessment-player">
    <header class="assessment-header">
      <div>
        <span class="eyebrow">Hard Assessment · {{ assessment.assessmentId }}</span>
        <h1>{{ assessment.title }}</h1>
        <p class="article-concept">主要概念：{{ assessment.primaryConceptId }}</p>
      </div>
      <div class="assessment-meta">
        <span class="difficulty">難度 {{ assessment.difficulty }}/10</span>
        <span>通過 {{ assessment.passScore }}/4</span>
      </div>
    </header>

    <div class="assessment-intro">
      <div class="assessment-block">
        <h2>測驗目標</h2>
        <MarkdownContent :content="assessment.objectiveMarkdown" />
      </div>
      <div class="assessment-block">
        <h2>問題情境與限制</h2>
        <MarkdownContent :content="assessment.scenarioMarkdown" />
      </div>
      <div class="assessment-block">
        <h2>期待證據</h2>
        <MarkdownContent :content="assessment.evidenceMarkdown" />
      </div>
    </div>

    <form class="assessment-form" @submit.prevent="submit">
      <div class="assessment-section-heading">
        <div>
          <span class="eyebrow">Candidate response</span>
          <h2>逐項完成作答</h2>
        </div>
        <span class="assessment-progress">{{ answeredTaskCount }}/{{ tasks.length }} 項已完成</span>
      </div>

      <div class="assessment-tasks">
        <fieldset v-for="task in tasks" :key="task.id" class="assessment-task" :disabled="submitted">
          <legend><span>{{ task.number }}</span><strong>{{ task.title }}</strong></legend>
          <p>{{ task.prompt }}</p>
          <textarea v-model="answers[task.id]" class="assessment-answer" rows="7" :aria-label="`${task.number}. ${task.title}`" placeholder="寫下你的判斷、推理、證據、取捨與驗證方式…" />
        </fieldset>
      </div>

      <div class="assessment-rubric">
        <div class="assessment-section-heading">
          <div>
            <span class="eyebrow">Self-scoring rubric</span>
            <h2>選擇最符合的整體表現</h2>
          </div>
          <span class="assessment-progress">0–4 分，{{ assessment.passScore }} 分通過</span>
        </div>
        <div class="rubric-options">
          <label v-for="row in rubricRows" :key="row.score" class="rubric-option" :class="{ selected: selectedScore === row.score }">
            <input v-model="selectedScore" type="radio" name="assessment-score" :value="row.score" :disabled="submitted" />
            <span class="rubric-score">{{ row.score }}</span>
            <span>{{ row.description }}</span>
          </label>
        </div>
      </div>

      <label class="assessment-notes">
        <span>補充筆記（選填）</span>
        <textarea v-model="notes" rows="3" :disabled="submitted" placeholder="記錄這次最不確定的假設或下一次要補強的方向…" />
      </label>

      <div class="quiz-actions">
        <button v-if="!submitted" class="button button-primary" type="submit" :disabled="!canSubmit || saving">{{ saving ? '儲存中…' : '提交 Hard Assessment' }}</button>
        <button v-else class="button button-secondary" type="button" @click="reset">重新作答</button>
        <NuxtLink class="button button-quiet" to="/review">查看複習清單</NuxtLink>
      </div>
      <p v-if="!submitted && !canSubmit" class="assessment-hint">請完成所有作答欄位並選擇 0–4 分，才能提交。</p>
    </form>

    <section v-if="submitted && score !== null" class="assessment-result" :class="{ success: score >= assessment.passScore, warning: score < assessment.passScore }" role="status">
      <div class="assessment-result-heading">
        <div><span class="eyebrow">Assessment result</span><h2>{{ scoreLabel }}</h2></div>
        <strong>{{ score }}/4</strong>
      </div>
      <div class="score-meter" aria-hidden="true"><span :style="{ width: `${scorePercent}%` }" /></div>
      <p>{{ score >= assessment.passScore ? '這次結果已記錄；可以繼續下一份測驗或回讀失分概念。' : '結果已記錄；建議先從下方參考答案與文章連結補強，再重新作答。' }}</p>
      <details class="assessment-reference" open>
        <summary>參考答案與詳解</summary>
        <MarkdownContent :content="assessment.referenceMarkdown" />
      </details>
      <details class="assessment-reference">
        <summary>常見失分點</summary>
        <MarkdownContent :content="assessment.commonMistakesMarkdown" />
      </details>
      <details v-if="assessment.followUpMarkdown" class="assessment-reference">
        <summary>延伸追問</summary>
        <MarkdownContent :content="assessment.followUpMarkdown" />
      </details>
      <div v-if="assessment.articleIds.length" class="assessment-article-links">
        <span>回讀對應文章</span>
        <NuxtLink v-for="articleId in assessment.articleIds" :key="articleId" class="text-link" :to="`/articles/${articleId}`">{{ articleId }} →</NuxtLink>
      </div>
    </section>
  </section>
</template>
