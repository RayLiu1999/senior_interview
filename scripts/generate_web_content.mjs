import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const webDir = path.join(rootDir, 'web')
const publicContentDir = path.join(webDir, 'public', 'content')
const generatedDir = path.join(webDir, 'generated')

const topicRoots = [
  '01_Computer_Science_Fundamentals',
  '02_Backend_Development',
  '03_System_Design_and_Architecture',
  '04_Infrastructure_and_DevOps',
  '05_Specialized_Topics',
  '06_Frontend_Development',
]

const categoryLabels = {
  '01_Computer_Science_Fundamentals': '電腦科學基礎',
  '02_Backend_Development': '後端開發',
  '03_System_Design_and_Architecture': '系統設計與架構',
  '04_Infrastructure_and_DevOps': '基礎設施與 DevOps',
  '05_Specialized_Topics': '特定領域',
  '06_Frontend_Development': '前端開發',
}

const categoryDescriptions = {
  '01_Computer_Science_Fundamentals': '作業系統、網路、資料結構與演算法等基礎原理。',
  '02_Backend_Development': 'API、資料庫、快取、訊息系統與程式語言框架。',
  '03_System_Design_and_Architecture': '分散式系統、架構模式、DDD 與大型系統設計。',
  '04_Infrastructure_and_DevOps': '容器、Kubernetes、雲端、CI/CD 與可觀測性。',
  '05_Specialized_Topics': '安全、測試、AI Engineering 與 Engineering Management。',
  '06_Frontend_Development': 'React、Vue 與前端狀態、渲染及效能。',
}

const conceptPattern = /concept\.[A-Za-z0-9][A-Za-z0-9._-]*/g
const learningObjectivePattern = /LO-[0-9]+/g

async function walkMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkMarkdown(absolutePath))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(absolutePath)
    }
  }
  return files
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/')
}

