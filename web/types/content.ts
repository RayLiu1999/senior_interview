export interface LearningObjective {
  id: string
  description: string
}

export interface CategoryRecord {
  id: string
  label: string
  description: string
  articleCount: number
}

export interface ArticleRecord {
  id: string
  slug: string
  path: string
  title: string
  categoryId: string
  categoryLabel: string
  difficulty: number
  importance: number
  tags: string[]
  prerequisites: string[]
  conceptId: string
  learningObjectives: LearningObjective[]
  contentMarkdown: string
  contentHash: string
  quickQuizIds: string[]
  assessmentIds: string[]
}

export type QuizItemType = 'reflection' | 'single-choice' | 'multiple-choice' | 'true-false'

export interface QuizOption {
  id: string
  label: string
}

export interface QuizItem {
  id: string
  sourceFile: string
  questionNumber: number
  title: string
  prompt: string
  answerMarkdown: string
  conceptId: string
  learningObjectiveIds: string[]
  difficulty: number
  importance: number
  type: QuizItemType
  options: QuizOption[]
  correctOptionIds: string[]
  explanationMarkdown: string
  articlePath: string
  articleId: string | null
  contentHash: string
}

export interface AssessmentRubricRow {
  score: number
  description: string
}

export interface AssessmentRecord {
  id: string
  sourceFile: string
  title: string
  assessmentId: string
  primaryConceptId: string
  conceptIds: string[]
  learningObjectiveIds: string[]
  articlePaths: string[]
  articleIds: string[]
  difficulty: number
  importance: number
  tags: string[]
  objectiveMarkdown: string
  scenarioMarkdown: string
  taskMarkdown: string
  evidenceMarkdown: string
  rubricMarkdown: string
  referenceMarkdown: string
  commonMistakesMarkdown: string
  followUpMarkdown: string
  passScore: number
  contentHash: string
}

export interface ContentCatalog {
  generatedAt: string
  schemaVersion: number
  categories: CategoryRecord[]
  articles: ArticleRecord[]
  quizzes: QuizItem[]
  assessments: AssessmentRecord[]
}

export interface QuizAttempt {
  id: string
  questionId: string
  conceptId: string
  learningObjectiveIds: string[]
  answers: string[]
  score: number
  maxScore: number
  correct: boolean | null
  selfAssessment: 'understood' | 'partial' | 'review'
  completedAt: string
  contentHash: string
}

export interface AssessmentAttempt {
  id: string
  assessmentId: string
  answers: Record<string, string>
  rubricScores: Record<string, number>
  totalScore: number
  maxScore: number
  passed: boolean
  notes: string
  completedAt: string
  contentHash: string
}

export interface ProgressState {
  schemaVersion: number
  quizAttempts: QuizAttempt[]
  assessmentAttempts: AssessmentAttempt[]
  completedArticleIds: string[]
  lastViewedArticleId: string | null
  updatedAt: string | null
}