function slugify(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

function stableArticleId(relativePath) {
  return relativePath
    .replace(/\.md$/i, '')
    .split('/')
    .map(slugify)
    .join('__')
}

function contentHash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

function firstMatch(text, pattern, fallback = '') {
  const match = text.match(pattern)
  return match?.[1]?.trim() ?? fallback
}

function parseNumber(text, label, fallback = 0) {
  const groupedLabel = label.includes('|') ? `(?:${label})` : label
  const match = text.match(new RegExp(`(?:\\*\\*)?${groupedLabel}(?:\\*\\*)?\\s*:\\s*[^\\n]*?(\\d+)(?:[^\\n]*)`, 'i'))
  return match ? Number(match[1]) : fallback
}

function cleanInline(value) {
  return value
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTags(text) {
  const line = text.split('\n').find((item) => /標籤|tags?/i.test(item) && item.includes(':'))
  if (!line) return []
  return line
    .split(':').slice(1).join(':')
    .split(/[,，]/)
    .map(cleanInline)
    .filter(Boolean)
}

function parseLearningObjectives(mappingText, conceptId) {
  const objectives = []
  for (const line of mappingText.split('\n')) {
    const match = line.match(/(?:^|[-*]\s+)(?:\*\*)?(?:`[^`]+\/)?`?(LO-\d+)`?(?:\*\*)?\s*[:：]\s*(.+)$/)
    if (!match) continue
    objectives.push({
      id: `${conceptId}/${match[1]}`,
      description: cleanInline(match[2]),
    })
  }
  return objectives
}

function resolveContentLink(fromRelativePath, target) {
  if (!target) return ''
  const withoutAnchor = target.split('#')[0].split('?')[0]
  return normalizePath(path.normalize(path.join(path.dirname(fromRelativePath), withoutAnchor)))
}

function parseArticle(relativePath, raw) {
  const categoryId = relativePath.split('/')[0]
  const mappingMatch = raw.match(/\n#{2,3}\s+測驗對應[\s\S]*$/)
  const mappingStart = mappingMatch?.index ?? -1
  const mappingText = mappingStart >= 0 ? raw.slice(mappingStart) : raw
  const contentText = mappingStart >= 0 ? raw.slice(0, mappingStart) : raw
  const title = firstMatch(raw, /^#\s+(.+)$/m, path.basename(relativePath, '.md'))
  const conceptId = firstMatch(mappingText, /Concept ID[^`\n]*`(concept\.[^`]+)`/i) || (mappingText.match(conceptPattern) ?? [])[0] || ''
  const learningObjectives = parseLearningObjectives(mappingText, conceptId)
  const quizTarget = firstMatch(mappingText, /Quick Quiz[^\n]*\]\(([^)]+)\)/i)
  const assessmentTarget = firstMatch(mappingText, /Hard Assessment[^\n]*\]\(([^)]+)\)/i)
  const prerequisitesLine = firstMatch(mappingText, /Prerequisites\*\*?\s*:\s*([^\n]+)/i)

  return {
    id: stableArticleId(relativePath),
    slug: stableArticleId(relativePath),
    path: relativePath,
    title: cleanInline(title),
    categoryId,
    categoryLabel: categoryLabels[categoryId] ?? categoryId,
    difficulty: parseNumber(raw, '難度', 0),
    importance: parseNumber(raw, '重要程度|重要性', 0),
    tags: parseTags(raw),
    prerequisites: prerequisitesLine.split(/[,，]/).map(cleanInline).filter(Boolean),
    conceptId,
    learningObjectives,
    contentMarkdown: contentText
      .replace(/^#\s+.+\n/, '')
      .replace(/^-\s+\*\*(難度|標籤|重要程度|重要性)\*\*[^\n]*\n/gm, '')
      .trim(),
    contentHash: contentHash(raw),
    quickQuizPath: resolveContentLink(relativePath, quizTarget),
    assessmentPath: resolveContentLink(relativePath, assessmentTarget),
    quickQuizIds: [],
    assessmentIds: [],
  }
}

function stripQuestionComment(text) {
  return text
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<a[^>]*><\/a>/g, '')
    .replace(/\*\*難度\*\*[^\n]*\n?/g, '')
    .replace(/\*\*重要程度\*\*[^\n]*\n?/g, '')
    .replace(/📖\s*\[[^\]]+\]\([^)]*\)\s*$/gm, '')
    .trim()
}

function parseQuizItems(relativePath, raw, overrides) {
  const items = []
  const chunks = raw.split(/(?=^### Q\d+:)/m).filter((chunk) => /^### Q\d+:/.test(chunk))
  const sourceSlug = slugify(path.basename(relativePath, '.md'))

  for (const chunk of chunks) {
    const header = chunk.match(/^### Q(\d+):\s*(.+)$/m)
    if (!header) continue
    const questionNumber = Number(header[1])
    const id = `quiz-${sourceSlug}-q${questionNumber}`
    const conceptLine = chunk.match(/Concept ID:\s*([^;\s]+)[^\n]*Learning Objective IDs:\s*([^\n]+?)(?:\s*-->|$)/i)
    const conceptId = conceptLine?.[1] ?? ''
    const loMatches = (conceptLine?.[2] ?? '').match(learningObjectivePattern) ?? []
    const detailsStart = chunk.indexOf('<details>')
    const answerStart = detailsStart >= 0 ? chunk.indexOf('\n', detailsStart) : -1
    const detailsEnd = chunk.indexOf('</details>', detailsStart)
    const beforeDetails = detailsStart >= 0 ? chunk.slice(0, detailsStart) : chunk
    const answerMarkdown = detailsStart >= 0 && answerStart >= 0 && detailsEnd >= 0
      ? chunk.slice(answerStart + 1, detailsEnd).replace(/<summary>[^]*?<\/summary>/, '').trim()
      : ''
    const articleTarget = firstMatch(chunk, /查看完整答案\]\(([^)]+)\)/)
    const articlePath = resolveContentLink(relativePath, articleTarget)
    const override = overrides[id] ?? {}
    const type = override.type ?? 'reflection'
    const learningObjectiveIds = loMatches.map((lo) => conceptId ? `${conceptId}/${lo}` : lo)
    const prompt = stripQuestionComment(beforeDetails)

    items.push({
      id,
      sourceFile: relativePath,
      questionNumber,
      title: cleanInline(header[2]),
      prompt,
      answerMarkdown,
      conceptId,
      learningObjectiveIds,
      difficulty: parseNumber(chunk, '難度', 0),
      importance: parseNumber(chunk, '重要性|重要程度', 0),
      type,
      options: override.options ?? [],
      correctOptionIds: override.correctOptionIds ?? [],
      explanationMarkdown: override.explanationMarkdown ?? answerMarkdown,
      articlePath,
      articleId: null,
      contentHash: contentHash(chunk),
    })
  }
  return items
}

function parseSections(raw) {
  const sections = {}
  const matches = [...raw.matchAll(/^##\s+(.+)$/gm)]
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index]
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? raw.length
    sections[cleanInline(match[1])] = raw.slice(start, end).trim()
  }
  return sections
}

function sectionByNames(sections, names) {
  const found = Object.entries(sections).find(([name]) => names.some((candidate) => name.includes(candidate)))
  return found?.[1] ?? ''
}

function parseAssessment(relativePath, raw) {
  const title = firstMatch(raw, /^#\s+(.+)$/m, path.basename(relativePath, '.md'))
  const primaryConceptId = firstMatch(raw, /主要 Concept ID[^`\n]*`(concept\.[^`]+)`/i) || (raw.match(conceptPattern) ?? [])[0] || ''
  const assessmentIdMatch = raw.match(/Assessment ID\*?\*?\s*:\s*(?:`([^`]+)`|([^\s\n]+))/i)
  const assessmentId = assessmentIdMatch?.[1] ?? assessmentIdMatch?.[2] ?? ''
  const allConceptIds = [...new Set(raw.match(conceptPattern) ?? [])]
  const learningObjectiveIds = [...new Set(raw.match(/concept\.[A-Za-z0-9][A-Za-z0-9._-]*\/LO-[0-9]+/g) ?? [])]
  const sections = parseSections(raw)
  const articlePaths = []
  for (const link of raw.matchAll(/\]\((\.\.\/[^)]+\.md)\)/g)) {
    const resolved = resolveContentLink(relativePath, link[1])
    if (!resolved.startsWith('QUIZ/') && !articlePaths.includes(resolved)) articlePaths.push(resolved)
  }
  const rubricMarkdown = sectionByNames(sections, ['評分規準', '評分', 'rubric'])
  const scoreMatches = [...rubricMarkdown.matchAll(/^\|\s*([0-4])\s*\|/gm)].map((match) => Number(match[1]))
  const passMatch = raw.match(/(?:通過標準|至少)\D{0,30}(\d)\s*\/\s*4/)

  return {
    id: `assessment-${slugify(path.basename(relativePath, '.md'))}`,
    sourceFile: relativePath,
    title: cleanInline(title),
    assessmentId,
    primaryConceptId,
    conceptIds: allConceptIds,
    learningObjectiveIds,
    articlePaths,
    articleIds: [],
    difficulty: parseNumber(raw, '難度', 0),
    importance: parseNumber(raw, '重要程度|重要性', 0),
    tags: parseTags(raw),
    objectiveMarkdown: sectionByNames(sections, ['測驗目標', '核心測驗', 'assessment objective']),
    scenarioMarkdown: sectionByNames(sections, ['問題情境與限制條件', '題目情境與限制條件', '問題情境', 'scenario']),
    taskMarkdown: sectionByNames(sections, ['作答要求', '題目', 'candidate task', 'questions']),
    evidenceMarkdown: sectionByNames(sections, ['期待證據', 'evidence']),
    rubricMarkdown,
    referenceMarkdown: sectionByNames(sections, ['參考答案與詳解', '參考答案', 'reference answer']),
    commonMistakesMarkdown: sectionByNames(sections, ['常見失分點', 'common mistakes']),
    followUpMarkdown: sectionByNames(sections, ['延伸追問', 'follow-up']),
    passScore: passMatch ? Number(passMatch[1]) : 3,
    contentHash: contentHash(raw),
    rubricScores: scoreMatches.length ? scoreMatches : [0, 1, 2, 3, 4],
  }
}

async function loadOverrides() {
  const filePath = path.join(webDir, 'content', 'quiz-overrides.json')
  if (!existsSync(filePath)) return {}
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function main() {
  const topicFiles = (await Promise.all(topicRoots.map((root) => walkMarkdown(path.join(rootDir, root)))))
    .flat()
    .filter((filePath) => path.basename(filePath) !== 'README.md')
    .sort()
  const articles = []
  const articleByPath = new Map()

  for (const filePath of topicFiles) {
    const relativePath = normalizePath(path.relative(rootDir, filePath))
    const raw = await readFile(filePath, 'utf8')
    const article = parseArticle(relativePath, raw)
    articles.push(article)
    articleByPath.set(relativePath, article)
  }

  const quizFiles = (await readdir(path.join(rootDir, 'QUIZ'), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md' && entry.name !== 'ASSESSMENT_ROADMAP.md' && entry.name !== 'ASSESSMENT_SPEC.md')
    .map((entry) => path.join(rootDir, 'QUIZ', entry.name))
    .sort()
  const overrides = await loadOverrides()
  const quizzes = []
  for (const filePath of quizFiles) {
    const relativePath = normalizePath(path.relative(rootDir, filePath))
    const raw = await readFile(filePath, 'utf8')
    quizzes.push(...parseQuizItems(relativePath, raw, overrides))
  }

  const assessmentFiles = (await readdir(path.join(rootDir, 'QUIZ', 'Hard_Assessments'), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map((entry) => path.join(rootDir, 'QUIZ', 'Hard_Assessments', entry.name))
    .sort()
  const assessments = []
  for (const filePath of assessmentFiles) {
    const relativePath = normalizePath(path.relative(rootDir, filePath))
    const raw = await readFile(filePath, 'utf8')
    assessments.push(parseAssessment(relativePath, raw))
  }

  for (const quiz of quizzes) {
    quiz.articleId = articleByPath.get(quiz.articlePath)?.id ?? null
    if (quiz.articleId) articleByPath.get(quiz.articlePath).quickQuizIds.push(quiz.id)
  }
  for (const assessment of assessments) {
    assessment.articleIds = assessment.articlePaths
      .map((articlePath) => articleByPath.get(articlePath)?.id)
      .filter(Boolean)
    for (const articleId of assessment.articleIds) {
      const article = articles.find((item) => item.id === articleId)
      if (article && !article.assessmentIds.includes(assessment.id)) article.assessmentIds.push(assessment.id)
    }
  }

  const categories = topicRoots.map((id) => ({
    id,
    label: categoryLabels[id],
    description: categoryDescriptions[id],
    articleCount: articles.filter((article) => article.categoryId === id).length,
  }))
  const catalog = {
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
    categories,
    articles,
    quizzes,
    assessments,
  }
  const routes = [
    '/',
    '/catalog',
    ...categories.map((category) => `/categories/${category.id}`),
    '/dashboard',
    '/review',
    '/settings',
    ...articles.map((article) => `/articles/${article.slug}`),
    ...quizzes.map((quiz) => `/quiz/${quiz.id}`),
    ...assessments.map((assessment) => `/assessment/${assessment.id}`),
  ]

  await mkdir(publicContentDir, { recursive: true })
  await mkdir(generatedDir, { recursive: true })
  await writeFile(path.join(publicContentDir, 'catalog.json'), `${JSON.stringify(catalog)}\n`)
  await writeFile(path.join(generatedDir, 'routes.json'), `${JSON.stringify(routes, null, 2)}\n`)
  console.log(`Generated web content: ${articles.length} articles, ${quizzes.length} quizzes, ${assessments.length} assessments`)
}

await main()
